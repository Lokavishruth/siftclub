# Ingredient Risk Analyzer (AI-powered, Personalized Nutrition)

## Overview

Ingredient Risk Analyzer is a full-stack AI-powered web application that helps users scan food products and receive personalized ingredient risk reports based on their unique health profile. The app leverages OpenAI GPT for nutrition analysis and Open Food Facts for ingredient data, providing:
- **Personalized ingredient risk assessment** (allergies, dietary needs, health conditions)
- **Actionable healthy alternatives** (not brands, but practical suggestions)
- **Downloadable PDF reports**
- **Modern, user-friendly React UI**
- **Easy deployment with Docker**

---

## Features
- **Scan by Barcode or Photo**: Instantly analyze ingredients from product barcodes or images.
- **User Profile**: Set allergies, dietary preferences, and health conditions for tailored analysis.
- **AI-Powered Risk Assessment**: Each ingredient is flagged as Safe, Moderate, or Avoid, with reasons.
- **Ailment Explanations**: See why ingredients are problematic for your specific health conditions.
- **Healthy Alternative Suggestions**: Get practical, non-brand alternatives for healthier choices.
- **Downloadable PDF**: Export your personalized report for sharing or printing.

---

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- OpenAI API key (for GPT-powered analysis)

### 2. Environment Variables
Create a `.env` file in the project root:
```
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY
```

### 3. Build & Run (Docker)
```bash
docker-compose up --build
```
The app will be available at [http://localhost:5000](http://localhost:5000)

---

## Local Development (Optional)

### Backend (Flask)
```bash
pip install -r requirements.txt
python app.py
```

### Frontend (React + Vite)
```bash
npm install
npm run dev
```

---

## Project Structure
- `app.py` — Flask backend (API, OpenAI integration)
- `src/` — React frontend (profile, scan, report UI)
- `Dockerfile`, `docker-compose.yml` — Containerized full-stack deployment
- `.env` — Secrets (never commit this!)

---

## Security Notes
- **Never expose your OpenAI API key in the frontend!** The backend handles all API calls securely.
- All user data is stored locally in the browser for privacy.

---

## Credits & Data Sources
- [Open Food Facts](https://world.openfoodfacts.org/) for ingredient and product data
- [OpenAI GPT](https://openai.com/) for AI-powered nutrition analysis

---

## License
MIT License. See `LICENSE` file.

---

## Screenshots
<!-- Add screenshots/gifs of the scan, report, and profile pages here for best results -->

---

## Contributing
Pull requests and issues are welcome! For major changes, please open an issue first to discuss what you would like to change.
