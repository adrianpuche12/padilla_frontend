/**
 * Temas de la Ayuda de Propero: un tema por cada uso del sistema.
 *
 * - pantalla: la ruta donde se usa ('general' = vale para todo el sistema).
 * - roles: quiénes lo pueden hacer (null = todos los que entran).
 * - video: id del video con voz en /ayuda/videos.json (opcional; si falta, el tema queda solo con texto).
 * - pasos: lo que se hace, en orden. consejos: «Tené en cuenta».
 *
 * Los videos se grabaron sobre el ambiente de desarrollo con datos inventados.
 */

export const GESTION = ['SUPER_ADMIN', 'MANAGER', 'ADMIN'];

export const PANTALLAS = [
  { id: 'dashboard', titulo: 'Dashboard' },
  { id: 'users', titulo: 'Usuarios' },
  { id: 'clients', titulo: 'Clientes' },
  { id: 'providers', titulo: 'Proveedores' },
  { id: 'properties', titulo: 'Propiedades' },
  { id: 'contracts', titulo: 'Contratos' },
  { id: 'tickets', titulo: 'Tickets' },
  { id: 'reservas', titulo: 'Reservas' },
  { id: 'my-home', titulo: 'Mis propiedades / Mi vivienda' },
  { id: 'reports', titulo: 'Reportes' },
  { id: 'audit', titulo: 'Auditoría' },
  { id: 'notifications', titulo: 'Notificaciones' },
  { id: 'profile', titulo: 'Mi perfil' },
  { id: 'settings', titulo: 'Configuración' },
  { id: 'platform', titulo: 'Plataforma' },
  { id: 'general', titulo: 'General' },
];

