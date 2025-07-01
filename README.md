# DocuMind AI

DocuMind AI is an intelligent document analysis application that processes PDF documents and generates structured insights using Google's Gemini API.

## Overview

DocuMind AI helps users extract valuable information from documents by providing:

- **Document Summaries**: Concise overviews of document content
- **Key Points**: Important information extracted from the document
- **Action Items**: Suggested tasks based on document content

## Project Structure

The project follows a microservices architecture:

```
frontend <--> ia-service <--> Gemini API
            |
            v
        db-service <--> MySQL Database
```

### Components

- **Frontend**: A modern web application built with TypeScript and Vite
- **Backend**:
  - **IA Service**: Handles document processing and analysis using Google's Gemini API
  - **DB Service**: Manages data persistence using MySQL database. Stores document metadata, analysis results, and user data. Provides database operations for creating, reading, updating, and deleting records.

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- Docker and Docker Compose (for containerized deployment)
- Google Gemini API key

### Installation

#### Option 1: Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/apocalipssi-ia-summerizer.git
   cd apocalipssi-ia-summerizer
   ```

2. **Set up the backend**:
   ```bash
   cd backend/ia-service
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

3. **Set up the frontend**:
   ```bash
   cd ../../frontend
   npm install
   ```

4. **Start the services**:
   ```bash
   # Start the backend
   cd ../backend/ia-service
   python app.py

   # In a new terminal, start the frontend
   cd ../../frontend
   npm install
   npm run dev
   ```

#### Option 2: Using Docker

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/apocalipssi-ia-summerizer.git
   cd apocalipssi-ia-summerizer
   ```

2. **Configure environment variables**:
   ```bash
   cd backend/ia-service
   cp .env.example .env
   # Edit .env and add your Gemini API key
   cd ../..

   # The DB Service configuration is handled through Docker environment variables
   # You can modify database credentials in the docker-compose.yml file if needed
   ```

3. **Start the services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## Usage

1. Access the web interface at `http://localhost:5173` (or the port configured for your frontend)
2. Upload a PDF document
3. View the generated summary, key points, and action items

## API Documentation

### IA Service API

- `POST /api/analyze`: Analyze a PDF document and return structured results
- `GET /api/health`: Health check endpoint

For more details, see the [IA Service documentation](./backend/ia-service/README.md).

### DB Service

The DB Service uses MySQL to store and manage application data:

- **Database**: `document_analysis`
- **Main Tables**:
  - `documents`: Stores metadata about uploaded documents
  - `analysis_results`: Stores the results of document analysis
  - `users`: Manages user information and authentication

The service provides a RESTful API for data operations:
- `GET /api/documents`: Retrieve document list
- `GET /api/documents/{id}`: Retrieve a specific document
- `POST /api/documents`: Create a new document record
- `PUT /api/documents/{id}`: Update document information
- `DELETE /api/documents/{id}`: Delete a document

Database connection is configured through environment variables in the Docker setup.

## Development

Each component can be developed independently:

- **Frontend**: See the frontend directory for development instructions
- **Backend Services**: See the [backend README](./backend/README.md) for development instructions

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your Gemini API key is correctly set in the `.env` file
2. **Port Conflicts**: If ports are already in use, modify them in the configuration files
3. **Dependencies**: Make sure all required dependencies are installed
4. **Database Connection Issues**: 
   - Verify MySQL container is running with `docker ps`
   - Check database credentials in docker-compose.yml
   - Ensure port 3306 is not blocked by firewall or used by another service

## License

[Specify your license here]

## Contributors

[List contributors here]
