/* Gebro — rubros y módulos.
 * Este archivo lo usan la web (modo demo y modo real) y el backend de Apps Script.
 * Para agregar un campo o un módulo nuevo se cambia acá y se vuelve a generar Code.gs.
 */
var GEBRO = (function () {
  var ESTADOS_RESERVA = ['Pendiente', 'Confirmada', 'En curso', 'Finalizada', 'Cancelada'];
  var MEDIOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mercado Pago'];

  var MODULOS = {
    clientes: {
      nombre: 'Clientes', singular: 'cliente', prefijo: 'C', icono: 'personas',
      campos: [
        { k: 'nombre', label: 'Nombre y apellido', tipo: 'texto', req: true, lista: true },
        { k: 'documento', label: 'DNI / CUIT', tipo: 'texto', lista: true },
        { k: 'condicion', label: 'Condición fiscal', tipo: 'select', opciones: ['Monotributo', 'Responsable inscripto', 'Exento', 'Consumidor final', 'Relación de dependencia'], lista: true, rubros: ['contadores'] },
        { k: 'obra_social', label: 'Obra social / prepaga', tipo: 'texto', rubros: ['farmacia'] },
        { k: 'telefono', label: 'Teléfono', tipo: 'tel', lista: true },
        { k: 'email', label: 'Email', tipo: 'email' },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: 'nombre'
    },

    /* ---------- Hotelería ---------- */
    habitaciones: {
      nombre: 'Habitaciones', singular: 'habitación', prefijo: 'H', icono: 'cama',
      campos: [
        { k: 'numero', label: 'Número o nombre', tipo: 'texto', req: true, lista: true },
        { k: 'tipo', label: 'Tipo', tipo: 'select', opciones: ['Single', 'Doble', 'Triple', 'Cuádruple', 'Suite', 'Cabaña'], lista: true },
        { k: 'capacidad', label: 'Capacidad (personas)', tipo: 'numero', lista: true },
        { k: 'tarifa', label: 'Tarifa por noche', tipo: 'dinero', lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento'], def: 'Disponible', lista: true }
      ],
      orden: 'numero'
    },
    reservas: {
      nombre: 'Reservas', singular: 'reserva', prefijo: 'R', icono: 'calendario', vista: 'calendario',
      campos: [
        { k: 'habitacion', label: 'Habitación', tipo: 'ref', ref: 'habitaciones', req: true, lista: true },
        { k: 'cliente', label: 'Huésped', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'desde', label: 'Entrada', tipo: 'fecha', req: true, lista: true },
        { k: 'hasta', label: 'Salida', tipo: 'fecha', req: true, lista: true },
        { k: 'personas', label: 'Personas', tipo: 'numero', def: 2 },
        { k: 'total', label: 'Total de la estadía', tipo: 'dinero', lista: true, ayuda: 'Si lo dejás vacío se calcula con la tarifa de la habitación.' },
        { k: 'sena', label: 'Seña cobrada', tipo: 'dinero' },
        { k: 'canal', label: 'Canal', tipo: 'select', opciones: ['Directo', 'WhatsApp', 'Teléfono', 'Booking', 'Airbnb', 'Otro'], def: 'Directo' },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_RESERVA, def: 'Confirmada', lista: true },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: '-desde',
      acciones: [
        { id: 'checkin', label: 'Hacer check-in', si: { estado: ['Pendiente', 'Confirmada'] } },
        { id: 'checkout', label: 'Hacer check-out', si: { estado: ['En curso'] } }
      ]
    },
    consumos: {
      nombre: 'Consumos', singular: 'consumo', prefijo: 'K', icono: 'copa',
      campos: [
        { k: 'reserva', label: 'Reserva', tipo: 'ref', ref: 'reservas', req: true, lista: true },
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', req: true, lista: true },
        { k: 'concepto', label: 'Concepto', tipo: 'texto', req: true, lista: true },
        { k: 'monto', label: 'Monto', tipo: 'dinero', req: true, lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Pendiente', 'Cobrado'], def: 'Pendiente', lista: true }
      ],
      orden: '-fecha'
    },

    /* ---------- Comercio ---------- */
    productos: {
      nombre: 'Productos', singular: 'producto', prefijo: 'P', icono: 'caja',
      campos: [
        { k: 'codigo', label: 'Código', tipo: 'texto', lista: true },
        { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true, lista: true },
        { k: 'categoria', label: 'Categoría', tipo: 'texto', lista: true },
        { k: 'laboratorio', label: 'Laboratorio', tipo: 'texto', rubros: ['farmacia'] },
        { k: 'receta', label: 'Venta', tipo: 'select', opciones: ['Libre', 'Bajo receta', 'Receta archivada'], def: 'Libre', rubros: ['farmacia'] },
        { k: 'vence', label: 'Vence el', tipo: 'fecha', lista: true, rubros: ['farmacia'] },
        { k: 'unidad', label: 'Se vende por', tipo: 'select', opciones: ['Unidad', 'Metro', 'Kilo', 'Litro', 'Caja', 'Bolsa'], def: 'Unidad', lista: true, rubros: ['ferreteria'] },
        { k: 'precio', label: 'Precio de venta', tipo: 'dinero', req: true, lista: true },
        { k: 'costo', label: 'Costo', tipo: 'dinero' },
        { k: 'stock', label: 'Stock', tipo: 'numero', def: 0, lista: true },
        { k: 'stock_min', label: 'Avisar con menos de', tipo: 'numero', def: 0 }
      ],
      orden: 'nombre'
    },
    ventas: {
      nombre: 'Ventas', singular: 'venta', prefijo: 'V', icono: 'ticket',
      campos: [
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', req: true, lista: true },
        { k: 'producto', label: 'Producto', tipo: 'ref', ref: 'productos', req: true, lista: true },
        { k: 'cantidad', label: 'Cantidad', tipo: 'numero', def: 1, req: true, lista: true, decimales: true },
        { k: 'precio_unit', label: 'Precio unitario', tipo: 'dinero', ayuda: 'Si lo dejás vacío se usa el precio del producto.' },
        { k: 'total', label: 'Total', tipo: 'dinero', lista: true, soloLectura: true },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes' },
        { k: 'medio', label: 'Medio de pago', tipo: 'select', opciones: MEDIOS, def: 'Efectivo', lista: true }
      ],
      orden: '-fecha',
      nota: 'Cada venta descuenta stock y se anota sola en la caja.'
    },
    proveedores: {
      nombre: 'Proveedores', singular: 'proveedor', prefijo: 'B', icono: 'camion',
      campos: [
        { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true, lista: true },
        { k: 'contacto', label: 'Persona de contacto', tipo: 'texto', lista: true },
        { k: 'telefono', label: 'Teléfono', tipo: 'tel', lista: true },
        { k: 'email', label: 'Email', tipo: 'email' },
        { k: 'rubro', label: 'Qué te vende', tipo: 'texto', lista: true },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: 'nombre'
    },

    /* ---------- Turnos y servicios ---------- */
    servicios: {
      nombre: 'Servicios', singular: 'servicio', prefijo: 'S', icono: 'tijera',
      campos: [
        { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true, lista: true },
        { k: 'duracion', label: 'Duración (minutos)', tipo: 'numero', def: 30, req: true, lista: true },
        { k: 'precio', label: 'Precio', tipo: 'dinero', lista: true }
      ],
      orden: 'nombre'
    },
    profesionales: {
      nombre: 'Profesionales', singular: 'profesional', prefijo: 'F', icono: 'persona',
      campos: [
        { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true, lista: true },
        { k: 'especialidad', label: 'Especialidad', tipo: 'texto', lista: true },
        { k: 'desde_hora', label: 'Atiende desde', tipo: 'hora', def: '09:00', lista: true },
        { k: 'hasta_hora', label: 'Atiende hasta', tipo: 'hora', def: '18:00', lista: true }
      ],
      orden: 'nombre'
    },
    turnos: {
      nombre: 'Turnos', singular: 'turno', prefijo: 'T', icono: 'reloj', vista: 'agenda',
      campos: [
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', req: true, lista: true },
        { k: 'hora', label: 'Hora', tipo: 'hora', req: true, lista: true },
        { k: 'profesional', label: 'Profesional', tipo: 'ref', ref: 'profesionales', req: true, lista: true },
        { k: 'servicio', label: 'Servicio', tipo: 'ref', ref: 'servicios', req: true, lista: true },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Reservado', 'Confirmado', 'Atendido', 'Ausente', 'Cancelado'], def: 'Reservado', lista: true },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: '-fecha',
      acciones: [
        { id: 'atendido', label: 'Marcar atendido y cobrar', si: { estado: ['Reservado', 'Confirmado'] } },
        { id: 'ausente', label: 'Marcar ausente', si: { estado: ['Reservado', 'Confirmado'] } }
      ]
    },

    /* ---------- Ferretería ---------- */
    presupuestos: {
      nombre: 'Presupuestos', singular: 'presupuesto', prefijo: 'Q', icono: 'documento',
      campos: [
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', req: true, lista: true },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'detalle', label: 'Qué incluye', tipo: 'largo', req: true },
        { k: 'total', label: 'Total', tipo: 'dinero', req: true, lista: true },
        { k: 'valido_hasta', label: 'Válido hasta', tipo: 'fecha', lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Enviado', 'Aceptado', 'Rechazado', 'Vencido'], def: 'Enviado', lista: true }
      ],
      orden: '-fecha'
    },

    /* ---------- Contadores ---------- */
    vencimientos: {
      nombre: 'Vencimientos', singular: 'vencimiento', prefijo: 'X', icono: 'alarma',
      campos: [
        { k: 'fecha', label: 'Vence el', tipo: 'fecha', req: true, lista: true },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'obligacion', label: 'Obligación', tipo: 'select', opciones: ['Monotributo', 'IVA', 'Ganancias', 'Bienes Personales', 'Autónomos', 'Ingresos Brutos', 'Cargas sociales (F.931)', 'Recategorización', 'Otra'], req: true, lista: true },
        { k: 'periodo', label: 'Período', tipo: 'texto', lista: true, ayuda: 'Por ejemplo 09/2026.' },
        { k: 'monto', label: 'Monto a pagar', tipo: 'dinero', lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Pendiente', 'Presentado', 'Pagado'], def: 'Pendiente', lista: true },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: 'fecha',
      acciones: [
        { id: 'presentado', label: 'Marcar presentado', si: { estado: ['Pendiente'] } },
        { id: 'pagado', label: 'Marcar pagado', si: { estado: ['Pendiente', 'Presentado'] } }
      ]
    },
    honorarios: {
      nombre: 'Honorarios', singular: 'honorario', prefijo: 'O', icono: 'billete',
      campos: [
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'proyecto', label: 'Proyecto', tipo: 'ref', ref: 'proyectos', lista: true, rubros: ['freelancer'] },
        { k: 'concepto', label: 'Concepto', tipo: 'texto', req: true, lista: true, ayuda: 'Abono mensual, anticipo, cuota, entrega final…' },
        { k: 'periodo', label: 'Período', tipo: 'texto', lista: true },
        { k: 'monto', label: 'Monto', tipo: 'dinero', req: true, lista: true },
        { k: 'vence', label: 'Vence el', tipo: 'fecha', lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['A cobrar', 'Cobrado'], def: 'A cobrar', lista: true }
      ],
      orden: '-vence',
      acciones: [{ id: 'cobrar', label: 'Cobrar', si: { estado: ['A cobrar'] } }]
    },

    /* ---------- Abogados ---------- */
    expedientes: {
      nombre: 'Expedientes', singular: 'expediente', prefijo: 'J', icono: 'carpeta',
      campos: [
        { k: 'numero', label: 'Número de expediente', tipo: 'texto', lista: true },
        { k: 'caratula', label: 'Carátula', tipo: 'texto', req: true, lista: true, ayuda: 'Por ejemplo: Pérez, Juan c/ López, Ana s/ daños y perjuicios.' },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'fuero', label: 'Fuero', tipo: 'select', opciones: ['Civil', 'Comercial', 'Laboral', 'Familia', 'Penal', 'Contencioso administrativo', 'Previsional', 'Otro'], lista: true },
        { k: 'juzgado', label: 'Juzgado / tribunal', tipo: 'texto' },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['En trámite', 'Con sentencia', 'Archivado'], def: 'En trámite', lista: true },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: 'caratula'
    },
    plazos: {
      nombre: 'Agenda y plazos', singular: 'plazo', prefijo: 'L', icono: 'alarma',
      campos: [
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', req: true, lista: true },
        { k: 'hora', label: 'Hora', tipo: 'hora', lista: true },
        { k: 'expediente', label: 'Expediente', tipo: 'ref', ref: 'expedientes', req: true, lista: true },
        { k: 'tipo', label: 'Tipo', tipo: 'select', opciones: ['Vencimiento de plazo', 'Audiencia', 'Mediación', 'Reunión con cliente', 'Otro'], def: 'Vencimiento de plazo', req: true, lista: true },
        { k: 'detalle', label: 'Detalle', tipo: 'texto', lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Pendiente', 'Cumplido'], def: 'Pendiente', lista: true }
      ],
      orden: 'fecha',
      acciones: [{ id: 'cumplido', label: 'Marcar cumplido', si: { estado: ['Pendiente'] } }]
    },

    /* ---------- Freelancer ---------- */
    proyectos: {
      nombre: 'Proyectos', singular: 'proyecto', prefijo: 'Y', icono: 'carpeta',
      campos: [
        { k: 'nombre', label: 'Nombre del proyecto', tipo: 'texto', req: true, lista: true },
        { k: 'cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true, lista: true },
        { k: 'tipo', label: 'Tipo de trabajo', tipo: 'select', opciones: ['Sitio web', 'Diseño', 'Desarrollo', 'Marketing y redes', 'Fotografía y video', 'Consultoría', 'Otro'], lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Propuesta', 'En curso', 'En revisión', 'Entregado', 'Pausado'], def: 'En curso', lista: true },
        { k: 'presupuesto', label: 'Presupuesto', tipo: 'dinero', lista: true },
        { k: 'inicio', label: 'Empezó el', tipo: 'fecha', def: 'hoy' },
        { k: 'entrega', label: 'Fecha de entrega', tipo: 'fecha', lista: true },
        { k: 'avance', label: 'Avance (%)', tipo: 'numero', def: 0 },
        { k: 'notas', label: 'Notas', tipo: 'largo' }
      ],
      orden: 'entrega'
    },
    tareas: {
      nombre: 'Tareas', singular: 'tarea', prefijo: 'A', icono: 'check',
      campos: [
        { k: 'tarea', label: 'Tarea', tipo: 'texto', req: true, lista: true },
        { k: 'proyecto', label: 'Proyecto', tipo: 'ref', ref: 'proyectos', req: true, lista: true },
        { k: 'fecha', label: 'Para el', tipo: 'fecha', lista: true },
        { k: 'horas', label: 'Horas trabajadas', tipo: 'numero', decimales: true, lista: true },
        { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['Pendiente', 'En curso', 'Hecha'], def: 'Pendiente', lista: true }
      ],
      orden: 'fecha',
      acciones: [{ id: 'hecha', label: 'Marcar hecha', si: { estado: ['Pendiente', 'En curso'] } }]
    },

    /* ---------- Para todos ---------- */
    caja: {
      nombre: 'Caja', singular: 'movimiento', prefijo: 'M', icono: 'billete',
      campos: [
        { k: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', req: true, lista: true },
        { k: 'tipo', label: 'Tipo', tipo: 'select', opciones: ['Ingreso', 'Egreso'], def: 'Ingreso', req: true, lista: true },
        { k: 'concepto', label: 'Concepto', tipo: 'texto', req: true, lista: true },
        { k: 'monto', label: 'Monto', tipo: 'dinero', req: true, lista: true },
        { k: 'medio', label: 'Medio', tipo: 'select', opciones: MEDIOS, def: 'Efectivo', lista: true },
        { k: 'origen', label: 'Origen', tipo: 'texto', soloLectura: true }
      ],
      orden: '-fecha'
    }
  };

  var RUBROS = {
    hoteleria: {
      nombre: 'Hotelería', para: 'Hoteles, hosterías, cabañas y departamentos',
      modulos: ['reservas', 'habitaciones', 'clientes', 'consumos', 'caja'],
      palabras: { clientes: 'Huéspedes', cliente: 'huésped' }
    },
    comercio: {
      nombre: 'Comercio', para: 'Almacenes, kioscos, tiendas y verdulerías',
      modulos: ['ventas', 'productos', 'clientes', 'proveedores', 'caja'],
      palabras: {}
    },
    servicios: {
      nombre: 'Turnos y servicios', para: 'Consultorios, estéticas, peluquerías y centros',
      modulos: ['turnos', 'servicios', 'profesionales', 'clientes', 'caja'],
      palabras: { clientes: 'Pacientes y clientes' }
    },
    ferreteria: {
      nombre: 'Ferretería', para: 'Ferreterías, corralones, pinturerías y casas de electricidad',
      modulos: ['ventas', 'productos', 'presupuestos', 'clientes', 'proveedores', 'caja'],
      palabras: {}
    },
    farmacia: {
      nombre: 'Farmacia', para: 'Farmacias, perfumerías y droguerías',
      modulos: ['ventas', 'productos', 'clientes', 'proveedores', 'caja'],
      palabras: { clientes: 'Clientes y afiliados' }
    },
    contadores: {
      nombre: 'Estudio contable', para: 'Contadores y estudios contables, con accesos a ARCA',
      modulos: ['vencimientos', 'clientes', 'honorarios', 'caja'],
      palabras: {}
    },
    abogados: {
      nombre: 'Estudio jurídico', para: 'Abogados y estudios jurídicos',
      modulos: ['plazos', 'expedientes', 'clientes', 'honorarios', 'caja'],
      palabras: {}
    },
    freelancer: {
      nombre: 'Freelancer', para: 'Diseñadores, programadores, community managers y profesionales independientes',
      modulos: ['proyectos', 'tareas', 'clientes', 'honorarios', 'caja'],
      palabras: { honorarios: 'Cobros', honorario: 'cobro' }
    }
  };

  // Accesos directos que se muestran en el menú según el rubro
  var ENLACES = {
    contadores: [
      { nombre: 'ARCA', url: 'https://www.arca.gob.ar/' },
      { nombre: 'Ingresar con Clave Fiscal', url: 'https://auth.afip.gob.ar/contribuyente_/login.xhtml' },
      { nombre: 'Constancia de CUIT', url: 'https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do' }
    ],
    abogados: [
      { nombre: 'Constitución Nacional', url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/804/norma.htm' }
    ]
  };

  // Orden fijo del menú, sin importar en qué orden se activen
  var ORDEN_MENU = ['reservas', 'habitaciones', 'consumos', 'turnos', 'servicios', 'profesionales',
    'proyectos', 'tareas', 'vencimientos', 'plazos', 'expedientes', 'ventas', 'productos', 'presupuestos', 'proveedores',
    'clientes', 'honorarios', 'caja'];

  // ¿Este campo se muestra para el rubro de la empresa?
  function campoVisible(c, rubro) { return !c.rubros || c.rubros.indexOf(rubro) >= 0; }

  return { MODULOS: MODULOS, RUBROS: RUBROS, ORDEN_MENU: ORDEN_MENU, MEDIOS: MEDIOS, ENLACES: ENLACES, campoVisible: campoVisible };
})();
if (typeof module !== 'undefined') module.exports = GEBRO;
