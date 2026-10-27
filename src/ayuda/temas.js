/**
 * Temas de la Ayuda de Propero: un tema por cada uso del sistema.
 *
 * - pantalla: la ruta donde se usa ('general' = vale para todo el sistema).
 * - roles: quiénes lo pueden hacer (null = todos los que entran).
 * - video: id del video sin voz en /ayuda/videos.json (opcional; si falta, el tema queda solo con texto).
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
      'Inquilino: ve el Dashboard y sus Tickets; carga pedidos de arreglo con «+ Nuevo ticket» y comenta.',
      'Proveedor: ve el Dashboard y los tickets que tiene asignados.',
      'Propietario: ve el Dashboard.',
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
];
