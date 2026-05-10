import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import reservaService from '../services/reservaService';
import './Reservas.css';

// ── Número a letras (pesos argentinos) ──────────────────────────────────────
const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
  'DIECIOCHO', 'DIECINUEVE'];
const DECENAS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function cientos(n) {
  if (n === 0) return '';
  if (n < 20) return UNIDADES[n];
  if (n < 100) {
    const d = Math.floor(n / 10), u = n % 10;
    if (d === 2 && u > 0) return `VEINTI${UNIDADES[u]}`;
    return u === 0 ? DECENAS[d] : `${DECENAS[d]} Y ${UNIDADES[u]}`;
  }
  const c = Math.floor(n / 100), resto = n % 100;
  if (n === 100) return 'CIEN';
  return resto === 0 ? CENTENAS[c] : `${CENTENAS[c]} ${cientos(resto)}`;
}

function numeroALetras(num) {
  if (!num || isNaN(num)) return '';
  const n = Math.round(parseFloat(num));
  if (n === 0) return 'CERO PESOS';
  const miles = Math.floor(n / 1000), resto = n % 1000;
  let resultado = '';
  if (miles > 0) {
    resultado += miles === 1 ? 'MIL' : `${cientos(miles)} MIL`;
  }
  if (resto > 0) resultado += (resultado ? ' ' : '') + cientos(resto);
  return resultado + ' PESOS';
}

// ── Fecha en letras ──────────────────────────────────────────────────────────
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fechaLetras(d) {
  const fecha = d ? new Date(d + 'T00:00:00') : new Date();
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

// ── Status badges ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'status-pendiente' },
  APROBADA:   { label: 'Aprobada',   cls: 'status-aprobada' },
  RECHAZADA:  { label: 'Rechazada',  cls: 'status-rechazada' },
  CANCELADA:  { label: 'Cancelada',  cls: 'status-cancelada' },
};

const GARANTIAS_OPTIONS = ['Propietaria', 'Laboral', 'Recibo de sueldo', 'Seguro de caución', 'Aval bancario'];
const CONDICION_FISCAL_OPTIONS = ['Consumidor Final', 'Responsable Inscripto', 'Monotributista', 'Exento', 'Otro'];

const EMPTY_GARANTE = { nombre: '', dni: '', cuil: '', domicilio: '', descripcionBien: '' };
const EMPTY_FORM = {
  nombre: '', apellido: '', apellidoMaterno: '', dni: '', cuil: '',
  fechaNacimiento: '', domicilioActual: '', telefono: '', email: '',
  condicionFiscal: 'Consumidor Final', profesion: '',
  propiedad: '', propertyId: null,
  monto: '', montoInformes: '',
  tipoGarantia: [],
  cantidadPersonas: '', tieneCoinquilino: false, coinquilinoNombre: '',
  garantes: [{ ...EMPTY_GARANTE }],
};

