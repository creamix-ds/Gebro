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
        { k: 'cantidad', label: 'Cantidad', tipo: 'numero', def: 1, req: true, lista: true },
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
      nombre: 'Comercio', para: 'Almacenes, tiendas, ferreterías y kioscos',
      modulos: ['ventas', 'productos', 'clientes', 'proveedores', 'caja'],
      palabras: {}
    },
    servicios: {
      nombre: 'Turnos y servicios', para: 'Consultorios, estéticas, peluquerías y estudios',
      modulos: ['turnos', 'servicios', 'profesionales', 'clientes', 'caja'],
      palabras: { clientes: 'Pacientes y clientes' }
    }
  };

  // Orden fijo del menú, sin importar en qué orden se activen
  var ORDEN_MENU = ['reservas', 'habitaciones', 'consumos', 'turnos', 'servicios', 'profesionales',
    'ventas', 'productos', 'proveedores', 'clientes', 'caja'];

  return { MODULOS: MODULOS, RUBROS: RUBROS, ORDEN_MENU: ORDEN_MENU, MEDIOS: MEDIOS };
})();
if (typeof module !== 'undefined') module.exports = GEBRO;
