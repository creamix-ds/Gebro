/* Gebro — Code.gs generado: modulos.js + motor.js + backend/base.gs. Pegar TODO en un solo archivo. */
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
    general: {
      nombre: 'General', para: 'Cualquier negocio: clientes, cobros y caja',
      modulos: ['clientes', 'honorarios', 'caja'],
      palabras: { honorarios: 'Cobros', honorario: 'cobro' }
    },
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

/* Gebro — reglas del negocio.
 * Funciones puras: reciben los datos de la empresa (db = { modulo: [filas] }) y devuelven
 * la lista de cambios a aplicar. Las usan igual la demo (localStorage) y Apps Script (planillas),
 * así una regla se escribe una sola vez.
 */
var Motor = (function () {
  // Se busca al usarlo (no al cargar) para que el orden de los archivos en Apps Script no importe
  function Mods() { return GEBRO.MODULOS; }

  function num(v) {
    if (v === '' || v === null || v === undefined) return '';
    if (typeof v === 'number') return v;
    var s = String(v).trim().replace(/\$/g, '').replace(/\s/g, '');
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(',', '.');
    var n = Number(s);
    return isNaN(n) ? '' : n;
  }
  function n0(v) { var n = num(v); return n === '' ? 0 : n; }

  function sumarDias(fecha, d) {
    var p = fecha.split('-');
    var dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + d));
    return dt.toISOString().slice(0, 10);
  }
  function noches(desde, hasta) {
    var a = Date.parse(desde + 'T00:00:00Z'), b = Date.parse(hasta + 'T00:00:00Z');
    return Math.round((b - a) / 86400000);
  }
  function minutos(hora) {
    var p = String(hora || '').split(':');
    return (+p[0]) * 60 + (+p[1] || 0);
  }
  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function plata(n) {
    n = Math.round(n0(n));
    if (n < 0) return '−' + plata(-n);
    return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function buscar(db, modulo, id) {
    var filas = db[modulo] || [];
    for (var i = 0; i < filas.length; i++) if (filas[i].id === id) return filas[i];
    return null;
  }
  function copia(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  function siguienteId(db, modulo) {
    var pre = Mods()[modulo].prefijo, max = 0;
    (db[modulo] || []).forEach(function (f) {
      var n = parseInt(String(f.id).slice(pre.length), 10);
      if (n > max) max = n;
    });
    return pre + (max + 1);
  }

  function etiqueta(db, modulo, id) {
    var f = buscar(db, modulo, id);
    if (!f) return id ? '(' + id + ' borrado)' : '';
    switch (modulo) {
      case 'habitaciones': return 'Hab. ' + f.numero;
      case 'reservas': {
        var h = buscar(db, 'habitaciones', f.habitacion), c = buscar(db, 'clientes', f.cliente);
        return (h ? 'Hab. ' + h.numero : '') + ' · ' + (c ? c.nombre : '') + ' · ' + f.desde;
      }
      case 'turnos': return f.fecha + ' ' + f.hora;
      case 'caja': return f.concepto;
      default: return f.nombre || f.id;
    }
  }

  function nuevaFila(modulo, hoy) {
    var f = {};
    Mods()[modulo].campos.forEach(function (c) {
      f[c.k] = c.def === 'hoy' ? hoy : (c.def !== undefined ? c.def : '');
    });
    return f;
  }

  // Limpia tipos y valida campos obligatorios y referencias
  function normalizar(db, modulo, entrada, anterior, hoy) {
    var def = Mods()[modulo], f = { id: entrada.id || '' }, errores = [];
    def.campos.forEach(function (c) {
      var v = entrada[c.k];
      // Campo no enviado: se conserva el valor anterior o se usa el de por defecto
      if (v === undefined) v = anterior ? anterior[c.k] : (c.def === 'hoy' ? hoy : c.def);
      if (v === undefined || v === null) v = '';
      if (c.tipo === 'numero' || c.tipo === 'dinero') v = num(v);
      else v = String(v).trim();
      if (c.tipo === 'fecha' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errores.push(c.label + ': la fecha no es válida.');
      if (c.tipo === 'hora' && v) {
        if (/^\d{1,2}$/.test(v)) v = v + ':00';
        if (!/^\d{1,2}:\d{2}$/.test(v)) errores.push(c.label + ': escribila como 09:30.');
        else v = hhmm(minutos(v));
      }
      if (c.tipo === 'select' && v && c.opciones.indexOf(v) < 0) errores.push(c.label + ': opción no válida.');
      if (c.tipo === 'ref' && v && !buscar(db, c.ref, v)) errores.push(c.label + ': no existe.');
      if (c.req && v === '' && !c.soloLectura) errores.push('Falta completar ' + c.label.toLowerCase() + '.');
      f[c.k] = v;
    });
    return { fila: f, errores: errores };
  }

  function activa(r) { return r.estado !== 'Cancelada' && r.estado !== 'Finalizada'; }
  function turnoActivo(t) { return t.estado !== 'Cancelado' && t.estado !== 'Ausente'; }

  // Movimiento de caja asociado a otra fila (venta, seña, check-out, turno)
  function movimiento(db, origen, datos, cambios) {
    var existente = null;
    (db.caja || []).forEach(function (m) { if (m.origen === origen) existente = m; });
    if (!datos) {
      if (existente) cambios.push({ m: 'caja', op: 'del', fila: existente });
      return;
    }
    var fila = existente ? copia(existente) : { id: siguienteId(db, 'caja') };
    fila.fecha = datos.fecha; fila.tipo = 'Ingreso'; fila.concepto = datos.concepto;
    fila.monto = datos.monto; fila.medio = datos.medio || 'Efectivo'; fila.origen = origen;
    cambios.push({ m: 'caja', op: 'set', fila: fila });
    if (!existente) (db.caja = db.caja || []).push(fila); // para que el próximo id no choque
  }

  function guardar(db, modulo, entrada, ctx) {
    if (!Mods()[modulo]) return { error: 'Módulo desconocido.' };
    var anterior = entrada.id ? buscar(db, modulo, entrada.id) : null;
    if (entrada.id && !anterior) return { error: 'Ese registro ya no existe. Recargá la página.' };
    var r = normalizar(db, modulo, entrada, anterior, ctx && ctx.hoy);
    if (r.errores.length) return { error: r.errores.join(' ') };
    var f = r.fila, cambios = [], avisos = [];
    if (!f.id) f.id = siguienteId(db, modulo);
    if (modulo === 'clientes' && f.documento) {
      var soloNum = String(f.documento).replace(/\D/g, '');
      if (soloNum.length === 11) {
        if (!cuitValido(soloNum)) return { error: 'El CUIT ' + f.documento + ' no es válido. Revisá los números.' };
        f.documento = soloNum.slice(0, 2) + '-' + soloNum.slice(2, 10) + '-' + soloNum.slice(10);
      }
    }
    if (modulo === 'proyectos' && f.avance !== '') f.avance = Math.max(0, Math.min(100, Math.round(n0(f.avance))));
    if (modulo === 'honorarios' && f.proyecto) {
      var py = buscar(db, 'proyectos', f.proyecto);
      if (py && py.cliente !== f.cliente) return { error: 'Ese proyecto es de ' + etiqueta(db, 'clientes', py.cliente) + ', no de este cliente.' };
    }
        if (modulo === 'productos' && f.codigo) {
      var mismo = (db.productos || []).filter(function (p) { return p.id !== f.id && String(p.codigo).trim() === f.codigo; })[0];
      if (mismo) return { error: 'El código ' + f.codigo + ' ya es de ' + mismo.nombre + '.' };
    }

    if (modulo === 'reservas') {
      if (f.hasta <= f.desde) return { error: 'La salida tiene que ser posterior a la entrada.' };
      if (activa(f)) {
        var choque = (db.reservas || []).filter(function (o) {
          return o.id !== f.id && o.habitacion === f.habitacion && activa(o) && o.desde < f.hasta && f.desde < o.hasta;
        })[0];
        if (choque) return { error: 'La habitación ya está reservada del ' + choque.desde + ' al ' + choque.hasta + ' (' + etiqueta(db, 'clientes', choque.cliente) + ').' };
      }
      var hab = buscar(db, 'habitaciones', f.habitacion);
      if (f.total === '' && hab && hab.tarifa !== '') f.total = n0(hab.tarifa) * noches(f.desde, f.hasta);
      if (hab && n0(hab.capacidad) && n0(f.personas) > n0(hab.capacidad)) avisos.push('Ojo: la habitación es para ' + hab.capacidad + ' personas.');
      cambios.push({ m: modulo, op: 'set', fila: f });
      movimiento(db, 'seña:' + f.id, n0(f.sena) > 0 && f.estado !== 'Cancelada' ? {
        fecha: (findOrigen(db, 'seña:' + f.id) || {}).fecha || ctx.hoy,
        concepto: 'Seña reserva ' + f.id + ' · ' + etiqueta(db, 'clientes', f.cliente), monto: n0(f.sena)
      } : null, cambios);
    } else if (modulo === 'turnos') {
      var serv = buscar(db, 'servicios', f.servicio), dur = serv ? n0(serv.duracion) || 30 : 30;
      var ini = minutos(f.hora), fin = ini + dur;
      if (turnoActivo(f)) {
        var pisado = (db.turnos || []).filter(function (o) {
          if (o.id === f.id || o.profesional !== f.profesional || o.fecha !== f.fecha || !turnoActivo(o)) return false;
          var s = buscar(db, 'servicios', o.servicio), oi = minutos(o.hora), of = oi + (s ? n0(s.duracion) || 30 : 30);
          return oi < fin && ini < of;
        })[0];
        if (pisado) return { error: 'Se superpone con el turno de las ' + pisado.hora + ' (' + etiqueta(db, 'clientes', pisado.cliente) + ').' };
      }
      var prof = buscar(db, 'profesionales', f.profesional);
      if (prof && prof.desde_hora && prof.hasta_hora && (ini < minutos(prof.desde_hora) || fin > minutos(prof.hasta_hora)))
        avisos.push(prof.nombre + ' atiende de ' + prof.desde_hora + ' a ' + prof.hasta_hora + '.');
      cambios.push({ m: modulo, op: 'set', fila: f });
    } else if (modulo === 'ventas') {
      var prod = buscar(db, 'productos', f.producto);
      if (n0(f.cantidad) <= 0) return { error: 'La cantidad tiene que ser mayor a cero.' };
      if (f.precio_unit === '') f.precio_unit = prod ? n0(prod.precio) : 0;
      f.total = Math.round(n0(f.cantidad) * n0(f.precio_unit) * 100) / 100;
      // Stock: devolver lo de la versión anterior y descontar lo nuevo
      var stock = {};
      function ajustar(pid, d) {
        if (!pid) return;
        if (!stock[pid]) { var p = buscar(db, 'productos', pid); if (!p) return; stock[pid] = copia(p); }
        stock[pid].stock = n0(stock[pid].stock) + d;
      }
      if (anterior) ajustar(anterior.producto, n0(anterior.cantidad));
      ajustar(f.producto, -n0(f.cantidad));
      for (var pid in stock) {
        cambios.push({ m: 'productos', op: 'set', fila: stock[pid] });
        if (stock[pid].stock < 0) avisos.push('El stock de ' + stock[pid].nombre + ' quedó en ' + stock[pid].stock + '.');
      }
      cambios.push({ m: modulo, op: 'set', fila: f });
      movimiento(db, 'venta:' + f.id, {
        fecha: f.fecha, medio: f.medio,
        concepto: 'Venta ' + f.id + ' · ' + f.cantidad + ' × ' + (prod ? prod.nombre : ''), monto: f.total
      }, cambios);
    } else if (modulo === 'caja') {
      if (anterior && anterior.origen) return { error: 'Este movimiento se generó solo desde ' + anterior.origen.split(':')[0] + '. Cambialo desde ahí.' };
      f.origen = '';
      cambios.push({ m: modulo, op: 'set', fila: f });
    } else {
      cambios.push({ m: modulo, op: 'set', fila: f });
    }
    return { fila: f, cambios: cambios, avisos: avisos };
  }

  function cuitValido(c) {
    var pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], suma = 0;
    for (var i = 0; i < 10; i++) suma += (+c[i]) * pesos[i];
    var v = 11 - suma % 11;
    if (v === 11) v = 0;
    if (v === 10) v = 9;
    return v === +c[10];
  }

  function findOrigen(db, origen) {
    return (db.caja || []).filter(function (m) { return m.origen === origen; })[0] || null;
  }

  function borrar(db, modulo, id) {
    var f = buscar(db, modulo, id);
    if (!f) return { error: 'Ese registro ya no existe.' };
    // ¿Alguien lo usa?
    for (var otro in Mods()) {
      var campos = Mods()[otro].campos.filter(function (c) { return c.tipo === 'ref' && c.ref === modulo; });
      if (!campos.length) continue;
      var usado = (db[otro] || []).filter(function (o) { return campos.some(function (c) { return o[c.k] === id; }); });
      if (usado.length) return { error: 'No se puede borrar: lo usan ' + usado.length + ' ' + (usado.length === 1 ? Mods()[otro].singular : Mods()[otro].nombre.toLowerCase()) + '. Cambiá su estado en lugar de borrarlo.' };
    }
    if (modulo === 'caja' && f.origen) return { error: 'Este movimiento se generó desde ' + f.origen.split(':')[0] + '. Borralo desde ahí.' };
    var cambios = [{ m: modulo, op: 'del', fila: f }];
    if (modulo === 'ventas') {
      var p = buscar(db, 'productos', f.producto);
      if (p) { p = copia(p); p.stock = n0(p.stock) + n0(f.cantidad); cambios.push({ m: 'productos', op: 'set', fila: p }); }
      movimiento(db, 'venta:' + f.id, null, cambios);
    }
    if (modulo === 'reservas') { movimiento(db, 'seña:' + f.id, null, cambios); movimiento(db, 'checkout:' + f.id, null, cambios); }
    if (modulo === 'turnos') movimiento(db, 'turno:' + f.id, null, cambios);
    if (modulo === 'honorarios') movimiento(db, 'honorario:' + f.id, null, cambios);
    return { cambios: cambios };
  }

  function accionDisponible(modulo, accion, fila) {
    var a = (Mods()[modulo].acciones || []).filter(function (x) { return x.id === accion; })[0];
    if (!a) return false;
    for (var k in a.si) if (a.si[k].indexOf(fila[k]) < 0) return false;
    return true;
  }

  // Resumen del check-out, para mostrarlo antes de confirmar
  function cuentaReserva(db, id) {
    var r = buscar(db, 'reservas', id);
    var cons = (db.consumos || []).filter(function (c) { return c.reserva === id && c.estado === 'Pendiente'; });
    var tc = cons.reduce(function (s, c) { return s + n0(c.monto); }, 0);
    return { estadia: n0(r.total), sena: n0(r.sena), consumos: cons, totalConsumos: tc, saldo: n0(r.total) - n0(r.sena) + tc };
  }

  function accion(db, modulo, accionId, id, ctx) {
    var f = buscar(db, modulo, id);
    if (!f) return { error: 'Ese registro ya no existe.' };
    if (!accionDisponible(modulo, accionId, f)) return { error: 'Esa acción no corresponde al estado actual (' + f.estado + ').' };
    var cambios = [], msg = '';
    f = copia(f);
    if (accionId === 'checkin') {
      f.estado = 'En curso';
      var h = buscar(db, 'habitaciones', f.habitacion);
      if (h) { h = copia(h); h.estado = 'Ocupada'; cambios.push({ m: 'habitaciones', op: 'set', fila: h }); }
      msg = 'Check-in hecho. La habitación quedó ocupada.';
    } else if (accionId === 'checkout') {
      var cta = cuentaReserva(db, id);
      f.estado = 'Finalizada';
      var h2 = buscar(db, 'habitaciones', f.habitacion);
      if (h2) { h2 = copia(h2); h2.estado = 'Limpieza'; cambios.push({ m: 'habitaciones', op: 'set', fila: h2 }); }
      cta.consumos.forEach(function (c) { c = copia(c); c.estado = 'Cobrado'; cambios.push({ m: 'consumos', op: 'set', fila: c }); });
      if (cta.saldo > 0) movimiento(db, 'checkout:' + id, {
        fecha: ctx.hoy, medio: ctx.medio, monto: cta.saldo,
        concepto: 'Check-out ' + id + ' · ' + etiqueta(db, 'clientes', f.cliente)
      }, cambios);
      msg = 'Check-out hecho. Se cobraron ' + plata(cta.saldo) + ' y la habitación pasó a limpieza.';
    } else if (accionId === 'atendido') {
      f.estado = 'Atendido';
      var s = buscar(db, 'servicios', f.servicio), monto = s ? n0(s.precio) : 0;
      if (monto > 0) movimiento(db, 'turno:' + id, {
        fecha: f.fecha, medio: ctx.medio, monto: monto,
        concepto: (s ? s.nombre : 'Turno') + ' · ' + etiqueta(db, 'clientes', f.cliente)
      }, cambios);
      msg = monto > 0 ? 'Turno atendido. Se anotaron ' + plata(monto) + ' en la caja.' : 'Turno marcado como atendido.';
    } else if (accionId === 'ausente') {
      f.estado = 'Ausente';
      msg = 'Turno marcado como ausente.';    } else if (accionId === 'presentado') {
      f.estado = 'Presentado';
      msg = 'Marcado como presentado.';
    } else if (accionId === 'pagado') {
      f.estado = 'Pagado';
      msg = 'Marcado como pagado.';
    } else if (accionId === 'hecha') {
      f.estado = 'Hecha';
      msg = 'Tarea hecha.';
    } else if (accionId === 'cumplido') {
      f.estado = 'Cumplido';
      msg = 'Listo, quedó cumplido.';
    } else if (accionId === 'cobrar') {
      f.estado = 'Cobrado';
      movimiento(db, 'honorario:' + id, {
        fecha: ctx.hoy, medio: ctx.medio, monto: n0(f.monto),
        concepto: (f.proyecto ? etiqueta(db, 'proyectos', f.proyecto) + ' · ' + f.concepto : 'Honorarios ' + f.concepto) + (f.periodo ? ' ' + f.periodo : '') + ' · ' + etiqueta(db, 'clientes', f.cliente)
      }, cambios);
      msg = 'Cobrado. Se anotaron ' + plata(f.monto) + ' en la caja.';
    }
    cambios.unshift({ m: modulo, op: 'set', fila: f });
    return { fila: f, cambios: cambios, mensaje: msg };
  }

  return {
    num: n0, plata: plata, sumarDias: sumarDias, noches: noches, minutos: minutos, hhmm: hhmm,
    buscar: buscar, etiqueta: etiqueta, nuevaFila: nuevaFila, guardar: guardar, borrar: borrar,
    accion: accion, accionDisponible: accionDisponible, cuitValido: cuitValido, cuentaReserva: cuentaReserva, activa: activa
  };
})();
if (typeof module !== 'undefined') module.exports = Motor;

