# Docker Guide for Fitness Tracker Landing

## Build the Docker Image

```bash
docker build -t fitness-tracker-landing .
```

## Test Locally

```bash
docker run -p 8080:80 fitness-tracker-landing
```

Then visit http://localhost:8080

## Upload to Docker Hub

### 1. Create Docker Hub Account
- Go to https://hub.docker.com and sign up if you don't have an account

### 2. Login to Docker Hub
```bash
docker login
```
Enter your Docker Hub username and password when prompted.

### 3. Tag Your Image
Replace `YOUR_USERNAME` with your Docker Hub username:

```bash
docker tag fitness-tracker-landing YOUR_USERNAME/fitness-tracker-landing:latest
```

You can also add version tags:
```bash
docker tag fitness-tracker-landing YOUR_USERNAME/fitness-tracker-landing:v1.0.0
```

### 4. Push to Docker Hub
```bash
docker push YOUR_USERNAME/fitness-tracker-landing:latest
```

If you tagged with a version:
```bash
docker push YOUR_USERNAME/fitness-tracker-landing:v1.0.0
```

### 5. Push All Tags (Optional)
```bash
docker push YOUR_USERNAME/fitness-tracker-landing --all-tags
```

## Pull and Run from Docker Hub

Anyone can now pull and run your image:

```bash
docker pull YOUR_USERNAME/fitness-tracker-landing:latest
docker run -p 8080:80 YOUR_USERNAME/fitness-tracker-landing:latest
```

## Useful Commands

### View local images
```bash
docker images
```

### Remove an image
```bash
docker rmi fitness-tracker-landing
```

### View running containers
```bash
docker ps
```

### Stop a container
```bash
docker stop CONTAINER_ID
```

### View build logs
```bash
docker build -t fitness-tracker-landing . --progress=plain
```

## Troubleshooting

If the build fails, try:
```bash
docker build -t fitness-tracker-landing . --no-cache
```

If you need to update the image on Docker Hub, rebuild and push again:
```bash
docker build -t fitness-tracker-landing .
docker tag fitness-tracker-landing YOUR_USERNAME/fitness-tracker-landing:latest
docker push YOUR_USERNAME/fitness-tracker-landing:latest
```
