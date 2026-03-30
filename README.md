# Plataforma de Microservicios
Plataforma web para crear, desplegar y administrar microservicios dinámicamente usando contenedores Docker. Cada microservicio se ejecuta en su propio contenedor, se expone via HTTP y retorna respuestas en formato JSON.


## Arquitectura

```
|---------------------------------------------------------|
|                     Usuario (Navegador)                 |
|---------------------------------------------------------|
                        | :3000
                        |
|---------------------------------------------------------|
|              Frontend  (React + Vite)                   |
|              Dashboard para crear y gestionar           |
|              microservicios                             |
|---------------------------------------------------------|
                        1 HTTP :4000
                        |
|---------------------------------------------------------|
|           Backend Orquestador (Node.js + Express)       |
|  - Genera Dockerfile segun lenguaje                     |
|  - Construye imagen Docker                              |
|  - Despliega contenedor en puerto dinamico              |
|  - Registra servicios en services.json                  |
|---------------------------------------------------------
                        | Docker API
                        |
|----------------------------------------------------------------|
|                      Docker Host                               |
|                                                                |
|      ms-hola:9000       ms-suma:9001      ms-xxx:9002          |
|                                                                |
|----------------------------------------------------------------|
```

- **Frontend** - Dashboard React (Vite) en el puerto `3000`.
- **Backend** - API REST Node.js/Express en el puerto `4000`. Genera Dockerfiles, construye imágenes y gestiona contenedores con `dockerode`.
- **Microservicios** - Contenedores independientes creados dinámicamente, expuestos desde el puerto `9000` en adelante.

## Requisitos previos
1. Docker instalado y en ejecución
2. Docker Compose

**Windows:** Habilitar la opcion `Expose daemon on tcp://localhost:2375 without TLS` en `Settings -> General`


## Instalación

```bash
git clone https://github.com/meiching29/PC2-proyecto-contenedores.git
cd PC2-proyecto-contenedores
docker-compose up --build
```

Abrir el dashboard en **http://localhost:3000**


## Ejemplos

El código pegado en el dashboard debe ser un servidor HTTP que escuche en el puerto 8080. Si no lo hace, el contenedor arranca y se cae de inmediato. Los siguientes ejemplos están listos para usarse.

### Hola Mundo - Python

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"mensaje": "Hola Mundo"}).encode())
    def log_message(self, *args): pass 

HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
```

### Suma de dos valores - Python

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
        self.wfile.write(json.dumps({
            "a": a,
            "b": b,
            "resultado": resultado
        }).encode())
    def log_message(self, *args): pass

HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
```


## Video de demostracion
[Ver en YouTube](https://youtu.be/Y7sl7uNoPLw?si=1143kKgAWVwOv5sj)


## Estructura del proyecto


```
PC2-proyecto-contenedores/
|-- backend/
|   |-- Dockerfile
|   |-- index.js
|   |-- package.json
|   |-- services.json
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |-- Dockerfile
|   |-- package.json
|-- docker-compose.yml
```
