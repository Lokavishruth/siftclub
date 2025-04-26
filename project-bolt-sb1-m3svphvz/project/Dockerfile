# ---- Backend (Flask API) ----
FROM python:3.10-slim as backend

WORKDIR /app

# Install backend dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app.py ./
COPY .env ./

# Expose backend port
EXPOSE 5000

# ---- Frontend (Vite/React) ----
FROM node:20-alpine as frontend
WORKDIR /frontend

COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY ./.env ./

COPY src ./src
COPY index.html ./

RUN npm install && npm run build

# ---- Final container ----
FROM python:3.10-slim as final
WORKDIR /app

# Copy backend from backend image
COPY --from=backend /app /app

# Copy frontend build from frontend image
COPY --from=frontend /frontend/dist /app/dist

# Install production server for static files
RUN pip install flask-cors

# Simple server to serve both Flask API and static frontend
COPY app.py ./

# Expose backend port
EXPOSE 5000

CMD ["python", "app.py"]
