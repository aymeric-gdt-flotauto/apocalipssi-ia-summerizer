import os
import time
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import PyPDF2
import io

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)


def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text


def analyze_with_gemini(text):
    start_time = time.time()

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = f"""
        Analysez ce document et fournissez une réponse au format JSON strict avec ces champs exacts :
        {{
            "summary": "résumé détaillé du document",
            "keyPoints": ["point 1", "point 2", "point 3"],
            "actionItems": [
                {{
                    "id": "action-1",
                    "title": "titre de l'action",
                    "description": "description détaillée",
                    "priority": "high|medium|low",
                    "category": "catégorie"
                }}
            ],
            "confidence": 85
        }}

        Document à analyser :
        {text[:15000]}

        Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.
        """

        response = model.generate_content(prompt)

        if not response.text:
            raise ValueError("Réponse vide de Gemini")

        response_text = response.text.strip()

        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        result = json.loads(response_text)

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

    except json.JSONDecodeError as e:
        app.logger.error(f"Erreur JSON: {str(e)}")
        return create_error_response(f"Erreur de format JSON: {str(e)}", start_time)
    except Exception as e:
        app.logger.error(f"Erreur Gemini: {str(e)}")
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

        result = analyze_with_gemini(text)
        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Erreur: {str(e)}")
        return jsonify(create_error_response(str(e), time.time())), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))