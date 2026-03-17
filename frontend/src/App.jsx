import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Estilos globales inyectados en JS (sin archivo CSS externo) ──
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #080c10;
      color: #e2e8f0;
      font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0d1117; }
    ::-webkit-scrollbar-thumb { background: #2a3f52; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3a4f62; }

    .mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }

    input, select, textarea {
      font-family: inherit;
      background: #0d1520;
      border: 1px solid #1e2d3d;
      color: #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      transition: all 0.2s;
      width: 100%;
      outline: none;
    }
    input:hover, select:hover, textarea:hover {
      border-color: #2a3f52;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #00d4ff;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
    input.error, select.error, textarea.error {
      border-color: #ff4444 !important;
    }
    select option { background: #0d1520; color: #e2e8f0; }

    textarea {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      resize: vertical;
      min-height: 280px;
      padding: 14px;
      tab-size: 2;
      color: #e2e8f0;
    }

    button {
      transition: all 0.15s ease;
      font-weight: 600;
    }
    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    button:active:not(:disabled) {
      transform: translateY(0);
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .warning-message {
      color: #ffaa00;
      font-size: 12px;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #1a1a0a;
      border: 1px solid #ffaa00;
      border-radius: 4px;
      padding: 6px 10px;
    }

    .char-counter {
      color: #64748b;
      font-size: 12px;
      margin-top: 6px;
      text-align: right;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInDown {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOutUp {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-12px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .fade-in { animation: fadeIn 0.3s ease forwards; }
    .toast-enter { animation: slideInDown 0.3s ease forwards; }
    .toast-exit { animation: slideOutUp 0.3s ease forwards; }
  `}</style>
)

// ── Colores de estado ──
const STATUS_COLORS = {
  activo:   { bg: '#0a2a1a', border: '#00ff88', text: '#00ff88' },
  inactivo: { bg: '#1a1a0a', border: '#ffaa00', text: '#ffaa00' },
  error:    { bg: '#2a0a0a', border: '#ff4444', text: '#ff4444' },
}

const LANGUAGES = ['Python', 'Node.js']

// ── Componente: Toast Notification ──
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: '#0a2a1a',
    error: '#2a0a0a',
    info: '#0a1a2a',
  }[type]

  const borderColor = {
    success: '#00ff88',
    error: '#ff4444',
    info: '#00d4ff',
  }[type]

  const textColor = {
    success: '#00ff88',
    error: '#ff4444',
    info: '#00d4ff',
  }[type]

  return (
    <div className="toast-enter" style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 8,
      padding: '12px 16px', color: textColor, fontSize: 13, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400,
      boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4)`,
    }}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>{message}</span>
    </div>
  )
}

// ── Componente: Badge de estado ──
function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.inactivo
  return (
    <span className="mono" style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c.border,
        animation: status === 'activo' ? 'pulse 2s infinite' : 'none',
        flexShrink: 0,
      }} />
      {status}
    </span>
  )
}

// ── Componente: Botón ──
function Btn({ children, onClick, variant = 'primary', disabled, small, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Syne', sans-serif", fontWeight: 600,
    opacity: disabled ? 0.6 : 1, ...style,
  }
  const variants = {
    primary:   { background: '#00d4ff', color: '#080c10', padding: small ? '6px 14px' : '10px 22px', fontSize: small ? 12 : 14 },
    danger:    { background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14 },
    secondary: { background: 'transparent', color: '#94a3b8', border: '1px solid #1e2d3d', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14 },
    success:   { background: '#00ff88', color: '#080c10', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14, fontWeight: 600 },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  )
}