/* ===================================================================
 * Gebro — backend (Apps Script)
 * Planilla central: Empresas, Usuarios, Registro.
 * Cada empresa tiene su propia planilla con una hoja por módulo.
 * Primera vez: ejecutar setup() desde el editor y aceptar permisos.
 * =================================================================== */

// ID de cliente de Google (el mismo que está en js/config.js de la web)
var CLIENT_ID = '340172069418-grc7uvkq164vufqrhp668rot1jajatp1.apps.googleusercontent.com';
// Cuentas que ven y administran todas las empresas
var DEVS = ['creamixds@gmail.com'];
var ZONA = 'America/Argentina/Buenos_Aires';
var MAX_EMPRESAS_POR_USUARIO = 3;

var HOJAS_CENTRAL = {
  Empresas: ['id', 'nombre', 'rubro', 'modulos', 'planilla_id', 'plan', 'estado', 'alta', 'dueno', 'mp_suscripcion', 'mp_estado', 'mp_pendiente'],
  Usuarios: ['email', 'empresa_id', 'rol', 'nombre', 'alta'],
  Registro: ['fecha', 'email', 'empresa', 'accion', 'detalle'],
  Rubros: ['id', 'nombre', 'para', 'modulos', 'palabras'],
  Pagos: ['fecha', 'empresa', 'modulo', 'fila', 'mp_id', 'monto', 'estado']
};

