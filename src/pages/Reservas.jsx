import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import reservaService from '../services/reservaService';
import './Reservas.css';

// ── Número a letras ──────────────────────────────────────────────────────────
const UNIDADES = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE',
  'DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
const DECENAS = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
const CENTENAS = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS',
  'SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];

function cientos(n) {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  let r = '';
  if (n >= 100) { r += CENTENAS[Math.floor(n / 100)] + ' '; n %= 100; }
  if (n >= 20) { r += DECENAS[Math.floor(n / 10)]; if (n % 10) r += ' Y ' + UNIDADES[n % 10]; }
  else if (n > 0) r += UNIDADES[n];
  return r.trim();
}

function numeroALetras(num) {
  if (!num || isNaN(num)) return '';
  const n = Math.floor(Number(num));
  if (n === 0) return 'CERO';
  let r = '';
  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    r += (m === 1 ? 'UN MILLÓN' : cientos(m) + ' MILLONES') + ' ';
    n % 1000000 && (r += cientos(n % 1000000));
    return ('PESOS ' + r).trim();
  }
  if (n >= 1000) {
    const m = Math.floor(n / 1000);
    r += (m === 1 ? 'MIL' : cientos(m) + ' MIL') + ' ';
  }
  const resto = n % 1000;
  if (resto > 0) r += cientos(resto);
  return ('PESOS ' + r).trim();
}

function formatPesos(n) {
  if (!n) return '';
  return '$ ' + Number(n).toLocaleString('es-AR');
}

// ── Fecha helpers ────────────────────────────────────────────────────────────
const MESES = ['enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function partsFecha(isoOrDate) {
  if (!isoOrDate) { const h = new Date(); return { dia: h.getDate(), mes: MESES[h.getMonth()], anio: h.getFullYear() }; }
  const d = new Date(isoOrDate);
  return { dia: d.getDate(), mes: MESES[d.getMonth()], anio: d.getFullYear() };
}

function formatNacimiento(str) {
  if (!str) return '';
  if (str.includes('/')) return str;
  const p = str.split('-');
  if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
  return str;
}

// ── Datos del inquilino ──────────────────────────────────────────────────────
function nombreCompleto(r) {
  return [r.nombre, r.apellidoMaterno, r.apellido ? r.apellido.toUpperCase() : ''].filter(Boolean).join(' ');
}

function garantiaStr(r) {
  if (Array.isArray(r.tipoGarantia)) return r.tipoGarantia.join(' + ');
  if (typeof r.tipoGarantia === 'string') return r.tipoGarantia;
  return '';
}

// ── Campo vacío (placeholder rojo para CTR) ──────────────────────────────────
function Vacio({ children }) {
  return <span className="campo-placeholder">[{children}]</span>;
}

