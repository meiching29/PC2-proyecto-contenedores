import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Iconos SVG en línea ──
const Icons = {
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  play: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
  checkmark: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  pause: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  info: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  box: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
}

// Estilos globales inyectados en JS  
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

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-valid-icon {
      position: absolute;
      right: 12px;
      color: #00ff88;
      pointer-events: none;
      display: flex;
      animation: fadeIn 0.2s ease forwards;
    }

    input, select, textarea {
      font-family: inherit;
      background: #0d1520;
      border: 1px solid #1e2d3d;
      color: #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      outline: none;
    }
    input:hover, select:hover, textarea:hover {
      border-color: #2a3f52;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #00d4ff;
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
    }
    input.error, select.error, textarea.error {
      border-color: #ff4444 !important;
      box-shadow: 0 0 12px rgba(255, 68, 68, 0.15) !important;
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
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      border-radius: 6px;
      font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: none;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      background: transparent;
      color: #94a3b8;
      border: 1px solid transparent;
      border-radius: 6px;
    }
    .icon-btn:hover {
      background: #1e2d3d;
      color: #e2e8f0;
    }
    .icon-btn.danger:hover {
      background: #2a0a0a;
      color: #ff4444;
      border-color: #ff4444;
    }
    .icon-btn.success:hover {
      background: #0a2a1a;
      color: #00ff88;
      border-color: #00ff88;
    }

    .card {
       background: #0d1117;
       border: 1px solid #1e2d3d;
       border-radius: 8px;
       padding: 18px 20px;
       display: flex;
       align-items: center;
       gap: 16px;
       transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card:hover {
       transform: translateY(-3px);
       border-color: #2a3f52;
       background: #0f1419;
       box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .shimmer-bg {
      background: #1e2d3d;
      background-image: linear-gradient(90deg, #1e2d3d 0px, #2a3f52 40px, #1e2d3d 80px);
      background-size: 800px 100%;
      animation: shimmer 2s infinite linear;
    }

    .fade-in { animation: fadeIn 0.3s ease forwards; }
    .toast-enter { animation: slideInDown 0.3s ease forwards; }
    .toast-exit { animation: slideOutUp 0.3s ease forwards; }
  `}</style>
)

// Colores de estado 
const STATUS_COLORS = {
  activo: { bg: '#0a2a1a', border: '#00ff88', text: '#00ff88' },
  inactivo: { bg: '#1a1a0a', border: '#ffaa00', text: '#ffaa00' },
  error: { bg: '#2a0a0a', border: '#ff4444', text: '#ff4444' },
}

const LANGUAGES = ['Python', 'Node.js']

// Componente: Toast Notification 
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    // Quitar automaticamente despues de 3 seg
    const timer = setTimeout(onClose, 3000)
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

  const icon = {
    success: Icons.checkmark,
    error: Icons.x,
    info: Icons.info,
  }[type]

  return (
    <div className="toast-enter" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 8,
      padding: '12px 16px', color: textColor, fontSize: 13, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400,
      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`,
    }}>
      <span style={{ display: 'flex' }}>{icon}</span>
      <span>{message}</span>
    </div>
  )
}

// Componente: Badge de estado 
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

// Componente: Botón 
function Btn({ children, onClick, variant = 'primary', disabled, small, style = {} }) {
  const variants = {
    primary: { background: '#00d4ff', color: '#080c10', padding: small ? '6px 14px' : '10px 22px', fontSize: small ? 12 : 14 },
    danger: { background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14 },
    secondary: { background: 'transparent', color: '#94a3b8', border: '1px solid #1e2d3d', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14 },
    success: { background: '#00ff88', color: '#080c10', padding: small ? '5px 12px' : '9px 20px', fontSize: small ? 12 : 14, fontWeight: 600 },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...variants[variant], cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontFamily: "'Syne', sans-serif", ...style }}>
      {children}
    </button>
  )
}

