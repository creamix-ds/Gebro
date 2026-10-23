/* Gebro — datos editables */
var CONFIG = {
  // URL de la implementación de Apps Script (termina en /exec). Vacío = solo funciona la demo.
  API_URL: 'https://script.google.com/macros/s/AKfycby6aQAYQ_fsy3CaxQlHQC8--PCwevEotmlqGnWeEgco2EnhbZfR36dDX4dwp0eSi_rW/exec',
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
  ]
};
