/* Gebro — datos editables */
var CONFIG = {
  // URL de la implementación de Apps Script (termina en /exec). Vacío = solo funciona la demo.
  API_URL: 'https://script.google.com/macros/s/AKfycbx9jV-hDSf1JwgYcRWjjYnpka6NwIrOTiTu0TIWQeZtzJKW7yVsyjhj0T8z6KUy3UBscA/exec',
  // ID de cliente de Google (termina en .apps.googleusercontent.com)
  GOOGLE_CLIENT_ID: '340172069418-grc7uvkq164vufqrhp668rot1jajatp1.apps.googleusercontent.com',

  WHATSAPP: '5492494511665',
  EMAIL: 'creamixds@gmail.com',

  // Precios en pesos por mes. Cambialos acá y se actualizan en la página.
  PLANES: [
    {
      nombre: 'Inicial', precio: 15000,
      para: 'Para arrancar a ordenar el negocio.',
      incluye: ['Los módulos de tu rubro', '1 usuario', 'Caja y reportes del mes', 'Soporte por WhatsApp']
    },
    {
      nombre: 'Negocio', precio: 29000, destacado: true,
      para: 'Para cuando atienden varias personas.',
      incluye: ['Todo lo del plan Inicial', 'Hasta 5 usuarios', 'Módulos de otros rubros', 'Copia de tus datos cuando la pidas']
    },
    {
      nombre: 'A medida', precio: null,
      para: 'Si necesitás algo que tu rubro no trae.',
      incluye: ['Todo lo del plan Negocio', 'Módulos hechos para vos', 'Usuarios ilimitados', 'Carga inicial de datos']
    }
  ],

  // Pago anual: cuántos meses se regalan si pagan el año (0 = no se muestra la opción anual)
  MESES_GRATIS_ANUAL: 0,

  // Tabla "Compará los planes" (una columna por plan, en el mismo orden de PLANES). true = incluido, false = no.
  COMPARACION: [
    ['Usuarios', '1', 'Hasta 5', 'Ilimitados'],
    ['Módulos de tu rubro', true, true, true],
    ['Caja y reportes del mes', true, true, true],
    ['Funciona en celular, tablet y PC', true, true, true],
    ['Links de pago con Mercado Pago', true, true, true],
    ['Módulos de otros rubros', false, true, true],
    ['Copia de tus datos cuando la pidas', false, true, true],
    ['Módulos hechos para vos', false, false, true],
    ['Carga inicial de datos', false, false, true],
    ['Soporte por WhatsApp', true, true, 'Prioritario']
  ],

  // "Módulos a la carta" de la página: se suman al plan Inicial. Precios PROPUESTOS en pesos por mes: cambialos.
  // Los módulos igual los activa solo el administrador; esto arma el pedido por WhatsApp.
  MODULOS_CARTA: [
    { nombre: 'Presupuestos', detalle: 'Armá presupuestos y seguí cuáles se aceptan.', precio: 4000 },
    { nombre: 'Lector de códigos de barras', detalle: 'Escaneá productos con la cámara del celular.', precio: 3000 },
    { nombre: 'Proveedores', detalle: 'Datos y contacto de quién te vende cada cosa.', precio: 2500 },
    { nombre: 'Vencimientos y alertas', detalle: 'Avisos de productos o trámites por vencer.', precio: 3500 },
    { nombre: 'Honorarios y cobros', detalle: 'Seguí lo que falta cobrar a cada cliente.', precio: 3500 },
    { nombre: 'Turnos y agenda', detalle: 'Agenda por profesional, sin superposiciones.', precio: 5000 },
    { nombre: 'Proyectos y tareas', detalle: 'Avance, horas y entregas de cada trabajo.', precio: 4500 },
    { nombre: 'Expedientes y plazos', detalle: 'Causas, audiencias y plazos para estudios jurídicos.', precio: 6000 },
    { nombre: 'Reservas y habitaciones', detalle: 'Calendario, huéspedes, check-in y check-out.', precio: 7500 },
    { nombre: 'Usuario extra', detalle: 'Una persona más con su propia cuenta.', precio: 2500 }
  ]
};
