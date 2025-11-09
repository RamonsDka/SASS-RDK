#!/bin/sh

echo "🚀 Iniciando RDK Server Monitor..."

# Iniciar servidor backend en segundo plano
echo "📡 Iniciando servidor backend en puerto 3001..."
node server/index.js &
BACKEND_PID=$!

# Esperar un momento para que el backend inicie
sleep 2

# Servir frontend en puerto 7771
echo "🌐 Sirviendo frontend en puerto 7771..."
npx serve -s dist -l 7771 &
FRONTEND_PID=$!

echo "✅ RDK Server Monitor iniciado correctamente"
echo "   - Backend API: http://localhost:3001"
echo "   - Frontend: http://localhost:7771"
echo "   - Usuario admin: rdk"
echo "   - Contraseña: *Ra8097164412"

# Mantener el script corriendo
wait $BACKEND_PID $FRONTEND_PID
