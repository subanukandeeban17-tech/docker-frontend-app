# Dockerized Frontend Application (2-Joint Robot C-Space Visualizer)

A lightweight, zero-dependency frontend web application packaged with Nginx for immediate deployment in Docker.

## Folder Structure

```text
docker-frontend-app/
├── index.html          # Main HTML page
├── style.css           # Responsive styling
├── app.js              # Interactive canvas logic
├── Dockerfile          # Multi-platform lightweight Nginx image
├── docker-compose.yml  # One-command container orchestration
├── .dockerignore       # Excludes unnecessary files from build context
└── README.md           # Deployment instructions
```

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)
1. Unzip this folder and open a terminal inside `docker-frontend-app/`.
2. Run:
   ```bash
   docker compose up -d --build
   ```
3. Open your browser to `http://localhost:8080`.

### Option 2: Using Standard Docker CLI
1. Build the Docker image:
   ```bash
   docker build -t cspace-frontend .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:80 --name cspace-app cspace-frontend
   ```
3. Open your browser to `http://localhost:8080`.
