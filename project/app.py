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

import logging
# Set ERROR level logs on Render, INFO otherwise
log_level = logging.ERROR if os.environ.get('RENDER') else logging.INFO
logging.basicConfig(level=log_level, format='%(asctime)s %(levelname)s %(message)s')

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__, static_folder="dist", static_url_path="/")
CORS(app)
# Allow up to 32MB uploads (increase if needed)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024

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
    print('Received request to /scan_url')
    data = request.get_json()
    url = data.get('url', '')
    user_profile = data.get('profile', None)
    print(f'URL: {url}, user_profile: {user_profile}')
    if not url:
        print('No URL provided')
        return jsonify({'error': 'No URL provided.'}), 400
    # Extract barcode from Open Food Facts URL
    m = re.search(r'/product/(\d+)', url)
    if not m:
        print('Invalid Open Food Facts URL')
        return jsonify({'error': 'Invalid Open Food Facts URL.'}), 400
    barcode = m.group(1)
    product_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
    print(f'Fetching product info from: {product_url}')
    try:
        resp = requests.get(product_url, timeout=7)
        print(f'Product info response status: {resp.status_code}')
        data = resp.json()
        if data.get('status') != 1:
            print('Product not found')
            return jsonify({'error': 'Product not found.'}), 404
        product = data['product']
        ingredients = product.get('ingredients_text', '')
        if not ingredients:
            print('No ingredients found')
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
        print('Sending prompt to OpenAI')
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        print('Returning AI response')
        return jsonify({'ingredients': ingredients, 'openai_response': answer})
    except Exception as e:
        print(f'Error in /scan_url: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/barcode-lookup', methods=['POST'])
def barcode_lookup():
    data = request.get_json()
    barcode = data.get('barcode', '').strip()
    if not barcode:
        return jsonify({'error': 'No barcode provided.'}), 400
    url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get('status') == 1:
            product = data['product']
            return jsonify({
                'product_name': product.get('product_name', ''),
                'brands': product.get('brands', ''),
                'code': product.get('code', barcode),
                'ingredients_text': product.get('ingredients_text', 'Not available')
            })
        else:
            return jsonify({'error': 'Product not found.'}), 404
    except Exception as e:
        return jsonify({'error': 'Lookup failed.'}), 500

import logging
import traceback

