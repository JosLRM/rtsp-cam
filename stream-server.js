const express = require('express');
const expressWs = require('express-ws');   // 👈 importar express-ws

const app = express();
expressWs(app); // 👈 habilitar soporte para websockets en express

const { proxy } = require('rtsp-relay')(app);

const PORT = 3000;

// Configura tu stream RTSP (cambia usuario, pass, ip y puerto)
const handler = proxy({
  url: 'rtsp://192.168.1.12:1935/',
  verbose: true,
});

// Ruta WebSocket para el stream
app.ws('/api/stream', handler);

// Servir frontend desde public/
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


