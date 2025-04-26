#!/bin/bash
set -e

# 1. Build frontend
npm install
npm run build

# 2. Ensure backend dependencies
pip install -r requirements.txt

# 3. Move frontend build to static dir for Flask
rm -rf dist
mv ./dist ./static || mv ./dist ./static || true