/* ---------------- Puesta en marcha ---------------- */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('CENTRAL_ID'), ss;
  if (id) { ss = SpreadsheetApp.openById(id); }
  else {
    ss = SpreadsheetApp.create('Gebro — Central');
    props.setProperty('CENTRAL_ID', ss.getId());
    var carpeta = DriveApp.createFolder('Gebro — Empresas');
    props.setProperty('CARPETA_ID', carpeta.getId());
    DriveApp.getFileById(ss.getId()).moveTo(carpeta);
  }
  Object.keys(HOJAS_CENTRAL).forEach(function (n) { asegurarHoja_(ss, n, HOJAS_CENTRAL[n]); });
  var sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (sobra && ss.getSheets().length > 1) ss.deleteSheet(sobra);
  Logger.log('Planilla central: ' + ss.getUrl());
}

function asegurarHoja_(ss, nombre, encabezados) {
  var h = ss.getSheetByName(nombre);
  if (!h) h = ss.insertSheet(nombre);
  var actuales = h.getLastColumn() ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0] : [];
  var faltan = encabezados.filter(function (e) { return actuales.indexOf(e) < 0; });
  if (faltan.length) h.getRange(1, actuales.length + 1, 1, faltan.length).setValues([faltan]);
  h.getRange(1, 1, h.getMaxRows(), Math.max(h.getMaxColumns(), encabezados.length)).setNumberFormat('@');
  h.setFrozenRows(1);
  h.getRange(1, 1, 1, h.getLastColumn()).setFontWeight('bold').setBackground('#DCEDE4');
  return h;
}

function central_() {
  var id = PropertiesService.getScriptProperties().getProperty('CENTRAL_ID');
  if (!id) throw new Error('Falta ejecutar setup() en el editor de Apps Script.');
  return SpreadsheetApp.openById(id);
}

/* ---------------- Entrada HTTP ---------------- */
function doGet() { return json_({ ok: true, servicio: 'Gebro' }); }

