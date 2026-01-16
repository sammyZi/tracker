# AWS ECS Deployment Guide

## Prerequisites
- Docker image pushed to Docker Hub: `sammyi57/fitness-tracker-landing:latest`
- AWS Account
- AWS CLI installed (optional but recommended)

## Step 1: Push Your Image to Docker Hub

```bash
docker build -t fitness-tracker-landing .
docker tag fitness-tracker-landing sammyi57/fitness-tracker-landing:latest
docker push sammyi57/fitness-tracker-landing:latest
```

## Step 2: Create ECS Cluster

### Using AWS Console:

1. Go to AWS ECS Console: https://console.aws.amazon.com/ecs
2. Click **"Clusters"** in the left sidebar
3. Click **"Create Cluster"**
4. Choose **"AWS Fargate"** (serverless) or **"EC2"** (if you want more control)
5. Enter cluster name: `fitness-tracker-cluster`
6. Click **"Create"**

### Using AWS CLI:

```bash
aws ecs create-cluster --cluster-name fitness-tracker-cluster
```

## Step 3: Create Task Definition

### Using AWS Console:

1. Go to **"Task Definitions"** in ECS Console
2. Click **"Create new Task Definition"**
3. Choose **"Fargate"** as launch type
4. Configure:
   - **Task Definition Name**: `fitness-tracker-task`
   - **Task Role**: Leave empty or create one if needed
   - **Task Execution Role**: Select `ecsTaskExecutionRole` (or create it)
   - **Task Memory**: `0.5 GB` (512)
   - **Task CPU**: `0.25 vCPU` (256)

5. Click **"Add Container"**:
   - **Container Name**: `fitness-tracker-container`
   - **Image**: `sammyi57/fitness-tracker-landing:latest`
   - **Memory Limits**: Soft limit `512`
   - **Port Mappings**: 
     - Container port: `80`
     - Protocol: `tcp`
   - Click **"Add"**

6. Click **"Create"**

### Using JSON (AWS CLI):

Create a file `task-definition.json`:

```json
{
  "family": "fitness-tracker-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "fitness-tracker-container",
      "image": "sammyi57/fitness-tracker-landing:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fitness-tracker",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

## Step 4: Create a Service

### Using AWS Console:

1. Go to your cluster: `fitness-tracker-cluster`
2. Click **"Services"** tab
3. Click **"Create"**
4. Configure:
   - **Launch Type**: `Fargate`
   - **Task Definition**: Select `fitness-tracker-task`
   - **Service Name**: `fitness-tracker-service`
   - **Number of tasks**: `1` (or more for scaling)
   
5. **Networking**:
   - **VPC**: Select your VPC
   - **Subnets**: Select public subnets
   - **Security Group**: Create new or select existing
     - Allow inbound traffic on port `80` from anywhere (0.0.0.0/0)
   - **Auto-assign public IP**: `ENABLED`

6. **Load Balancing** (Optional but recommended):
   - Choose **"Application Load Balancer"**
   - Create new ALB or select existing
   - Configure target group for port 80

7. Click **"Create Service"**

### Using AWS CLI:

```bash
aws ecs create-service \
  --cluster fitness-tracker-cluster \
  --service-name fitness-tracker-service \
  --task-definition fitness-tracker-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

## Step 5: Access Your Application

### Find Public IP:

1. Go to your cluster
2. Click on the service
3. Click on the **"Tasks"** tab
4. Click on the running task
5. Find the **"Public IP"** in the Network section
6. Visit: `http://YOUR_PUBLIC_IP`

### With Load Balancer:

If you set up an ALB, use the ALB DNS name:
- Find it in EC2 > Load Balancers
- Visit: `http://your-alb-dns-name.region.elb.amazonaws.com`

## Step 6: Update Your Application

When you push a new image to Docker Hub:

```bash
# Build and push new version
docker build -t fitness-tracker-landing .
docker tag fitness-tracker-landing sammyi57/fitness-tracker-landing:latest
docker push sammyi57/fitness-tracker-landing:latest

# Force ECS to pull new image
aws ecs update-service \
  --cluster fitness-tracker-cluster \
  --service fitness-tracker-service \
  --force-new-deployment
```

Or in AWS Console:
1. Go to your service
2. Click **"Update"**
3. Check **"Force new deployment"**
4. Click **"Update"**

## Image URI Format

Your Docker Hub image URI for ECS:
```
sammyi57/fitness-tracker-landing:latest
```

For specific versions:
```
sammyi57/fitness-tracker-landing:v1.0.0
sammyi57/fitness-tracker-landing:v1.0.1
```

## Cost Optimization Tips

1. **Use Fargate Spot** for non-production (up to 70% cheaper)
2. **Right-size resources**: Start with 0.25 vCPU / 0.5 GB
3. **Use Auto Scaling**: Scale based on CPU/memory usage
4. **Stop services** when not needed (dev/test environments)

## Troubleshooting

### Task fails to start:
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster fitness-tracker-cluster \
  --tasks TASK_ID
```

### Can't access application:
- Check security group allows port 80 inbound
- Verify public IP is assigned
- Check task is in RUNNING state

### Image pull errors:
- Verify image exists on Docker Hub: https://hub.docker.com/r/sammyi57/fitness-tracker-landing
- Check image name is correct in task definition
- Docker Hub public images don't need authentication

## Useful Commands

```bash
# List clusters
aws ecs list-clusters

# List services
aws ecs list-services --cluster fitness-tracker-cluster

# List tasks
aws ecs list-tasks --cluster fitness-tracker-cluster

# Describe service
aws ecs describe-services \
  --cluster fitness-tracker-cluster \
  --services fitness-tracker-service

# Stop all tasks (to stop service)
aws ecs update-service \
  --cluster fitness-tracker-cluster \
  --service fitness-tracker-service \
  --desired-count 0
```

## Next Steps

1. Set up a custom domain with Route 53
2. Add HTTPS with ACM (AWS Certificate Manager)
3. Set up CloudWatch alarms for monitoring
4. Configure auto-scaling policies
5. Set up CI/CD pipeline with GitHub Actions or AWS CodePipeline
