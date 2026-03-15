/**
 * ProperoLogo — Logo oficial de Propero
 *
 * Cambiar SOLO este archivo para actualizar el logo en toda la app.
 * Usa variables CSS de marca definidas en variables.css.
 *
 * Props:
 *   size      — ancho y alto en px (default: 40)
 *   className — clase CSS adicional
 */
function ProperoLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Propero"
      role="img"
    >
      {/* Fondo redondeado — color primario de marca */}
      <rect width="44" height="44" rx="10" fill="var(--brand-color-primary)" />

      {/* Techo / acento — simboliza propiedad */}
      <path d="M22 8 L34 18 L10 18 Z" fill="var(--brand-color-accent)" />

      {/* Trazo vertical de la P */}
      <rect x="12" y="18" width="5" height="19" rx="2" fill="white" />

      {/* Bowl de la P — semicirculo hacia la derecha */}
      <path
        d="M17 20 L25 20 Q33 20 33 26 Q33 32 25 32 L17 32"
        stroke="white"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ProperoLogo;
