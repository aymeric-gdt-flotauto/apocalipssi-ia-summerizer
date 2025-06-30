# DocuMind AI Backend

This directory contains the backend services for the DocuMind AI application.

## Services

The backend is divided into two main services:

### IA Service

The IA Service handles document processing and analysis using Google's Gemini API. It provides structured responses with document summaries, key points, and action items.

[See IA Service documentation](./ia-service/README.md)

### DB Service

The DB Service is responsible for data persistence and management. (Note: This service is not yet implemented)

## Architecture

The backend follows a microservices architecture:

```
frontend <--> ia-service <--> Gemini API
```

## Getting Started

To set up the backend services:

1. Navigate to the ia-service directory:

```bash
cd ia-service
```

2. Follow the setup instructions in the [IA Service README](./ia-service/README.md).

## API Documentation

### IA Service API

- `POST /api/analyze`: Analyze a PDF document and return structured results
- `GET /api/health`: Health check endpoint

## Development

Each service has its own dependencies and can be developed independently. See the individual service READMEs for development instructions.