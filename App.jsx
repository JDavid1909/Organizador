import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'

/* ---------- Constantes y utilidades ---------- */

const CATEGORIAS = ['Estudio', 'Casa', 'Trabajo', 'Personal']
const ICONO_CATEGORIA = {
  Estudio: 'estudio',
  Casa: 'casa',
  Trabajo: 'trabajo',
  Personal: 'personal',
}
const PRIORIDADES = ['alta', 'media', 'baja']
const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 }
const ETIQUETA_PRIORIDAD = { alta: 'Alta', media: 'Intermedia', baja: 'Baja' }

const TAREAS_INICIALES = [
  { id: 't1', titulo: 'Repasar la Unidad 3 del curso', categoria: 'Estudio', prioridad: 'alta', fecha: '', hecha: false },
  { id: 't2', titulo: 'Ordenar el escritorio', categoria: 'Casa', prioridad: 'baja', fecha: '', hecha: false },
]

const HABITOS_INICIALES = [
  { id: 'h1', nombre: 'Beber 2 litros de agua', dias: {} },
  { id: 'h2', nombre: 'Leer 20 minutos', dias: {} },
]

function claveDia(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}

function ultimosDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d
  })
}

function calcularRacha(dias) {
  let racha = 0
  const d = new Date()
  if (!dias[claveDia(d)]) d.setDate(d.getDate() - 1)
  while (dias[claveDia(d)]) {
    racha++
    d.setDate(d.getDate() - 1)
  }
  return racha
}

function parsearClave(clave) {
  const [y, m, d] = clave.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatearFecha(clave) {
  return parsearClave(clave).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/* Hook propio: estado que se guarda en localStorage (Unidad 2: ciclo de vida) */
function usePersistente(clave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado ? JSON.parse(guardado) : inicial
    } catch {
      return inicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [clave, valor])

  return [valor, setValor]
}

/* ---------- Iconos (SVG propios, sin librerías) ---------- */

const ICONOS = {
  tareas: (
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </>
  ),
  racha: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  resumen: (
    <>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </>
  ),
  mas: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  basura: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  calendario: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  alerta: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </>
  ),
  izquierda: <path d="m15 18-6-6 6-6" />,
  derecha: <path d="m9 18 6-6-6-6" />,
  bandera: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  checkCirculo: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  estudio: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
  casa: (
    <>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  trabajo: (
    <>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </>
  ),
  personal: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
}

function Icono({ nombre, tam = 18 }) {
  return (
    <svg
      className="icono"
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONOS[nombre]}
    </svg>
  )
}

/* ---------- Componentes de estructura ---------- */

function Header({ pendientes, vencidas }) {
  const fecha = new Date().toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return (
    <header className="header">
      <p className="header-fecha">
        <Icono nombre="calendario" tam={16} />
        {fecha}
      </p>
      <div className="header-titulo">
        <span className="header-logo">
          <Icono nombre="checkCirculo" tam={30} />
        </span>
        <h1>Mis tareas y hábitos</h1>
      </div>
      <p className="header-estado">
        {pendientes === 0
          ? 'No tienes tareas pendientes.'
          : `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'}`}
        {vencidas > 0 && ` · ${vencidas} ${vencidas === 1 ? 'vencida' : 'vencidas'}`}
      </p>
    </header>
  )
}

function Tabs({ activa, onCambiar }) {
  const opciones = [
    { id: 'tareas', texto: 'Tareas', icono: 'tareas' },
    { id: 'habitos', texto: 'Hábitos', icono: 'racha' },
    { id: 'resumen', texto: 'Resumen', icono: 'resumen' },
  ]
  return (
    <nav className="tabs" aria-label="Secciones">
      {opciones.map((op) => (
        <button
          key={op.id}
          type="button"
          className={activa === op.id ? 'tab activa' : 'tab'}
          aria-current={activa === op.id ? 'page' : undefined}
          onClick={() => onCambiar(op.id)}
        >
          <Icono nombre={op.icono} />
          {op.texto}
        </button>
      ))}
    </nav>
  )
}

/* ---------- Selector de fecha (calendario propio) ---------- */

