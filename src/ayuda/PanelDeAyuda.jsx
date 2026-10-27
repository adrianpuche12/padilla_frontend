import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PANTALLAS, TEMAS } from './temas';
import './PanelDeAyuda.css';

import { CARPETA_DE_VIDEOS, buscarTemas, cargarVideos, minutosYSegundos, temasVisibles } from './ayuda';

/**
 * Panel de Ayuda: se abre a la derecha sin sacarte de lo que estabas haciendo.
 * Abre en lo de la pantalla actual; el buscador encuentra sin tildes ni mayúsculas;
 * cada rol ve solo lo que puede usar. Esc o la cruz la cierran.
 */
export default function PanelDeAyuda({ actual, roles, onCerrar, traerVideos = cargarVideos }) {
  const [consulta, setConsulta] = useState('');
  const [tema, setTema] = useState(null);
  const [videos, setVideos] = useState([]);
  const campo = useRef(null);

  const temas = useMemo(() => temasVisibles(TEMAS, roles), [roles]);
  const videoDe = (t) => videos.find((v) => v.id === t.video);

  useEffect(() => {
    let vigente = true;
    traerVideos().then((l) => { if (vigente) setVideos(l); });
    return () => { vigente = false; };
  }, [traerVideos]);

  useEffect(() => {
    const anterior = document.activeElement;
    campo.current?.focus();
    return () => { if (anterior instanceof HTMLElement) anterior.focus(); };
  }, []);

  // Si cambia de pantalla con la ayuda abierta, la ayuda la sigue.
  const [pantallaAnterior, setPantallaAnterior] = useState(actual);
  if (actual !== pantallaAnterior) {
    setPantallaAnterior(actual);
    setTema(null);
    setConsulta('');
  }

  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (tema) setTema(null);
      else if (consulta) setConsulta('');
      else onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [tema, consulta, onCerrar]);

  const tituloDe = (id) => PANTALLAS.find((p) => p.id === id)?.titulo || id;
  const deAca = temas.filter((t) => t.pantalla === actual);
  const grupos = PANTALLAS.filter((p) => p.id !== actual)
    .map((p) => ({ ...p, temas: temas.filter((t) => t.pantalla === p.id) }))
    .filter((g) => g.temas.length > 0);

  let cuerpo;
  if (tema) {
    cuerpo = (
      <>
        <button type="button" className="ayuda__volver" onClick={() => setTema(null)}>‹ Volver</button>
        <DetalleDelTema tema={tema} video={videoDe(tema)} actual={actual} tituloDe={tituloDe} />
      </>
    );
  } else if (consulta.trim()) {
    const res = buscarTemas(temas, consulta);
    cuerpo = res.length === 0 ? (
      <p className="ayuda__vacio">No encontramos ayuda para «{consulta.trim()}». Probá con otra palabra, por ejemplo el nombre de la pantalla o de un botón.</p>
    ) : (
      <section aria-label="Resultados">
        <h3 className="ayuda__seccion">{res.length === 1 ? '1 resultado' : `${res.length} resultados`}</h3>
        <Lista temas={res} videoDe={videoDe} alElegir={setTema} />
      </section>
    );
  } else {
    cuerpo = (
      <>
        <section className="ayuda__aca" aria-label="En esta pantalla">
          <h3 className="ayuda__seccion">En esta pantalla · {tituloDe(actual)}</h3>
          {deAca.length > 0 ? (
            <Lista temas={deAca} videoDe={videoDe} alElegir={setTema} />
          ) : (
            <p className="ayuda__vacio">Esta pantalla todavía no tiene ayuda propia. Buscá arriba o elegí un tema.</p>
          )}
        </section>
        {grupos.map((g) => (
          <section key={g.id} aria-label={g.titulo}>
            <h3 className="ayuda__seccion">{g.titulo}</h3>
            <Lista temas={g.temas} videoDe={videoDe} alElegir={setTema} />
          </section>
        ))}
      </>
    );
  }

  return (
    <aside className="ayuda" role="dialog" aria-label="Ayuda">
      <header className="ayuda__cabecera">
        <h2 className="ayuda__titulo">Ayuda</h2>
        <button type="button" className="ayuda__cerrar" onClick={onCerrar} aria-label="Cerrar la ayuda">×</button>
      </header>
      <div className="ayuda__buscador">
        <input
          ref={campo}
          type="search"
          className="ayuda__buscar"
          placeholder="¿Qué querés hacer? Ej.: rescindir"
          aria-label="Buscar en la ayuda"
          value={consulta}
          onChange={(e) => { setConsulta(e.target.value); setTema(null); }}
        />
      </div>
      <div className="ayuda__cuerpo">{cuerpo}</div>
    </aside>
  );
}

