const express = require('express')
const cors = require('cors')
const Docker = require('dockerode')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const app = express()
const PORT = 4000

// CONEXIÓN A DOCKER
// Usa DOCKER_HOST si está definido (dentro de Docker en Windows)
// Si no, detecta automáticamente según el sistema operativo
function createDockerConnection() {
    if (process.env.DOCKER_HOST) {
        const url = new URL(process.env.DOCKER_HOST)
        return new Docker({ host: url.hostname, port: parseInt(url.port) })
    }
    if (process.platform === 'win32') {
        return new Docker({ host: '127.0.0.1', port: 2375 })
    }
    return new Docker({ socketPath: '/var/run/docker.sock' })
}

const docker = createDockerConnection()

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// REGISTRO DE MICROSERVICIOS (archivo JSON simple)
const DB_PATH = path.join(__dirname, 'services.json')

function readServices() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    } catch {
        return []
    }
}

function writeServices(services) {
    fs.writeFileSync(DB_PATH, JSON.stringify(services, null, 2))
}

// PUERTO LIBRE
function getNextPort() {
    const services = readServices()
    const usedPorts = services.map(s => s.port).filter(Boolean)
    let port = 9000
    while (usedPorts.includes(port)) port++
    return port
}

// GENERAR DOCKERFILE SEGÚN LENGUAJE
function generateDockerfile(language) {
    if (language === 'Python') {
        return `FROM python:3.11-alpine
WORKDIR /app
COPY main.py .
EXPOSE 8080
CMD ["python", "main.py"]`
    }

    if (language === 'Node.js') {
        return `FROM node:20-alpine
WORKDIR /app
COPY main.js .
EXPOSE 8080
CMD ["node", "main.js"]`
    }

    throw new Error(`Lenguaje no soportado: ${language}`)
}

// NOMBRE DEL ARCHIVO SEGÚN LENGUAJE
function getFileName(language) {
    if (language === 'Python') return 'main.py'
    if (language === 'Node.js') return 'main.js'
    throw new Error(`Lenguaje no soportado: ${language}`)
}

// ENDPOINTS

// GET /microservices — listar todos
app.get('/microservices', (req, res) => {
    res.json(readServices())
})

// POST /microservices — crear y desplegar
app.post('/microservices', async (req, res) => {
    const { name, description, language, code } = req.body

    if (!name || !code || !language) {
        return res.status(400).json({ message: 'name, code y language son obligatorios.' })
    }

    const services = readServices()
    if (services.find(s => s.name === name)) {
        return res.status(409).json({ message: `Ya existe un microservicio llamado "${name}".` })
    }

    const id = `ms-${name}-${Date.now()}`
    const port = getNextPort()
    const buildDir = path.join(__dirname, 'builds', id)

    try {
        // Crear carpeta temporal con el código y el Dockerfile
        fs.mkdirSync(buildDir, { recursive: true })
        fs.writeFileSync(path.join(buildDir, getFileName(language)), code)
        fs.writeFileSync(path.join(buildDir, 'Dockerfile'), generateDockerfile(language))

        // Build de la imagen Docker
        console.log(`[${id}] Construyendo imagen...`)
        const buildStream = await docker.buildImage(
            { context: buildDir, src: ['Dockerfile', getFileName(language)] },
            { t: id }
        )

        // Esperar a que termine el build
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(buildStream, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // Correr el contenedor
        console.log(`[${id}] Lanzando contenedor en puerto ${port}...`)
        const container = await docker.createContainer({
            Image: id,
            name: id,
            ExposedPorts: { '8080/tcp': {} },
            HostConfig: {
                PortBindings: { '8080/tcp': [{ HostPort: String(port) }] },
                AutoRemove: false,
            },
        })
        await container.start()

        // Guardar en el registro
        const newService = {
            id,
            name,
            description: description || '',
            language,
            port,
            status: 'activo',
            createdAt: new Date().toISOString(),
        }

        const updated = [...readServices(), newService]
        writeServices(updated)

        console.log(`[${id}] ✓ Microservicio activo en localhost:${port}`)
        res.status(201).json(newService)

    } catch (err) {
        console.error(`[${id}] Error:`, err.message)

        // Limpiar carpeta temporal si algo falló
        try { fs.rmSync(buildDir, { recursive: true, force: true }) } catch { }

        res.status(500).json({ message: `Error al crear el microservicio: ${err.message}` })
    }
})

// POST /microservices/:id/stop — pausar
app.post('/microservices/:id/stop', async (req, res) => {
    const { id } = req.params
    try {
        const container = docker.getContainer(id)
        await container.stop()

        const services = readServices().map(s =>
            s.id === id ? { ...s, status: 'inactivo' } : s
        )
        writeServices(services)

        res.json({ message: 'Microservicio pausado.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// POST /microservices/:id/start — reactivar
app.post('/microservices/:id/start', async (req, res) => {
    const { id } = req.params
    try {
        const container = docker.getContainer(id)
        await container.start()

        const services = readServices().map(s =>
            s.id === id ? { ...s, status: 'activo' } : s
        )
        writeServices(services)

        res.json({ message: 'Microservicio reactivado.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// DELETE /microservices/:id — eliminar contenedor e imagen
app.delete('/microservices/:id', async (req, res) => {
    const { id } = req.params
    try {
        // Detener y eliminar contenedor
        try {
            const container = docker.getContainer(id)
            await container.stop().catch(() => { }) // Se ignora si ya esta detenido
            await container.remove()
        } catch { }

        // Eliminar imagen
        try {
            const image = docker.getImage(id)
            await image.remove({ force: true })
        } catch { }

        // Eliminar carpeta de build
        const buildDir = path.join(__dirname, 'builds', id)
        try { fs.rmSync(buildDir, { recursive: true, force: true }) } catch { }

        // Quitar del registro
        const services = readServices().filter(s => s.id !== id)
        writeServices(services)

        res.json({ message: 'Microservicio eliminado.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Arrancar servidor 
app.listen(PORT, () => {
    console.log(`\n Backend corriendo en http://localhost:${PORT}`)
    console.log(`   Conectado a Docker: ${process.platform === 'win32' ? 'TCP 2375' : 'Unix socket'}`)
    console.log(`   Endpoints disponibles:`)
    console.log(`   GET    /microservices`)
    console.log(`   POST   /microservices`)
    console.log(`   POST   /microservices/:id/start`)
    console.log(`   POST   /microservices/:id/stop`)
    console.log(`   DELETE /microservices/:id\n`)
})