function doPost(e) {
  // Avisos de Mercado Pago (no traen token de Google). Nunca confiamos en el aviso:
  // con el id se vuelve a consultar a Mercado Pago con nuestro Access Token.
  var q = (e && e.parameter) || {};
  if (q.mp) {
    var aviso = {};
    try { aviso = JSON.parse((e.postData && e.postData.contents) || '{}'); } catch (x) { }
    try { webhookMp_(q, aviso); } catch (x) { registrar_('mercadopago', q.e || '', 'webhook:error', x.message); }
    return json_({ ok: true });
  }
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: 'Pedido inválido.' }); }
  try {
    var email = verificar_(req.token);
    if (!email) return json_({ sesion: false, error: 'Tu sesión venció. Volvé a ingresar.' });
    var acciones = { yo: yo_, crearEmpresa: crearEmpresa_, todo: todo_, guardar: guardar_, guardarVarios: guardarVarios_, borrar: borrar_, accion: accion_, ajustes: ajustes_, usuarios: usuarios_,
      dev_empresas: devEmpresas_, dev_crearEmpresa: devCrearEmpresa_, dev_rubros: devRubros_, dev_acceso: devAcceso_, dev_estado: devEstado_, dev_modulos: devModulos_,
      mp_suscribir: mpSuscribir_, mp_revisar: mpRevisar_, mp_cuenta: mpCuenta_, mp_link: mpLink_ };
    if (!acciones[req.action]) return json_({ error: 'Acción desconocida.' });
    return json_(acciones[req.action](email, req));
  } catch (err) {
    return json_({ error: err.message || String(err) });
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- Sesión con Google ---------------- */
function verificar_(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var clave = 'tk_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, token));
  var guardado = cache.get(clave);
  if (guardado) return guardado;
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return null;
  var d = JSON.parse(r.getContentText());
  if (d.aud !== CLIENT_ID || String(d.email_verified) !== 'true') return null;
  var resta = Math.floor(+d.exp - Date.now() / 1000) - 30;
  if (resta <= 0) return null;
  var email = String(d.email).toLowerCase();
  cache.put(clave, email, Math.min(resta, 21600));
  return email;
}

function esDev_(email) { return DEVS.map(function (x) { return x.toLowerCase(); }).indexOf(email) >= 0; }

// Dependencias de módulos: uno necesita los que referencia como obligatorios (según el rubro). En cascada.
function refsReq_(m, rubro) {
  return (GEBRO.MODULOS[m] ? GEBRO.MODULOS[m].campos : []).filter(function (c) { return c.tipo === 'ref' && c.req && GEBRO.campoVisible(c, rubro); }).map(function (c) { return c.ref; });
}
function cerrarDeps_(mods, rubro) {
  var set = {}; (mods || []).forEach(function (m) { if (GEBRO.MODULOS[m]) set[m] = 1; });
  var cambio = true;
  while (cambio) { cambio = false; Object.keys(set).forEach(function (m) { refsReq_(m, rubro).forEach(function (r) { if (!set[r]) { set[r] = 1; cambio = true; } }); }); }
  return Object.keys(set);
}

/* ---------------- Tablas genéricas ---------------- */
function leerTabla_(hoja) {
  var v = hoja.getDataRange().getValues();
  if (v.length < 2) return [];
  var cab = v[0];
  return v.slice(1).filter(function (f) { return f[0] !== ''; }).map(function (f, i) {
    var o = { _fila: i + 2 };
    cab.forEach(function (c, j) {
      var v = f[j];
      if (v instanceof Date) v = v.getFullYear() < 1901 ? Utilities.formatDate(v, ZONA, 'HH:mm') : Utilities.formatDate(v, ZONA, 'yyyy-MM-dd');
      o[c] = String(v);
    });
    return o;
  });
}

function empresas_() { return leerTabla_(central_().getSheetByName('Empresas')); }
function usuariosTabla_() { return leerTabla_(central_().getSheetByName('Usuarios')); }
function rubrosTabla_() { var h = central_().getSheetByName('Rubros'); return h ? leerTabla_(h) : []; }

// Catálogo de rubros = los definidos en modulos.js (GEBRO.RUBROS) + los que
// agregás desde el panel (hoja "Rubros" de la central). La hoja pisa al código si el id coincide.
function catalogoRubros_() {
  var cache = CacheService.getScriptCache();
  var en = cache.get('rubros_cat');
  if (en) { try { return JSON.parse(en); } catch (e) {} }
  var cat = {};
  Object.keys(GEBRO.RUBROS).forEach(function (k) {
    var r = GEBRO.RUBROS[k];
    cat[k] = { id: k, nombre: r.nombre, para: r.para || '', modulos: r.modulos.slice(), palabras: r.palabras || {}, origen: 'codigo' };
  });
  rubrosTabla_().forEach(function (f) {
    var id = String(f.id || '').trim();
    if (!id) return;
    var mods = String(f.modulos || '').split(',').map(function (m) { return m.trim(); }).filter(function (m) { return GEBRO.MODULOS[m]; });
    var palabras = {};
    try { palabras = f.palabras ? JSON.parse(f.palabras) : {}; } catch (e) { palabras = {}; }
    cat[id] = { id: id, nombre: String(f.nombre || id), para: String(f.para || ''), modulos: mods, palabras: palabras, origen: 'hoja' };
  });
  try { cache.put('rubros_cat', JSON.stringify(cat), 60); } catch (e) {}
  return cat;
}
function olvidarRubros_() { try { CacheService.getScriptCache().remove('rubros_cat'); } catch (e) {} }

function empresaPublica_(e, rol) {
  var cat = catalogoRubros_()[e.rubro];
  return { id: e.id, nombre: e.nombre, rubro: e.rubro, rubroNombre: cat ? cat.nombre : e.rubro, palabras: cat ? cat.palabras : {}, modulos: e.modulos ? e.modulos.split(',') : [], plan: e.plan, estado: e.estado, rol: rol,
    suscripcion: e.mp_estado || '', cobrosMp: !!PropertiesService.getScriptProperties().getProperty('MP_NEG_' + e.id), cuentaMp: PropertiesService.getScriptProperties().getProperty('MP_NEG_INFO_' + e.id) || '' };
}

// Devuelve la empresa y el rol del usuario en ella, o error si no tiene acceso
function acceso_(email, empresaId) {
  var e = empresas_().filter(function (x) { return x.id === empresaId; })[0];
  if (!e) throw new Error('Esa empresa no existe.');
  var rol = esDev_(email) ? 'dueño' : null;
  usuariosTabla_().forEach(function (u) { if (u.email.toLowerCase() === email && u.empresa_id === empresaId) rol = u.rol; });
  if (!rol) throw new Error('Tu cuenta no tiene acceso a esta empresa.');
  if (e.estado === 'Suspendida' && !esDev_(email)) throw new Error('La cuenta de ' + e.nombre + ' está suspendida. Escribinos por WhatsApp para reactivarla.');
  return { empresa: e, rol: rol };
}

function registrar_(email, empresa, accion, detalle) {
  try {
    central_().getSheetByName('Registro').appendRow([Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm:ss'), email, empresa, accion, String(detalle || '').slice(0, 300)]);
  } catch (e) { }
}

/* ---------------- Planilla de cada empresa ---------------- */
function encabezados_(m) { return ['id'].concat(GEBRO.MODULOS[m].campos.map(function (c) { return c.k; })).concat(['creado', 'modificado']); }

function planilla_(e) {
  var ss = SpreadsheetApp.openById(e.planilla_id);
  // Si se agregó un módulo o un campo nuevo en modulos.js, se crea solo
  Object.keys(GEBRO.MODULOS).forEach(function (m) { if (!ss.getSheetByName(m)) asegurarHoja_(ss, m, encabezados_(m)); });
  return ss;
}

function leerDb_(ss) {
  var db = {};
  Object.keys(GEBRO.MODULOS).forEach(function (m) {
    var h = ss.getSheetByName(m), tipos = {};
    GEBRO.MODULOS[m].campos.forEach(function (c) { tipos[c.k] = c.tipo; });
    db[m] = h ? leerTabla_(h).map(function (f) {
      var o = { id: f.id };
      GEBRO.MODULOS[m].campos.forEach(function (c) {
        var v = f[c.k] === undefined ? '' : f[c.k];
        o[c.k] = (tipos[c.k] === 'numero' || tipos[c.k] === 'dinero') ? (v === '' ? '' : Motor.num(v)) : v;
      });
      return o;
    }) : [];
  });
  return db;
}

function aplicar_(ss, cambios) {
  var ahora = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm');
  var porHoja = {};
  cambios.forEach(function (c) { (porHoja[c.m] = porHoja[c.m] || []).push(c); });
  Object.keys(porHoja).forEach(function (m) {
    var h = ss.getSheetByName(m) || asegurarHoja_(ss, m, encabezados_(m));
    var cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
    var faltan = encabezados_(m).filter(function (k) { return cab.indexOf(k) < 0; });
    if (faltan.length) { asegurarHoja_(ss, m, encabezados_(m)); cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0]; }
    var ids = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var borrar = [];
    porHoja[m].forEach(function (c) {
      var i = ids.indexOf(String(c.fila.id));
      if (c.op === 'del') { if (i >= 0) borrar.push(i + 2); return; }
      var previo = i >= 0 ? h.getRange(i + 2, 1, 1, cab.length).getValues()[0] : null;
      var fila = cab.map(function (k, j) {
        if (k === 'creado') return previo ? previo[j] : ahora;
        if (k === 'modificado') return ahora;
        var v = c.fila[k];
        return v === undefined || v === null ? '' : String(v);
      });
      if (i >= 0) h.getRange(i + 2, 1, 1, cab.length).setNumberFormat('@').setValues([fila]);
      else {
        var nueva = h.getLastRow() + 1;
        h.getRange(nueva, 1, 1, cab.length).setNumberFormat('@').setValues([fila]);
        ids.push(String(c.fila.id));
      }
    });
    borrar.sort(function (a, b) { return b - a; }).forEach(function (r) { h.deleteRow(r); });
  });
}

function conLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Hay mucha gente guardando al mismo tiempo. Probá de nuevo en unos segundos.');
  try { return fn(); } finally { lock.releaseLock(); }
}

function hoy_() { return Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd'); }

/* ---------------- Acciones ---------------- */
function yo_(email) {
  var es = empresas_(), us = usuariosTabla_(), lista = [];
  if (esDev_(email)) lista = es.map(function (e) { return empresaPublica_(e, 'dueño'); });
  else us.forEach(function (u) {
    if (u.email.toLowerCase() !== email) return;
    var e = es.filter(function (x) { return x.id === u.empresa_id; })[0];
    if (e) lista.push(empresaPublica_(e, u.rol));
  });
  return { email: email, esDev: esDev_(email), empresas: lista };
}

function crearEmpresa_(email, req) {
  return crearEmpresaInterna_(email, req.nombre, req.rubro, email);
}

// duenoEmail = cuenta que será dueña; caller = quién ejecuta (para el límite y la bitácora)
function crearEmpresaInterna_(duenoEmail, nombre, rubro, caller) {
  nombre = String(nombre || '').trim();
  rubro = String(rubro || '').trim();
  duenoEmail = String(duenoEmail || '').trim().toLowerCase();
  if (!nombre) throw new Error('Escribí el nombre del negocio.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(duenoEmail)) throw new Error('El email del dueño no es válido.');
  var cat = catalogoRubros_();
  if (!cat[rubro]) throw new Error('Rubro no válido.');
  return conLock_(function () {
    var es = empresas_();
    var propias = es.filter(function (e) { return e.dueno === duenoEmail; }).length;
    if (propias >= MAX_EMPRESAS_POR_USUARIO && !esDev_(caller)) throw new Error('Ya tenés ' + propias + ' negocios creados. Escribinos si necesitás más.');
    var max = 0; es.forEach(function (e) { var n = parseInt(String(e.id).slice(1), 10); if (n > max) max = n; });
    var id = 'E' + (max + 1);
    var ss = SpreadsheetApp.create('Gebro — ' + nombre + ' (' + id + ')');
    Object.keys(GEBRO.MODULOS).forEach(function (m) { asegurarHoja_(ss, m, encabezados_(m)); });
    var sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (sobra) ss.deleteSheet(sobra);
    var carpeta = PropertiesService.getScriptProperties().getProperty('CARPETA_ID');
    if (carpeta) try { DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(carpeta)); } catch (e) { }
    var c = central_();
    var fila = { id: id, nombre: nombre, rubro: rubro, modulos: cerrarDeps_(cat[rubro].modulos, rubro).join(','), planilla_id: ss.getId(), plan: 'Prueba', estado: 'Activa', alta: hoy_(), dueno: duenoEmail };
    c.getSheetByName('Empresas').appendRow(HOJAS_CENTRAL.Empresas.map(function (k) { return fila[k] === undefined ? '' : fila[k]; }));
    c.getSheetByName('Usuarios').appendRow([duenoEmail, id, 'dueño', '', hoy_()]);
    registrar_(caller, id, 'crearEmpresa', nombre + ' · ' + rubro + (caller !== duenoEmail ? ' · para ' + duenoEmail : ''));
    return { empresa: empresaPublica_(fila, 'dueño') };
  });
}

function todo_(email, req) {
  var a = acceso_(email, req.empresa);
  return { empresa: empresaPublica_(a.empresa, a.rol), db: leerDb_(planilla_(a.empresa)) };
}

function operar_(email, req, fn, nombreAccion) {
  var a = acceso_(email, req.empresa);
  return conLock_(function () {
    var ss = planilla_(a.empresa), db = leerDb_(ss);
    var r = fn(db);
    if (r.error) return { error: r.error };
    aplicar_(ss, r.cambios);
    registrar_(email, a.empresa.id, nombreAccion, (req.modulo || '') + ' ' + ((r.fila && r.fila.id) || req.id || ''));
    return r;
  });
}

function guardar_(email, req) {
  return operar_(email, req, function (db) { return Motor.guardar(db, req.modulo, req.fila || {}, { hoy: hoy_() }); }, 'guardar');
}

// Varias filas en un solo pedido (lo usa la venta rápida)
function guardarVarios_(email, req) {
  return operar_(email, req, function (db) {
    var todos = [], avisos = [];
    for (var i = 0; i < (req.filas || []).length; i++) {
      var r = Motor.guardar(db, req.modulo, req.filas[i], { hoy: hoy_() });
      if (r.error) return { error: r.error };
      r.cambios.forEach(function (c) {
        var lista = db[c.m] = db[c.m] || [], j = -1;
        lista.forEach(function (f, k) { if (f.id === c.fila.id) j = k; });
        if (c.op === 'del') { if (j >= 0) lista.splice(j, 1); } else if (j >= 0) lista[j] = c.fila; else lista.push(c.fila);
      });
      todos = todos.concat(r.cambios); avisos = avisos.concat(r.avisos || []);
    }
    return { cambios: todos, avisos: avisos };
  }, 'guardarVarios');
}

function borrar_(email, req) {
  return operar_(email, req, function (db) { return Motor.borrar(db, req.modulo, req.id); }, 'borrar');
}

function accion_(email, req) {
  return operar_(email, req, function (db) { return Motor.accion(db, req.modulo, req.accion, req.id, { hoy: hoy_(), medio: (req.extra || {}).medio }); }, 'accion:' + req.accion);
}

function ajustes_(email, req) {
  var a = acceso_(email, req.empresa);
  if (a.rol !== 'dueño') throw new Error('Solo el dueño puede cambiar los ajustes.');
  var cambios = req.cambios || {};
  // Los módulos solo los prende/apaga el administrador (DEVS), desde el panel o desde Ajustes
  if (cambios.modulos && !esDev_(email)) throw new Error('Los módulos los activa el administrador. Pedilo por WhatsApp y te lo habilitamos.');
  return conLock_(function () {
    var h = central_().getSheetByName('Empresas'), cab = HOJAS_CENTRAL.Empresas;
    var e = a.empresa;
    if (cambios.nombre) e.nombre = String(cambios.nombre).trim();
    if (cambios.modulos) e.modulos = cerrarDeps_(cambios.modulos.filter(function (m) { return GEBRO.MODULOS[m]; }), e.rubro).join(',');
    h.getRange(e._fila, 1, 1, cab.length).setValues([cab.map(function (k) { return e[k] === undefined ? '' : e[k]; })]);
    registrar_(email, e.id, 'ajustes', JSON.stringify(cambios));
    return { empresa: empresaPublica_(e, a.rol) };
  });
}

function usuarios_(email, req) {
  var a = acceso_(email, req.empresa), op = req.op || 'listar';
  var lista = function () {
    return usuariosTabla_().filter(function (u) { return u.empresa_id === a.empresa.id; }).map(function (u) { return { email: u.email, rol: u.rol, nombre: u.nombre }; });
  };
  if (op === 'listar') return { usuarios: lista() };
  if (a.rol !== 'dueño') throw new Error('Solo el dueño puede dar o quitar accesos.');
  var mail = String((req.datos || {}).email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Mail no válido.');
  return conLock_(function () {
    var h = central_().getSheetByName('Usuarios'), us = usuariosTabla_();
    var existe = us.filter(function (u) { return u.email.toLowerCase() === mail && u.empresa_id === a.empresa.id; })[0];
    if (op === 'sumar') {
      if (existe) throw new Error('Esa cuenta ya tiene acceso.');
      h.appendRow([mail, a.empresa.id, 'empleado', '', hoy_()]);
    } else if (op === 'quitar') {
      if (!existe) throw new Error('Esa cuenta no tiene acceso.');
      if (existe.rol === 'dueño') throw new Error('No se puede quitar al dueño.');
      h.deleteRow(existe._fila);
    }
    registrar_(email, a.empresa.id, 'usuarios:' + op, mail);
    return { usuarios: lista() };
  });
}

/* ===================================================================
 * Panel de desarrollador (SOLO cuentas en DEVS)
 * Cada acción empieza por soloDev_: una cuenta de cliente nunca llega acá.
 * =================================================================== */
function soloDev_(email) { if (!esDev_(email)) throw new Error('Acción reservada al administrador.'); return true; }

var PLANES_VALIDOS = ['Prueba', 'Inicial', 'Crecimiento', 'Pro', 'Negocio', 'A medida'];
var ESTADOS_EMPRESA = ['Activa', 'Suspendida'];

// Lista todas las empresas con su estado, plan, dueño y cantidad de accesos
function devEmpresas_(email) {
  soloDev_(email);
  var us = usuariosTabla_(), cat = catalogoRubros_();
  var empresas = empresas_().map(function (e) {
    return {
      id: e.id, nombre: e.nombre, rubro: e.rubro, rubroNombre: (cat[e.rubro] ? cat[e.rubro].nombre : e.rubro),
      plan: e.plan, estado: e.estado, alta: e.alta, dueno: e.dueno,
      modulos: e.modulos ? e.modulos.split(',') : [],
      usuarios: us.filter(function (u) { return u.empresa_id === e.id; }).length
    };
  });
  return { empresas: empresas };
}

// Crea una empresa llave en mano a nombre del email del cliente
function devCrearEmpresa_(email, req) {
  soloDev_(email);
  var d = req.datos || req;
  return crearEmpresaInterna_(d.dueno || d.email, d.nombre, d.rubro, email);
}

// Lista el catálogo de rubros + los módulos disponibles; o crea/edita un rubro (receta: módulos + renombres)
function devRubros_(email, req) {
  soloDev_(email);
  var op = req.op || (req.datos ? 'crear' : 'listar');
  if (op === 'listar') {
    var cat = catalogoRubros_(), lista = [];
    Object.keys(cat).forEach(function (k) { lista.push(cat[k]); });
    return { rubros: lista, modulos: Object.keys(GEBRO.MODULOS).map(function (m) { return { id: m, nombre: GEBRO.MODULOS[m].nombre }; }) };
  }
  var d = req.datos || {};
  var id = String(d.id || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!id) throw new Error('El rubro necesita un identificador (solo letras y números, sin espacios).');
  if (GEBRO.RUBROS[id] && op === 'crear') throw new Error('Ya hay un rubro de sistema con el código "' + id + '". Elegí otro identificador.');
  var nombre = String(d.nombre || '').trim();
  if (!nombre) throw new Error('El rubro necesita un nombre.');
  var mods = (d.modulos || []).filter(function (m) { return GEBRO.MODULOS[m]; });
  if (!mods.length) throw new Error('Elegí al menos un módulo válido.');
  var palabras = (d.palabras && typeof d.palabras === 'object') ? d.palabras : {};
  var fila = { id: id, nombre: nombre.slice(0, 80), para: String(d.para || '').slice(0, 200), modulos: mods.join(','), palabras: JSON.stringify(palabras) };
  return conLock_(function () {
    var c = central_();
    var h = c.getSheetByName('Rubros') || asegurarHoja_(c, 'Rubros', HOJAS_CENTRAL.Rubros);
    var existe = rubrosTabla_().filter(function (f) { return String(f.id) === id; })[0];
    var cols = HOJAS_CENTRAL.Rubros, valores = cols.map(function (k) { return fila[k] === undefined ? '' : fila[k]; });
    if (existe) h.getRange(existe._fila, 1, 1, cols.length).setNumberFormat('@').setValues([valores]);
    else { h.appendRow(valores); h.getRange(h.getLastRow(), 1, 1, cols.length).setNumberFormat('@'); }
    olvidarRubros_();
    registrar_(email, '', 'dev_rubros:' + op, id);
    return { ok: true, rubro: fila };
  });
}

// Da o quita acceso de cualquier cuenta a cualquier empresa
function devAcceso_(email, req) {
  soloDev_(email);
  var d = req.datos || {};
  var empresaId = String(d.empresa || '').trim(), op = d.op || 'sumar';
  var mail = String(d.email || '').trim().toLowerCase();
  var e = empresas_().filter(function (x) { return x.id === empresaId; })[0];
  if (!e) throw new Error('Esa empresa no existe.');
  if (op === 'sumar' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Mail no válido.');
  return conLock_(function () {
    var h = central_().getSheetByName('Usuarios');
    var existe = usuariosTabla_().filter(function (u) { return u.email.toLowerCase() === mail && u.empresa_id === empresaId; })[0];
    if (op === 'sumar') {
      if (existe) throw new Error('Esa cuenta ya tiene acceso.');
      h.appendRow([mail, empresaId, (d.rol === 'dueño' ? 'dueño' : 'empleado'), '', hoy_()]);
    } else if (op === 'quitar') {
      if (!existe) throw new Error('Esa cuenta no tiene acceso.');
      h.deleteRow(existe._fila);
    } else throw new Error('Operación no válida.');
    registrar_(email, empresaId, 'dev_acceso:' + op, mail);
    var lista = usuariosTabla_().filter(function (u) { return u.empresa_id === empresaId; }).map(function (u) { return { email: u.email, rol: u.rol }; });
    return { usuarios: lista };
  });
}

// Suspende/reactiva una empresa o le cambia el plan
function devEstado_(email, req) {
  soloDev_(email);
  var d = req.datos || {};
  var empresaId = String(d.empresa || '').trim();
  return conLock_(function () {
    var h = central_().getSheetByName('Empresas'), cab = HOJAS_CENTRAL.Empresas;
    var e = empresas_().filter(function (x) { return x.id === empresaId; })[0];
    if (!e) throw new Error('Esa empresa no existe.');
    if (d.estado !== undefined && d.estado !== '') { if (ESTADOS_EMPRESA.indexOf(d.estado) < 0) throw new Error('Estado no válido.'); e.estado = d.estado; }
    if (d.plan !== undefined && d.plan !== '') { if (PLANES_VALIDOS.indexOf(d.plan) < 0) throw new Error('Plan no válido.'); e.plan = d.plan; }
    h.getRange(e._fila, 1, 1, cab.length).setValues([cab.map(function (k) { return e[k] === undefined ? '' : e[k]; })]);
    registrar_(email, empresaId, 'dev_estado', JSON.stringify({ estado: d.estado, plan: d.plan }));
    return { ok: true, empresa: { id: e.id, nombre: e.nombre, estado: e.estado, plan: e.plan } };
  });
}

// Prende/apaga módulos de una empresa (solo administrador). Suma en cascada los que hacen falta.
function devModulos_(email, req) {
  soloDev_(email);
  var d = req.datos || {};
  var empresaId = String(d.empresa || '').trim();
  var pedidos = (d.modulos || []).filter(function (m) { return GEBRO.MODULOS[m]; });
  if (!pedidos.length) throw new Error('Dejá al menos un módulo prendido.');
  return conLock_(function () {
    var h = central_().getSheetByName('Empresas'), cab = HOJAS_CENTRAL.Empresas;
    var e = empresas_().filter(function (x) { return x.id === empresaId; })[0];
    if (!e) throw new Error('Esa empresa no existe.');
    var antes = e.modulos ? e.modulos.split(',') : [];
    var mods = cerrarDeps_(pedidos, e.rubro);
    e.modulos = mods.join(',');
    h.getRange(e._fila, 1, 1, cab.length).setValues([cab.map(function (k) { return e[k] === undefined ? '' : e[k]; })]);
    registrar_(email, empresaId, 'dev_modulos',
      '+' + mods.filter(function (m) { return antes.indexOf(m) < 0; }).join(',') + ' -' + antes.filter(function (m) { return mods.indexOf(m) < 0; }).join(','));
    return { ok: true, empresa: { id: e.id, nombre: e.nombre, modulos: mods } };
  });
}

/* ===================================================================
 * Mercado Pago
 * 1) Cobrar Gebro: cada negocio paga su plan con débito automático mensual (suscripción).
 *    Token de CreaMix-DS en Propiedades del script: MP_ACCESS_TOKEN.
 * 2) Que cada negocio cobre a SUS clientes con un link de pago (honorarios y señas de reservas).
 *    Cada negocio conecta su propia cuenta desde Ajustes (se guarda como MP_NEG_<empresa>; nunca vuelve a la web).
 * Avisos (webhooks): <URL /exec>?mp=gebro  y  <URL /exec>?mp=negocio&e=<empresa>
 * =================================================================== */

// Precio mensual EN PESOS de cada plan para el débito automático. COMPLETAR antes de usar (0 = no se puede pagar online).
var PRECIOS_MP = { Inicial: 0, Crecimiento: 0, Pro: 0 };
// Adónde vuelve el cliente después de pagar
var WEB_URL = 'https://creamix-ds.github.io/Gebro/';
var MP_API = 'https://api.mercadopago.com';

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function urlServicio_() { return prop_('URL_PUBLICA') || ScriptApp.getService().getUrl(); }

function mpFetch_(token, metodo, ruta, cuerpo) {
  var op = { method: metodo, muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token } };
  if (cuerpo) { op.contentType = 'application/json'; op.payload = JSON.stringify(cuerpo); op.headers['X-Idempotency-Key'] = Utilities.getUuid(); }
  var r = UrlFetchApp.fetch(MP_API + ruta, op), code = r.getResponseCode(), j = {};
  try { j = JSON.parse(r.getContentText()); } catch (e) { }
  if (code >= 300) throw new Error('Mercado Pago respondió: ' + (j.message || j.error || code));
  return j;
}

// Las columnas nuevas (mp_*) y la hoja Pagos se crean solas si todavía no se corrió setup()
function asegurarMp_() {
  var c = central_(), h = c.getSheetByName('Empresas');
  if (h.getLastColumn() < HOJAS_CENTRAL.Empresas.length) asegurarHoja_(c, 'Empresas', HOJAS_CENTRAL.Empresas);
  return c.getSheetByName('Pagos') || asegurarHoja_(c, 'Pagos', HOJAS_CENTRAL.Pagos);
}
function guardarEmpresa_(e) {
  var h = central_().getSheetByName('Empresas'), cab = HOJAS_CENTRAL.Empresas;
  h.getRange(e._fila, 1, 1, cab.length).setValues([cab.map(function (k) { return e[k] === undefined ? '' : e[k]; })]);
}
function empresaPorId_(id) { return empresas_().filter(function (x) { return x.id === id; })[0]; }
function soloDueno_(a) { if (a.rol !== 'dueño') throw new Error('Solo el dueño puede manejar los pagos.'); }
function mailValido_(m) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m); }

/* ---------- 1) Suscripción a Gebro ---------- */
function mpSuscribir_(email, req) {
  var a = acceso_(email, req.empresa); soloDueno_(a); asegurarMp_();
  var plan = String(req.plan || ''), monto = Number(PRECIOS_MP[plan] || 0);
  if (!monto) throw new Error('Ese plan todavía no se puede pagar online. Escribinos por WhatsApp.');
  var token = prop_('MP_ACCESS_TOKEN');
  if (!token) throw new Error('Los pagos online todavía no están configurados.');
  var pagador = String(req.pagador || email).trim().toLowerCase();
  if (!mailValido_(pagador)) throw new Error('Escribí el mail de tu cuenta de Mercado Pago.');
  var r = mpFetch_(token, 'post', '/preapproval', {
    reason: 'Gebro · Plan ' + plan + ' · ' + a.empresa.nombre,
    external_reference: a.empresa.id + '|' + plan,
    payer_email: pagador,
    back_url: WEB_URL + '#/app/ajustes',
    auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: monto, currency_id: 'ARS' },
    status: 'pending'
  });
  conLock_(function () { var e = empresaPorId_(a.empresa.id); e.mp_pendiente = r.id; guardarEmpresa_(e); });
  registrar_(email, a.empresa.id, 'mp_suscribir', plan + ' · ' + monto + ' · ' + r.id);
  return { url: r.init_point };
}

