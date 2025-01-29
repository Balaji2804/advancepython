[
  {
    "name": "${container_name}",
    "image": "${ecr_url}:${build_version}",
    "essential": true,
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
        "name": "region",
        "value": "${region}"
      },
      {
        "name": "kinesis_stream",
        "value": "${kinesis_stream}"
      },
      {
        "name": "kinesis_region",
        "value": "${kinesis_region}"
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
      },
      {
        "containerPort": 5170,
        "hostPort": 5170,
        "protocol": "tcp"
      }
    ],
    "command": [
      "./start.sh | tee >(nc localhost 5170)"
    ],
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
    "portMappings": [
      {
        "containerPort": 5170,
        "hostPort": 5170,
        "protocol": "tcp"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${log_group_name}",
        "awslogs-region": "${region}",
        "awslogs-create-group": "true",
        "awslogs-stream-prefix": "/ecs/${stack_name}"
      }
    }
  }
]
