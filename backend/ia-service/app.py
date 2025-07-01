import os
import time
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import PyPDF2
import io
from urllib.parse import urlparse
import urllib3

# Désactiver les warnings SSL si nécessaire
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration pour le service Docker
MODEL_SERVICE_URL = os.getenv("MODEL_SERVICE_URL", "http://model-runner.docker.internal")
MODEL_NAME = os.getenv("MODEL_NAME", "ai/qwen3:14B-Q6_K")

# S'assurer que l'URL utilise HTTP et ajouter le port si nécessaire
if not MODEL_SERVICE_URL.startswith(('http://', 'https://')):
    MODEL_SERVICE_URL = f"http://{MODEL_SERVICE_URL}"

# Parser l'URL pour s'assurer qu'elle est correcte
parsed_url = urlparse(MODEL_SERVICE_URL)
if not parsed_url.port:
    # Ajouter le port par défaut si aucun port n'est spécifié
    if parsed_url.hostname:
        MODEL_SERVICE_URL = f"{parsed_url.scheme}://{parsed_url.hostname}:12434"

print(f"Configuration du service model: URL={MODEL_SERVICE_URL}, MODEL={MODEL_NAME}")

def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text


def analyze_with_model(text):
    start_time = time.time()

    try:
        system_prompt = """Vous êtes un assistant IA spécialisé dans l'analyse de documents. Analysez le document fourni et répondez UNIQUEMENT avec un JSON valide selon ce format exact :
{
    "summary": "résumé détaillé du document",
    "keyPoints": ["point 1", "point 2", "point 3"],
    "actionItems": [
        {
            "id": "action-1",
            "title": "titre de l'action",
            "description": "description détaillée",
            "priority": "high|medium|low",
            "category": "catégorie"
        }
    ],
    "confidence": 85
}"""

        user_prompt = f"""Analysez ce document et fournissez votre réponse au format JSON strict demandé.

Document à analyser :
{text[:15000]}

Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire ni formatage markdown."""

        # Préparer la requête pour l'API OpenAI compatible
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": user_prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 4000,
            "top_p": 0.9
        }

        # Utiliser l'endpoint OpenAI compatible
        completions_url = f"{MODEL_SERVICE_URL}/engines/v1/chat/completions"
        print(f"Tentative de connexion à: {completions_url}")

        # Appel au service Docker avec l'API OpenAI
        response = requests.post(
            completions_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=120,  # 2 minutes timeout
            verify=False  # Désactiver la vérification SSL
        )

        if response.status_code != 200:
            raise ValueError(f"Erreur du service model: {response.status_code} - {response.text}")

        response_data = response.json()
        
        # Extraire le contenu de la réponse OpenAI
        if "choices" not in response_data or len(response_data["choices"]) == 0:
            raise ValueError("Format de réponse OpenAI invalide")
            
        response_text = response_data["choices"][0]["message"]["content"].strip()

        if not response_text:
            raise ValueError("Réponse vide du service model")

        # Nettoyage de la réponse (enlever les balises markdown si présentes)
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        result = json.loads(response_text)

        # Validation et nettoyage des données
        if not isinstance(result.get("keyPoints"), list):
            result["keyPoints"] = []

        if not isinstance(result.get("actionItems"), list):
            result["actionItems"] = []

        cleaned_actions = []
        for i, action in enumerate(result.get("actionItems", [])):
            if isinstance(action, dict):
                cleaned_action = {
                    "id": action.get("id", f"action-{i + 1}"),
                    "title": action.get("title", "Action sans titre"),
                    "description": action.get("description", "Aucune description"),
                    "priority": action.get("priority", "medium"),
                    "category": action.get("category", "General")
                }

                if cleaned_action["priority"] not in ["high", "medium", "low"]:
                    cleaned_action["priority"] = "medium"

                cleaned_actions.append(cleaned_action)

        result["actionItems"] = cleaned_actions

        if not isinstance(result.get("confidence"), (int, float)):
            result["confidence"] = 0

        if not result.get("summary"):
            result["summary"] = "Résumé non disponible"

        result["processingTime"] = round(time.time() - start_time, 1)

        return result

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Erreur de connexion au service model: {str(e)}")
        return create_error_response(f"Erreur de connexion au service model: {str(e)}", start_time)
    except json.JSONDecodeError as e:
        app.logger.error(f"Erreur JSON: {str(e)}")
        return create_error_response(f"Erreur de format JSON: {str(e)}", start_time)
    except Exception as e:
        app.logger.error(f"Erreur d'analyse: {str(e)}")
        return create_error_response(f"Erreur d'analyse: {str(e)}", start_time)


def create_error_response(error_message, start_time):
    return {
        "summary": f"Échec de l'analyse du document: {error_message}",
        "keyPoints": ["Erreur lors du traitement du document"],
        "actionItems": [],
        "confidence": 0,
        "processingTime": round(time.time() - start_time, 1)
    }


@app.route('/api/analyze', methods=['POST'])
def analyze_document():
    if 'file' not in request.files:
        return jsonify(create_error_response("Aucun fichier fourni", time.time())), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify(create_error_response("Aucun fichier sélectionné", time.time())), 400

    if not file.filename.endswith('.pdf'):
        return jsonify(create_error_response("Seuls les fichiers PDF sont supportés", time.time())), 400

    try:
        pdf_data = file.read()
        text = extract_text_from_pdf(pdf_data)

        if not text.strip():
            return jsonify(create_error_response("Aucun texte extrait du PDF", time.time())), 400

        result = analyze_with_model(text)
        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Erreur: {str(e)}")
        return jsonify(create_error_response(str(e), time.time())), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Utiliser l'endpoint OpenAI pour lister les modèles
        models_url = f"{MODEL_SERVICE_URL}/engines/v1/models"
        print(f"Health check - tentative de connexion à: {models_url}")
        
        # Vérifier la connectivité avec le service model
        response = requests.get(
            models_url, 
            timeout=10,
            verify=False  # Désactiver la vérification SSL
        )
        
        if response.status_code == 200:
            return jsonify({
                "status": "healthy",
                "model_service": "connected",
                "model": MODEL_NAME,
                "service_url": MODEL_SERVICE_URL
            }), 200
        else:
            return jsonify({
                "status": "degraded",
                "model_service": "unreachable",
                "model": MODEL_NAME,
                "service_url": MODEL_SERVICE_URL,
                "http_status": response.status_code
            }), 200
    except Exception as e:
        error_msg = str(e)
        print(f"Health check error: {error_msg}")
        return jsonify({
            "status": "unhealthy",
            "model_service": "error",
            "error": error_msg,
            "model": MODEL_NAME,
            "service_url": MODEL_SERVICE_URL
        }), 503


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))