// Por si el aviso no llegó: el dueño vuelve de Mercado Pago y toca "Ya pagué"
function mpRevisar_(email, req) {
  var a = acceso_(email, req.empresa); asegurarMp_();
  var token = prop_('MP_ACCESS_TOKEN');
  if (!token) throw new Error('Los pagos online todavía no están configurados.');
  var e = empresaPorId_(a.empresa.id);
  [e.mp_pendiente, e.mp_suscripcion].filter(String).forEach(function (id) {
    try { aplicarSuscripcion_(mpFetch_(token, 'get', '/preapproval/' + id)); } catch (x) { }
  });
  return { empresa: empresaPublica_(empresaPorId_(a.empresa.id), a.rol) };
}

function aplicarSuscripcion_(pre) {
  var ref = String(pre.external_reference || '').split('|'), empId = ref[0], plan = ref[1];
  conLock_(function () {
    var e = empresaPorId_(empId);
    if (!e) return;
    var st = String(pre.status || '');
    if (st === 'authorized') {
      // Pasó a un plan nuevo: se cancela la suscripción anterior para no cobrar dos veces
      if (e.mp_suscripcion && e.mp_suscripcion !== pre.id) {
        try { mpFetch_(prop_('MP_ACCESS_TOKEN'), 'put', '/preapproval/' + e.mp_suscripcion, { status: 'cancelled' }); } catch (x) { }
      }
      e.mp_suscripcion = pre.id; e.mp_estado = 'authorized'; e.estado = 'Activa';
      if (PRECIOS_MP[plan]) e.plan = plan;
      if (e.mp_pendiente === pre.id) e.mp_pendiente = '';
    } else if ((st === 'paused' || st === 'cancelled') && e.mp_suscripcion === pre.id) {
      e.mp_estado = st; e.estado = 'Suspendida';
    } else if (e.mp_pendiente === pre.id) {
      e.mp_estado = st;
    } else return;
    guardarEmpresa_(e);
    registrar_('mercadopago', empId, 'suscripcion:' + st, pre.id + ' · ' + plan);
  });
}

