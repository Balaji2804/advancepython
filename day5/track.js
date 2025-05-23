[
  {
    "environment": [
      {
        "name": "build_version",
        "value": "${build_version}"
      },
      {
        "name": "stage",
        "value": "${stage}"
      },
      {
        "name": "secrets_prefix",
        "value": "${secrets_prefix}"
      },
      {
        "name": "kinesis_stream",
        "value": "${kinesis_stream}"
      },
      {
        "name": "kinesis_region",
        "value": "${kinesis_region}"
      },
      {
        "name": "region",
        "value": "${region}"
      },
      {
        "name": "AWS_PLATFORM",
        "value": "ecs-fargate"
      },
      {
        "name": "app_name",
        "value": "${app_name}"
      },
      {
        "name": "common_token_secret_name",
        "value": "${common_token_secret_name}"
      }
    ],
    "entryPoint": [
      "sh",
      "-c"
    ],
    "portMappings": [
      {
        "containerPort": 80,
        "hostPort": 80,
        "protocol": "tcp"
      }
    ],
    "command": [
      "./start.sh"
    ],
    "linuxParameters": null,
    "cpu": 0,
    "essential": true,
    "image": "${ecr_url}:${build_version}",
    "name": "${container_name}",
    "logConfiguration": {
      "logDriver": "awsfirelens",
      "options": {
        "Name": "kinesis",
        "region": "${kinesis_region}",
        "stream": "${kinesis_stream}",
        "log_key": "log",
        "auto_create_stream": "true"
      }
    }
  },
  {
    "name": "log-router",
    "image": "amazon/aws-for-fluent-bit:latest",
    "essential": true,
    "firelensConfiguration": {
      "type": "fluentbit"
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/${container_name}",
        "awslogs-region": "${region}",
        "awslogs-create-group": "true",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }
]
