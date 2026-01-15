# Build and run the Docker image

Build the image:

```bash
docker build -t fitness-landing:latest .
```

Run the container (maps host port 3000 to container 3000):

```bash
docker run -p 3000:3000 fitness-landing:latest
```

Notes:
- The project uses `output: 'export'` for static site generation. The Dockerfile builds the static files and serves them with `serve`.
- If you change the Next.js config, rebuild with `docker build`.
