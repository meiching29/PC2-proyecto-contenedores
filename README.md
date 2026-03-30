# MicroDeploy — Plataforma de Microservicios

Plataforma web para crear, desplegar y administrar microservicios dinámicamente usando contenedores Docker. Cada microservicio se ejecuta en su propio contenedor, se expone vía HTTP y retorna respuestas en formato JSON.

---

## Integrantes

| Nombre |
|--------|
| Mei Li Ching Franco |
| Donald José Pimienta Pérez |
| Julian Esteban Porto Rangel |
| Camilo Jose Urzola Castillo |

---

## Descripción

**MicroDeploy** permite a cualquier usuario pegar código fuente directamente en un dashboard web, seleccionar el lenguaje de programación (Python o Node.js), y la plataforma construye automáticamente la imagen Docker, despliega el contenedor y expone el endpoint HTTP — todo sin intervención manual.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Usuario (Navegador)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ :3000
┌─────────────────────────▼───────────────────────────────────┐
│                  Frontend (React + Vite)                     │
│         Dashboard para crear y gestionar microservicios      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP :4000
┌─────────────────────────▼───────────────────────────────────┐
│          Backend Orquestador (Node.js + Express)             │
│  - Genera Dockerfile según el lenguaje seleccionado          │
│  - Construye la imagen Docker (docker build)                 │
│  - Despliega el contenedor en puerto dinámico (docker run)   │
│  - Registra los servicios en services.json                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Docker API (TCP / Unix socket)
┌─────────────────────────▼───────────────────────────────────┐
│                        Docker Host                           │
│                                                              │
│   ms-hola-mundo:9000   ms-suma:9001   ms-xxx:9002  ...      │
│   (contenedores creados dinámicamente desde el dashboard)    │
└──────────────────────────────────────────────────────────────┘
```

**Flujo de creación de un microservicio:**
1. El usuario pega código fuente en el dashboard y selecciona el lenguaje
2. El frontend envía el código al backend vía `POST /microservices`
3. El backend genera un `Dockerfile` automáticamente según el lenguaje
4. El backend ejecuta `docker build` para construir la imagen
5. El backend ejecuta `docker run` y asigna un puerto libre (desde el 9000)
6. El microservicio queda expuesto en `http://localhost:PUERTO`

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express + Dockerode |
| Contenedores | Docker + Docker Compose |
| Comunicación | REST API (HTTP/JSON) |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y en ejecución
- Docker Compose (incluido en Docker Desktop)

> **Solo en Windows:** habilitar la API TCP de Docker
> `Docker Desktop → Settings → General → Expose daemon on tcp://localhost:2375 without TLS`

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/meiching29/PC2-proyecto-contenedores.git
cd PC2-proyecto-contenedores

# 2. Levantar todo con un solo comando
docker-compose up --build
```

Abrir el dashboard en: **http://localhost:3000**

Para detener todos los servicios:
```bash
docker-compose down
```

---

## Ejemplos funcionales

> El código pegado en el dashboard debe ser un servidor HTTP que escuche en el puerto 8080. Si no lo hace, el contenedor arranca y se cae de inmediato.

Los siguientes ejemplos están listos para copiar y pegar directamente en el dashboard.

---

### Hola Mundo — Python

**Nombre:** `hola-mundo-py` | **Lenguaje:** Python

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"mensaje": "Hola Mundo", "lenguaje": "Python"}).encode())
    def log_message(self, *args): pass

HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
```

Prueba en el navegador: `http://localhost:PUERTO`
Respuesta esperada: `{"mensaje": "Hola Mundo", "lenguaje": "Python"}`

---

### Hola Mundo — Node.js

**Nombre:** `hola-mundo-node` | **Lenguaje:** Node.js

```javascript
const http = require('http')

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ mensaje: 'Hola Mundo', lenguaje: 'Node.js' }))
}).listen(8080)
```

Prueba en el navegador: `http://localhost:PUERTO`
Respuesta esperada: `{"mensaje": "Hola Mundo", "lenguaje": "Node.js"}`

---

### Suma de dos valores — Python

**Nombre:** `suma-numeros-py` | **Lenguaje:** Python

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json, urllib.parse

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        a = int(params.get('a', [0])[0])
        b = int(params.get('b', [0])[0])
        resultado = a + b
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"a": a, "b": b, "resultado": resultado}).encode())
    def log_message(self, *args): pass

HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
```

Prueba en el navegador: `http://localhost:PUERTO?a=5&b=3`
Respuesta esperada: `{"a": 5, "b": 3, "resultado": 8}`

---

### Suma de dos valores — Node.js

**Nombre:** `suma-numeros-node` | **Lenguaje:** Node.js

```javascript
const http = require('http')
const url = require('url')

http.createServer((req, res) => {
    const { a = 0, b = 0 } = url.parse(req.url, true).query
    const resultado = Number(a) + Number(b)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ a: Number(a), b: Number(b), resultado }))
}).listen(8080)
```

Prueba en el navegador: `http://localhost:PUERTO?a=10&b=7`
Respuesta esperada: `{"a": 10, "b": 7, "resultado": 17}`

---

## Estructura del proyecto

```
PC2-proyecto-contenedores/
├── docker-compose.yml          # Orquestación de servicios
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── App.jsx             # Dashboard completo
└── backend/
    ├── Dockerfile
    ├── index.js                # Servidor Express + lógica Docker
    ├── package.json
    ├── services.json           # Registro de microservicios
    └── builds/                 # Carpeta auto-generada con los builds
```

---

## Video de demostración

[Ver en YouTube](https://youtu.be/Y7sl7uNoPLw?si=1143kKgAWVwOv5sj)


