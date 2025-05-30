terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.58"
    }
  }
}

provider "aws" {
  region = "us-west-1"
}

# Variables
variable "app_name" {
  description = "Name of the application"
  default     = "hello-world-app"
}

variable "container_port" {
  description = "Port exposed by the container"
  default     = 5000
}

variable "image_tag" {
  description = "Tag for the container image"
}

# Data sources to reference existing resources
data "aws_vpc" "default" {
  default = true
}

data "aws_security_group" "default" {
  id = "sg-507"
}

data "aws_subnet" "subnet1" {
  id = "subnet-0b9b"
}

data "aws_subnet" "subnet2" {
  id = "subnet-237"
}

data "aws_caller_identity" "current" {}

data "aws_iam_role" "lambda_role" {
  name = "CustomerManagedBasic"
}

# ECR Repository
resource "aws_ecr_repository" "app_repo" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-ecr"
  }
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 30

  tags = {
    Application = var.app_name
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  tags = {
    Name = "${var.app_name}-cluster"
  }
}

# Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.app_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lambda_role.arn
  task_role_arn            = data.aws_iam_role.lambda_role.arn

  container_definitions = jsonencode([
    {
      name             = var.app_name
      image            = "${aws_ecr_repository.app_repo.repository_url}:${var.image_tag}"
      essential        = true
      portMappings     = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.app_logs.name
          "awslogs-region"        = "us-west-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "${var.app_name}-task"
  }
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [data.aws_security_group.default.id]
  subnets            = [data.aws_subnet.subnet1.id, data.aws_subnet.subnet2.id]

  tags = {
    Name = "${var.app_name}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.app_name}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Name = "${var.app_name}-tg"
  }

  depends_on = [aws_lb.main]
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ECS Service (Correctly Defined with Desired Count 1)
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1  # Ensured only 1 service is created
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [data.aws_subnet.subnet1.id, data.aws_subnet.subnet2.id]
    security_groups  = [data.aws_security_group.default.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = var.app_name
    container_port   = var.container_port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_cloudwatch_log_group.app_logs
  ]

  tags = {
    Name = "${var.app_name}-service"
  }
}

# Outputs
output "load_balancer_url" {
  value = "http://${aws_lb.main.dns_name}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.app_logs.name
}
