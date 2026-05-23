# BiteRush Plus - DevSecOps Food Order Website

BiteRush Plus is a full-stack food ordering application used as a DevSecOps project. It includes a static frontend, a Node.js backend API, MongoDB support for container deployments, local JSON fallback for development, Docker images, Docker Compose orchestration, and an end-to-end GitHub Actions pipeline.

## Project Goal

This repository demonstrates how a DevOps engineer can take a simple food-ordering product from source code to a containerized, scanned, and deployed application.

The pipeline covers:

- Code quality checks with Biome
- Static security scanning with Semgrep
- Secret scanning with Gitleaks
- Dependency vulnerability scanning with OWASP Dependency-Check
- Dockerfile linting with Hadolint
- Docker image build and push to Docker Hub
- Container image scanning with Trivy
- Remote deployment to an EC2 server using Docker Compose

## Application Features

- Login-first food ordering experience
- Browse food menu with categories and search
- Add items to cart
- Buy Now checkout flow
- Cart checkout with delivery details
- Profile update and profile photo upload
- Account drawer with personal order history
- Orders drawer for placed orders
- REST API for menu and orders

## Architecture

```text
User Browser
    |
    v
Nginx Frontend Container :80
    |
    |-- Static HTML/CSS/JS
    |
    |-- /api proxy
          |
          v
Node.js Backend Container :3000
          |
          v
MongoDB Container :27017
```

For local development without Docker, the backend can also save orders to:

```text
mongodb/seed/orders.json
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js HTTP server |
| Database | MongoDB in Docker, JSON fallback locally |
| Web server | Nginx |
| Containers | Docker |
| Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Security | Semgrep, Gitleaks, OWASP Dependency-Check, Trivy |
| Linting | Biome, Hadolint |

## Repository Structure

```text
Food-Order-Website/
  backend/
    Dockerfile
    package.json
    server.js
  frontend/
    Dockerfile
    app.js
    index.html
    nginx.conf
    styles.css
  mongodb/
    seed/
      orders.json
  .github/
    workflows/
      build-push.yml
      code-security.yml
      dependency-scan.yml
      deploy-to-server.yml
      dev-sec-ops.yml
      docker-lint.yml
      image-scan.yml
      secrets-scan.yml
  docker-compose.yml
  package.json
  README.md
```

## Run Locally

Install dependencies:

```powershell
npm install
```

Start the app:

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

When MongoDB is not available locally, the backend automatically uses local JSON order storage.

## Run With Docker Compose

The compose file expects Docker Hub images created by the CI pipeline.

Set the image variables:

```powershell
$env:DOCKERHUB_USERNAME="your-dockerhub-username"
$env:DOCKER_TAG="your-image-tag"
```

Start the stack:

```powershell
docker compose up -d
```

Open:

```text
http://localhost
```

Stop the stack:

```powershell
docker compose down
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/menu` | Get available food items |
| GET | `/api/orders` | Get placed orders |
| POST | `/api/orders` | Create a new order |

Example order payload:

```json
{
  "customer": {
    "name": "Praveen",
    "phone": "9876543210",
    "address": "Mathura, Uttar Pradesh"
  },
  "items": [
    {
      "id": 1,
      "qty": 2
    }
  ]
}
```

## CI/CD Pipeline

The main workflow is:

```text
.github/workflows/dev-sec-ops.yml
```

It runs on push to `main` and orchestrates the full delivery flow.

Pipeline stages:

| Stage | Workflow | Tooling |
| --- | --- | --- |
| Code quality | `code-security.yml` | Biome |
| SAST | `code-security.yml` | Semgrep |
| Secret scanning | `secrets-scan.yml` | Gitleaks |
| Dependency scanning | `dependency-scan.yml` | OWASP Dependency-Check |
| Dockerfile linting | `docker-lint.yml` | Hadolint |
| Build and push | `build-push.yml` | Docker Buildx, Docker Hub |
| Image scanning | `image-scan.yml` | Trivy |
| Deployment | `deploy-to-server.yml` | SSH, Docker Compose |

## Required GitHub Variables And Secrets

Repository variable:

```text
DOCKERHUB_USERNAME
```

Repository secrets:

```text
DOCKERHUB_TOKEN
EC2_SSH_HOST
EC2_SSH_USERNAME
EC2_SSH_PRIVATE_KEY
```

## Deployment Flow

1. Code is pushed to `main`.
2. GitHub Actions runs quality and security checks.
3. Frontend and backend Docker images are built.
4. Images are pushed to Docker Hub with the Git commit SHA as the tag.
5. Trivy scans the pushed images.
6. GitHub Actions connects to the EC2 server over SSH.
7. Docker and Docker Compose are installed if needed.
8. `docker-compose.yml` is copied to the server.
9. The latest images are pulled and recreated with Docker Compose.

## DevOps Notes

- Frontend runs on Nginx and proxies `/api` requests to the backend service.
- Backend exposes port `3000`.
- MongoDB uses a named Docker volume called `mongo-data`.
- Image tags are based on `${{ github.sha }}` for traceability.
- The app can run locally without MongoDB, but production-style Docker deployment uses MongoDB.

## Useful Commands

Run lint and quality checks:

```powershell
npx @biomejs/biome check .
```

Start local server in the background on Windows:

```powershell
Start-Process -FilePath node -ArgumentList "backend/server.js" -WindowStyle Hidden
```

Stop local Node server:

```powershell
Get-Process node | Stop-Process
```

Check running containers:

```powershell
docker ps
```

View compose logs:

```powershell
docker compose logs -f
```

## Author

DevOps Engineer: Praveen Singh Tomar
