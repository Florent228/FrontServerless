# Stage 1: Build de l'application
FROM node:18-alpine AS builder

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache git

# Copie des fichiers de configuration des dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installation des dépendances
RUN npm ci --only=production=false

# Copie du code source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build de l'application pour la production
RUN npm run build

# Stage 2: Serveur de production avec nginx
FROM nginx:alpine AS production

# Installation de curl pour les health checks
RUN apk add --no-cache curl

# Copie de la configuration nginx personnalisée
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gestion du routing côté client pour les SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Copie des fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"] 