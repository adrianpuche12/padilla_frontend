import './PropertyDetailModal.css';

const TYPE_LABEL = {
  CASA:             'Casa',
  CASA_PLANTA_ALTA: 'Casa Planta Alta',
  COCHERA:          'Cochera',
  DEPARTAMENTO:     'Departamento',
  DEPTO_DUPLEX:     'Depto. Duplex',
  DEPTO_PASILLO:    'Depto. de pasillo',
  GALPON:           'Galpón',
  LOCAL:            'Local',
  OFICINA:          'Oficina',
  TERRENO:          'Terreno',
  SIN_INFORMAR:     'Sin informar',
};

const STATUS_LABEL = {
  AVAILABLE:   'Disponible',
  RENTED:      'Alquilada',
  FOR_SALE:    'En venta',
  MAINTENANCE: 'Mantenimiento',
};

const RENTAL_STATUS_LABEL = {
  ALQUILADA:              'Alquilada',
  EN_ALQUILER:            'En alquiler',
  CONTRATO_EN_CONFECCION: 'Contrato en confección',
  SUSPENDIDA:             'Suspendida',
  ANULADA:                'Anulada',
  NO_CORRESPONDE:         'No corresponde',
};

const SALE_STATUS_LABEL = {
  EN_VENTA:       'En venta',
  ANULADA:        'Anulada',
  NO_CORRESPONDE: 'No corresponde',
};

const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  );
}

function PropertyDetailModal({ property, ownerName, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal property-detail-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Detalle de propiedad</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="detail-body">

          {/* Sección: Ubicación */}
          <div className="detail-section">
            <h3 className="detail-section-title">Ubicación</h3>
            <div className="detail-grid">
              <Field label="Dirección"    value={property.address} />
              <Field label="Propietario"  value={ownerName} />
              <Field label="Calle"        value={property.street} />
              <Field label="Número"       value={property.streetNumber} />
              <Field label="Piso"         value={property.floor} />
              <Field label="Departamento" value={property.apartment} />
              <Field label="Localidad"    value={property.city} />
              <Field label="Provincia"    value={property.province} />
            </div>
          </div>

          {/* Sección: Datos de la propiedad */}
          <div className="detail-section">
            <h3 className="detail-section-title">Datos de la propiedad</h3>
            <div className="detail-grid">
              <Field label="Tipo"         value={TYPE_LABEL[property.type] || property.type} />
              <Field label="Estado"       value={STATUS_LABEL[property.status] || property.status} />
              <Field label="M²"           value={property.squareMeters} />
              <Field label="Ambientes"    value={property.rooms} />
              <Field label="Fecha de alta" value={formatDate(property.entryDate)} />
              <Field label="Núm. legacy"  value={property.legacyId} />
            </div>
          </div>

          {/* Sección: Estado comercial */}
          <div className="detail-section">
            <h3 className="detail-section-title">Estado comercial</h3>
            <div className="detail-grid">
              <Field label="Estado alquiler"    value={RENTAL_STATUS_LABEL[property.rentalStatus] || property.rentalStatus} />
              <Field label="Productor alquiler" value={property.rentalProducer} />
              <Field label="Estado venta"       value={SALE_STATUS_LABEL[property.saleStatus] || property.saleStatus} />
              <Field label="Productor venta"    value={property.saleProducer} />
            </div>
          </div>

        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}

export default PropertyDetailModal;
