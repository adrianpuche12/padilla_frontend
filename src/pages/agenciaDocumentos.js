/**
 * PRO-095: datos de la inmobiliaria para los documentos (GET /api/settings/agency). Antes estaban
 * escritos aca el nombre, la firma, la matricula y el mail de Padilla. Si falta un dato se deja la
 * linea para completar a mano.
 */
const LINEA = '_______________';
export const AGENCIA_VACIA = {
  nombreComercial: LINEA, razonSocial: LINEA, emailContratos: LINEA, corredorNombre: LINEA, corredorMatricula: '',
  ciudad: LINEA, provincia: LINEA, jurisdiccion: 'tribunales ordinarios que correspondan', comisionTexto: LINEA, plataformaPago: LINEA,
};

export function agenciaParaDocumentos(s) {
  if (!s) return AGENCIA_VACIA;
  const v = (x, def = LINEA) => (x && String(x).trim()) || def;
  const pct = s.comisionPct != null ? `${String(s.comisionPct).replace('.', ',')}%` : null;
  return {
    nombreComercial: v(s.nombreComercial || s.agencyName),
    razonSocial: v(s.razonSocial || s.nombreComercial || s.agencyName),
    emailContratos: v(s.emailContratos),
    corredorNombre: v(s.corredorNombre),
    corredorMatricula: v(s.corredorMatricula, ''),
    ciudad: v(s.ciudad),
    provincia: v(s.provincia),
    jurisdiccion: v(s.jurisdiccion, AGENCIA_VACIA.jurisdiccion),
    comisionTexto: pct ? `${pct}${s.comisionIva ? ' + IVA' : ''}` : LINEA,
    plataformaPago: v(s.plataformaPago),
  };
}
