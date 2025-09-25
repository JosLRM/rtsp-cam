const express = require("express");
const expressWs = require("express-ws");
const fs = require("fs");
const path = require("path");
const { parse } = require('url');

const app = express();
expressWs(app);

const { proxy } = require("rtsp-relay")(app);

const PORT = 3000;

//Leer cameras.json
const camerasFile = path.join(__dirname, "cameras.json");
let cameras = [];

try {
  const data = fs.readFileSync(camerasFile, "utf-8");
  cameras = JSON.parse(data);
} catch (err) {
  console.error("Error al leer cameras.json:", err);
}

app.ws("/api/stream", (ws, req) => {
  console.log("Nueva conexión WS, req.url =", req.url);

  const camId = parse(req.url, true).query.cam;
  console.log("camId extraído =", camId);

  const cam = cameras.find((c) => c.id === camId);

  if (!cam) {
    console.error("Cámara no encontrada:", camId);
    try { ws.close(); } catch (e) {/* ignore */ }
    return;
  }

  const handler = proxy({ url: cam.rtsp, verbose: true });
  handler(ws, req);
});

//Endpoint para devolver lista de cámaras (sin exponer usuario/pass)
app.get("/api/cameras", (req, res) => {
  const publicCameras = cameras.map((cam) => ({
    id: cam.id,
    responsable: cam.responsable,
    domicilio: cam.domicilio,
    telefono: cam.telefono,
    numero_serie: cam.numero_serie,
    latitud: cam.latitud,
    longitud: cam.longitud,
    ddns: cam.ddns
    //No incluimos usuario, password ni rtsp en la respuesta pública
  }));

  res.json(publicCameras);
});

// Servir frontend
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