const NOMBRES_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function FechaSelector({ value, onChange }) {
  const [abierto, setAbierto] = useState(false)
  const [mes, setMes] = useState(() => {
    const base = value ? parsearClave(value) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const contenedor = useRef(null)

  // Cerrar al hacer clic fuera o al pulsar Escape
  useEffect(() => {
    if (!abierto) return
    const alClicar = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false)
    }
    const alTecla = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alClicar)
    document.addEventListener('keydown', alTecla)
    return () => {
      document.removeEventListener('mousedown', alClicar)
      document.removeEventListener('keydown', alTecla)
    }
  }, [abierto])

  const alternar = () => {
    if (!abierto) {
      const base = value ? parsearClave(value) : new Date()
      setMes(new Date(base.getFullYear(), base.getMonth(), 1))
    }
    setAbierto(!abierto)
  }

  const elegir = (fecha) => {
    onChange(fecha ? claveDia(fecha) : '')
    setAbierto(false)
  }

  const anio = mes.getFullYear()
  const numMes = mes.getMonth()
  const desfase = (new Date(anio, numMes, 1).getDay() + 6) % 7 // la semana empieza en lunes
  const diasDelMes = new Date(anio, numMes + 1, 0).getDate()
  const celdas = [
    ...Array(desfase).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ]
  const hoy = claveDia(new Date())

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)

  return (
    <div className="campo selector-fecha" ref={contenedor}>
      <span>Fecha límite (opcional)</span>
      <button
        type="button"
        className="selector-boton"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={alternar}
      >
        <Icono nombre="calendario" />
        {value
          ? parsearClave(value).toLocaleDateString('es', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
          : 'Elegir fecha'}
      </button>

      {abierto && (
        <div className="calendario" role="dialog" aria-label="Elegir fecha límite">
          <div className="calendario-cabecera">
            <button
              type="button"
              className="calendario-nav"
              aria-label="Mes anterior"
              onClick={() => setMes(new Date(anio, numMes - 1, 1))}
            >
              <Icono nombre="izquierda" />
            </button>
            <p className="calendario-mes">
              {mes.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              className="calendario-nav"
              aria-label="Mes siguiente"
              onClick={() => setMes(new Date(anio, numMes + 1, 1))}
            >
              <Icono nombre="derecha" />
            </button>
          </div>

          <div className="calendario-grid">
            {NOMBRES_DIAS.map((n, i) => (
              <span key={i} className="calendario-dia-semana">{n}</span>
            ))}
            {celdas.map((dia, i) => {
              if (dia === null) return <span key={`v${i}`} />
              const fecha = new Date(anio, numMes, dia)
              const clave = claveDia(fecha)
              const clases = ['calendario-dia']
              if (clave === value) clases.push('elegido')
              if (clave === hoy) clases.push('es-hoy')
              return (
                <button
                  key={clave}
                  type="button"
                  className={clases.join(' ')}
                  aria-pressed={clave === value}
                  aria-label={fecha.toLocaleDateString('es', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  onClick={() => elegir(fecha)}
                >
                  {dia}
                </button>
              )
            })}
          </div>

          <div className="calendario-atajos">
            <button type="button" onClick={() => elegir(new Date())}>Hoy</button>
            <button type="button" onClick={() => elegir(manana)}>Mañana</button>
            <button type="button" onClick={() => elegir(null)}>Sin fecha</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Tareas ---------- */

function TareaForm({ onAgregar }) {
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [prioridad, setPrioridad] = useState('media')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    const limpio = titulo.trim()
    if (limpio.length < 3) {
      setError('Escribe al menos 3 caracteres.')
      return
    }
    onAgregar({ titulo: limpio, categoria, prioridad, fecha })
    setTitulo('')
    setFecha('')
    setError('')
  }

  return (
    <form className="card form" onSubmit={enviar}>
      <h2 className="titulo-icono">
        <Icono nombre="mas" tam={22} />
        Nueva tarea
      </h2>

      <label className="campo">
        <span>Título</span>
        <input
          type="text"
          value={titulo}
          placeholder="¿Qué necesitas hacer?"
          aria-invalid={Boolean(error)}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          <Icono nombre="alerta" tam={16} />
          {error}
        </p>
      )}

      <div className="campo-fila">
        <label className="campo">
          <span>Categoría</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Prioridad</span>
          <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{ETIQUETA_PRIORIDAD[p]}</option>
            ))}
          </select>
        </label>
      </div>

      <FechaSelector value={fecha} onChange={setFecha} />

      <button type="submit" className="btn btn-principal">
        <Icono nombre="mas" />
        Agregar tarea
      </button>
    </form>
  )
}

function TareaItem({ tarea, vencida, onAlternar, onEliminar }) {
  const clases = ['tarea', `prioridad-${tarea.prioridad}`]
  if (tarea.hecha) clases.push('hecha')

  return (
    <li className={clases.join(' ')}>
      <label className="tarea-check">
        <input type="checkbox" checked={tarea.hecha} onChange={() => onAlternar(tarea.id)} />
        <span className="tarea-titulo">{tarea.titulo}</span>
      </label>
      <div className="tarea-meta">
        <span className={`chip cat-${tarea.categoria}`}>
          <Icono nombre={ICONO_CATEGORIA[tarea.categoria]} tam={14} />
          {tarea.categoria}
        </span>
        <span className="meta-texto con-icono">
          <Icono nombre="bandera" tam={14} />
          Prioridad {ETIQUETA_PRIORIDAD[tarea.prioridad].toLowerCase()}
        </span>
        {tarea.fecha && (
          <span className={vencida ? 'meta-texto con-icono vencida' : 'meta-texto con-icono'}>
            <Icono nombre={vencida ? 'alerta' : 'calendario'} tam={14} />
            {vencida ? 'Venció el ' : 'Para el '}
            {formatearFecha(tarea.fecha)}
          </span>
        )}
        <button
          type="button"
          className="btn-borrar"
          aria-label={`Eliminar ${tarea.titulo}`}
          onClick={() => onEliminar(tarea.id)}
        >
          <Icono nombre="basura" tam={15} />
          Eliminar
        </button>
      </div>
    </li>
  )
}

function PantallaTareas({ tareas, onAgregar, onAlternar, onEliminar, onLimpiar }) {
  const [filtro, setFiltro] = useState('todas')
  const [categoria, setCategoria] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const hoy = claveDia(new Date())

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    const lista = tareas.filter((t) => {
      if (filtro === 'pendientes' && t.hecha) return false
      if (filtro === 'hechas' && !t.hecha) return false
      if (categoria !== 'todas' && t.categoria !== categoria) return false
      if (texto) {
        // La búsqueda mira el título, la categoría, la prioridad y el estado
        const estado = t.hecha ? 'hecha hechas completada completadas' : 'pendiente pendientes'
        const contenido = normalizar(`${t.titulo} ${t.categoria} ${ETIQUETA_PRIORIDAD[t.prioridad]} ${estado}`)
        if (!contenido.includes(texto)) return false
      }
      return true
    })
    if (orden === 'prioridad') {
      lista.sort((a, b) => ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad])
    } else if (orden === 'fecha') {
      lista.sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999'))
    }
    return lista
  }, [tareas, filtro, categoria, busqueda, orden])

  const hayHechas = tareas.some((t) => t.hecha)
  const conteo = {
    todas: tareas.length,
    pendientes: tareas.filter((t) => !t.hecha).length,
    hechas: tareas.filter((t) => t.hecha).length,
  }

  let mensajeVacio = 'Ninguna tarea coincide con estos filtros.'
  if (tareas.length === 0) {
    mensajeVacio = 'Aún no tienes tareas. Agrega la primera desde el formulario.'
  } else if (!busqueda.trim() && categoria === 'todas') {
    if (filtro === 'hechas') {
      mensajeVacio = 'Aún no has completado ninguna tarea. Marca una con su casilla y aparecerá aquí.'
    } else if (filtro === 'pendientes') {
      mensajeVacio = 'No te queda nada pendiente.'
    }
  }

  return (
    <div className="tareas-layout">
      <TareaForm onAgregar={onAgregar} />

      <section className="card lista-card">
        <div className="toolbar">
          <div className="busqueda-caja">
            <Icono nombre="buscar" />
            <input
              type="search"
              placeholder="Buscar tareas"
              aria-label="Buscar tareas"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select aria-label="Ordenar por" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="prioridad">Por prioridad</option>
            <option value="fecha">Por fecha límite</option>
          </select>
        </div>

        <div className="filtros" role="group" aria-label="Filtrar por estado">
          {['todas', 'pendientes', 'hechas'].map((op) => (
            <button
              key={op}
              type="button"
              className={filtro === op ? 'filtro activo' : 'filtro'}
              onClick={() => setFiltro(op)}
            >
              {op} ({conteo[op]})
            </button>
          ))}
        </div>

        <div className="filtros" role="group" aria-label="Filtrar por categoría">
          {['todas', ...CATEGORIAS].map((op) => (
            <button
              key={op}
              type="button"
              className={categoria === op ? 'filtro activo' : 'filtro'}
              onClick={() => setCategoria(op)}
            >
              {op !== 'todas' && <Icono nombre={ICONO_CATEGORIA[op]} tam={14} />}
              {op}
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <div className="vacio">
            <Icono nombre="tareas" tam={36} />
            <p>{mensajeVacio}</p>
          </div>
        ) : (
          <ul className="lista">
            {visibles.map((t) => (
              <TareaItem
                key={t.id}
                tarea={t}
                vencida={!t.hecha && t.fecha !== '' && t.fecha < hoy}
                onAlternar={onAlternar}
                onEliminar={onEliminar}
              />
            ))}
          </ul>
        )}

        {hayHechas && (
          <button type="button" className="btn btn-suave" onClick={onLimpiar}>
            <Icono nombre="basura" />
            Limpiar tareas completadas
          </button>
        )}
      </section>
    </div>
  )
}