@app.route('/scan_photo', methods=['POST'])
def scan_photo():
    print('Received request to /scan_photo')
    user_profile = None
    barcode = None
    ingredients = None

    # Barcode parser: extract barcode from possible fields or text
    def extract_barcode(value):
        import re
        # Accepts barcodes as numbers, or as part of a URL (e.g. Open Food Facts)
        if not value:
            return None
        # Try to find a sequence of 8-14 digits (common barcode lengths)
        m = re.search(r'(\d{8,14})', value)
        if m:
            return m.group(1)
        return None

    if 'profile' in request.form:
        user_profile = request.form['profile']
    photo_file = request.files.get('photo')

    if 'barcode' in request.form:
        barcode = extract_barcode(request.form['barcode'])
        if not barcode:
            return jsonify({'error': 'No valid barcode provided.'}), 400

    if barcode:
        product_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
        logging.info(f'Fetching product info from: {product_url}')
        try:
            resp = requests.get(product_url, timeout=7)
            logging.info(f'Open Food Facts response status: {resp.status_code}')
            resp.raise_for_status()

            data = resp.json()
            logging.info("Successfully parsed Open Food Facts JSON response.")

            if data.get('status') != 1 or 'product' not in data:
                logging.warning('Product not found or invalid response from Open Food Facts')
                return jsonify({'error': 'Product not found in Open Food Facts database.'}), 404

            product = data['product']
            ingredients = product.get('ingredients_text', '')
            if not ingredients:
                logging.warning('No ingredients found for product')
                return jsonify({'error': 'No ingredients listed for this product.'}), 404
            logging.info("Successfully extracted ingredients from Open Food Facts.")

        except requests.exceptions.Timeout:
            logging.error(f'Timeout fetching Open Food Facts for barcode {barcode}')
            return jsonify({'error': 'Timeout contacting Open Food Facts.'}), 504
        except requests.exceptions.HTTPError as e:
            logging.error(f'HTTP error fetching Open Food Facts for barcode {barcode}: {e}')
            if e.response.status_code == 404:
                return jsonify({'error': 'Product not found in Open Food Facts database.'}), 404
            else:
                return jsonify({'error': f'Error contacting Open Food Facts: Status {e.response.status_code}'}), 502
        except requests.exceptions.RequestException as e:
            logging.error(f'Network error fetching Open Food Facts for barcode {barcode}: {e}')
            logging.error(traceback.format_exc())
            return jsonify({'error': f'Network error contacting Open Food Facts: {str(e)}'}), 502
        except ValueError as e:
            logging.error(f'JSON decode error for Open Food Facts barcode {barcode}: {e}')
            logging.error(traceback.format_exc())
            return jsonify({'error': 'Invalid response received from Open Food Facts.'}), 502
        except KeyError as e:
            logging.error(f'Missing key in Open Food Facts response for barcode {barcode}: {e}')
            logging.error(traceback.format_exc())
            return jsonify({'error': 'Unexpected data format from Open Food Facts.'}), 500
        except Exception as e:
            logging.error(f'Unexpected error fetching/processing Open Food Facts for barcode {barcode}: {e}')
            logging.error(traceback.format_exc())
            return jsonify({'error': 'An unexpected error occurred while fetching product info.'}), 500

    elif photo_file:
        logging.info('Using provided photo file.')
        filename = secure_filename(photo_file.filename or 'upload.bin')
        fd, tmp_path = tempfile.mkstemp()
        try:
            photo_file.save(tmp_path)
            logging.info(f'Photo saved temporarily to: {tmp_path}')

            scan_api_url = 'https://api.scanifly.com/barcode/scan'
            logging.info(f'Sending photo to barcode scanning API: {scan_api_url}')
            with open(tmp_path, 'rb') as f:
                files = {'photo': (filename, f, photo_file.mimetype)}
                try:
                    resp = requests.post(scan_api_url, files=files, timeout=15)
                    logging.info(f'Barcode scanning API response status: {resp.status_code}')
                    resp.raise_for_status()

                    scan_data = resp.json()
                    logging.info("Successfully parsed barcode scanning API JSON response.")

                    barcode = scan_data.get('barcode')
                    if not barcode:
                        logging.warning('Barcode not detected in image by external API')
                        return jsonify({'error': 'Barcode not detected in the provided image.'}), 400

                    logging.info(f'Barcode detected by API: {barcode}')

                    product_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
                    logging.info(f'Fetching product info from: {product_url}')

                    resp2 = requests.get(product_url, timeout=10)
                    logging.info(f'Open Food Facts response status: {resp2.status_code}')
                    resp2.raise_for_status()

                    data = resp2.json()
                    logging.info("Successfully parsed Open Food Facts JSON response.")

                    if data.get('status') != 1 or 'product' not in data:
                        logging.warning('Product not found or invalid response from Open Food Facts')
                        return jsonify({'error': 'Product not found in Open Food Facts database.'}), 404

                    product = data['product']
                    ingredients = product.get('ingredients_text', '')
                    if not ingredients:
                        logging.warning('No ingredients found for product')
                        return jsonify({'error': 'No ingredients listed for this product.'}), 404
                    logging.info("Successfully extracted ingredients from Open Food Facts.")

                except requests.exceptions.Timeout:
                    logging.error('Timeout contacting external API (Scanifly or Open Food Facts)')
                    return jsonify({'error': 'Timeout contacting external services.'}), 504
                except requests.exceptions.HTTPError as e:
                    logging.error(f'HTTP error contacting external API: {e}')
                    if e.response.status_code == 400:
                        return jsonify({'error': 'Error scanning barcode from image (API returned 400).'}), 400
                    return jsonify({'error': f'Error contacting external services: Status {e.response.status_code}'}), 502
                except requests.exceptions.RequestException as e:
                    logging.error(f'Network error contacting external API: {e}')
                    logging.error(traceback.format_exc())
                    return jsonify({'error': f'Network error contacting external services: {str(e)}'}), 502
                except ValueError as e:
                    logging.error(f'JSON decode error from external API: {e}')
                    logging.error(traceback.format_exc())
                    return jsonify({'error': 'Invalid response received from external services.'}), 502
                except KeyError as e:
                    logging.error(f'Missing key in external API response: {e}')
                    logging.error(traceback.format_exc())
                    return jsonify({'error': 'Unexpected data format from external services.'}), 500
                except Exception as e:
                    logging.error(f'Unexpected error during photo processing or API calls: {e}')
                    logging.error(traceback.format_exc())
                    return jsonify({'error': 'An unexpected error occurred while processing the photo.'}), 500
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                    logging.info(f'Deleted temporary file: {tmp_path}')
                except Exception as e_unlink:
                    logging.error(f'Error deleting temporary file {tmp_path}: {e_unlink}')

    else:
        logging.error('No barcode or photo provided in request.')
        return jsonify({'error': 'No barcode or photo provided.'}), 400

    # At this point, we have ingredients
    try:
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
        logging.info('Sending prompt to OpenAI')
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        logging.info('Returning AI response')
        return jsonify({'barcode': barcode, 'ingredients': ingredients, 'openai_response': answer})
    except openai.error.APIConnectionError as e:
        logging.error(f'OpenAI API connection error: {e}')
        return jsonify({'error': 'Could not connect to OpenAI API. Please try again later.'}), 503
    except Exception as e:
        logging.error(f'Error in OpenAI call: {e}')
        logging.error(traceback.format_exc())
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
    if request.path.startswith(('/chat', '/scan_url', '/scan_photo', '/api/barcode-lookup')):
        return jsonify({'error': 'Not found'}), 404
    # Otherwise, serve the frontend
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host="0.0.0.0", port=port)