// ────────────────────────────────────────────────────────────────────────────
// FC1 — Recibo de Reserva (texto legal completo)
// ────────────────────────────────────────────────────────────────────────────
function ReciboPreview({ r }) {
  const nombre = nombreCompleto(r);
  const fecha  = partsFecha(r.fechaRecibo || r.createdAt);

  return (
    <div className="recibo-doc">
      <div className="recibo-header">
        <div className="recibo-logo-area">
          <div className="recibo-logo-placeholder">S. RAMASCO PADILLA<br/>Negocios Inmobiliarios</div>
        </div>
        <div className="recibo-title-area">
          <h2 className="recibo-title">Recibo de Reserva de Alquiler</h2>
          <p className="recibo-subtitle">de propiedad de calle {r.propiedad || '_______________'}</p>
          <p className="recibo-fc">FC1</p>
        </div>
      </div>

      <div className="recibo-body-wrap">
        <p className="recibo-body">
          Recibí del/la Sr./Sra. <strong>{nombre || '_______________'}</strong>,
          DNI Nº <strong>{r.dni || '_______________'}</strong>,
          CUIT – CUIL Nº <strong>{r.cuil || '_______________'}</strong>,
          de apellido materno <strong>{r.apellidoMaterno || '_______________'}</strong>,
          nacido/a el día <strong>{formatNacimiento(r.fechaNacimiento) || '_______________'}</strong>,
          con domicilio en calle <strong>{r.domicilioActual || '_______________'}</strong>, de la ciudad de Rosario, provincia de Santa Fe,
          de profesión: <strong>{r.profesion || '_______________'}</strong>,
          teléfono celular: <strong>{r.telefono || '_______________'}</strong>,
          correo electrónico: <strong>{r.email || '_______________'}</strong>,
          condición fiscal: <strong>{r.condicionFiscal || '_______________'}</strong>,
          la cantidad de <strong>{numeroALetras(r.monto)}</strong> (<strong>{formatPesos(r.monto)}</strong>)
          por <strong>{r.medioPago || 'transferencia bancaria'}</strong>, en concepto de reserva de la propiedad sita en calle{' '}
          <strong>{r.propiedad || '_______________'}</strong>, de la ciudad de Rosario, provincia de Santa Fe,
          que administra la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
          Se deja constancia que la precitada suma es de carácter provisorio y en caso de sufrir un incremento en sus costos, será informado al/la RESERVANTE.
          La suma recibida tendrá distinta aplicación conforme las circunstancias que se detallan a continuación:
        </p>

        <ol className="lista-letras">
          <li>
            Si efectivamente se celebrase el contrato de locación la suma será imputada a cuenta de comisión inmobiliaria que se compone del cinco por ciento más IVA (5% + IVA) del monto total del contrato suscripto, manifestando el/la RESERVANTE que acepta el pago de la misma y que renuncia a las facultades de protesto previstas por el art. 1346 CCCN.&nbsp;-
          </li>
          <li>
            Si las garantías propietarias no fuesen aceptadas por EL LOCADOR, la suma en concepto de reserva será devuelta en su totalidad.&nbsp;-
          </li>
          <li>
            Si las garantías se encontraran observadas a nivel comercial en el BANCO CENTRAL DE LA REPUBLICA ARGENTINA se devolverá el cincuenta por ciento (50&nbsp;%) de la suma recibida en concepto de reserva.&nbsp;-
          </li>
          <li>
            Si el contrato de locación no se celebrase, por exclusiva voluntad del/la Sr./Sra. <strong>{nombre || '_______________'}</strong> sin acreditar ninguna causa que justifique su conducta, la suma no será devuelta y se imputará al pago de confección del contrato y a falsa comisión de la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
          </li>
        </ol>

        <p className="recibo-body">
          La documentación requerida deberá ser enviada al correo electrónico: <strong>contratos@sramascopadilla.com.ar</strong>. La misma incluye: datos personales del/los locatario/s y fiadores, y toda la documentación indicada de las garantías. El incumplimiento de la referida obligación de hacer en el plazo de tres (3) días corridos, dará por caída la presente reserva sin necesidad de notificación alguna, quedando las sumas entregadas a favor de la inmobiliaria SEBASTIAN RAMASCO PADILLA NEGOCIOS INMOBILIARIOS y serán imputadas al pago de confección del contrato y a falsa comisión de la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS. Se deja constancia que el/la RESERVANTE acepta de plena conformidad la penalidad dispuesta y en caso de no cumplir con su obligación, nada más tendrá que reclamar al corredor inmobiliario.-
        </p>

        <p className="recibo-body">
          Se deja constancia que la presente reserva tiene un plazo de quince (15) días corridos desde la fecha de suscripción de la presente. En el caso de que en el plazo estipulado no se exhibiesen la viabilidad de las garantías ofrecidas para la firma del contrato de locación, se aplicará al/la RESERVANTE una multa equivalente al monto entregado para la presente reserva.-
        </p>

        <p className="recibo-body">
          No habiendo sido observada la reserva, se enviará el llamado a la firma del contrato de locación al correo electrónico denunciado en la presente y en forma automática correrá un plazo perentorio e improrrogable de cuarenta y ocho (48) horas hábiles para la rúbrica del contrato. El/la RESERVANTE, acepta que los rubros emergentes del contrato comiencen a cobrarse a partir de las cuarenta y ocho (48) horas como máximo de recibido el e-mail en la casilla denunciada. En el supuesto de que EL LOCATARIO ofreciese garantías cuyos domicilios sean fuera de la ciudad de Rosario y pretenda rubricar los contratos ante autoridad y/o escribano en la localidad que estos residan, deberá presentar el contrato en el plazo de cinco (05) días corridos a la inmobiliaria debidamente rubricado. Bajo apercibimiento de que deba abonar la multa que el API aplique sobre el sellado fuera de término.
        </p>

        <p className="recibo-body">
          En caso de incumplimiento del plazo para la rúbrica del contrato se dará por caída la presente reserva, siendo aplicable cualquiera de las dos sanciones que se detallan a continuación, a elección del/la RESERVANTE:
        </p>

        <ol className="lista-sanciones">
          <li>
            Quedando las sumas entregadas a favor de la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS y serán imputadas al pago de confección del contrato y a falsa comisión de la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
          </li>
          <li>
            Que el/la RESERVANTE abone el proporcional del canon locativo, impuestos, tasas y expensas por el total de tiempo de la demora en la firma del contrato de locación.
          </li>
        </ol>

        <p className="recibo-body">
          El/la RESERVANTE, se obliga a abonar a SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS, la comisión inmobiliaria del cinco por ciento más IVA (5&nbsp;% + IVA) del total de la operación que se concrete. Asimismo, en caso de contrato de locación de vivienda, se obliga a abonar mensualmente, durante la vigencia del contrato de locación a SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS, la cuota del seguro de incendio y responsabilidad civil del inmueble objeto de la presente reserva. La póliza del seguro será contratada, sin excepción, por la inmobiliaria SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS, prestando el/la RESERVANTE plena conformidad al monto de la póliza y a la empresa que le será informado una vez celebrado el contrato. En caso que se tratase de un contrato comercial, la contratación de la mencionada póliza quedará a exclusivo cargo de la parte LOCATARIA, debiendo endosarse a favor del LOCADOR.
        </p>

        <p className="recibo-body">
          Del monto de <strong>{numeroALetras(r.monto)}</strong> (<strong>{formatPesos(r.monto)}</strong>) se imputa el importe aproximado
          de <strong>{r.montoInformes ? numeroALetras(r.montoInformes) : '_______________'}</strong>{' '}
          ({r.montoInformes ? <strong>{formatPesos(r.montoInformes)}</strong> : '___'})
          en concepto de adelanto de gastos para la obtención de informes necesarios con respecto a su solvencia moral y patrimonial del locatario y la de los posibles fiadores todo tendiente a la locación del inmueble objeto de la presente reserva siempre que sea aceptado por el locador. En caso de incremento en los montos de las averiguaciones de las garantías, el/la RESERVANTE se obliga a abonar la diferencia en más de los mismos. La referida suma no será devuelta en caso de hacerse presente los supuestos que se detallan a continuación:
        </p>

        <ol className="lista-letras">
          <li>
            La falta de entrega de información y fotocopias en el plazo establecido (3 días corridos) en la reserva rubricada por el interesado.
          </li>
          <li>
            En caso de no resultar satisfactorias las garantías, a exclusivo criterio del locador, no siendo obligación del locador y/o administrador explicitar los motivos del rechazo. Se deja constancia que dicho importe no será devuelto, ya que se considera como gastos de informes abonados por la inmobiliaria.
          </li>
        </ol>

        <p className="recibo-body">
          En este acto, el/la reservante, rubrica una planilla de anexo en la cual se le informa la totalidad de los gastos y montos que erogarán del contrato de locación a firmarse por las partes, prestando absoluta conformidad a los montos que se le informan en la referida planilla. El/la RESERVANTE toma conocimiento en este acto, que <strong>EL LOCATARIO deberá abonar el monto del alquiler por mes adelantado entre el día 1° al día 5° inclusive de cada mes</strong>, por los siguientes canales de pago: mediante código electrónico de pago por plataforma HOME BANKING o en forma presencial descargando el cupón de pago de la plataforma GEXION y dirigiéndose a las entidades informadas en el referido cupón de pago, o adonde EL LOCADOR y/o Administrador lo indique en el futuro. El reservante manifiesta en este acto que es debidamente informado de la fecha de pago mensual del canon locativo y que lo acepta no teniendo nada que reclamar durante la vigencia del contrato de locación ni al LOCADOR ni al Administrador SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
        </p>

        <p className="recibo-body">
          La presente reserva queda sujeta a la acreditación, en el plazo de veinticuatro (24) horas a contar desde la fecha de la presente reserva, del monto establecido en la misma. Caso contrario, quedará sin efecto en forma automática, sin necesidad de notificación alguna, sin tener el/la reservante, nada que reclamar al titular del inmueble ni a SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
        </p>

        <p className="recibo-body">
          Se deja constancia que la presente reserva queda sujeta a la aprobación por parte del/la PROPIETARIO/A por el plazo de tres (3) días hábiles. En el caso de que el/la PROPIETARIO/A no acepte por cualquier causa, la misma se devolverá al/la reservante, quien manifiesta que nada tendrá que reclamar ni al/a la PROPIETARIO/A ni a la INMOBILIARIA interviniente.
        </p>

        <p className="recibo-body">
          En consecuencia, el/la reservante, acepta de plena conformidad lo dispuesto sobre la reserva abonada y manifiesta que en caso de no concretarse el contrato objeto de la presente reserva, nada más tendrá que reclamar a SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS por ningún concepto.&nbsp;-
        </p>

        <p className="recibo-body">
          La presente reserva es firmada bajo la modalidad de firma electrónica conforme a la ley 25.506. El/la RESERVANTE Sr./Sra. <strong>{nombre || '_______________'}</strong>, presta conformidad para firmarlo bajo esa modalidad obligándose a cumplimentar todos los requisitos exigidos para dicha firma y reconociendo su autenticidad.
        </p>

        <p className="recibo-body">
          Se suscriben dos (2) ejemplares de igual tenor y a un solo efecto en la ciudad de Rosario, a los{' '}
          <strong>{fecha.dia}</strong> días del mes de <strong>{fecha.mes}</strong> de <strong>{fecha.anio}</strong>.&nbsp;-
        </p>

        <div className="recibo-firma">
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre">Sebastián Ramasco Padilla</p>
            <p className="recibo-firma-cargo">Negocios Inmobiliarios</p>
            <p className="recibo-firma-mat">Mat. C.I.C.I.C.P.S.F. N° 829</p>
          </div>
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre">{nombre || 'LOCATARIO'}</p>
            <p className="recibo-firma-cargo">DNI N° {r.dni || '___________'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FC10 — Entrega de Copia
// ────────────────────────────────────────────────────────────────────────────
function EntregaCopiaPreview({ r }) {
  const nombre = nombreCompleto(r);
  const fecha  = partsFecha(r.fechaRecibo || r.createdAt);

  return (
    <div className="recibo-doc">
      <div className="recibo-header">
        <div className="recibo-logo-area">
          <div className="recibo-logo-placeholder">S. RAMASCO PADILLA<br/>Negocios Inmobiliarios</div>
        </div>
        <div className="recibo-title-area">
          <h2 className="recibo-title">Recibo de Entrega de Copia</h2>
          <p className="recibo-fc">FC10</p>
        </div>
      </div>

      <div className="recibo-body-wrap">
        <p className="recibo-body">
          Por la presente, SEBASTIÁN RAMASCO PADILLA, Negocios Inmobiliarios, en su carácter de corredor público inmobiliario, hace entrega al/la Sr./Sra.{' '}
          <strong>{nombre || '_______________'}</strong>,
          DNI Nº <strong>{r.dni || '_______________'}</strong>,
          CUIT – CUIL Nº <strong>{r.cuil || '_______________'}</strong>,
          con domicilio en calle <strong>{r.domicilioActual || '_______________'}</strong>, de la ciudad de Rosario, provincia de Santa Fe,
          de una (1) copia del Recibo de Reserva de Locación (FC1) correspondiente a la propiedad ubicada en calle{' '}
          <strong>{r.propiedad || '_______________'}</strong>, de la ciudad de Rosario, provincia de Santa Fe.
        </p>

        <p className="recibo-body">
          El/la firmante declara en este acto recibir de plena conformidad el referido documento, manifestando haber leído, comprendido y aceptado íntegramente su contenido, prestando conformidad con todas y cada una de las cláusulas en él contenidas.
        </p>

        <p className="recibo-body">
          Asimismo, el/la firmante declara conocer y aceptar las condiciones de la reserva, los plazos y las obligaciones emergentes del instrumento referenciado, no teniendo nada más que reclamar a SEBASTIÁN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS por ningún concepto.&nbsp;-
        </p>

        <p className="recibo-body">
          La presente es firmada bajo la modalidad de firma electrónica conforme a la ley 25.506. El/la Sr./Sra. <strong>{nombre || '_______________'}</strong> presta conformidad para suscribirlo bajo esa modalidad, obligándose a cumplimentar todos los requisitos exigidos para dicha firma y reconociendo su autenticidad.
        </p>

        <p className="recibo-body">
          Se suscriben dos (2) ejemplares de igual tenor y a un solo efecto en la ciudad de Rosario, a los{' '}
          <strong>{fecha.dia}</strong> días del mes de <strong>{fecha.mes}</strong> de <strong>{fecha.anio}</strong>.&nbsp;-
        </p>

        <div className="recibo-firma">
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre">{nombre || 'LOCATARIO'}</p>
            <p className="recibo-firma-cargo">DNI N° {r.dni || '___________'}</p>
            <p className="recibo-firma-mat">EL/LA RESERVANTE</p>
          </div>
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre">Sebastián Ramasco Padilla</p>
            <p className="recibo-firma-cargo">Corredor Público Inmobiliario</p>
            <p className="recibo-firma-mat">Mat. C.I.C.I.C.P.S.F. N° 829</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CTR — Contrato de Locación
// ────────────────────────────────────────────────────────────────────────────
function ContratoPreview({ r }) {
  const nombre   = nombreCompleto(r);
  const fecha    = partsFecha(r.fechaRecibo || r.createdAt);
  const garantia = garantiaStr(r);
  const garantes = Array.isArray(r.garantes) ? r.garantes.filter(g => g.nombre) : [];

  return (
    <div className="recibo-doc">
      <div className="recibo-header">
        <div className="recibo-logo-area">
          <div className="recibo-logo-placeholder">S. RAMASCO PADILLA<br/>Negocios Inmobiliarios</div>
        </div>
        <div className="recibo-title-area">
          <h2 className="recibo-title">Contrato de Locación</h2>
          <p className="recibo-fc">CTR</p>
        </div>
      </div>

      <div className="recibo-body-wrap">

        <p className="clausula-titulo">Primero — Partes</p>
        <p className="recibo-body">
          En la ciudad de Rosario, provincia de Santa Fe, a los <strong>{fecha.dia}</strong> días del mes de <strong>{fecha.mes}</strong> de <strong>{fecha.anio}</strong>, entre:
        </p>
        <p className="recibo-body">
          <strong>EL LOCADOR:</strong> Sr./Sra. <Vacio>NOMBRE PROPIETARIO</Vacio>, DNI Nº <Vacio>DNI PROPIETARIO</Vacio>, con domicilio en <Vacio>DOMICILIO PROPIETARIO</Vacio>, en adelante denominado/a "EL LOCADOR"; y
        </p>
        <p className="recibo-body">
          <strong>EL LOCATARIO:</strong> Sr./Sra. <strong>{nombre || '_______________'}</strong>,
          DNI Nº <strong>{r.dni || '_______________'}</strong>,
          CUIT – CUIL Nº <strong>{r.cuil || '_______________'}</strong>,
          nacido/a el día <strong>{formatNacimiento(r.fechaNacimiento) || '_______________'}</strong>,
          de profesión <strong>{r.profesion || '_______________'}</strong>,
          con domicilio en calle <strong>{r.domicilioActual || '_______________'}</strong>,
          teléfono: <strong>{r.telefono || '_______________'}</strong>,
          correo electrónico: <strong>{r.email || '_______________'}</strong>,
          condición fiscal: <strong>{r.condicionFiscal || '_______________'}</strong>,
          en adelante denominado/a "EL LOCATARIO"; acuerdan celebrar el presente Contrato de Locación sujeto a las siguientes cláusulas y condiciones:
        </p>

        <p className="clausula-titulo">Segunda — Objeto</p>
        <p className="recibo-body">
          EL LOCADOR da en locación al LOCATARIO, el inmueble de su propiedad ubicado en calle <strong>{r.propiedad || '_______________'}</strong>, ciudad de Rosario, provincia de Santa Fe (en adelante "el inmueble"). El inmueble se destina exclusivamente a vivienda del LOCATARIO y su grupo familiar conviviente, quedando expresamente prohibido todo destino diferente al pactado sin autorización escrita del LOCADOR.
        </p>

        <p className="clausula-titulo">Tercera — Plazo</p>
        <p className="recibo-body">
          El plazo de locación es de <Vacio>PLAZO EN MESES</Vacio> meses, contados a partir del día <Vacio>FECHA DE INICIO</Vacio>, venciendo el día <Vacio>FECHA DE VENCIMIENTO</Vacio>. En cumplimiento de lo dispuesto por el art. 1.198 del Código Civil y Comercial de la Nación y la Ley N° 27.551, el plazo mínimo para locaciones con destino habitacional es de tres (3) años.
        </p>

        <p className="clausula-titulo">Cuarta — Canon locativo</p>
        <p className="recibo-body">
          El canon locativo mensual se establece en la suma de <Vacio>MONTO EN LETRAS</Vacio> (<Vacio>$ MONTO</Vacio>), el cual será abonado por mes adelantado entre el día 1° y el día 5° inclusive de cada mes, mediante código electrónico de pago por plataforma HOME BANKING o en forma presencial descargando el cupón de pago de la plataforma GEXION, o adonde EL LOCADOR y/o su administrador lo indique en el futuro. El canon podrá ajustarse conforme al Índice para Contratos de Locación (ICL) elaborado por el Banco Central de la República Argentina.
        </p>

        <p className="clausula-titulo">Quinta — Depósito en garantía</p>
        <p className="recibo-body">
          EL LOCATARIO entrega en este acto en concepto de depósito en garantía la suma equivalente a <Vacio>MONTO DEPÓSITO</Vacio>, importe que será devuelto al término del contrato, actualizado conforme al ICL, siempre que el inmueble sea restituido en perfectas condiciones y libre de deudas. Conforme al art. 1.196 CCCN, el depósito en garantía en ningún caso podrá exceder el importe equivalente a un (1) mes de alquiler por cada año de locación contratado.
        </p>

        <p className="clausula-titulo">Sexta — Garantías</p>
        <p className="recibo-body">
          La presente locación queda garantizada por la modalidad de garantía: <strong>{garantia || '_______________'}</strong>.
        </p>

        {garantes.length > 0 && garantes.map((g, i) => (
          <div key={i} className="ctr-garante-seccion">
            <p className="ctr-garante-titulo">Garante {i + 1}</p>
            <p className="recibo-body">
              Sr./Sra. <strong>{g.nombre}</strong>{g.dni ? `, DNI Nº ${g.dni}` : ''}{g.cuil ? `, CUIL Nº ${g.cuil}` : ''}{g.domicilio ? `, con domicilio en ${g.domicilio}, ciudad de Rosario, provincia de Santa Fe` : ''}, quien en su carácter de GARANTE asume solidariamente con EL LOCATARIO el cumplimiento de todas las obligaciones emergentes del presente contrato.{g.descripcionBien ? ` Bien ofrecido como garantía: ${g.descripcionBien}.` : ''}
            </p>
          </div>
        ))}

        <p className="clausula-titulo">Séptima — Estado del inmueble</p>
        <p className="recibo-body">
          EL LOCATARIO declara recibir el inmueble en perfecto estado de conservación, funcionamiento y mantenimiento. Se labrará en este acto un acta de estado de entrega del inmueble que, una vez suscripta por las partes, formará parte integrante del presente contrato como Anexo I.
        </p>

        <p className="clausula-titulo">Octava — Expensas, impuestos y servicios</p>
        <p className="recibo-body">
          Las expensas comunes ordinarias, los servicios de luz, gas, agua, teléfono, internet y cable correrán por cuenta exclusiva del LOCATARIO a partir de la fecha de entrega del inmueble. Las expensas comunes extraordinarias y los impuestos provinciales y municipales que graven el inmueble estarán a cargo del LOCADOR. EL LOCATARIO se obliga a abonar el proporcional del seguro de incendio y responsabilidad civil de la póliza contratada por SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS.
        </p>

        <p className="clausula-titulo">Novena — Reparaciones y reformas</p>
        <p className="recibo-body">
          Las reparaciones necesarias para la conservación del inmueble que resulten de su uso normal estarán a cargo de EL LOCATARIO. Queda expresamente prohibido realizar obras, reformas o modificaciones en el inmueble sin autorización escrita previa del LOCADOR. Al vencimiento del contrato, el inmueble deberá ser restituido en el mismo estado en que fuera recibido, salvo el desgaste propio del uso normal.
        </p>

        <p className="clausula-titulo">Décima — Sublocación y cesión</p>
        <p className="recibo-body">
          Queda expresamente prohibida la sublocación total o parcial del inmueble, así como la cesión del presente contrato, sin la previa autorización escrita del LOCADOR. La violación de esta prohibición facultará al LOCADOR a resolver el contrato de pleno derecho.
        </p>

        <p className="clausula-titulo">Undécima — Rescisión anticipada</p>
        <p className="recibo-body">
          Conforme al art. 1.221 del CCCN y la Ley N° 27.551, el LOCATARIO podrá, en cualquier momento y previo aviso con una antelación mínima de un (1) mes, notificar en forma fehaciente su voluntad de rescisión anticipada. Si la rescisión se produce antes de que hayan transcurrido seis (6) meses de contrato, deberá abonar al LOCADOR la suma equivalente a un mes y medio (1½) de alquiler. Si la rescisión se produce superado el sexto mes, la indemnización será equivalente a un (1) mes de alquiler.
        </p>

        <p className="clausula-titulo">Duodécima — Comisión inmobiliaria</p>
        <p className="recibo-body">
          EL LOCATARIO abona en este acto a SEBASTIAN RAMASCO PADILLA, NEGOCIOS INMOBILIARIOS, en concepto de comisión inmobiliaria, el cinco por ciento más IVA (5&nbsp;% + IVA) del total de la operación. Asimismo, durante la vigencia del contrato, abonará mensualmente la cuota del seguro de incendio y responsabilidad civil, cuya póliza será contratada por la inmobiliaria.
        </p>

        <p className="clausula-titulo">Decimotercera — Firma electrónica</p>
        <p className="recibo-body">
          El presente contrato es suscripto bajo la modalidad de firma electrónica conforme a la ley 25.506. Las partes prestan conformidad para firmarlo bajo esa modalidad, obligándose a cumplimentar todos los requisitos exigidos para dicha firma y reconociendo su autenticidad y plena validez legal.
        </p>

        <p className="clausula-titulo">Decimocuarta — Jurisdicción</p>
        <p className="recibo-body">
          Para todos los efectos legales emergentes del presente contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la ciudad de Rosario, provincia de Santa Fe, renunciando a cualquier otro fuero o jurisdicción que pudiera corresponderles.
        </p>

        <p className="recibo-body" style={{ marginTop: 12 }}>
          En prueba de conformidad, las partes firman el presente contrato en dos (2) ejemplares de igual tenor y a un solo efecto, en el lugar y fecha indicados al inicio del presente instrumento.&nbsp;-
        </p>

        <div className="recibo-firma">
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre"><Vacio>NOMBRE PROPIETARIO</Vacio></p>
            <p className="recibo-firma-mat">EL LOCADOR</p>
          </div>
          <div className="recibo-firma-bloque">
            <div className="recibo-firma-linea" />
            <p className="recibo-firma-nombre">{nombre || 'LOCATARIO'}</p>
            <p className="recibo-firma-cargo">DNI N° {r.dni || '___________'}</p>
            <p className="recibo-firma-mat">EL LOCATARIO</p>
          </div>
        </div>

        {garantes.length > 0 && (
          <div className="recibo-firma" style={{ marginTop: 24 }}>
            <div className="recibo-firma-bloque">
              <div className="recibo-firma-linea" />
              <p className="recibo-firma-nombre">Sebastián Ramasco Padilla</p>
              <p className="recibo-firma-cargo">Corredor Público Inmobiliario</p>
              <p className="recibo-firma-mat">Mat. C.I.C.I.C.P.S.F. N° 829</p>
            </div>
            <div className="recibo-firma-bloque">
              <div className="recibo-firma-linea" />
              <p className="recibo-firma-nombre">{garantes[0].nombre}</p>
              {garantes[0].dni && <p className="recibo-firma-cargo">DNI N° {garantes[0].dni}</p>}
              <p className="recibo-firma-mat">EL/LA GARANTE</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Status badges / config
// ────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', cls: 'status-pendiente' },
  APROBADA:  { label: 'Aprobada',  cls: 'status-aprobada' },
  RECHAZADA: { label: 'Rechazada', cls: 'status-rechazada' },
  CANCELADA: { label: 'Cancelada', cls: 'status-cancelada' },
};

const GARANTIAS_OPTIONS = ['Propietaria','Laboral','Recibo de sueldo','Seguro de caución','Aval bancario'];
const CONDICION_FISCAL_OPTIONS = ['Consumidor Final','Responsable Inscripto','Monotributista','Exento','Otro'];
const EMPTY_GARANTE = { nombre:'', dni:'', cuil:'', domicilio:'', descripcionBien:'', apellidoMaterno:'', fechaNacimiento:'' };
const TIPO_INMUEBLE_OPTIONS = ['departamento','casa','PH','local','cochera','otro'];
const MEDIO_PAGO_OPTIONS = ['transferencia','efectivo','cheque','tarjeta'];
const today = () => new Date().toISOString().split('T')[0];
const EMPTY_FORM = {
  nombre:'', apellido:'', apellidoMaterno:'', dni:'', cuil:'',
  fechaNacimiento:'', domicilioActual:'', telefono:'', email:'',
  condicionFiscal:'Consumidor Final', profesion:'',
  propiedad:'', propertyId: null,
  monto:'', montoInformes:'',
  tipoGarantia:[],
  cantidadPersonas:'', tieneCoinquilino: false, coinquilinoNombre:'',
  tipoInmueble:'departamento', asesor:'',
  fechaRecibo: today(), medioPago:'transferencia',
  observaciones:'', apoderadoLocativa:'',
  garantes:[{ ...EMPTY_GARANTE }],
};

// ────────────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────────────
function Reservas() {
  const [reservas, setReservas]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  const [showForm, setShowForm]         = useState(false);
  const [formData, setFormData]         = useState({ ...EMPTY_FORM, garantes:[{ ...EMPTY_GARANTE }] });
  const [dniLoading, setDniLoading]     = useState(false);
  const [dniError, setDniError]         = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError]   = useState(null);

  // Documento seleccionado (para ver desde la tabla o tras submit)
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [previewLoading, setPreviewLoading]   = useState(false);
  const [docType, setDocType]                 = useState('fc1'); // 'fc1' | 'fc10' | 'ctr'

  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileInputRef = useRef();

  const loadReservas = async () => {
    setIsLoading(true); setError(null);
    try { setReservas(await reservaService.getReservas()); }
    catch { setError('Error al cargar las reservas'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadReservas(); }, []);

  // ── DNI AI ──────────────────────────────────────────────────────────────
  const handleDniUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDniError(null); setDniLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const result = await reservaService.readDni(ev.target.result.split(',')[1], file.type || 'image/jpeg');
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
        } finally { setDniLoading(false); }
      };
      reader.readAsDataURL(file);
    } catch { setDniError('Error al procesar la imagen.'); setDniLoading(false); }
  };

  // ── Form helpers ─────────────────────────────────────────────────────────
  const setField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleGarantia = (opt) => setFormData(prev => {
    const cur = Array.isArray(prev.tipoGarantia) ? prev.tipoGarantia : [];
    return { ...prev, tipoGarantia: cur.includes(opt) ? cur.filter(g => g !== opt) : [...cur, opt] };
  });
  const setGarante = (idx, field, value) => setFormData(prev => {
    const garantes = [...prev.garantes];
    garantes[idx] = { ...garantes[idx], [field]: value };
    return { ...prev, garantes };
  });
  const addGarante    = () => setFormData(prev => ({ ...prev, garantes: [...prev.garantes, { ...EMPTY_GARANTE }] }));
  const removeGarante = (idx) => setFormData(prev => ({ ...prev, garantes: prev.garantes.filter((_, i) => i !== idx) }));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true); setSubmitError(null);
    try {
      const payload = {
        ...formData,
        tipoGarantia: Array.isArray(formData.tipoGarantia) ? formData.tipoGarantia.join(' + ') : formData.tipoGarantia,
        garantes: formData.garantes.filter(g => g.nombre.trim()).map(g => ({
          ...g,
          fechaNacimiento: g.fechaNacimiento || null,
        })),
        monto: formData.monto ? parseFloat(formData.monto) : null,
        montoInformes: formData.montoInformes ? parseFloat(formData.montoInformes) : null,
        cantidadPersonas: formData.cantidadPersonas ? parseInt(formData.cantidadPersonas) : null,
        fechaNacimiento: formData.fechaNacimiento || null,
        fechaRecibo: formData.fechaRecibo || null,
        propertyId: null,
      };
      const created = await reservaService.createReserva(payload);
      setShowForm(false);
      setFormData({ ...EMPTY_FORM, garantes:[{ ...EMPTY_GARANTE }] });
      // Normalizar tipoGarantia para los componentes de documento
      if (created.tipoGarantia && typeof created.tipoGarantia === 'string') {
        created.tipoGarantia = created.tipoGarantia.split(' + ').map(s => s.trim());
      }
      setDocType('fc1');
      setSelectedReserva(created);
      loadReservas();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al guardar la reserva');
    } finally { setSubmitLoading(false); }
  };

  // ── Preview desde tabla ──────────────────────────────────────────────────
  const openPreview = async (id, type = 'fc1') => {
    setPreviewLoading(true);
    try {
      const data = await reservaService.getReserva(id);
      if (data.tipoGarantia && typeof data.tipoGarantia === 'string') {
        data.tipoGarantia = data.tipoGarantia.split(' + ').map(s => s.trim());
      }
      setDocType(type);
      setSelectedReserva(data);
    } catch { setError('Error al cargar la reserva'); }
    finally { setPreviewLoading(false); }
  };

  const closePreview = () => setSelectedReserva(null);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try { await reservaService.deleteReserva(id); setConfirmDelete(null); loadReservas(); }
    catch { setError('Error al eliminar la reserva'); }
  };

  const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('es-AR') : '-';

  // ── Documento activo en el modal ─────────────────────────────────────────
  const DocComponent = docType === 'ctr' ? ContratoPreview
                     : docType === 'fc10' ? EntregaCopiaPreview
                     : ReciboPreview;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout title="Reservas">
      <div className="reservas-page">

        <div className="reservas-toolbar">
          <h2 className="reservas-heading">Recibos de Reserva</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nueva Reserva</button>
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
                  <th>Inquilino</th><th>DNI</th><th>Propiedad</th>
                  <th>Monto</th><th>Garantía</th><th>Estado</th>
                  <th>Fecha</th><th>Documentos</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => {
                  const sc = STATUS_CONFIG[r.status] || { label: r.status, cls: 'status-pendiente' };
                  return (
                    <tr key={r.id}>
                      <td data-label="Inquilino">{r.nombre} <strong>{r.apellido?.toUpperCase()}</strong></td>
                      <td data-label="DNI">{r.dni}</td>
                      <td data-label="Propiedad">{r.propiedad}</td>
                      <td data-label="Monto">${Number(r.monto).toLocaleString('es-AR')}</td>
                      <td data-label="Garantía">{r.tipoGarantia || '-'}</td>
                      <td data-label="Estado"><span className={`status-badge ${sc.cls}`}>{sc.label}</span></td>
                      <td data-label="Fecha">{formatDate(r.createdAt)}</td>
                      <td data-label="Documentos">
                        <div className="row-actions">
                          <button className="action-btn" onClick={() => openPreview(r.id, 'fc1')} title="Recibo de Reserva (FC1)">FC1</button>
                          <button className="action-btn" onClick={() => openPreview(r.id, 'fc10')} title="Entrega de Copia (FC10)">FC10</button>
                          <button className="action-btn" onClick={() => openPreview(r.id, 'ctr')} title="Contrato de Locación (CTR)">CTR</button>
                          <button className="action-btn delete" onClick={() => setConfirmDelete(r)} title="Eliminar">🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal: Nueva Reserva ─────────────────────────────────── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => !submitLoading && setShowForm(false)}>
            <div className="modal modal-lg reservas-form-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nueva Reserva de Locación</h2>
                <button className="modal-close" onClick={() => setShowForm(false)} disabled={submitLoading}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="reservas-form">

                <div className="form-section">
                  <div className="form-section-title">Lectura automática de DNI</div>
                  <div className="dni-upload-area">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleDniUpload} className="dni-file-input" id="dni-file" />
                    <label htmlFor="dni-file" className={`dni-upload-btn ${dniLoading ? 'loading' : ''}`}>
                      {dniLoading ? 'Leyendo DNI con IA...' : '📷 Subir foto del DNI'}
                    </label>
                    <button type="button" className="btn-demo-fill" onClick={() => setFormData({
                      nombre: 'Carlos Alberto', apellido: 'MIRANDA', apellidoMaterno: 'LÓPEZ',
                      dni: '30123456', cuil: '20-30123456-5', fechaNacimiento: '1985-06-15',
                      domicilioActual: 'Córdoba 1234 Piso 2 Dto. B, Rosario', telefono: '341 555-0000',
                      email: 'carlos.miranda@gmail.com', condicionFiscal: 'Consumidor Final', profesion: 'Empleado',
                      propiedad: 'Av. Corrientes 756 Piso 3° Dpto. B, Rosario', propertyId: null,
                      tipoInmueble: 'departamento', asesor: 'Martín Fernández',
                      monto: '350000', montoInformes: '15000',
                      fechaRecibo: today(), medioPago: 'transferencia',
                      observaciones: 'Reserva confirmada con transferencia. Garantía propietaria + recibo de sueldo presentados.',
                      tipoGarantia: ['Propietaria','Laboral'],
                      cantidadPersonas: '2', tieneCoinquilino: false, coinquilinoNombre: '', apoderadoLocativa: '',
                      garantes: [{
                        nombre: 'GARCÍA, Carlos Alberto', apellidoMaterno: 'PÉREZ',
                        dni: '11223344', fechaNacimiento: '1962-03-22',
                        cuil: '20-11223344-7', domicilio: 'Sarmiento 890, Rosario',
                        descripcionBien: 'Depto. en Laprida 555, libre de gravamen',
                      }],
                    })}>✦ Caso completo</button>
                    {dniError && <p className="field-error">{dniError}</p>}
                    {!dniError && !dniLoading && <p className="dni-hint">Opcional — sube una foto para que la IA complete los campos automáticamente.</p>}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Datos del Inquilino</div>
                  <div className="form-row">
                    <div className="form-group"><label>Nombre *</label><input value={formData.nombre} onChange={e => setField('nombre', e.target.value)} required placeholder="Juan" /></div>
                    <div className="form-group"><label>Apellido *</label><input value={formData.apellido} onChange={e => setField('apellido', e.target.value)} required placeholder="GARCÍA" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Apellido Materno</label><input value={formData.apellidoMaterno} onChange={e => setField('apellidoMaterno', e.target.value)} placeholder="Opcional" /></div>
                    <div className="form-group"><label>DNI *</label><input value={formData.dni} onChange={e => setField('dni', e.target.value)} required placeholder="30123456" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>CUIL</label><input value={formData.cuil} onChange={e => setField('cuil', e.target.value)} placeholder="20-30123456-5" /></div>
                    <div className="form-group"><label>Fecha de nacimiento</label><input type="date" value={formData.fechaNacimiento} onChange={e => setField('fechaNacimiento', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label>Domicilio actual *</label><input value={formData.domicilioActual} onChange={e => setField('domicilioActual', e.target.value)} required placeholder="Mitre 1234, Rosario" /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Teléfono</label><input value={formData.telefono} onChange={e => setField('telefono', e.target.value)} placeholder="+54 341 555-0000" /></div>
                    <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setField('email', e.target.value)} placeholder="juan@email.com" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Condición fiscal *</label>
                      <select value={formData.condicionFiscal} onChange={e => setField('condicionFiscal', e.target.value)} required>
                        {CONDICION_FISCAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Profesión</label><input value={formData.profesion} onChange={e => setField('profesion', e.target.value)} placeholder="Empleado" /></div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Datos de la Operación</div>
                  <div className="form-group"><label>Propiedad *</label><input value={formData.propiedad} onChange={e => setField('propiedad', e.target.value)} required placeholder="Corrientes 456, Piso 3 Dto. A, Rosario" /></div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de inmueble</label>
                      <select value={formData.tipoInmueble} onChange={e => setField('tipoInmueble', e.target.value)}>
                        {TIPO_INMUEBLE_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Asesor</label><input value={formData.asesor} onChange={e => setField('asesor', e.target.value)} placeholder="Nombre del asesor" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Monto de reserva ($) *</label>
                      <input type="number" min="0" value={formData.monto} onChange={e => setField('monto', e.target.value)} required placeholder="50000" />
                      {formData.monto && <p className="monto-letras">{numeroALetras(formData.monto)}</p>}
                    </div>
                    <div className="form-group">
                      <label>Honorarios por informes ($)</label>
                      <input type="number" min="0" value={formData.montoInformes} onChange={e => setField('montoInformes', e.target.value)} placeholder="0" />
                      {formData.montoInformes && <p className="monto-letras">{numeroALetras(formData.montoInformes)}</p>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha del recibo</label>
                      <input type="date" value={formData.fechaRecibo} onChange={e => setField('fechaRecibo', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Medio de pago</label>
                      <select value={formData.medioPago} onChange={e => setField('medioPago', e.target.value)}>
                        {MEDIO_PAGO_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tipo de garantía</label>
                    <div className="garantias-checkboxes">
                      {GARANTIAS_OPTIONS.map(opt => (
                        <label key={opt} className="checkbox-label">
                          <input type="checkbox" checked={Array.isArray(formData.tipoGarantia) && formData.tipoGarantia.includes(opt)} onChange={() => toggleGarantia(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.tipoGarantia && Array.isArray(formData.tipoGarantia) && formData.tipoGarantia.some(g => g.toLowerCase().includes('locativa')) && (
                    <div className="form-group"><label>Apoderado Locativa</label><input value={formData.apoderadoLocativa} onChange={e => setField('apoderadoLocativa', e.target.value)} placeholder="Nombre del apoderado" /></div>
                  )}
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea value={formData.observaciones} onChange={e => setField('observaciones', e.target.value)} placeholder="Notas internas sobre la reserva..." rows={3} />
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Garantes</div>
                  {formData.garantes.map((g, idx) => (
                    <div key={idx} className="garante-card">
                      <div className="garante-card-header">
                        <span className="garante-num">Garante {idx + 1}</span>
                        {formData.garantes.length > 1 && <button type="button" className="garante-remove" onClick={() => removeGarante(idx)}>× Quitar</button>}
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>Nombre completo</label><input value={g.nombre} onChange={e => setGarante(idx,'nombre',e.target.value)} placeholder="Ana López" /></div>
                        <div className="form-group"><label>Apellido materno</label><input value={g.apellidoMaterno} onChange={e => setGarante(idx,'apellidoMaterno',e.target.value)} placeholder="RODRÍGUEZ" /></div>
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>DNI</label><input value={g.dni} onChange={e => setGarante(idx,'dni',e.target.value)} placeholder="28000000" /></div>
                        <div className="form-group"><label>Fecha de nacimiento</label><input type="date" value={g.fechaNacimiento} onChange={e => setGarante(idx,'fechaNacimiento',e.target.value)} /></div>
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>CUIL</label><input value={g.cuil} onChange={e => setGarante(idx,'cuil',e.target.value)} placeholder="27-28000000-3" /></div>
                        <div className="form-group"><label>Domicilio</label><input value={g.domicilio} onChange={e => setGarante(idx,'domicilio',e.target.value)} placeholder="San Martín 100, Rosario" /></div>
                      </div>
                      <div className="form-group">
                        <label>Descripción del bien (garantía propietaria)</label>
                        <input value={g.descripcionBien} onChange={e => setGarante(idx,'descripcionBien',e.target.value)} placeholder="Depto. en Laprida 555, libre de gravamen" />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-garante" onClick={addGarante}>+ Agregar garante</button>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Datos adicionales (solo quedan en el sistema)</div>
                  <div className="form-row">
                    <div className="form-group"><label>Personas convivientes</label><input type="number" min="1" value={formData.cantidadPersonas} onChange={e => setField('cantidadPersonas', e.target.value)} placeholder="2" /></div>
                    <div className="form-group form-group-inline">
                      <label className="checkbox-label-lg">
                        <input type="checkbox" checked={formData.tieneCoinquilino} onChange={e => setField('tieneCoinquilino', e.target.checked)} />
                        Tiene co-inquilino
                      </label>
                    </div>
                  </div>
                  {formData.tieneCoinquilino && (
                    <div className="form-group"><label>Nombre del co-inquilino</label><input value={formData.coinquilinoNombre} onChange={e => setField('coinquilinoNombre', e.target.value)} placeholder="María Gómez" /></div>
                  )}
                </div>

                {submitError && <p className="field-error">{submitError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={submitLoading}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={submitLoading}>{submitLoading ? 'Guardando...' : 'Guardar reserva'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Vista de documento (FC1 / FC10 / CTR) ─────────── */}
        {(selectedReserva || previewLoading) && (
          <div className="modal-overlay print-hide" onClick={closePreview}>
            <div className="modal modal-print" onClick={e => e.stopPropagation()}>
              <div className="modal-header print-hide">
                <div className="doc-tabs">
                  {[['fc1','FC1 — Reserva'],['fc10','FC10 — Entrega de Copia'],['ctr','CTR — Contrato']].map(([type, label]) => (
                    <button key={type} className={`doc-tab ${docType === type ? 'active' : ''}`} onClick={() => setDocType(type)}>{label}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
                  <button className="btn-primary" onClick={() => window.print()}>Imprimir / PDF</button>
                  <button className="modal-close" onClick={closePreview}>×</button>
                </div>
              </div>
              {previewLoading ? (
                <div className="loading-container"><div className="loading-spinner" /></div>
              ) : (
                <DocComponent r={selectedReserva} />
              )}
            </div>
          </div>
        )}

        {/* ── Modal: Confirmar eliminar ─────────────────────────────── */}
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