// ── Vista: Crear microservicio ──
function CreateView({ onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', language: 'Python', code: '' })
  const [errors, setErrors] = useState({})
  const [warnings, setWarnings] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const PLACEHOLDER = {
    Python: `from http.server import BaseHTTPRequestHandler, HTTPServer
import json, urllib.parse

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        a = int(params.get('a', [0])[0])
        b = int(params.get('b', [0])[0])
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"resultado": a + b}).encode())
    def log_message(self, *args): pass

HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()`,
    'Node.js': `const http = require('http')
const url = require('url')

http.createServer((req, res) => {
  const { a = 0, b = 0 } = url.parse(req.url, true).query
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ resultado: Number(a) + Number(b) }))
}).listen(8080)`
  }

  // ── Funciones de validación ──
  const validateName = (value) => {
    if (!value.trim()) return 'El nombre es obligatorio'
    if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres'
    if (value.length > 30) return 'El nombre no puede exceder 30 caracteres'
    if (!/^[a-z0-9\-]+$/.test(value)) return 'Solo se permiten letras minúsculas, números y guiones'
    return null
  }

  const validateLanguage = (value) => {
    if (!LANGUAGES.includes(value)) return 'Debes seleccionar un lenguaje válido'
    return null
  }

  const validateDescription = (value) => {
    if (value.length > 120) return 'La descripción no puede exceder 120 caracteres'
    return null
  }

  const validateCode = (value) => {
    if (!value.trim()) return 'El código es obligatorio'
    if (value.trim().length < 50) return 'El código debe tener al menos 50 caracteres'
    return null
  }

  const check8080Warning = (value) => {
    if (!value.trim()) return null
    return !value.includes('8080') ? 'El código no menciona el puerto 8080. Asegúrate de que tu servidor escuche en ese puerto.' : null
  }

  // ── Manejo de cambios de campo ──
  const handleFieldChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))

    if (touched[field]) {
      const error = (() => {
        switch(field) {
          case 'name': return validateName(value)
          case 'language': return validateLanguage(value)
          case 'description': return validateDescription(value)
          case 'code': return validateCode(value)
          default: return null
        }
      })()

      if (error) setErrors(e => ({ ...e, [field]: error }))
      else setErrors(e => { const ne = { ...e }; delete ne[field]; return ne })

      const warning = field === 'code' ? check8080Warning(value) : null
      if (warning) setWarnings(w => ({ ...w, [field]: warning }))
      else setWarnings(w => { const nw = { ...w }; delete nw[field]; return nw })
    }
  }

  // ── Manejo de blur de campo ──
  const handleFieldBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }))

    const error = (() => {
      switch(field) {
        case 'name': return validateName(form[field])
        case 'language': return validateLanguage(form[field])
        case 'description': return validateDescription(form[field])
        case 'code': return validateCode(form[field])
        default: return null
      }
    })()

    if (error) setErrors(e => ({ ...e, [field]: error }))
    else setErrors(e => { const ne = { ...e }; delete ne[field]; return ne })

    const warning = field === 'code' ? check8080Warning(form[field]) : null
    if (warning) setWarnings(w => ({ ...w, [field]: warning }))
    else setWarnings(w => { const nw = { ...w }; delete nw[field]; return nw })
  }

  // ── Envío del formulario ──
  async function handleSubmit() {
    setTouched({ name: true, language: true, description: true, code: true })

    const nameError = validateName(form.name)
    const languageError = validateLanguage(form.language)
    const descriptionError = validateDescription(form.description)
    const codeError = validateCode(form.code)

    const newErrors = {}
    if (nameError) newErrors.name = nameError
    if (languageError) newErrors.language = languageError
    if (descriptionError) newErrors.description = descriptionError
    if (codeError) newErrors.code = codeError

    setErrors(newErrors)

    const port8080Warning = check8080Warning(form.code)
    const newWarnings = {}
    if (port8080Warning) newWarnings.code = port8080Warning
    setWarnings(newWarnings)

    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/microservices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Error del servidor')
      const data = await res.json()
      setSuccess(`✓ Microservicio "${form.name}" creado y desplegado exitosamente`)
      setForm({ name: '', description: '', language: 'Python', code: '' })
      setErrors({})
      setWarnings({})
      setTouched({})
      setTimeout(() => onCreated(data), 500)
    } catch (e) {
      setErrors(err => ({ ...err, _submit: e.message }))
    } finally {
      setLoading(false)
    }
  }

  const hasBlockingErrors = Object.keys(errors).length > 0

  return (
    <>
      <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Nuevo microservicio</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>
          Pega tu código, elige el lenguaje y el sistema crea el contenedor automáticamente en Docker.
        </p>

        {/* Fila nombre + lenguaje */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 28 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>Nombre del microservicio</label>
            <input
              className={errors.name ? 'error' : ''}
              placeholder="ej: suma-numeros"
              value={form.name}
              onChange={e => handleFieldChange('name', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              onBlur={() => handleFieldBlur('name')}
            />
            {touched.name && errors.name && (
              <div className="error-message">✕ {errors.name}</div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>Lenguaje</label>
            <select
              className={errors.language ? 'error' : ''}
              value={form.language}
              onChange={e => handleFieldChange('language', e.target.value)}
              onBlur={() => handleFieldBlur('language')}
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
            {touched.language && errors.language && (
              <div className="error-message">✕ {errors.language}</div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Descripción (opcional)</label>
            <span className="char-counter">{form.description.length}/120</span>
          </div>
          <input
            className={errors.description ? 'error' : ''}
            placeholder="¿Qué hace este microservicio?"
            value={form.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            onBlur={() => handleFieldBlur('description')}
          />
          {touched.description && errors.description && (
            <div className="error-message">✕ {errors.description}</div>
          )}
        </div>

        {/* Código */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Código fuente</label>
            <button
              onClick={() => setForm(f => ({ ...f, code: PLACEHOLDER[f.language] }))}
              style={{ fontSize: 11, color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.15s' }}
            >
              Cargar ejemplo
            </button>
          </div>
          <textarea
            className={errors.code ? 'error' : ''}
            placeholder={`Pega aquí tu código en ${form.language}...\n\nEl servidor debe escuchar en el puerto 8080.`}
            value={form.code}
            onChange={e => handleFieldChange('code', e.target.value)}
            onBlur={() => handleFieldBlur('code')}
          />
          {touched.code && errors.code && (
            <div className="error-message">✕ {errors.code}</div>
          )}
          {warnings.code && (
            <div className="warning-message">⚠ {warnings.code}</div>
          )}
        </div>

        {errors._submit && (
          <div style={{ background: '#2a0a0a', border: '1px solid #ff4444', borderRadius: 6, padding: '12px 14px', fontSize: 13, color: '#ff4444', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✕</span>
            {errors._submit}
          </div>
        )}

        <Btn onClick={handleSubmit} disabled={hasBlockingErrors || loading}>
          {loading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid #080c10', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Creando contenedor...
            </>
          ) : '⚡ Crear y desplegar'}
        </Btn>
      </div>
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
    </>
  )
}

// ── Vista: Lista de microservicios ──
function ListaView({ services, onAction, loading }) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 32px', color: '#475569' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #1e2d3d', borderTop: '2px solid #00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
      <p style={{ fontSize: 14 }}>Cargando microservicios...</p>
    </div>
  )

  if (services.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 32px', color: '#475569' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
      <p style={{ fontSize: 16, marginBottom: 8, fontWeight: 500 }}>No hay microservicios aún.</p>
      <p style={{ fontSize: 13 }}>Crea uno en la pestaña "Nuevo" para empezar.</p>
    </div>
  )

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {services.map(svc => (
        <div key={svc.id} style={{
          background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8,
          padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
          transition: 'all 0.2s',
          cursor: 'default',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a3f52'; e.currentTarget.style.background = '#0f1419'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2d3d'; e.currentTarget.style.background = '#0d1117'; }}
        >
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>{svc.name}</span>
              <StatusBadge status={svc.status} />
              <span style={{
                fontSize: 11, background: '#0a1a2a', border: '1px solid #1e3a5a',
                color: '#4a9eff', borderRadius: 4, padding: '3px 8px',
              }} className="mono">{svc.language}</span>
            </div>
            {svc.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{svc.description}</p>}
            {svc.port && (
              <a
                href={`http://localhost:${svc.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ fontSize: 12, color: '#00d4ff', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#00ffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#00d4ff'}
              >
                localhost:{svc.port} ↗
              </a>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {svc.status === 'activo'
              ? <Btn small variant="secondary" onClick={() => onAction(svc.id, 'stop')}>Pausar</Btn>
              : <Btn small variant="success"   onClick={() => onAction(svc.id, 'start')}>Activar</Btn>
            }
            <Btn small variant="danger" onClick={() => onAction(svc.id, 'delete')}>Eliminar</Btn>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── App principal ──
export default function App() {
  const [tab, setTab] = useState('lista')
  const [services, setServices] = useState([])
  const [loadingList, setLoadingList] = useState(false)

  async function fetchServices() {
    setLoadingList(true)
    try {
      const res = await fetch(`${API_URL}/microservices`)
      if (res.ok) setServices(await res.json())
    } catch { /* backend no disponible aún */ }
    finally { setLoadingList(false) }
  }

  // Cargar lista al montar
  useEffect(() => {
    fetchServices()
  }, [])

  function handleTabChange(t) {
    setTab(t)
    if (t === 'lista') fetchServices()
  }

  async function handleAction(id, action) {
    const endpoints = { stop: 'stop', start: 'start', delete: '' }
    const method = action === 'delete' ? 'DELETE' : 'POST'
    const path = action === 'delete'
      ? `${API_URL}/microservices/${id}`
      : `${API_URL}/microservices/${id}/${endpoints[action]}`
    try {
      const res = await fetch(path, { method })
      if (res.ok) fetchServices()
    } catch { alert('Error al comunicarse con el backend.') }
  }

  function handleCreated(data) {
    setServices(prev => [...prev, data])
    setTab('lista')
  }

  const TABS = [
    { id: 'lista', label: '📋 Mis servicios' },
    { id: 'nuevo', label: '⚡ Nuevo' },
  ]

  return (
    <>
      <GlobalStyles />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1e2d3d', padding: '0 32px',
        display: 'flex', alignItems: 'center', height: 60, gap: 32,
        position: 'sticky', top: 0, background: '#080c10', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>◈</span>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px' }}>MicroDeploy</span>
          <span className="mono" style={{ fontSize: 10, color: '#475569', background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 4, padding: '2px 6px', fontWeight: 500 }}>v1.0</span>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              style={{
                background: tab === t.id ? '#0d1520' : 'transparent',
                border: tab === t.id ? '1px solid #1e2d3d' : '1px solid transparent',
                borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
                color: tab === t.id ? '#e2e8f0' : '#64748b',
                fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Contador */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
            {services.filter(s => s.status === 'activo').length} activos / {services.length} total
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: '40px 32px', maxWidth: 960, margin: '0 auto' }}>
        {tab === 'lista' && (
          <ListaView services={services} onAction={handleAction} loading={loadingList} />
        )}
        {tab === 'nuevo' && (
          <CreateView onCreated={handleCreated} />
        )}
      </main>
    </>
  )
}