function Lista({ temas, videoDe, alElegir }) {
  return (
    <ul className="ayuda__lista">
      {temas.map((t) => {
        const v = videoDe(t);
        return (
          <li key={t.id}>
            <button type="button" className={`ayuda__item${v ? ' ayuda__item--video' : ''}`} onClick={() => alElegir(t)}>
              {v && (
                <span className="ayuda__miniatura" aria-hidden="true">
                  {v.portada && <img src={`${CARPETA_DE_VIDEOS}${v.portada}`} alt="" loading="lazy" />}
                  <span className="ayuda__play">▶</span>
                </span>
              )}
              <span className="ayuda__item-texto">
                <span className="ayuda__item-titulo">{t.titulo}</span>
                <span className="ayuda__item-resumen">
                  {v ? `Video sin sonido · ${minutosYSegundos(v.duracion)} · ` : ''}{t.resumen}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Un video con sus pasos: tocar un paso lleva a ese momento; el paso actual queda resaltado. */
function VideoDeAyuda({ video }) {
  const ref = useRef(null);
  const [segundo, setSegundo] = useState(0);
  const pasos = (video.pasos || []).filter((p) => p.texto);
  let actual = -1;
  pasos.forEach((p, i) => { if (segundo >= p.segundo) actual = i; });
  const ir = (s) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = s;
    v.play().catch(() => {});
  };
  return (
    <div className="ayuda__video">
      <video
        ref={ref}
        src={`${CARPETA_DE_VIDEOS}${video.archivo}`}
        poster={video.portada ? `${CARPETA_DE_VIDEOS}${video.portada}` : undefined}
        controls
        muted
        playsInline
        preload="none"
        onTimeUpdate={(e) => setSegundo(e.currentTarget.currentTime)}
      />
      <p className="ayuda__nota">Video sin sonido · {minutosYSegundos(video.duracion)} · Datos de ejemplo, inventados.</p>
      {pasos.length > 0 && (
        <ol className="ayuda__pasos-del-video">
          {pasos.map((p, i) => (
            <li key={`${p.segundo}-${i}`}>
              <button type="button" className={i === actual ? 'es-actual' : ''} onClick={() => ir(p.segundo)}>
                <span className="ayuda__tiempo">{minutosYSegundos(p.segundo)}</span> {p.texto}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function DetalleDelTema({ tema, video, actual, tituloDe }) {
  const otra = tema.pantalla !== 'general' && tema.pantalla !== actual;
  return (
    <article className="ayuda__tema">
      <h3 className="ayuda__tema-titulo">{tema.titulo}</h3>
      <p className="ayuda__resumen">{tema.resumen}</p>
      {video && <VideoDeAyuda video={video} />}
      <h4 className="ayuda__subtitulo">Paso a paso</h4>
      <ol className="ayuda__pasos">
        {tema.pasos.map((p) => <li key={p}>{p}</li>)}
      </ol>
      {tema.consejos.length > 0 && (
        <div className="ayuda__ojo">
          <h4 className="ayuda__subtitulo">Tené en cuenta</h4>
          <ul>{tema.consejos.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {otra && <Link className="ayuda__ir" to={`/${tema.pantalla}`}>Ir a {tituloDe(tema.pantalla)} ›</Link>}
    </article>
  );
}