/* ---------- 2) Cobros de cada negocio ---------- */
function mpCuenta_(email, req) {
  var a = acceso_(email, req.empresa), op = req.op || 'estado', props = PropertiesService.getScriptProperties();
  if (op !== 'estado') soloDueno_(a);
  if (op === 'guardar') {
    var tk = String(req.token || '').trim();
    if (!/^APP_USR-/.test(tk)) throw new Error('Pegá el Access Token de tu cuenta (empieza con APP_USR-).');
    var yo = mpFetch_(tk, 'get', '/users/me');
    props.setProperty('MP_NEG_' + a.empresa.id, tk);
    props.setProperty('MP_NEG_INFO_' + a.empresa.id, String(yo.nickname || yo.email || yo.id || 'Cuenta conectada'));
    registrar_(email, a.empresa.id, 'mp_cuenta:conectar', yo.id);
  } else if (op === 'quitar') {
    props.deleteProperty('MP_NEG_' + a.empresa.id); props.deleteProperty('MP_NEG_INFO_' + a.empresa.id);
    registrar_(email, a.empresa.id, 'mp_cuenta:quitar', '');
  }
  return { empresa: empresaPublica_(empresaPorId_(a.empresa.id), a.rol) };
}

// Calcula qué se puede cobrar de un registro (honorarios: el monto; reservas: el saldo, o una seña menor)
function cobrable_(db, modulo, id, pedido) {
  var f = Motor.buscar(db, modulo, id);
  if (!f) throw new Error('Ese registro ya no existe.');
  if (modulo === 'honorarios') {
    if (f.estado !== 'A cobrar') throw new Error('Ese cobro ya figura como cobrado.');
    return { fila: f, monto: Motor.num(f.monto), titulo: f.concepto + (f.periodo ? ' ' + f.periodo : '') };
  }
  if (modulo === 'reservas') {
    if (!Motor.activa(f)) throw new Error('La reserva no está activa.');
    var saldo = Motor.num(f.total) - Motor.num(f.sena);
    var monto = pedido ? Motor.num(pedido) : saldo;
    if (!(monto > 0) || monto > saldo) throw new Error('El monto tiene que ser mayor a cero y no superar el saldo (' + Motor.plata(saldo) + ').');
    return { fila: f, monto: monto, titulo: 'Reserva ' + f.id + ' · ' + f.desde + ' al ' + f.hasta };
  }
  throw new Error('Este registro no se puede cobrar con link de pago.');
}

