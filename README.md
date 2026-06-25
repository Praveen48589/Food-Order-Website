<div align="center">

# DevSecOps Food Order Website

A containerized **Food Ordering Website** built with **HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB**.

This project demonstrates a DevSecOps workflow using Docker, Kubernetes, Terraform, Argo CD, GitHub Actions, Amazon EKS, Docker Hub, Prometheus, Grafana, and automated security scanning.

[![HTML](https://img.shields.io/badge/Frontend-HTML5-E34F26.svg?logo=html5\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/Styling-CSS3-1572B6.svg?logo=css3\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg?logo=javascript\&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg?logo=nodedotjs\&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-black.svg?logo=express\&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED.svg?logo=docker\&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5.svg?logo=kubernetes\&logoColor=white)](https://kubernetes.io/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg?logo=githubactions\&logoColor=white)](https://github.com/features/actions)
[![Argo CD](https://img.shields.io/badge/GitOps-Argo%20CD-EF7B4D.svg?logo=argo\&logoColor=white)](https://argo-cd.readthedocs.io/)
[![AWS](https://img.shields.io/badge/Cloud-AWS-FF9900.svg?logo=amazonaws\&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC.svg?logo=terraform\&logoColor=white)](https://www.terraform.io/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C.svg?logo=prometheus\&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Visualization-Grafana-F46800.svg?logo=grafana\&logoColor=white)](https://grafana.com/)
[![Gitleaks](https://img.shields.io/badge/Secrets-Gitleaks-00ADD8.svg?logo=git\&logoColor=white)](https://github.com/gitleaks/gitleaks)
[![Semgrep](https://img.shields.io/badge/SAST-Semgrep-FFB300.svg?logo=semgrep\&logoColor=black)](https://semgrep.dev/)
[![Trivy](https://img.shields.io/badge/Security-Trivy-1904DA.svg?logo=aquasecurity\&logoColor=white)](https://trivy.dev/)

</div>

![Food Order Website Dashboard](screenshots/Screenshot1.png)

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Technical Architecture](#technical-architecture)
* [Security Pipeline](#security-pipeline-devsecops-pipeline)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Application Configuration](#application-configuration)
* [Prerequisites](#prerequisites)
* [Setup](#setup)
* [Security Best Practices](#security-best-practices)
* [Author](#author)

---

## Overview

The DevSecOps Food Order Website is a containerized web application where users can browse food items and place orders.

The application uses a frontend built with HTML, CSS, and JavaScript, a backend API built with Node.js and Express.js, and MongoDB for data storage. Docker packages the application services, Kubernetes deploys them to Amazon EKS, and Argo CD manages GitOps-based deployment.

GitHub Actions automates CI tasks such as code scanning, Docker image building, vulnerability scanning, and pushing approved images to Docker Hub.

Prometheus collects application and cluster metrics, while Grafana provides dashboards for monitoring and visualization.

---

## Features

* Responsive food ordering frontend
* Food menu browsing and ordering
* Node.js and Express.js REST API
* MongoDB database integration
* Dockerized frontend, backend, and MongoDB services
* Kubernetes deployment manifests
* Amazon EKS infrastructure created with Terraform
* Argo CD GitOps deployment
* Docker Hub container registry
* GitHub Actions CI pipeline
* Gitleaks secret scanning
* Semgrep SAST scanning
* OWASP Dependency-Check dependency scanning
* Hadolint Dockerfile linting
* Trivy container image and Kubernetes manifest scanning
* Prometheus metrics collection
* Grafana dashboards and visualization

---

## Technical Architecture

The application is deployed to Amazon EKS through a GitOps workflow.

GitHub Actions runs security checks, builds Docker images, scans them for vulnerabilities, and pushes approved images to Docker Hub. Argo CD monitors Kubernetes manifests stored in GitHub and synchronizes the application to the EKS cluster.

Prometheus collects application and cluster metrics, while Grafana provides dashboards for monitoring and visualization.

```mermaid
flowchart LR
    Dev[Developer] -->|Git Push| GitHub[GitHub Repository]

    GitHub -->|Trigger CI Pipeline| GHA[GitHub Actions]

    GHA --> Gitleaks[Gitleaks<br/>Secret Scanning]
    GHA --> Semgrep[Semgrep<br/>SAST Scan]
    GHA --> OWASP[OWASP Dependency Check<br/>Dependency Scan]
    GHA --> Hadolint[Hadolint<br/>Dockerfile Linting]
    GHA --> Trivy[Trivy<br/>Container Image Scan]

    GHA -->|Build and Push Docker Images| DockerHub[Docker Hub]

    GitHub -->|Kubernetes Manifests| ArgoCD[Argo CD]
    DockerHub -->|Pull Docker Images| ArgoCD

    ArgoCD -->|Deploy Application| EKS[Amazon EKS Cluster]

    subgraph FoodOrderApp["Food Order Application"]
        Frontend[Frontend<br/>HTML CSS JavaScript Nginx]
        Backend[Backend<br/>Node.js Express.js]
        MongoDB[(MongoDB)]
    end

    subgraph Monitoring["Monitoring Stack"]
        Prometheus[Prometheus<br/>Metrics Collection]
        Grafana[Grafana<br/>Dashboards and Visualization]
    end

    EKS --> Frontend
    EKS --> Backend
    EKS --> MongoDB

    Frontend -->|API Requests| Backend
    Backend -->|Database Operations| MongoDB

    Prometheus -->|Scrapes Metrics| Frontend
    Prometheus -->|Scrapes Metrics| Backend
    Prometheus -->|Scrapes Metrics| MongoDB
    Grafana -->|Reads Metrics| Prometheus

    User[User Browser] -->|Access Website| Frontend
    User -->|View Dashboards| Grafana
```

---

## Security Pipeline (DevSecOps Pipeline)

The CI/CD pipeline applies security checks before Docker images are pushed to Docker Hub and deployed to Amazon EKS through Argo CD.

| Gate | Name                          | Tool                   | Purpose                                                                                                      |
| :--: | :---------------------------- | :--------------------- | :----------------------------------------------------------------------------------------------------------- |
|   1  | Secret Scan                   | Gitleaks               | Scans the repository and Git history for exposed passwords, API keys, tokens, and other secrets.             |
|   2  | Code Scan                     | Semgrep                | Performs SAST scanning on HTML, JavaScript, Node.js, and Express.js source code to identify security issues. |
|   3  | Dependency Scan               | OWASP Dependency-Check | Scans Node.js dependencies from `package.json` and `package-lock.json` for known CVEs.                       |
|   4  | Dockerfile Linting            | Hadolint               | Checks frontend and backend Dockerfiles for Docker best practices and security issues.                       |
|   5  | Application Validation        | npm                    | Installs application dependencies and validates the backend application.                                     |
|   6  | Container Image Scan          | Trivy                  | Scans frontend and backend Docker images for OS package and dependency vulnerabilities.                      |
|   7  | Image Push                    | Docker Hub             | Pushes frontend and backend images only after required checks pass.                                          |
|   8  | GitOps Deployment             | Argo CD                | Synchronizes Kubernetes manifests and deploys the application to Amazon EKS.                                 |
|   9  | Kubernetes Configuration Scan | Trivy                  | Scans Kubernetes manifests for security misconfigurations.                                                   |

### Pipeline Flow

```text
Developer Push
     ↓
GitHub Actions
     ↓
Gitleaks → Semgrep → OWASP Dependency-Check → Hadolint
     ↓
npm Install / Application Validation
     ↓
Docker Build
     ↓
Trivy Image Scan
     ↓
Docker Hub Push
     ↓
Argo CD GitOps Sync
     ↓
Amazon EKS Deployment
     ↓
Trivy Kubernetes Configuration Scan
```

---

## Technology Stack

| Category                | Technologies                                               |
| :---------------------- | :--------------------------------------------------------- |
| Frontend                | HTML5, CSS3, JavaScript                                    |
| Web Server              | Nginx                                                      |
| Backend                 | Node.js, Express.js                                        |
| Database                | MongoDB                                                    |
| Containerization        | Docker, Docker Compose                                     |
| Container Registry      | Docker Hub                                                 |
| CI/CD                   | GitHub Actions                                             |
| GitOps Deployment       | Argo CD                                                    |
| Container Orchestration | Kubernetes, Amazon EKS                                     |
| Infrastructure as Code  | Terraform                                                  |
| Cloud Platform          | AWS                                                        |
| Security Tools          | Gitleaks, Semgrep, OWASP Dependency-Check, Hadolint, Trivy |
| Monitoring              | Prometheus, Grafana                                        |

---

## Project Structure

```text
Food-Order-Website/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD and security workflows
├── argocd/                     # Argo CD application manifests
├── backend/                    # Node.js and Express.js backend API
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── frontend/                   # HTML, CSS, JavaScript, Nginx frontend
│   ├── Dockerfile
│   ├── index.html
│   └── ...
├── k8s/                        # Kubernetes deployment and service manifests
├── screenshots/                # Application and deployment screenshots
├── terraform/                  # Terraform infrastructure for Amazon EKS
├── docker-compose.yml          # Local Docker Compose configuration
├── deployment.md               # Deployment instructions
└── README.md
```

---

## Application Configuration

The application uses Kubernetes ConfigMaps for non-sensitive MongoDB values and Kubernetes Secrets for MongoDB credentials.

### ConfigMap Values

| Variable           | Value             |
| :----------------- | :---------------- |
| `DATABASE_HOST`    | `mongodb-service` |
| `DATABASE_PORT`    | `27017`           |
| `MONGODB_DATABASE` | `mydatabase`      |

### Secret Values

| Variable                     | Value                                                                       |
| :--------------------------- | :-------------------------------------------------------------------------- |
| `MONGO_INITDB_ROOT_USERNAME` | `admin`                                                                     |
| `MONGO_INITDB_ROOT_PASSWORD` | `pass123`                                                                   |
| `MONGO_URI`                  | `mongodb://admin:pass123@mongodb-service:27017/mydatabase?authSource=admin` |

> Change the MongoDB username, password, and connection URI before using this project in production. Store encoded credentials in Kubernetes Secrets.

---

## Prerequisites

Install the following tools before running the project:

* Git
* Docker and Docker Compose
* Node.js and npm
* kubectl
* Terraform
* AWS CLI
* Helm
* Argo CD CLI
* Docker Hub account
* AWS account with Amazon EKS permissions

---

## Setup

Follow the instructions in [`deployment.md`](deployment.md) to deploy the application.

---

## Security Best Practices

* Never commit `.env` files, passwords, API keys, or Docker Hub tokens.
* Use GitHub Secrets for Docker Hub credentials.
* Use Kubernetes Secrets for MongoDB credentials.
* Run security scans before pushing Docker images.
* Keep Docker base images and Node.js dependencies updated.
* Regularly review Gitleaks, Semgrep, OWASP Dependency-Check, Hadolint, and Trivy reports.

---

## Author

**Praveen Singh Tomar**

* GitHub: `https://github.com/Praveen48589`
* LinkedIn: `https://www.linkedin.com/in/praveen-tomar-350893321/`

---

<div align="center">

⭐ If you found this project useful, consider giving it a star.

</div>