// Vista: Crear microservicio 
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

  // Funciones de validación 
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
    return null
  }

  const check8080Warning = (value) => {
    if (!value.trim()) return null
    return !value.includes('8080') ? 'El código no menciona el puerto 8080. Asegúrate de que tu servidor escuche en ese puerto.' : null
  }

  // Manejo de cambios de campo 
  const handleFieldChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => {
      const ne = { ...e }
      delete ne[field]
      delete ne._submit
      return ne
    })
    const warning = field === 'code' ? check8080Warning(value) : null
    if (warning) setWarnings(w => ({ ...w, [field]: warning }))
    else setWarnings(w => { const nw = { ...w }; delete nw[field]; return nw })
  }

  // Manejo de blur de campo 
  const handleFieldBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }))

    const error = (() => {
      switch (field) {
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

  // Envío del formulario 
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
      if (!res.ok) {
        const errData = await res.json()
        if (res.status === 409) {
          setErrors(e => ({ ...e, name: errData.message }))
          setTouched(t => ({ ...t, name: true }))
          return
        }
        throw new Error(errData.message || 'No se pudo crear el microservicio. Revisa los datos y vuelve a intentar.')
      }
      const data = await res.json()
      setSuccess(`Microservicio "${form.name}" creado y desplegado exitosamente`)
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
            <div className="input-wrapper">
              <input
                className={errors.name ? 'error' : ''}
                placeholder="ej: suma-numeros"
                value={form.name}
                onChange={e => handleFieldChange('name', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                onBlur={() => handleFieldBlur('name')}
              />
              {touched.name && !errors.name && form.name.length > 0 && <span className="input-valid-icon">{Icons.checkmark}</span>}
            </div>
            {touched.name && errors.name && (
              <div className="error-message"><span>{Icons.x}</span> {errors.name}</div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>Lenguaje</label>
            <div className="input-wrapper">
              <select
                className={errors.language ? 'error' : ''}
                value={form.language}
                onChange={e => handleFieldChange('language', e.target.value)}
                onBlur={() => handleFieldBlur('language')}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              {touched.language && !errors.language && <span className="input-valid-icon" style={{ right: 30 }}>{Icons.checkmark}</span>}
            </div>
            {touched.language && errors.language && (
              <div className="error-message"><span>{Icons.x}</span> {errors.language}</div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Descripción (opcional)</label>
            <span className="char-counter">{form.description.length}/120</span>
          </div>
          <div className="input-wrapper">
            <input
              className={errors.description ? 'error' : ''}
              placeholder="¿Qué hace este microservicio?"
              value={form.description}
              onChange={e => handleFieldChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description')}
            />
            {touched.description && !errors.description && form.description.length > 0 && <span className="input-valid-icon">{Icons.checkmark}</span>}
          </div>
          {touched.description && errors.description && (
            <div className="error-message"><span>{Icons.x}</span> {errors.description}</div>
          )}
        </div>

        {/* Código */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Código fuente</label>
            <button
              onClick={() => {
                setForm(f => ({ ...f, code: PLACEHOLDER[f.language] }));
                setErrors(e => { const ne = { ...e }; delete ne.code; return ne });
              }}
              style={{ fontSize: 11, color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 600, transition: 'all 0.15s' }}
            >
              Usar un ejemplo
            </button>
          </div>
          <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
            <textarea
              className={errors.code ? 'error' : ''}
              placeholder={`Pega aquí tu código en ${form.language}...\n\nEl servidor debe escuchar en el puerto 8080.`}
              value={form.code}
              onChange={e => handleFieldChange('code', e.target.value)}
              onBlur={() => handleFieldBlur('code')}
            />
            {touched.code && !errors.code && form.code.length > 0 && <span className="input-valid-icon" style={{ top: 24 }}>{Icons.checkmark}</span>}
          </div>
          {touched.code && errors.code && (
            <div className="error-message"><span>{Icons.x}</span> {errors.code}</div>
          )}
          {warnings.code && (
            <div className="warning-message"><span>{Icons.warning}</span> {warnings.code}</div>
          )}
        </div>

        {errors._submit && (
          <div style={{ background: '#2a0a0a', border: '1px solid #ff4444', borderRadius: 6, padding: '12px 14px', fontSize: 13, color: '#ff4444', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{Icons.x}</span>
            {errors._submit}
          </div>
        )}

        <Btn onClick={handleSubmit} disabled={hasBlockingErrors || loading}>
          {loading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid #080c10', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Creando contenedor...
            </>
          ) : (
            <><span>{Icons.play}</span> Crear y desplegar</>
          )}
        </Btn>
      </div>
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
    </>
  )
}

// Vista: Lista de microservicios 
function ListaView({ services, onAction, loading, onSwitchTab }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, port) => {
    navigator.clipboard.writeText(`http://localhost:${port}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="card shimmer-bg" style={{ height: 90, border: 'none' }} />
      ))}
    </div>
  )

  if (services.length === 0) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '100px 32px', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: 24, color: '#1e2d3d' }}>{Icons.box}</div>
      <h3 style={{ fontSize: 20, color: '#e2e8f0', marginBottom: 8, fontWeight: 700 }}>No hay microservicios aún</h3>
      <p style={{ fontSize: 14, marginBottom: 24 }}>Crea tu primer servicio para empezar a gestionar tus contenedores.</p>
      <Btn onClick={() => onSwitchTab('nuevo')}>
        <span>{Icons.plus}</span> Crear mi primer microservicio
      </Btn>
    </div>
  )

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {services.map(svc => (
        <div key={svc.id} className="card" style={{
          borderLeft: confirmDeleteId === svc.id ? '2px solid #ff4444' : undefined,
          paddingLeft: confirmDeleteId === svc.id ? '19px' : undefined
        }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href={`http://localhost:${svc.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#00d4ff', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00ffff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#00d4ff'}
                >
                  localhost:{svc.port} <span>{Icons.external}</span>
                </a>
                <button
                  onClick={() => handleCopy(svc.id, svc.port)}
                  style={{
                    background: 'none', border: 'none', color: copiedId === svc.id ? '#00ff88' : '#64748b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 6px',
                    borderRadius: 4, transition: 'all 0.2s', outline: 'none', fontFamily: "'Syne', sans-serif"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e2d3d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Copiar enlace"
                >
                  <span>{copiedId === svc.id ? Icons.checkmark : Icons.copy}</span>
                  {copiedId === svc.id ? '¡Listo!' : 'Copiar enlace'}
                </button>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {svc.status === 'activo'
              ? <button title="Pausar" onClick={() => onAction(svc.id, 'stop')} style={{ width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg></button>
              : <button title="Activar" onClick={() => onAction(svc.id, 'start')} style={{ width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><svg width="16" height="16" viewBox="0 0 24 24" fill="#00ff88" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg></button>
            }
            <button title="Eliminar" onClick={() => onAction(svc.id, 'delete')} style={{ width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg></button>
          </div>
        </div>
      ))}
    </div>
  )
}

// App principal 
export default function App() {
  const [tab, setTab] = useState('lista')
  const [services, setServices] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  async function fetchServices() {
    setLoadingList(true)
    try {
      const res = await fetch(`${API_URL}/microservices`)
      if (res.ok) setServices(await res.json())
      else throw new Error('Error al cargar microservicios')
    } catch {
      setGlobalError('No se pudo cargar la lista de microservicios.')
    }
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
      if (!res.ok) throw new Error('Error en la operación del servidor.')
      if (res.ok) fetchServices()
    } catch {
      setGlobalError('Hubo un problema al ejecutar la acción solicitada.')
    }
  }

  function handleCreated(data) {
    setServices(prev => [...prev, data])
    setTab('lista')
  }

  const TABS = [
    { id: 'lista', label: 'Mis servicios' },
    { id: 'nuevo', label: 'Nuevo' },
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
          <span style={{ fontSize: 22, fontWeight: 700, color: '#00d4ff' }}>◈</span>
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
                fontSize: 13, fontFamily: "'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 600,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t.id === 'lista' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              )}
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
          <ListaView services={services} onAction={handleAction} loading={loadingList} onSwitchTab={handleTabChange} />
        )}
        {tab === 'nuevo' && (
          <CreateView onCreated={handleCreated} />
        )}
      </main>

      {/* Global Error Toast */}
      {globalError && <Toast message={globalError} type="error" onClose={() => setGlobalError(null)} />}
    </>
  )
}