function mpLink_(email, req) {
  var a = acceso_(email, req.empresa);
  var token = prop_('MP_NEG_' + a.empresa.id);
  if (!token) throw new Error('Primero conectá tu cuenta de Mercado Pago en Ajustes.');
  var db = leerDb_(planilla_(a.empresa));
  var c = cobrable_(db, req.modulo, req.id, req.monto);
  var r = mpFetch_(token, 'post', '/checkout/preferences', {
    items: [{ title: a.empresa.nombre + ' · ' + c.titulo, quantity: 1, unit_price: c.monto, currency_id: 'ARS' }],
    external_reference: [a.empresa.id, req.modulo, req.id].join('|'),
    notification_url: urlServicio_() + '?mp=negocio&e=' + encodeURIComponent(a.empresa.id)
  });
  registrar_(email, a.empresa.id, 'mp_link', req.modulo + ' ' + req.id + ' · ' + c.monto);
  return { url: r.init_point, monto: c.monto };
}

function pagoNegocio_(empId, pagoId) {
  var token = prop_('MP_NEG_' + empId);
  if (!token) return;
  var p = mpFetch_(token, 'get', '/v1/payments/' + pagoId);
  if (p.status !== 'approved') return;
  var ref = String(p.external_reference || '').split('|');
  if (ref[0] !== empId) return;
  var modulo = ref[1], id = ref[2], monto = Motor.num(p.transaction_amount);
  var hojaPagos = asegurarMp_();
  conLock_(function () {
    var ya = leerTabla_(hojaPagos).some(function (x) { return String(x.mp_id) === String(p.id); });
    if (ya) return; // el aviso puede llegar varias veces
    var e = empresaPorId_(empId), ss = planilla_(e), db = leerDb_(ss), r = null;
    var f = Motor.buscar(db, modulo, id);
    if (f && modulo === 'honorarios' && f.estado === 'A cobrar') {
      r = Motor.accion(db, 'honorarios', 'cobrar', id, { hoy: hoy_(), medio: 'Mercado Pago' });
    } else if (f && modulo === 'reservas') {
      var g = {}; for (var k in f) g[k] = f[k];
      g.sena = Motor.num(f.sena) + monto;
      r = Motor.guardar(db, 'reservas', g, { hoy: hoy_() });
      // La seña entró por Mercado Pago: que la caja lo diga
      if (r && !r.error) r.cambios.forEach(function (c) { if (c.m === 'caja' && c.fila.origen === 'seña:' + id) c.fila.medio = 'Mercado Pago'; });
    }
    if (r && !r.error) aplicar_(ss, r.cambios);
    hojaPagos.appendRow([Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm'), empId, modulo, id, String(p.id), monto, r && !r.error ? 'aplicado' : 'sin aplicar' + (r && r.error ? ': ' + r.error : '')]);
    registrar_('mercadopago', empId, 'pago:' + modulo, id + ' · ' + monto + ' · ' + p.id);
  });
}

function webhookMp_(q, aviso) {
  var tipo = String(aviso.type || aviso.topic || q.type || q.topic || '');
  var id = (aviso.data && aviso.data.id) || q['data.id'] || q.id || '';
  if (!id) return;
  if (q.mp === 'gebro' && tipo.indexOf('preapproval') >= 0) {
    var token = prop_('MP_ACCESS_TOKEN');
    if (token) aplicarSuscripcion_(mpFetch_(token, 'get', '/preapproval/' + id));
  } else if (q.mp === 'negocio' && tipo === 'payment' && q.e) {
    pagoNegocio_(String(q.e), id);
  }
}