/* ---------- Hábitos ---------- */

function PantallaHabitos({ habitos, onAgregar, onMarcar, onEliminar }) {
  const [nombre, setNombre] = useState('')
  const dias = ultimosDias(7)
  const hoy = claveDia(new Date())

  const enviar = (e) => {
    e.preventDefault()
    if (nombre.trim().length < 3) return
    onAgregar(nombre.trim())
    setNombre('')
  }

  return (
    <section className="card">
      <h2 className="titulo-icono">
        <Icono nombre="racha" tam={22} />
        Últimos 7 días
      </h2>

      <form className="habito-form" onSubmit={enviar}>
        <input
          type="text"
          value={nombre}
          placeholder="Nuevo hábito, por ejemplo: Estirar 10 minutos"
          aria-label="Nuevo hábito"
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="submit" className="btn btn-principal">
          <Icono nombre="mas" />
          Agregar hábito
        </button>
      </form>

      {habitos.length === 0 ? (
        <div className="vacio">
          <Icono nombre="racha" tam={36} />
          <p>Aún no tienes hábitos. Agrega uno para empezar a marcar tus días.</p>
        </div>
      ) : (
        <ul className="habitos">
          {habitos.map((h) => {
            const racha = calcularRacha(h.dias)
            return (
              <li key={h.id} className="habito">
                <div className="habito-cabecera">
                  <div>
                    <p className="habito-nombre">{h.nombre}</p>
                    <p className="meta-texto con-icono">
                      <Icono nombre="racha" tam={14} />
                      Racha: {racha} {racha === 1 ? 'día' : 'días'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-borrar"
                    aria-label={`Eliminar hábito ${h.nombre}`}
                    onClick={() => onEliminar(h.id)}
                  >
                    <Icono nombre="basura" tam={15} />
                    Eliminar
                  </button>
                </div>
                <div className="semana">
                  {dias.map((d) => {
                    const clave = claveDia(d)
                    const marcado = Boolean(h.dias[clave])
                    return (
                      <button
                        key={clave}
                        type="button"
                        className={['dia', marcado ? 'marcado' : '', clave === hoy ? 'hoy' : ''].join(' ').trim()}
                        aria-pressed={marcado}
                        aria-label={`${d.toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}: ${marcado ? 'hecho' : 'pendiente'}`}
                        onClick={() => onMarcar(h.id, clave)}
                      >
                        <span className="dia-nombre">{d.toLocaleDateString('es', { weekday: 'short' })}</span>
                        <span className="dia-numero">{d.getDate()}</span>
                        <span className="dia-marca">{marcado && <Icono nombre="check" tam={14} />}</span>
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/* ---------- Resumen ---------- */

function Barra({ valor, total, color }) {
  const pct = total === 0 ? 0 : Math.round((valor / total) * 100)
  return (
    <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="barra-relleno" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function PantallaResumen({ tareas, habitos }) {
  const hoy = claveDia(new Date())
  const total = tareas.length
  const hechas = tareas.filter((t) => t.hecha).length
  const vencidas = tareas.filter((t) => !t.hecha && t.fecha && t.fecha < hoy).length
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100)
  const mejorRacha = habitos.reduce((max, h) => Math.max(max, calcularRacha(h.dias)), 0)

  const colores = {
    Estudio: 'var(--azul)',
    Casa: 'var(--limonada-oscura)',
    Trabajo: 'var(--vino)',
    Personal: 'var(--azul-claro)',
  }

  return (
    <div className="resumen">
      <div className="stats">
        <div className="card stat stat-azul">
          <Icono nombre="checkCirculo" tam={26} />
          <p className="stat-cifra">{porcentaje}%</p>
          <p>completado</p>
        </div>
        <div className="card stat stat-claro">
          <Icono nombre="tareas" tam={26} />
          <p className="stat-cifra">{hechas}/{total}</p>
          <p>tareas hechas</p>
        </div>
        <div className="card stat stat-vino">
          <Icono nombre="reloj" tam={26} />
          <p className="stat-cifra">{vencidas}</p>
          <p>vencidas</p>
        </div>
        <div className="card stat stat-limonada">
          <Icono nombre="racha" tam={26} />
          <p className="stat-cifra">{mejorRacha}</p>
          <p>mejor racha de hábitos</p>
        </div>
      </div>

      <section className="card">
        <h2 className="titulo-icono">
          <Icono nombre="resumen" tam={22} />
          Avance por categoría
        </h2>
        <ul className="categorias">
          {CATEGORIAS.map((cat) => {
            const deCat = tareas.filter((t) => t.categoria === cat)
            const listas = deCat.filter((t) => t.hecha).length
            return (
              <li key={cat}>
                <div className="categoria-fila">
                  <span className="con-icono">
                    <Icono nombre={ICONO_CATEGORIA[cat]} />
                    {cat}
                  </span>
                  <span className="meta-texto">{listas} de {deCat.length}</span>
                </div>
                <Barra valor={listas} total={deCat.length} color={colores[cat]} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

/* ---------- App ---------- */

function App() {
  const [tareas, setTareas] = usePersistente('mis-tareas-v2', TAREAS_INICIALES)
  const [habitos, setHabitos] = usePersistente('mis-habitos-v1', HABITOS_INICIALES)
  const [pantalla, setPantalla] = useState('tareas')

  const agregarTarea = (datos) =>
    setTareas((prev) => [{ id: crypto.randomUUID(), hecha: false, ...datos }, ...prev])

  const alternarTarea = (id) =>
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)))

  const eliminarTarea = (id) => setTareas((prev) => prev.filter((t) => t.id !== id))

  const limpiarHechas = () => setTareas((prev) => prev.filter((t) => !t.hecha))

  const agregarHabito = (nombre) =>
    setHabitos((prev) => [...prev, { id: crypto.randomUUID(), nombre, dias: {} }])

  const marcarDia = (id, clave) =>
    setHabitos((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h
        const dias = { ...h.dias }
        if (dias[clave]) delete dias[clave]
        else dias[clave] = true
        return { ...h, dias }
      })
    )

  const eliminarHabito = (id) => setHabitos((prev) => prev.filter((h) => h.id !== id))

  const hoy = claveDia(new Date())
  const pendientes = tareas.filter((t) => !t.hecha).length
  const vencidas = tareas.filter((t) => !t.hecha && t.fecha && t.fecha < hoy).length

  return (
    <main className="app">
      <Header pendientes={pendientes} vencidas={vencidas} />
      <Tabs activa={pantalla} onCambiar={setPantalla} />

      {pantalla === 'tareas' && (
        <PantallaTareas
          tareas={tareas}
          onAgregar={agregarTarea}
          onAlternar={alternarTarea}
          onEliminar={eliminarTarea}
          onLimpiar={limpiarHechas}
        />
      )}
      {pantalla === 'habitos' && (
        <PantallaHabitos
          habitos={habitos}
          onAgregar={agregarHabito}
          onMarcar={marcarDia}
          onEliminar={eliminarHabito}
        />
      )}
      {pantalla === 'resumen' && <PantallaResumen tareas={tareas} habitos={habitos} />}
    </main>
  )
}

export default App