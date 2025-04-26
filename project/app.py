import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import requests
import re
from werkzeug.utils import secure_filename
import tempfile

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__, static_folder="dist", static_url_path="/")
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'No prompt provided.'}), 400
    # Only allow ingredient text, not barcode/photo
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({'response': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scan_url', methods=['POST'])
def scan_url():
    data = request.get_json()
    url = data.get('url', '')
    user_profile = data.get('profile', None)
    if not url:
        return jsonify({'error': 'No URL provided.'}), 400
    # Extract barcode from Open Food Facts URL
    m = re.search(r'/product/(\d+)', url)
    if not m:
        return jsonify({'error': 'Invalid Open Food Facts URL.'}), 400
    barcode = m.group(1)
    product_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
    try:
        resp = requests.get(product_url, timeout=7)
        data = resp.json()
        if data.get('status') != 1:
            return jsonify({'error': 'Product not found.'}), 404
        product = data['product']
        ingredients = product.get('ingredients_text', '')
        if not ingredients:
            return jsonify({'error': 'No ingredients found.'}), 404
        # Pass only ingredients to OpenAI
        profile_str = ''
        if user_profile:
            profile_str = f"The user has the following health profile, allergies, dietary preferences, and ailments: {user_profile}. "
        prompt = (
            profile_str +
            "Given the following list of food ingredients, generate a JSON object with the following fields:\n"
            "1. 'ingredient_risks': an array where each object contains: 'ingredient', 'risk' (one of: 'safe', 'moderate', 'avoid'), and a brief 'reason'.\n"
            "2. 'healthy_alternatives': an array of 3-5 healthy alternative suggestions (not brands or products), each as an object with 'suggestion' and 'reason' fields. For example: { 'suggestion': 'fresh fruit', 'reason': 'Naturally sweet and high in fiber' }.\n"
            "3. 'ailment_explanations': an array where each object contains: 'ailment' (from the user's profile) and 'why_bad' (explain why this product or its ingredients may be problematic for that ailment).\n"
            f"Ingredients: {ingredients}\n"
            "Respond ONLY with the JSON object."
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({'ingredients': ingredients, 'openai_response': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scan_photo', methods=['POST'])
def scan_photo():
    user_profile = None
    if 'profile' in request.form:
        try:
            user_profile = request.form['profile']
        except Exception:
            user_profile = None
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo uploaded.'}), 400
    photo = request.files['photo']
    if photo.filename == '':
        return jsonify({'error': 'No photo selected.'}), 400
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        photo.save(tmp.name)
        tmp_path = tmp.name
    try:
        # Upload to Open Food Facts image recognition endpoint
        files = {'imagefile': (secure_filename(photo.filename), open(tmp_path, 'rb'), 'image/jpeg')}
        resp = requests.post('https://world.openfoodfacts.org/cgi/product_image_upload.pl?process_image=1', files=files, timeout=20)
        # Extract barcode from response
        m = re.search(r'barcode=(\d+)', resp.text)
        if not m:
            os.unlink(tmp_path)
            return jsonify({'error': 'Barcode not detected in image.'}), 404
        barcode = m.group(1)
        # Now fetch product info
        product_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
        resp2 = requests.get(product_url, timeout=7)
        data = resp2.json()
        if data.get('status') != 1:
            os.unlink(tmp_path)
            return jsonify({'error': 'Product not found.'}), 404
        product = data['product']
        ingredients = product.get('ingredients_text', '')
        if not ingredients:
            os.unlink(tmp_path)
            return jsonify({'error': 'No ingredients found.'}), 404
        # Pass only ingredients to OpenAI
        profile_str = ''
        if user_profile:
            profile_str = f"The user has the following health profile, allergies, dietary preferences, and ailments: {user_profile}. "
        prompt = (
            profile_str +
            "Given the following list of food ingredients, generate a JSON object with the following fields:\n"
            "1. 'ingredient_risks': an array where each object contains: 'ingredient', 'risk' (one of: 'safe', 'moderate', 'avoid'), and a brief 'reason'.\n"
            "2. 'healthy_alternatives': an array of 3-5 healthy alternative suggestions (not brands or products), each as an object with 'suggestion' and 'reason' fields. For example: { 'suggestion': 'fresh fruit', 'reason': 'Naturally sweet and high in fiber' }.\n"
            "3. 'ailment_explanations': an array where each object contains: 'ailment' (from the user's profile) and 'why_bad' (explain why this product or its ingredients may be problematic for that ailment).\n"
            f"Ingredients: {ingredients}\n"
            "Respond ONLY with the JSON object."
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        os.unlink(tmp_path)
        return jsonify({'barcode': barcode, 'ingredients': ingredients, 'openai_response': answer})
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        return jsonify({'error': str(e)}), 500

@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")

# Serve static files (JS, CSS, etc.)
@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# Catch-all route for SPA (serves index.html for all non-API, non-static routes)
@app.errorhandler(404)
def not_found(e):
    # If the path starts with an API route, return original 404
    if request.path.startswith(('/chat', '/scan_url', '/scan_photo')):
        return jsonify({'error': 'Not found'}), 404
    # Otherwise, serve the frontend
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
