# Etapa 1: Build del frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build del frontend
RUN pnpm run build

# Etapa 2: Imagen final con Node.js para backend y frontend
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm y serve
RUN npm install -g pnpm serve

# Copiar package.json y instalar solo dependencias de producción
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copiar servidor backend
COPY server ./server

# Copiar build del frontend desde la etapa anterior
COPY --from=frontend-builder /app/dist ./dist

# Copiar script de inicio
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Crear directorio para base de datos
RUN mkdir -p /app/server/data

# Exponer puertos
EXPOSE 7771 3001

# Variables de entorno
ENV NODE_ENV=production
ENV DB_PATH=/app/server/data/users.db
ENV JWT_SECRET=rdk-server-monitor-secret-key-2024

# Ejecutar script de inicio
CMD ["./start.sh"]