export const TEMAS = [
  // ───────────────────────────── General
  {
    id: 'entrar',
    pantalla: 'general',
    roles: null,
    video: 'propero-01',
    titulo: 'Entrar, moverse por el menú y salir',
    resumen: 'Usuario y contraseña, el menú de la izquierda y Cerrar sesión.',
    pasos: [
      'Abrí Propero en el navegador. En la pantalla de ingreso escribí tu usuario (o el email con el que te dieron de alta) y tu contraseña.',
      'Tocá «Ingresar». El sistema abre en el Dashboard.',
      'A la izquierda está el menú: tocá una sección para ir a ella. El nombre de la sección aparece arriba, y a la derecha, tu usuario.',
      'Con la flecha de abajo del menú, el menú se achica y queda más lugar para las tablas. Con la misma flecha vuelve a abrirse. En el celular, el menú se abre con el botón de tres rayas.',
      'Al terminar, tocá «Cerrar sesión», sobre todo si la computadora es compartida.',
    ],
    consejos: [
      'La primera vez que entrás con una contraseña temporal, el sistema te pide cambiarla por una propia.',
      'Si no te acordás la contraseña, en la pantalla de ingreso está «¿Olvidaste tu contraseña?»: te llega una temporal por mail.',
      'El menú cambia según el rol: el inquilino y el proveedor solo ven Dashboard y Tickets.',
    ],
  },
  {
    id: 'roles',
    pantalla: 'general',
    roles: null,
    titulo: 'Qué puede hacer cada rol',
    resumen: 'SUPER ADMIN, MANAGER, ADMIN, propietario, inquilino y proveedor.',
    pasos: [
      'SUPER ADMIN: todo, incluida Configuración, y administra a los MANAGER y ADMIN.',
      'MANAGER: todo el trabajo diario y administra a los ADMIN.',
      'ADMIN: Usuarios (solo lectura de los de rango menor), Clientes, Proveedores, Propiedades, Contratos, Tickets y Reservas.',
      'Inquilino: ve el Dashboard, «Mi vivienda» y sus Tickets; carga pedidos de arreglo con «+ Nuevo ticket» o «🎙️ Pedir por voz» y comenta.',
      'Proveedor: ve el Dashboard y los tickets que tiene asignados; manda presupuestos y coordina visitas.',
      'Propietario: ve el Dashboard, «Mis propiedades», los tickets de sus propiedades y su informe anual en «Reportes».',
      'Reportes: SUPER ADMIN, MANAGER y ADMIN. Auditoría: solo SUPER ADMIN y MANAGER.',
    ],
    consejos: ['Cada uno ve y administra solo a los usuarios de rango menor al suyo.'],
  },

  // ───────────────────────────── Dashboard
  {
    id: 'dashboard',
    pantalla: 'dashboard',
    roles: null,
    video: 'propero-02',
    titulo: 'Leer el Dashboard',
    resumen: 'Consultas (leads) de portales y del formulario, vendedores y fuentes.',
    pasos: [
      'Arriba hay cuatro números: el total de consultas que llegaron por portales, el total por el formulario de la web, y las que entraron hoy por cada vía.',
      'En «Vendedores» está cada vendedor y cuántas consultas tiene asignadas.',
      'En «Fuentes de Leads» están los canales por los que llegan las consultas: portales, redes, el cartel en la propiedad, la web.',
      '«Estado del Sistema» muestra que todas las partes están andando.',
      'Abajo, «Últimos Leads de Portales» muestra las diez consultas más nuevas con fecha, nombre, teléfono, fuente y vendedor.',
    ],
    consejos: ['Los vendedores, las fuentes y la tabla de consultas solo los ven los roles de gestión (SUPER ADMIN, MANAGER y ADMIN).'],
  },

  // ───────────────────────────── Usuarios
  {
    id: 'usuarios',
    pantalla: 'users',
    roles: GESTION,
    video: 'propero-03',
    titulo: 'Usuarios del sistema: ver, filtrar y dar de alta',
    resumen: 'Las personas de la inmobiliaria que trabajan en el panel.',
    pasos: [
      'Entrá a «Usuarios». Están las personas de la inmobiliaria con acceso al panel; los clientes van aparte, en «Clientes».',
      'Con el filtro de arriba elegís ver un solo rol.',
      'Para dar de alta a alguien, tocá «+ Nuevo usuario».',
      'Completá nombre, email (es con el que va a entrar), teléfono y rol. El rol solo ofrece los de rango menor al tuyo.',
      'Al guardar, el sistema muestra una contraseña temporal para copiar y le manda un mail de bienvenida con esos datos.',
      'La primera vez que entre, el sistema le pide cambiar la contraseña. Mientras tanto figura «Pendiente activación».',
    ],
    consejos: [
      'El SUPER ADMIN administra a todos; el MANAGER, a los ADMIN. Un ADMIN no puede dar de alta usuarios del sistema: la lista de roles le sale vacía.',
      'Si el acceso temporal venció, figura «Acceso expirado»: usá «Reenviar acceso».',
    ],
  },
  {
    id: 'usuarios-acciones',
    pantalla: 'users',
    roles: GESTION,
    titulo: 'Usuarios: editar, desactivar, resetear la contraseña o eliminar',
    resumen: 'Los botones de cada fila de la tabla de usuarios.',
    pasos: [
      'Lápiz: editar nombre, teléfono o rol.',
      'Círculo tachado: desactivar. La persona deja de poder entrar, pero no se borra nada. Con la tilde verde se reactiva.',
      'Sobre (solo mientras no entró por primera vez): reenviar acceso. Genera un acceso temporal nuevo, válido por 24 horas, y lo manda por mail.',
      'Llave (solo el SUPER ADMIN): resetear la contraseña. Muestra una contraseña temporal para copiar y también la manda por mail.',
      'Tacho (solo el SUPER ADMIN): eliminar para siempre (de la base y del acceso). Pide confirmación y no se puede deshacer.',
    ],
    consejos: ['Si alguien deja de trabajar en la inmobiliaria, conviene desactivarlo en lugar de eliminarlo: queda el historial.'],
  },

  // ───────────────────────────── Clientes
  {
    id: 'clientes',
    pantalla: 'clients',
    roles: GESTION,
    video: 'propero-04',
    titulo: 'Clientes: ver, filtrar y dar de alta',
    resumen: 'Propietarios e inquilinos, el filtro por tipo y el formulario de alta.',
    pasos: [
      'Entrá a «Clientes». Los propietarios y los inquilinos están en tablas separadas.',
      'Cada fila muestra nombre, tipo de persona, documento, email, localidad y estado.',
      'Con el filtro de arriba elegís ver solo «Propietarios» o solo «Inquilinos».',
      'Para dar de alta, tocá «+ Nuevo cliente».',
      'Obligatorios: nombre o razón social, email, tipo de cliente (propietario o inquilino) y tipo de persona.',
      'Si los tenés, completá documento, CUIT/CUIL, domicilio, localidad, provincia, condición frente al IVA y notas.',
      'Al guardar, el cliente queda con acceso al sistema: se muestra su contraseña temporal para copiar y le llega un mail de bienvenida.',
    ],
    consejos: [
      '«Pendiente activación» quiere decir que todavía no entró por primera vez con su contraseña temporal.',
      'Para cargar una propiedad o un contrato, el propietario y el inquilino tienen que estar cargados antes acá.',
    ],
  },
  {
    id: 'clientes-editar',
    pantalla: 'clients',
    roles: GESTION,
    video: 'propero-05',
    titulo: 'Clientes: editar, desactivar y reactivar',
    resumen: 'Corregir datos y dar de baja sin borrar el historial.',
    pasos: [
      'En la fila del cliente, el lápiz abre el formulario con los datos cargados. Corregí lo que haga falta y guardá. El email no se puede cambiar.',
      'El círculo tachado es «Desactivar»: pide confirmación y el cliente deja de poder entrar, pero no se borra nada. Queda «Inactivo».',
      'En un cliente inactivo aparece «Reactivar»: con eso recupera el acceso.',
    ],
    consejos: ['Desactivar no borra sus contratos ni sus propiedades.'],
  },

  // ───────────────────────────── Proveedores
  {
    id: 'proveedores',
    pantalla: 'providers',
    roles: GESTION,
    video: 'propero-06',
    titulo: 'Proveedores: filtrar, dar de alta, desactivar y eliminar',
    resumen: 'Plomeros, pintores, electricistas y otros prestadores.',
    pasos: [
      'Entrá a «Proveedores». Están los que hacen los arreglos que piden los inquilinos.',
      'Con el filtro de arriba elegís una especialidad: pintor, electricista, plomero, gasista, albañil.',
      'Para dar de alta, tocá «+ Nuevo proveedor». Obligatorios: nombre o razón social, email y tipo de persona. Elegí también la especialidad.',
      'Al guardar, el proveedor recibe acceso (contraseña temporal por mail) para ver y actualizar los tickets que se le asignen.',
      'En cada fila: lápiz para editar, círculo tachado para desactivar (deja de recibir trabajos), tilde para reactivar y tacho para eliminar.',
      '«Eliminar definitivamente» pide confirmación y no se puede deshacer.',
    ],
    consejos: ['Si un proveedor solo dejó de trabajar con ustedes, conviene desactivarlo: sus tickets anteriores siguen mostrando quién los hizo.'],
  },

  // ───────────────────────────── Propiedades
  {
    id: 'propiedades',
    pantalla: 'properties',
    roles: GESTION,
    video: 'propero-07',
    titulo: 'Propiedades: ver, filtrar y ver el detalle',
    resumen: 'La cartera, el filtro por estado y la ficha de cada propiedad.',
    pasos: [
      'Entrá a «Propiedades». La tabla muestra dirección, tipo, metros cuadrados, ambientes, estado y fecha de alta.',
      'Con el filtro de arriba elegís un estado: Disponible, Alquilada, En venta o Mantenimiento.',
      'El ojo de cada fila abre el detalle: ubicación, datos de la propiedad y estado comercial (en alquiler o en venta, y el productor de cada operación).',
      'Cerrá el detalle con «Cerrar».',
    ],
    consejos: [],
  },
  {
    id: 'propiedades-alta',
    pantalla: 'properties',
    roles: GESTION,
    video: 'propero-08',
    titulo: 'Propiedades: cargar, editar y desactivar',
    resumen: 'Alta de una propiedad con su propietario, cambios y baja.',
    pasos: [
      'Tocá «+ Nueva propiedad».',
      'Obligatorios: la dirección completa, el tipo (casa, departamento, cochera, local…) y el propietario.',
      'Si los tenés: calle, número, piso, departamento, localidad, provincia, metros cuadrados y ambientes.',
      'Abajo: estado de alquiler y de venta, productor de cada operación y fecha de alta.',
      'Tocá «Guardar». La propiedad aparece en la lista.',
      'Para cambiar algo, el lápiz de la fila; corregí y guardá.',
      'Si deja de estar en la cartera, el círculo tachado la desactiva: queda inactiva pero no se borra. Con la tilde se reactiva.',
    ],
    consejos: ['El propietario tiene que estar cargado antes en «Clientes» como propietario.'],
  },

  // ───────────────────────────── Contratos
  {
    id: 'contratos',
    pantalla: 'contracts',
    roles: GESTION,
    video: 'propero-09',
    titulo: 'Contratos: ver, filtrar y ver el detalle',
    resumen: 'Activos, vencidos y rescindidos, con el historial de períodos.',
    pasos: [
      'Entrá a «Contratos». La tabla muestra propiedad, propietario, inquilino, inicio, fin, monto y estado.',
      'Con el filtro de arriba elegís ver solo los activos, los vencidos o los rescindidos.',
      'El ojo de cada fila abre el detalle: las partes, los datos del contrato y el historial de períodos, donde se ve cómo fue cambiando el monto.',
    ],
    consejos: [],
  },
  {
    id: 'contratos-alta',
    pantalla: 'contracts',
    roles: GESTION,
    video: 'propero-10',
    titulo: 'Contratos: cargar, editar y rescindir',
    resumen: 'Propiedad, partes, fechas y monto; cambios y rescisión.',
    pasos: [
      'Tocá «+ Nuevo contrato».',
      'Elegí la propiedad, el propietario y el inquilino. Si hay, escribí el socio del propietario y el del inquilino.',
      'Completá la fecha de inicio, la de fin y el monto inicial (obligatorios). Si la tenés, la fecha de firma.',
      'Opcionales: tipo de contrato, moneda, honorarios (%), gastos administrativos (%), productor y observaciones.',
      'Tocá «Guardar». El contrato aparece como «Activo».',
      'Para corregir, el lápiz de la fila.',
      'Si termina antes de tiempo, el círculo tachado lo «Rescinde». Pide confirmación y no se puede deshacer.',
    ],
    consejos: ['La propiedad, el propietario y el inquilino tienen que estar cargados antes.'],
  },

  // ───────────────────────────── Tickets
  {
    id: 'tickets',
    pantalla: 'tickets',
    roles: null,
    video: 'propero-11',
    titulo: 'Tickets: ver, filtrar y comentar',
    resumen: 'Los pedidos de arreglo, sus estados, el detalle y los comentarios.',
    pasos: [
      'Entrá a «Tickets». Cada ticket es un pedido de arreglo con número, título, categoría, prioridad, propiedad, proveedor, estado y fecha.',
      'Con el filtro de arriba elegís un estado.',
      'Tocá el título para abrir el detalle: estado, categoría, prioridad, propiedad, proveedor y lo que escribió el inquilino.',
      'Los roles de gestión ven además el historial de proveedores: quién lo tuvo y cuándo cambió.',
      'Abajo están los comentarios. Escribí en «Agregar comentario…» y tocá «Comentar».',
      'Si tildás «Interno», el comentario queda solo para la inmobiliaria: el inquilino no lo ve.',
    ],
    consejos: [],
  },
  {
    id: 'tickets-ciclo',
    pantalla: 'tickets',
    roles: null,
    titulo: 'El recorrido de un ticket: de Abierta a Cerrada',
    resumen: 'Qué quiere decir cada estado y quién lo cambia.',
    pasos: [
      'Abierta: el inquilino lo cargó y todavía no tiene proveedor.',
      'En proceso: la inmobiliaria le asignó un proveedor. El proveedor también puede marcarlo en proceso.',
      'Resuelta: el proveedor terminó el arreglo.',
      'Cerrada: la inmobiliaria da el trabajo por terminado.',
      'Rechazada: la inmobiliaria lo rechazó con un motivo (por ejemplo, porque el arreglo corre por cuenta del inquilino).',
    ],
    consejos: ['En esta versión del panel no hay todavía un botón para pasar un ticket a Resuelta o Cerrada: se hace desde el sistema, fuera de esta pantalla.'],
  },
  {
    id: 'tickets-asignar',
    pantalla: 'tickets',
    roles: GESTION,
    video: 'propero-12',
    titulo: 'Tickets: asignar proveedor, cambiarlo o rechazar',
    resumen: 'Mandar el arreglo a un proveedor, reemplazarlo o rechazar el pedido.',
    pasos: [
      'Filtrá los tickets «Abierta»: son los que esperan proveedor.',
      'En la fila, tocá «Asignar», elegí el proveedor de la lista y tocá «Asignar». El ticket pasa a «En proceso» y el proveedor lo ve en su usuario.',
      'Para cambiar de proveedor, otra vez «Asignar» en un ticket abierto o en proceso: el sistema pide confirmar el cambio y lo anota en el historial de proveedores.',
      'Si el pedido no corresponde, en un ticket abierto tocá «Rechazar», escribí el motivo (lo ve el inquilino) y confirmá.',
    ],
    consejos: ['Rechazar no tiene vuelta atrás.'],
  },
  {
    id: 'tickets-nuevo',
    pantalla: 'tickets',
    roles: ['TENANT'],
    titulo: 'Inquilino: pedir un arreglo con un ticket nuevo',
    resumen: 'Cómo carga el inquilino un pedido de arreglo.',
    pasos: [
      'Entrá con tu usuario y andá a «Tickets».',
      'Tocá «+ Nuevo ticket».',
      'Escribí un título corto (por ejemplo, «Canilla rota en el baño») y describí el problema con detalle.',
      'Elegí la categoría (plomería, electricidad, pintura, cerrajería, gas u otro), la prioridad y la propiedad.',
      'Tocá «Crear ticket». El ticket queda «Abierta» hasta que la inmobiliaria le asigne un proveedor.',
      'Podés seguirlo desde la lista y agregar comentarios en el detalle.',
    ],
    consejos: ['Si tenés una sola propiedad alquilada, ya viene elegida.'],
  },

  // ───────────────────────────── Reservas
  {
    id: 'reservas',
    pantalla: 'reservas',
    roles: GESTION,
    video: 'propero-13',
    titulo: 'Reservas: cargar una reserva',
    resumen: 'Datos del inquilino, de la operación, garantes y locador.',
    pasos: [
      'Entrá a «Reservas» y tocá «+ Nueva Reserva».',
      'Opcional: «Subir foto del DNI» lee la foto y completa nombre, apellido, DNI, CUIL y fecha de nacimiento. Revisá siempre lo que completó.',
      'Datos del inquilino: nombre, apellido, DNI y domicilio actual son obligatorios. También apellido materno, CUIL, fecha de nacimiento, teléfono, email, condición fiscal y profesión.',
      'Datos de la operación: la propiedad y el monto de la reserva (obligatorios). Debajo de cada monto aparece escrito en letras. También tipo de inmueble, asesor, honorarios por informes, fecha del recibo, medio de pago y observaciones.',
      'Tildá los tipos de garantía.',
      'Garantes: cargá uno o más con «+ Agregar garante». Con garantía propietaria, describí el bien.',
      'Locador / Propietario: nombre, apellido, DNI y domicilio. Lo completa la inmobiliaria y va al contrato (CTR).',
      'Datos adicionales (quedan solo en el sistema): personas convivientes y co-inquilino.',
      'Tocá «Guardar reserva». Queda en la lista como «Pendiente», con sus tres documentos.',
    ],
    consejos: ['La lectura del DNI usa un servicio de inteligencia artificial externo: si no puede leerla, completá los datos a mano.'],
  },
  {
    id: 'reservas-documentos',
    pantalla: 'reservas',
    roles: GESTION,
    video: 'propero-14',
    titulo: 'Reservas: documentos FC1, FC10 y CTR',
    resumen: 'Ver, imprimir o guardar en PDF el recibo, la entrega de copia y el contrato.',
    pasos: [
      'En la fila de la reserva están los tres documentos, que se arman solos con lo que se cargó.',
      'FC1: recibo de la reserva. FC10: constancia de entrega de copia. CTR: contrato de locación.',
      'Tocá uno para abrir la vista. Arriba se pasa de un documento a otro sin cerrar.',
      'En el contrato, lo que falta completar aparece marcado en rojo: revisalo antes de imprimir.',
      '«Imprimir / PDF» abre la impresión del navegador: imprimí o elegí «Guardar como PDF».',
      'El tacho borra la reserva. Pide confirmación y no se puede deshacer.',
    ],
    consejos: ['En el video de ayuda el documento aparece tapado: lleva los datos de la inmobiliaria.'],
  },

  // ───────────────────────────── Dashboard (PRO-105 y PRO-106)
  {
    id: 'dashboard-personalizar',
    pantalla: 'dashboard',
    roles: null,
    titulo: 'Personalizar el Dashboard',
    resumen: 'Elegir qué cuadros ver y en qué orden.',
    pasos: [
      'En el Dashboard tocá «⚙️ Personalizar dashboard».',
      'Aparece la lista de cuadros disponibles para tu rol. Tildá los que querés ver y destildá los que no.',
      'Con ↑ y ↓ cambiás el orden.',
      'Tocá «Guardar». La próxima vez que entres, el Dashboard se ve igual.',
    ],
    consejos: ['Cada rol tiene sus cuadros: la inmobiliaria ve tickets, propiedades y proveedores; el propietario, el inquilino y el proveedor ven los de su cuenta.'],
  },
  {
    id: 'encuesta',
    pantalla: 'dashboard',
    roles: ['OWNER', 'TENANT'],
    titulo: 'Calificar un arreglo terminado',
    resumen: 'La encuesta de 1 a 5 estrellas al cerrarse un ticket.',
    pasos: [
      'Cuando la inmobiliaria cierra un ticket tuyo, en el Dashboard aparece «¿Cómo resolvimos tu pedido?».',
      'Tocá las estrellas: 1 es muy mal y 5 es excelente.',
      'Si querés, escribí un comentario.',
      'Tocá «Enviar». La encuesta desaparece y queda registrada.',
    ],
    consejos: ['Con 1 o 2 estrellas, la inmobiliaria recibe un aviso urgente para revisar el caso.'],
  },

  // ───────────────────────────── Tickets (PRO-103)
  {
    id: 'tickets-voz',
    pantalla: 'tickets',
    roles: ['TENANT', 'OWNER'],
    titulo: 'Pedir un arreglo por voz',
    resumen: 'Cuatro pasos grandes y simples, dictando en vez de escribir.',
    pasos: [
      'En «Tickets» tocá «🎙️ Pedir por voz».',
      'Paso 1, «¿Qué problema tenés?»: tocá el tipo de problema.',
      'Paso 2, «Contanos qué pasa»: dictá o escribí qué pasa y tocá «Siguiente».',
      'Paso 3: si querés, sumá una foto. Si no, tocá «Saltar este paso».',
      'Paso 4, «Revisá tu pedido»: si algo está mal, «✏️ Editar algo». Si está bien, «✅ Enviar pedido».',
    ],
    consejos: ['Si tu navegador no permite dictar, el sistema te deja escribirlo.'],
  },
  {
    id: 'tickets-presupuestos',
    pantalla: 'tickets',
    roles: ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'PROVIDER'],
    titulo: 'Presupuestos, visita y costo final',
    resumen: 'El proveedor presupuesta, la inmobiliaria aprueba y se registra el costo.',
    pasos: [
      'Abrí el ticket. Abajo está la sección «Presupuestos».',
      'Proveedor: cargá el monto y el detalle, y tocá «Enviar presupuesto».',
      'Inmobiliaria: en cada presupuesto tocá «Aprobar» o «Rechazar».',
      'Con «Coordinar visita» y «Guardar fecha» queda la fecha en que va el proveedor.',
      'Al terminar el trabajo, cargá el «Costo final» y tocá «Guardar costo».',
    ],
    consejos: ['Si el presupuesto supera el monto crítico de la Configuración, se avisa a la supervisión.'],
  },

  // ───────────────────────────── Mis propiedades / Mi vivienda (PRO-102)
  {
    id: 'mi-vivienda',
    pantalla: 'my-home',
    roles: ['OWNER', 'TENANT'],
    titulo: 'Mis propiedades / Mi vivienda',
    resumen: 'Tus propiedades o tu vivienda, con sus contratos.',
    pasos: [
      'Tocá «Mis propiedades» (propietario) o «Mi vivienda» (inquilino) en el menú.',
      'Arriba están tus propiedades o la vivienda que alquilás.',
      'Debajo están los contratos, con fechas, alquiler y estado.',
    ],
    consejos: ['Si falta algún dato o no está bien, avisale a la inmobiliaria: ellos lo corrigen.'],
  },

  // ───────────────────────────── Reportes y Auditoría (PRO-106)
  {
    id: 'reportes',
    pantalla: 'reports',
    roles: ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'OWNER'],
    titulo: 'Sacar un reporte y exportarlo',
    resumen: 'Tickets, costos, proveedores, eficiencia e informe anual, en Excel o PDF.',
    pasos: [
      'Entrá a «Reportes» y elegí el reporte.',
      'Completá los filtros que necesites: fechas, tipo de servicio, costo, puntuación, año o propietario.',
      'Tocá «Ver reporte» para verlo en pantalla.',
      'Con «Exportar Excel» o «Exportar PDF» se descarga el archivo con los mismos filtros.',
    ],
    consejos: [
      'Si no ponés fechas, el reporte toma los últimos 90 días.',
      'El propietario ve solo su informe anual. «Eficiencia operativa» la ven el SUPER ADMIN y el MANAGER.',
    ],
  },
  {
    id: 'auditoria',
    pantalla: 'audit',
    roles: ['SUPER_ADMIN', 'MANAGER'],
    titulo: 'Ver quién hizo qué (Auditoría)',
    resumen: 'El registro de los cambios importantes del sistema.',
    pasos: [
      'Entrá a «Auditoría».',
      'Cada fila dice cuándo, quién, con qué rol, qué hizo y el detalle (por ejemplo, de qué estado a qué estado pasó un ticket).',
      'Filtrá por sección (tickets, usuarios, contratos, reservas, configuración) y por fechas.',
    ],
    consejos: ['El registro no se puede editar ni borrar desde el sistema.'],
  },

  // ───────────────────────────── Notificaciones y perfil (PRO-101 y PRO-104)
  {
    id: 'notificaciones',
    pantalla: 'notifications',
    roles: null,
    titulo: 'Notificaciones',
    resumen: 'La campana, la bandeja y los avisos por mail.',
    pasos: [
      'Arriba a la derecha, la campana 🔔 muestra cuántos avisos tenés sin leer. Tocala para abrir la bandeja.',
      'Tocá un aviso para marcarlo como leído e ir a lo que avisa (un ticket, un contrato, una reserva).',
      '«Marcar todas como leídas» limpia la bandeja. «Solo sin leer» filtra.',
      'En «Preferencias» elegís si querés avisos por mail y un resumen diario o semanal. Tocá «Guardar preferencias».',
    ],
    consejos: ['Algunos avisos importantes llegan por mail aunque lo apagues. La campana se actualiza sola cada minuto.'],
  },
  {
    id: 'perfil',
    pantalla: 'profile',
    roles: null,
    titulo: 'Mi perfil y cambiar la contraseña',
    resumen: 'Tus datos de contacto y tu contraseña.',
    pasos: [
      'Tocá tu nombre arriba a la derecha.',
      'En «Mis datos» corregí nombre, teléfono, domicilio, ciudad y provincia, y tocá «Guardar».',
      'En «Cambiar contraseña» escribí la actual y dos veces la nueva.',
    ],
    consejos: ['El email no se cambia desde acá: es tu usuario. Pedíselo a la inmobiliaria.'],
  },

  // ───────────────────────────── Configuración y Plataforma (PRO-100)
  {
    id: 'configuracion',
    pantalla: 'settings',
    roles: ['SUPER_ADMIN'],
    titulo: 'Configuración de la inmobiliaria',
    resumen: 'Datos que van en los documentos, color de marca y reglas operativas.',
    pasos: [
      'Entrá a «Configuración».',
      'En «Datos de la inmobiliaria» cargá lo que sale en los recibos y contratos.',
      'Elegí el «Color de marca».',
      'En «Reglas operativas»: horas de SLA para tomar un ticket, monto crítico de presupuestos, comisión y horario de los mails.',
      'Tocá «Guardar configuración».',
    ],
    consejos: ['Cada cambio queda registrado en la Auditoría.'],
  },
  {
    id: 'plataforma',
    pantalla: 'platform',
    roles: ['PLATFORM_ADMIN'],
    titulo: 'Dar de alta una inmobiliaria',
    resumen: 'Solo para el personal de Propero.',
    pasos: [
      'Entrá a «Plataforma».',
      'En «Dar de alta una inmobiliaria» completá el nombre, el identificador (en minúsculas y con guiones), el plan y el nombre y email del administrador.',
      'Tocá «Crear inmobiliaria». El administrador recibe sus datos de acceso por mail.',
      'Abajo, en «Inmobiliarias», está la lista de las que ya están dadas de alta.',
    ],
    consejos: ['Cada inmobiliaria ve solo sus datos: nunca los de otra.'],
  },
];