// ── Documento FC1 (Recibo de Reserva) ───────────────────────────────────────
function ReciboPreview({ r }) {
  const apellidoMayus = r.apellido ? r.apellido.toUpperCase() : '';
  const nombreCompleto = [r.nombre, r.apellidoMaterno, apellidoMayus].filter(Boolean).join(' ');
  const tipoGarantiaStr = Array.isArray(r.tipoGarantia)
    ? r.tipoGarantia.join(' + ')
    : (r.tipoGarantia || '');

  return (
    <div className="recibo-doc">
      <div className="recibo-header">
        <div className="recibo-logo-area">
          <div className="recibo-logo-placeholder">S. RAMASCO PADILLA<br/>Negocios Inmobiliarios</div>
        </div>
        <div className="recibo-title-area">
          <h2 className="recibo-title">RECIBO DE RESERVA DE LOCACIÓN</h2>
        </div>
      </div>

      <p className="recibo-body">
        En la ciudad de Rosario, Provincia de Santa Fe, a los <strong>{fechaLetras()}</strong>, se recibe de{' '}
        <strong>{nombreCompleto || '__________'}</strong>,{' '}
        DNI N° <strong>{r.dni || '__________'}</strong>,{' '}
        CUIL N° <strong>{r.cuil || '__________'}</strong>,{' '}
        con domicilio en <strong>{r.domicilioActual || '__________'}</strong>,{' '}
        condición frente al IVA: <strong>{r.condicionFiscal || '__________'}</strong>,{' '}
        la suma de <strong>{numeroALetras(r.monto)}</strong>{' '}
        (<strong>${r.monto ? Number(r.monto).toLocaleString('es-AR') : '___'}</strong>),{' '}
        en concepto de <strong>RESERVA DE LOCACIÓN</strong> del inmueble ubicado en{' '}
        <strong>{r.propiedad || '__________'}</strong>.
      </p>

      {tipoGarantiaStr && (
        <p className="recibo-body">
          <strong>TIPO DE GARANTÍA:</strong> {tipoGarantiaStr}
        </p>
      )}

      {r.garantes && r.garantes.length > 0 && r.garantes[0]?.nombre && (
        <div className="recibo-garantes">
          <p className="recibo-body"><strong>GARANTES:</strong></p>
          {r.garantes.map((g, i) => (
            <p key={i} className="recibo-body recibo-garante-row">
              {g.nombre}{g.dni ? `, DNI N° ${g.dni}` : ''}{g.cuil ? `, CUIL N° ${g.cuil}` : ''}{g.domicilio ? `, domicilio: ${g.domicilio}` : ''}{g.descripcionBien ? ` — ${g.descripcionBien}` : ''}
            </p>
          ))}
        </div>
      )}

      {r.montoInformes && (
        <p className="recibo-body">
          <strong>HONORARIOS POR INFORMES Y ESTUDIO DE ANTECEDENTES:</strong>{' '}
          {numeroALetras(r.montoInformes)}{' '}
          (<strong>${Number(r.montoInformes).toLocaleString('es-AR')}</strong>)
        </p>
      )}

      <p className="recibo-body">
        La presente reserva tendrá validez hasta tanto se verifiquen los informes y antecedentes
        de los garantes propuestos. En caso de no aprobarse la operación, se procederá a la
        devolución del importe recibido. Una vez aprobada la operación, en caso de desistir el
        locatario, perderá la suma entregada en concepto de reserva.
      </p>

      <div className="recibo-firma">
        <div className="recibo-firma-bloque">
          <div className="recibo-firma-linea" />
          <p className="recibo-firma-nombre">SEBASTIÁN RAMASCO PADILLA</p>
          <p className="recibo-firma-cargo">NEGOCIOS INMOBILIARIOS</p>
          <p className="recibo-firma-mat">Mat. C.I.C.I.C.P.S.F. N° 829</p>
        </div>
        <div className="recibo-firma-bloque">
          <div className="recibo-firma-linea" />
          <p className="recibo-firma-nombre">{nombreCompleto || 'LOCATARIO'}</p>
          <p className="recibo-firma-cargo">DNI N° {r.dni || '___________'}</p>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM, garantes: [{ ...EMPTY_GARANTE }] });
  const [dniLoading, setDniLoading] = useState(false);
  const [dniError, setDniError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [selectedReserva, setSelectedReserva] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fileInputRef = useRef();
  const printRef = useRef();

  const loadReservas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservaService.getReservas();
      setReservas(data);
    } catch {
      setError('Error al cargar las reservas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReservas(); }, []);

  // ── DNI AI reading ──────────────────────────────────────────────────────
  const handleDniUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDniError(null);
    setDniLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        try {
          const result = await reservaService.readDni(base64, mimeType);
          setFormData(prev => ({
            ...prev,
            nombre: result.nombre || prev.nombre,
            apellido: result.apellido || prev.apellido,
            dni: result.dni || prev.dni,
            cuil: result.cuil || prev.cuil,
            fechaNacimiento: result.fecha_nacimiento || prev.fechaNacimiento,
          }));
        } catch (err) {
          setDniError(err.response?.data?.message || 'No se pudo leer el DNI. Complete los datos manualmente.');
        } finally {
          setDniLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setDniError('Error al procesar la imagen.');
      setDniLoading(false);
    }
  };

  // ── Form field change ──────────────────────────────────────────────────
  const setField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleGarantia = (opt) => {
    setFormData(prev => {
      const current = Array.isArray(prev.tipoGarantia) ? prev.tipoGarantia : [];
      return {
        ...prev,
        tipoGarantia: current.includes(opt) ? current.filter(g => g !== opt) : [...current, opt],
      };
    });
  };

  const setGarante = (idx, field, value) => {
    setFormData(prev => {
      const garantes = [...prev.garantes];
      garantes[idx] = { ...garantes[idx], [field]: value };
      return { ...prev, garantes };
    });
  };

  const addGarante = () => setFormData(prev => ({ ...prev, garantes: [...prev.garantes, { ...EMPTY_GARANTE }] }));
  const removeGarante = (idx) => setFormData(prev => ({ ...prev, garantes: prev.garantes.filter((_, i) => i !== idx) }));

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        tipoGarantia: Array.isArray(formData.tipoGarantia) ? formData.tipoGarantia.join(' + ') : formData.tipoGarantia,
        garantes: formData.garantes.filter(g => g.nombre.trim()),
        monto: formData.monto ? parseFloat(formData.monto) : null,
        montoInformes: formData.montoInformes ? parseFloat(formData.montoInformes) : null,
        cantidadPersonas: formData.cantidadPersonas ? parseInt(formData.cantidadPersonas) : null,
        fechaNacimiento: formData.fechaNacimiento || null,
        propertyId: null,
      };
      await reservaService.createReserva(payload);
      setShowForm(false);
      setFormData({ ...EMPTY_FORM, garantes: [{ ...EMPTY_GARANTE }] });
      loadReservas();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al guardar la reserva');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Preview ───────────────────────────────────────────────────────────
  const openPreview = async (id) => {
    setPreviewLoading(true);
    try {
      const data = await reservaService.getReserva(id);
      if (data.tipoGarantia && typeof data.tipoGarantia === 'string') {
        data.tipoGarantia = data.tipoGarantia.split(' + ').map(s => s.trim());
      }
      setSelectedReserva(data);
    } catch {
      setError('Error al cargar la reserva');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id) => {
    try {
      await reservaService.deleteReserva(id);
      setConfirmDelete(null);
      loadReservas();
    } catch {
      setError('Error al eliminar la reserva');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  const formatDate = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleDateString('es-AR');
  };

  return (
    <Layout title="Reservas">
      <div className="reservas-page">

        <div className="reservas-toolbar">
          <h2 className="reservas-heading">Recibos de Reserva</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nueva Reserva
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Cargando reservas...</span>
          </div>
        ) : reservas.length === 0 ? (
          <div className="empty-state">No hay reservas registradas</div>
        ) : (
          <div className="table-container">
            <table className="reservas-table">
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>DNI</th>
                  <th>Propiedad</th>
                  <th>Monto</th>
                  <th>Garantía</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, cls: 'status-pendiente' };
                  return (
                    <tr key={r.id}>
                      <td data-label="Inquilino">
                        {r.nombre} <strong>{r.apellido?.toUpperCase()}</strong>
                      </td>
                      <td data-label="DNI">{r.dni}</td>
                      <td data-label="Propiedad">{r.propiedad}</td>
                      <td data-label="Monto">${Number(r.monto).toLocaleString('es-AR')}</td>
                      <td data-label="Garantía">{r.tipoGarantia || '-'}</td>
                      <td data-label="Estado">
                        <span className={`status-badge ${sc.cls}`}>{sc.label}</span>
                      </td>
                      <td data-label="Fecha">{formatDate(r.createdAt)}</td>
                      <td data-label="Acciones">
                        <div className="row-actions">
                          <button
                            className="action-btn"
                            onClick={() => openPreview(r.id)}
                            title="Ver / Imprimir recibo"
                          >
                            🖨
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => setConfirmDelete(r)}
                            title="Eliminar"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal: Nueva Reserva ─────────────────────────────────────── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => !submitLoading && setShowForm(false)}>
            <div className="modal modal-lg reservas-form-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nueva Reserva de Locación</h2>
                <button className="modal-close" onClick={() => setShowForm(false)} disabled={submitLoading}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="reservas-form">

                {/* DNI upload */}
                <div className="form-section">
                  <div className="form-section-title">Lectura automática de DNI</div>
                  <div className="dni-upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDniUpload}
                      className="dni-file-input"
                      id="dni-file"
                    />
                    <label htmlFor="dni-file" className={`dni-upload-btn ${dniLoading ? 'loading' : ''}`}>
                      {dniLoading ? 'Leyendo DNI con IA...' : '📷 Subir foto del DNI'}
                    </label>
                    {dniError && <p className="field-error">{dniError}</p>}
                    {!dniError && !dniLoading && (
                      <p className="dni-hint">Opcional — completa los datos de abajo manualmente o sube una foto para que la IA los complete automáticamente.</p>
                    )}
                  </div>
                </div>

                {/* Datos del inquilino */}
                <div className="form-section">
                  <div className="form-section-title">Datos del Inquilino</div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre *</label>
                      <input value={formData.nombre} onChange={e => setField('nombre', e.target.value)} required placeholder="Juan" />
                    </div>
                    <div className="form-group">
                      <label>Apellido *</label>
                      <input value={formData.apellido} onChange={e => setField('apellido', e.target.value)} required placeholder="GARCÍA" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Apellido Materno</label>
                      <input value={formData.apellidoMaterno} onChange={e => setField('apellidoMaterno', e.target.value)} placeholder="Opcional" />
                    </div>
                    <div className="form-group">
                      <label>DNI *</label>
                      <input value={formData.dni} onChange={e => setField('dni', e.target.value)} required placeholder="30123456" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>CUIL</label>
                      <input value={formData.cuil} onChange={e => setField('cuil', e.target.value)} placeholder="20-30123456-5" />
                    </div>
                    <div className="form-group">
                      <label>Fecha de nacimiento</label>
                      <input type="date" value={formData.fechaNacimiento} onChange={e => setField('fechaNacimiento', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Domicilio actual *</label>
                    <input value={formData.domicilioActual} onChange={e => setField('domicilioActual', e.target.value)} required placeholder="Mitre 1234, Rosario" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input value={formData.telefono} onChange={e => setField('telefono', e.target.value)} placeholder="+54 341 555-0000" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={formData.email} onChange={e => setField('email', e.target.value)} placeholder="juan@email.com" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Condición fiscal *</label>
                      <select value={formData.condicionFiscal} onChange={e => setField('condicionFiscal', e.target.value)} required>
                        {CONDICION_FISCAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Profesión</label>
                      <input value={formData.profesion} onChange={e => setField('profesion', e.target.value)} placeholder="Empleado" />
                    </div>
                  </div>
                </div>

                {/* Datos de la operación */}
                <div className="form-section">
                  <div className="form-section-title">Datos de la Operación</div>

                  <div className="form-group">
                    <label>Propiedad *</label>
                    <input value={formData.propiedad} onChange={e => setField('propiedad', e.target.value)} required placeholder="Corrientes 456, Piso 3 Dto. A, Rosario" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Monto de reserva ($) *</label>
                      <input type="number" min="0" step="0.01" value={formData.monto} onChange={e => setField('monto', e.target.value)} required placeholder="50000" />
                      {formData.monto && <p className="monto-letras">{numeroALetras(formData.monto)}</p>}
                    </div>
                    <div className="form-group">
                      <label>Honorarios por informes ($)</label>
                      <input type="number" min="0" step="0.01" value={formData.montoInformes} onChange={e => setField('montoInformes', e.target.value)} placeholder="0" />
                      {formData.montoInformes && <p className="monto-letras">{numeroALetras(formData.montoInformes)}</p>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tipo de garantía</label>
                    <div className="garantias-checkboxes">
                      {GARANTIAS_OPTIONS.map(opt => (
                        <label key={opt} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={Array.isArray(formData.tipoGarantia) && formData.tipoGarantia.includes(opt)}
                            onChange={() => toggleGarantia(opt)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Garantes */}
                <div className="form-section">
                  <div className="form-section-title">Garantes</div>
                  {formData.garantes.map((g, idx) => (
                    <div key={idx} className="garante-card">
                      <div className="garante-card-header">
                        <span className="garante-num">Garante {idx + 1}</span>
                        {formData.garantes.length > 1 && (
                          <button type="button" className="garante-remove" onClick={() => removeGarante(idx)}>× Quitar</button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nombre completo</label>
                          <input value={g.nombre} onChange={e => setGarante(idx, 'nombre', e.target.value)} placeholder="Ana López" />
                        </div>
                        <div className="form-group">
                          <label>DNI</label>
                          <input value={g.dni} onChange={e => setGarante(idx, 'dni', e.target.value)} placeholder="28000000" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>CUIL</label>
                          <input value={g.cuil} onChange={e => setGarante(idx, 'cuil', e.target.value)} placeholder="27-28000000-3" />
                        </div>
                        <div className="form-group">
                          <label>Domicilio</label>
                          <input value={g.domicilio} onChange={e => setGarante(idx, 'domicilio', e.target.value)} placeholder="San Martín 100, Rosario" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Descripción del bien (garantía propietaria)</label>
                        <input value={g.descripcionBien} onChange={e => setGarante(idx, 'descripcionBien', e.target.value)} placeholder="Depto. en Peatonal Laprida 555, Rosario — libre de gravamen" />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-garante" onClick={addGarante}>
                    + Agregar garante
                  </button>
                </div>

                {/* Adicionales */}
                <div className="form-section">
                  <div className="form-section-title">Datos adicionales (quedan en el sistema, no van al recibo)</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad de personas convivientes</label>
                      <input type="number" min="1" value={formData.cantidadPersonas} onChange={e => setField('cantidadPersonas', e.target.value)} placeholder="2" />
                    </div>
                    <div className="form-group form-group-inline">
                      <label className="checkbox-label-lg">
                        <input type="checkbox" checked={formData.tieneCoinquilino} onChange={e => setField('tieneCoinquilino', e.target.checked)} />
                        Tiene co-inquilino
                      </label>
                    </div>
                  </div>
                  {formData.tieneCoinquilino && (
                    <div className="form-group">
                      <label>Nombre del co-inquilino</label>
                      <input value={formData.coinquilinoNombre} onChange={e => setField('coinquilinoNombre', e.target.value)} placeholder="María Gómez" />
                    </div>
                  )}
                </div>

                {submitError && <p className="field-error">{submitError}</p>}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={submitLoading}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitLoading}>
                    {submitLoading ? 'Guardando...' : 'Guardar reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Preview / Print ───────────────────────────────────── */}
        {(selectedReserva || previewLoading) && (
          <div className="modal-overlay print-hide" onClick={() => setSelectedReserva(null)}>
            <div className="modal modal-print" onClick={e => e.stopPropagation()} ref={printRef}>
              <div className="modal-header print-hide">
                <h2>Recibo de Reserva</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={handlePrint}>Imprimir / PDF</button>
                  <button className="modal-close" onClick={() => setSelectedReserva(null)}>×</button>
                </div>
              </div>
              {previewLoading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
              ) : (
                <ReciboPreview r={selectedReserva} />
              )}
            </div>
          </div>
        )}

        {/* ── Modal: Confirmar eliminar ─────────────────────────────────── */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Eliminar reserva</h2>
                <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>¿Eliminar la reserva de <strong>{confirmDelete.nombre} {confirmDelete.apellido?.toUpperCase()}</strong>?</p>
                <p>Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Reservas;
