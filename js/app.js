/* Gebro — interfaz (landing + sistema). Rutas:
 *   #/                     landing
 *   #/demo/<rubro>/<vista> sistema con datos de ejemplo (sin registrarse)
 *   #/app/<vista>          sistema real (login con Google + Apps Script)
 */
(function () {
  'use strict';
  var M = GEBRO.MODULOS, R = GEBRO.RUBROS;
  var $app = document.getElementById('app'), $capa = document.getElementById('capa'), $avisos = document.getElementById('avisos');

  /* ================= Utilidades ================= */
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  var plata = Motor.plata, num = Motor.num, sumar = Motor.sumarDias;
  var DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DIAS_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function fdate(f) { return new Date(f + 'T12:00:00'); }
  function fCorta(f) { if (!f) return ''; var p = f.split('-'); return p[2] + '/' + p[1]; }
  function fLarga(f) { var d = fdate(f); return DIAS_L[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function mesDe(f) { return f.slice(0, 7); }
  function mesNombre(m) { var p = m.split('-'); return MESES[+p[1] - 1].replace(/^./, function (c) { return c.toUpperCase(); }) + ' ' + p[0]; }
  function sumarMes(m, n) { var p = m.split('-'), d = new Date(+p[0], +p[1] - 1 + n, 1); return d.getFullYear() + '-' + p2(d.getMonth() + 1); }
  function iniciales(s) { return String(s || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); }
  function guardarLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function leerLocal(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ancho() { return window.innerWidth; }

  var IC = {
    personas: '<path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19"/><circle cx="10" cy="7.5" r="3.5"/><path d="M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.5 3.5 0 0 1 0 6.6"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    cama: '<path d="M3 18V6M3 14h18v4M21 14v-2.5A3.5 3.5 0 0 0 17.5 8H11v6"/><circle cx="7" cy="10.5" r="2"/>',
    calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    copa: '<path d="M7 3h10l-1 7a4 4 0 0 1-8 0L7 3zM12 14v7M8 21h8"/>',
    caja: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    ticket: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    camion: '<path d="M2.5 6h11v10h-11zM13.5 9h4l3 3.5V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    documento: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    alarma: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M5 4 2.5 6.5M19 4l2.5 2.5"/>',
    carpeta: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
    enlace: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    balanza: '<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
    check: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="m8 12.5 3 3 5.5-6"/>',
    tijera: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 18M8 16.5 20 6"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    billete: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    inicio: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-6h-5v6H4z"/>',
    reportes: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    barras: '<path d="M3 7V5a1 1 0 0 1 1-1h2M18 4h2a1 1 0 0 1 1 1v2M21 17v2a1 1 0 0 1-1 1h-2M6 20H4a1 1 0 0 1-1-1v-2M7 8v8M10 8v8M13 8v8M17 8v8"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    menos: '<path d="M5 12h14"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
    izq: '<path d="m15 6-6 6 6 6"/>', der: '<path d="m9 6 6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    salir: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
    whatsapp: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a3.8 3.8 0 0 1-2.1-2.1l.8-1-1-2z"/>',
    planilla: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 9v12"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>'; }
  function logo() {
    return '<svg aria-hidden="true" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#0F3D2E"/><g transform="translate(21 21) scale(.86)"><defs><linearGradient id="glogo" x1="12" y1="10" x2="88" y2="92" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2CCFBF"/><stop offset="1" stop-color="#0A7EA4"/></linearGradient></defs><g fill="none" stroke="url(#glogo)" stroke-linecap="round" stroke-linejoin="round"><path d="M71.5 22.6 50 10.2 15.4 30.2V58" stroke-width="9"/><path d="M28.5 77.4 50 89.8l34.6-20V42" stroke-width="9"/><path d="M15 72.5h11c8 0 13-4 17-10.5M53 45.5c3-2 6-2.6 10-3l22-1.5" stroke-width="6"/></g><g fill="url(#glogo)" stroke="#0F3D2E" stroke-width="4"><circle cx="15" cy="72.5" r="9.5"/><circle cx="85" cy="44" r="9.5"/></g><circle cx="48" cy="54" r="10" fill="url(#glogo)"/></g></svg>';
  }
  function marca(href) { return '<a class="marca" href="' + (href || '#/') + '" aria-label="Gebro, inicio">' + logo() + '<b>Gebro</b></a>'; }

  function aviso(txt, mal) {
    var d = document.createElement('div');
    d.className = 'aviso' + (mal ? ' mal' : '');
    d.textContent = txt;
    $avisos.appendChild(d);
    setTimeout(function () { d.remove(); }, mal ? 6000 : 3800);
  }

  /* ================= Estado ================= */
  var S = {
    api: null, modo: null, rubroDemo: null, empresa: null, db: null, usuario: null,
    filtros: {}, busqueda: {}, vistaMod: {}, calDesde: null, agFecha: null, mesRep: null, limite: {}
  };

  function palabra(k) { // "clientes" → "Huéspedes" en hotelería
    var p = S.empresa && R[S.empresa.rubro] ? R[S.empresa.rubro].palabras : {};
    return p[k] || null;
  }
  function nombreMod(m) { return palabra(m) || M[m].nombre; }
  function singularMod(m) { return palabra(M[m].singular) || (m === 'clientes' && palabra('cliente')) || M[m].singular; }
  function etiquetaCampo(m, c) {
    if (c.ref === 'clientes' && palabra('cliente')) return palabra('cliente').replace(/^./, function (x) { return x.toUpperCase(); });
    return c.label;
  }
  function activos() { return GEBRO.ORDEN_MENU.filter(function (m) { return S.empresa.modulos.indexOf(m) >= 0; }); }
  function tiene(m) { return S.empresa && S.empresa.modulos.indexOf(m) >= 0; }
  function base() { return S.modo === 'demo' ? '#/demo/' + S.rubroDemo : '#/app'; }
  function et(m, id) { return Motor.etiqueta(S.db, m, id); }
  function filas(m) { return S.db[m] || []; }

  /* ================= API real (Apps Script) ================= */
  function apiReal() {
    function post(action, datos) {
      var token = (leerLocal('gebro_sesion') || {}).token;
      return fetch(CONFIG.API_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action: action, token: token }, datos || {}))
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j.sesion === false) { cerrarSesion(); throw new Error('Tu sesión venció. Volvé a ingresar.'); }
        if (j.error) throw new Error(j.error);
        return j;
      });
    }
    return {
      modo: 'real',
      yo: function () { return post('yo'); },
      crearEmpresa: function (nombre, rubro) { return post('crearEmpresa', { nombre: nombre, rubro: rubro }); },
      todo: function (emp) { return post('todo', { empresa: emp }); },
      guardar: function (emp, modulo, fila) { return post('guardar', { empresa: emp, modulo: modulo, fila: fila }); },
      guardarVarios: function (emp, modulo, filas) { return post('guardarVarios', { empresa: emp, modulo: modulo, filas: filas }); },
      borrar: function (emp, modulo, id) { return post('borrar', { empresa: emp, modulo: modulo, id: id }); },
      accion: function (emp, modulo, acc, id, extra) { return post('accion', { empresa: emp, modulo: modulo, accion: acc, id: id, extra: extra || {} }); },
      ajustes: function (emp, cambios) { return post('ajustes', { empresa: emp, cambios: cambios }); },
      usuarios: function (emp, op, datos) { return post('usuarios', { empresa: emp, op: op || 'listar', datos: datos || {} }); }
    };
  }
  function cerrarSesion() { try { localStorage.removeItem('gebro_sesion'); localStorage.removeItem('gebro_empresa'); } catch (e) { } S.empresa = null; S.db = null; S.usuario = null; }

  /* ================= Router ================= */
  function ruta() {
    var h = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    cerrarCapa();
    document.body.classList.remove('sin-scroll');
    if (h[0] === 'demo' && R[h[1]]) return entrarDemo(h[1], h[2] || 'inicio');
    if (h[0] === 'app') return entrarReal(h[1] || 'inicio');
    S.modo = null;
    landing();
  }
  window.addEventListener('hashchange', ruta);

  function entrarDemo(rubro, vista) {
    if (S.modo !== 'demo' || S.rubroDemo !== rubro || !S.db) {
      S.modo = 'demo'; S.rubroDemo = rubro; S.api = Demo.api(rubro, hoy);
      $app.innerHTML = '<div class="cargando">Preparando la demo…</div>';
      return S.api.todo().then(function (r) {
        S.empresa = r.empresa; S.db = r.db; S.usuario = { email: 'demo@gebro.app', nombre: 'Demo' };
        S.calDesde = null; S.agFecha = null; S.mesRep = null;
        pantalla(vista);
      });
    }
    pantalla(vista);
  }

  function entrarReal(vista) {
    if (S.modo === 'real' && S.db) return pantalla(vista);
    S.modo = 'real';
    if (!CONFIG.API_URL || !CONFIG.GOOGLE_CLIENT_ID) return pantallaSinConfig();
    var ses = leerLocal('gebro_sesion');
    if (!ses || !ses.token || ses.vence < Date.now()) return pantallaIngreso();
    S.api = apiReal();
    $app.innerHTML = '<div class="cargando">Cargando tu negocio…</div>';
    S.api.yo().then(function (yo) {
      S.usuario = yo;
      if (!yo.empresas.length) return pantallaNuevaEmpresa();
      var elegida = leerLocal('gebro_empresa');
      var emp = yo.empresas.filter(function (e) { return e.id === elegida; })[0];
      if (!emp && yo.empresas.length > 1) return pantallaElegirEmpresa(yo.empresas, vista);
      return cargarEmpresa((emp || yo.empresas[0]).id, vista);
    }).catch(function (e) { aviso(e.message, true); pantallaIngreso(); });
  }
  function cargarEmpresa(id, vista) {
    guardarLocal('gebro_empresa', id);
    $app.innerHTML = '<div class="cargando">Cargando tu negocio…</div>';
    return S.api.todo(id).then(function (r) { S.empresa = r.empresa; S.db = r.db; pantalla(vista); })
      .catch(function (e) { aviso(e.message, true); });
  }
  function recargar() {
    return S.api.todo(S.empresa.id).then(function (r) { S.empresa = r.empresa; S.db = r.db; });
  }

  /* ================= LANDING ================= */
  var vitrinaRubro = 'hoteleria', vitrinaDatos = {}, VITRINA = ['hoteleria', 'comercio', 'servicios'];

  function landing() {
    document.title = 'Gebro | Reservas, turnos, ventas y caja para tu negocio';
    var wa = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent('Hola, quiero saber más sobre Gebro.');
    var detalles = {
      hoteleria: [['Calendario de reservas', 'que avisa si se pisan dos huéspedes'], ['Check-in y check-out', 'con la cuenta de consumos lista'], ['Estado de cada habitación', 'libre, ocupada, en limpieza'], ['Señas y cobros', 'que se anotan solos en la caja']],
      comercio: [['Ventas en segundos', 'que descuentan el stock solas'], ['Aviso de reposición', 'cuando un producto baja del mínimo'], ['Proveedores', 'con sus datos a mano'], ['Caja diaria', 'por medio de pago']],
      servicios: [['Agenda por profesional', 'con los horarios de cada uno'], ['Turnos sin superposición', 'según la duración del servicio'], ['Atendido o ausente', 'en un toque, y se cobra'], ['Fichas de pacientes', 'y clientes con su historial']],
      ferreteria: [['Venta por metro, kilo o unidad', 'con lector de código de barras'], ['Presupuestos', 'para obras y clientes'], ['Stock y reposición', 'con aviso de faltantes'], ['Proveedores', 'y caja diaria']],
      farmacia: [['Vencimientos de medicamentos', 'con aviso de los próximos 90 días'], ['Venta libre o bajo receta', 'marcado en cada producto'], ['Obra social', 'en la ficha de cada cliente'], ['Lector de códigos', 'para vender en segundos']],
      contadores: [['Vencimientos de cada cliente', 'IVA, Monotributo, Ganancias y más'], ['CUIT validado', 'y su constancia de ARCA a un clic'], ['Accesos directos a ARCA', 'con Clave Fiscal'], ['Honorarios', 'a cobrar y cobrados, por cliente']],
      freelancer: [['Cada cliente con sus proyectos', 'todo en la misma ficha'], ['Avance y fecha de entrega', 'de cada proyecto'], ['Tareas y horas trabajadas', 'para saber cuánto te lleva cada uno'], ['Anticipos y saldos', 'lo cobrado y lo que falta cobrar']],
      abogados: [['Expedientes', 'con carátula, fuero y juzgado'], ['Agenda de plazos y audiencias', 'para que no se pase ninguno'], ['Constitución Nacional', 'a un clic desde el sistema'], ['Honorarios', 'y anticipos por cliente']]
    };
    var demoTxt = { hoteleria: 'Probar la demo de hotel', comercio: 'Probar la demo de comercio', servicios: 'Probar la demo de turnos', ferreteria: 'Probar la demo de ferretería', farmacia: 'Probar la demo de farmacia', contadores: 'Probar la demo contable', abogados: 'Probar la demo jurídica', freelancer: 'Probar la demo freelancer' };

    $app.innerHTML =
      '<div class="web">' +
      '<header class="web-cab"><div class="envase">' + marca() +
      '<nav class="web-nav" aria-label="Secciones"><a href="#rubros">Rubros</a><a href="#como">Cómo funciona</a><a href="#planes">Planes</a><a href="#contacto">Contacto</a></nav>' +
      '<div class="acciones"><a class="btn btn-2" href="#/app">Ingresar</a><a class="btn btn-1" href="#/demo/hoteleria">Probar la demo</a></div>' +
      '</div></header>' +

      '<main>' +
      '<section class="heroe"><div class="envase">' +
      '<div><h1><span class="rengln">Reservas, turnos,</span><span class="rengln">ventas y caja.</span><span class="rengln">Todo en un lugar.</span></h1>' +
      '<p class="bajada">Gebro se adapta a tu rubro: el hotel ve sus habitaciones, la ferretería su stock, el contador los vencimientos de sus clientes y el abogado sus plazos. Cada movimiento queda anotado en la caja sin que lo cargues dos veces.</p>' +
      '<div class="botones"><a class="btn btn-1 btn-grande" href="#/demo/hoteleria" id="heroe-demo">' + demoTxt.hoteleria + '</a>' +
      '<a class="btn btn-2 btn-grande" href="' + wa + '" target="_blank" rel="noopener">' + ic('whatsapp') + 'Consultar por WhatsApp</a></div>' +
      '<p class="chico">La demo usa datos de ejemplo y funciona sin registrarte.</p></div>' +
      '<div class="vitrina" aria-label="Vista previa del sistema">' +
      '<div class="vitrina-tabs" role="tablist">' + VITRINA.map(function (k) {
        return '<button role="tab" data-r="' + k + '" aria-selected="' + (k === vitrinaRubro) + '">' + { hoteleria: 'Hotel', comercio: 'Comercio', servicios: 'Consultorio' }[k] + '</button>';
      }).join('') + '</div>' +
      '<div class="vitrina-cuerpo" id="vitrina"></div>' +
      '<div class="vitrina-pie"><span id="vitrina-pie"></span><a class="btn btn-chico btn-2" id="vitrina-ir" href="#/demo/hoteleria">Abrir</a></div>' +
      '</div>' +
      '</div></section>' +

      '<section class="seccion" id="rubros"><div class="envase">' +
      '<h2>Un sistema, hecho a la medida de cada rubro</h2>' +
      '<p class="intro">Elegís tu rubro y Gebro te muestra solo lo que usás. Si tu negocio mezcla cosas, como una ferretería que hace presupuestos o un estudio que también cobra turnos, sumás los módulos que necesites.</p>' +
      '<div class="rubros">' + Object.keys(R).map(function (k) {
        return '<article class="rubro"><h3>' + R[k].nombre + '</h3><p class="para">' + R[k].para + '</p><ul>' +
          detalles[k].map(function (d) { return '<li>' + ic('ok') + '<span><b>' + d[0] + '</b> ' + d[1] + '</span></li>'; }).join('') +
          '</ul><a class="btn btn-2" href="#/demo/' + k + '">' + demoTxt[k] + '</a></article>';
      }).join('') + '</div>' +
      '</div></section>' +

      '<section class="seccion" id="como"><div class="envase">' +
      '<h2>Empezás hoy, sin instalar nada</h2>' +
      '<div class="pasos">' +
      '<div class="paso"><h3>Ingresás con tu cuenta de Google</h3><p>No hay contraseñas nuevas que recordar. Funciona en la computadora del mostrador y en el celular.</p></div>' +
      '<div class="paso"><h3>Elegís tu rubro</h3><p>Gebro arma los módulos de tu negocio. Después podés prender o apagar los que quieras desde Ajustes.</p></div>' +
      '<div class="paso"><h3>Cargás y listo</h3><p>Tus habitaciones, productos o servicios. Si tenés todo en un Excel, te ayudamos a pasarlo.</p></div>' +
      '</div></div></section>' +

      '<section class="seccion" id="planes"><div class="envase">' +
      '<h2>Precios claros, sin permanencia</h2>' +
      '<p class="intro">Pagás por mes y das de baja cuando quieras. Los primeros 30 días son sin cargo.</p>' +
      '<div class="planes">' + CONFIG.PLANES.map(function (p) {
        return '<article class="plan' + (p.destacado ? ' destacado' : '') + '">' + (p.destacado ? '<span class="etiqueta">El más elegido</span>' : '') +
          '<h3>' + esc(p.nombre) + '</h3><p class="precio">' + (p.precio ? plata(p.precio) + ' <small>por mes</small>' : 'A convenir') + '</p>' +
          '<p>' + esc(p.para) + '</p><ul>' + p.incluye.map(function (x) { return '<li>' + ic('ok') + esc(x) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn ' + (p.destacado ? 'btn-1' : 'btn-2') + '" href="https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent('Hola, me interesa el plan ' + p.nombre + ' de Gebro.') + '" target="_blank" rel="noopener">' + (p.precio ? 'Quiero este plan' : 'Contame qué necesitás') + '</a></article>';
      }).join('') + '</div>' +
      '<p class="planes-nota">Precios finales en pesos argentinos.</p>' +
      '</div></section>' +

      '<section class="seccion" id="contacto"><div class="envase"><div class="cierre">' +
      '<div><h2>¿Lo vemos juntos con los datos de tu negocio?</h2><p>Te mostramos Gebro en 20 minutos, por videollamada o en tu local si estás en Tandil.</p></div>' +
      '<div class="botones"><a class="btn btn-2 btn-grande" href="' + wa + '" target="_blank" rel="noopener">' + ic('whatsapp') + 'Escribinos</a>' +
      '<a class="btn btn-borde btn-grande" href="mailto:' + CONFIG.EMAIL + '?subject=Gebro">' + CONFIG.EMAIL + '</a></div>' +
      '</div></div></section>' +
      '</main>' +

      '<footer class="web-pie"><div class="envase"><span>' + marca() + '</span><span>Gebro es un producto de <a href="https://creamixds.com" target="_blank" rel="noopener">CreamixDS</a>, Tandil.</span><a href="#/app">Ingresar al sistema</a></div></footer>' +
      '</div>';

    var cab = $app.querySelector('.web-cab');
    window.onscroll = function () { cab.classList.toggle('con-linea', window.scrollY > 8); };
    $app.querySelectorAll('.vitrina-tabs button').forEach(function (b) {
      b.onclick = function () { vitrinaRubro = b.dataset.r; vitrina(); };
      b.onkeydown = function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var ks = VITRINA, i = ks.indexOf(vitrinaRubro) + (e.key === 'ArrowRight' ? 1 : -1);
        vitrinaRubro = ks[(i + ks.length) % ks.length]; vitrina();
        $app.querySelector('.vitrina-tabs [data-r="' + vitrinaRubro + '"]').focus();
      };
    });
    vitrina();
  }

  function vitrina() {
    var k = vitrinaRubro, el = document.getElementById('vitrina');
    if (!el) return;
    if (!vitrinaDatos[k]) vitrinaDatos[k] = Demo.semilla(k, hoy());
    var db = vitrinaDatos[k], h = hoy();
    $app.querySelectorAll('.vitrina-tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.r === k); b.tabIndex = b.dataset.r === k ? 0 : -1; });
    var demoTxt = { hoteleria: 'Probar la demo de hotel', comercio: 'Probar la demo de comercio', servicios: 'Probar la demo de turnos' };
    document.getElementById('heroe-demo').textContent = demoTxt[k];
    document.getElementById('heroe-demo').href = '#/demo/' + k;
    document.getElementById('vitrina-ir').href = '#/demo/' + k;
    var anteriorDb = S.db, anteriorEmp = S.empresa;
    S.db = db; S.empresa = { rubro: k, modulos: R[k].modulos };
    if (k === 'hoteleria') {
      var dias = ancho() < 600 ? 6 : 10;
      el.innerHTML = '<div class="vitrina-titulo"><b>' + Demo.EMPRESAS[k] + '</b><span>Reservas de los próximos ' + dias + ' días</span></div>' +
        htmlCalendario(sumar(h, -1), dias, true);
      var oc = db.habitaciones.filter(function (x) { return x.estado === 'Ocupada'; }).length;
      document.getElementById('vitrina-pie').textContent = oc + ' de ' + db.habitaciones.length + ' habitaciones ocupadas hoy';
    } else if (k === 'servicios') {
      el.innerHTML = '<div class="vitrina-titulo"><b>' + Demo.EMPRESAS[k] + '</b><span>Agenda de hoy, ' + fLarga(h) + '</span></div>' +
        htmlAgenda(h, true);
      var t = db.turnos.filter(function (x) { return x.fecha === h && x.estado !== 'Cancelado'; }).length;
      document.getElementById('vitrina-pie').textContent = t + ' turnos para hoy entre 3 profesionales';
    } else {
      var vh = db.ventas.filter(function (v) { return v.fecha === h; });
      var reponer = db.productos.filter(function (p) { return num(p.stock) <= num(p.stock_min); });
      el.innerHTML = '<div class="vitrina-titulo"><b>' + Demo.EMPRESAS[k] + '</b><span>Hoy</span></div>' +
        '<div class="columnas" style="margin:0;gap:12px">' +
        '<div class="panel"><div class="panel-cab"><h2>Ventas de hoy</h2></div><ul class="lista">' +
        vh.slice(-5).reverse().map(function (v) {
          return '<li><div class="txt"><b>' + esc(Motor.etiqueta(db, 'productos', v.producto)) + '</b><span>' + v.cantidad + ' × ' + plata(v.precio_unit) + ' · ' + v.medio + '</span></div><span class="monto">' + plata(v.total) + '</span></li>';
        }).join('') + '</ul></div>' +
        '<div class="panel"><div class="panel-cab"><h2>Para reponer</h2></div><ul class="lista">' +
        reponer.slice(0, 5).map(function (p) {
          return '<li><div class="txt"><b>' + esc(p.nombre) + '</b><span>Mínimo ' + p.stock_min + '</span></div><span class="estado ' + (num(p.stock) === 0 ? 'e-rojo' : 'e-ambar') + '">Quedan ' + p.stock + '</span></li>';
        }).join('') + '</ul></div></div>';
      document.getElementById('vitrina-pie').textContent = vh.length + ' ventas hoy por ' + plata(vh.reduce(function (s, v) { return s + num(v.total); }, 0));
    }
    S.db = anteriorDb; S.empresa = anteriorEmp;
  }

  /* ================= Pantallas de ingreso (modo real) ================= */
  function cajaIngreso(contenido) {
    $app.innerHTML = '<div class="ingreso"><div class="ingreso-caja">' + marca() + contenido + '</div></div>';
  }
  function pantallaSinConfig() {
    cajaIngreso('<h1>El sistema todavía no está conectado</h1><p>Falta cargar la dirección del servidor y el ID de Google en <b>js/config.js</b>. Mientras tanto, podés recorrer la demo.</p>' +
      '<a class="btn btn-1" href="#/demo/hoteleria">Ver la demo</a><a class="btn btn-3" href="#/">Volver al inicio</a>');
  }
  function pantallaIngreso() {
    cajaIngreso('<h1>Ingresá a tu negocio</h1><p>Usá la cuenta de Google con la que te registraste. Si es la primera vez, después elegís tu rubro.</p><div id="boton-google"></div><a class="btn btn-3" href="#/">Volver al inicio</a>');
    function pintar() {
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: function (r) {
          var datos = JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
          guardarLocal('gebro_sesion', { token: r.credential, email: datos.email, vence: datos.exp * 1000 - 60000 });
          S.db = null; entrarReal('inicio');
        }
      });
      google.accounts.id.renderButton(document.getElementById('boton-google'), { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', locale: 'es' });
    }
    if (window.google && google.accounts) return pintar();
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = pintar;
    document.head.appendChild(s);
  }
  function pantallaElegirEmpresa(emps, vista) {
    cajaIngreso('<h1>¿Con qué negocio trabajás?</h1><div class="opciones-rubro">' + emps.map(function (e) {
      return '<button class="btn btn-2" data-id="' + esc(e.id) + '" style="justify-content:flex-start">' + esc(e.nombre) + ' <span style="color:var(--tinta-3);font-weight:500">' + esc(R[e.rubro] ? R[e.rubro].nombre : '') + '</span></button>';
    }).join('') + '</div>');
    $app.querySelectorAll('[data-id]').forEach(function (b) { b.onclick = function () { cargarEmpresa(b.dataset.id, vista); }; });
  }
  function pantallaNuevaEmpresa() {
    cajaIngreso('<h1>Creá tu negocio</h1><p>Hola ' + esc(S.usuario.email) + '. Contanos cómo se llama y a qué se dedica.</p>' +
      '<div class="campo"><label for="ne-nombre">Nombre del negocio</label><input id="ne-nombre" placeholder="Hotel Las Sierras"></div>' +
      '<div class="opciones-rubro">' + Object.keys(R).map(function (k, i) {
        return '<label><input type="radio" name="rubro" value="' + k + '"' + (i ? '' : ' checked') + '><div><b>' + R[k].nombre + '</b><span>' + R[k].para + '</span></div></label>';
      }).join('') + '</div><div id="ne-error"></div>' +
      '<button class="btn btn-1 btn-grande" id="ne-crear">Crear negocio</button>');
    document.getElementById('ne-crear').onclick = function () {
      var n = document.getElementById('ne-nombre').value.trim(), r = $app.querySelector('[name=rubro]:checked').value;
      if (!n) { document.getElementById('ne-error').innerHTML = '<p class="error">Escribí el nombre del negocio.</p>'; return; }
      this.disabled = true; this.textContent = 'Creando…';
      S.api.crearEmpresa(n, r).then(function (x) { cargarEmpresa(x.empresa.id, 'inicio'); })
        .catch(function (e) { aviso(e.message, true); pantallaNuevaEmpresa(); });
    };
  }

  /* ================= Esqueleto del sistema ================= */
  var vistaActual = 'inicio';
  function pantalla(vista) {
    if (vista !== 'inicio' && vista !== 'reportes' && vista !== 'ajustes' && !tiene(vista)) vista = 'inicio';
    vistaActual = vista;
    var titulo = vista === 'inicio' ? 'Inicio' : vista === 'reportes' ? 'Reportes' : vista === 'ajustes' ? 'Ajustes' : nombreMod(vista);
    document.title = titulo + ' · ' + S.empresa.nombre + ' | Gebro';
    var reponer = tiene('productos') ? filas('productos').filter(function (p) { return num(p.stock) <= num(p.stock_min); }).length : 0;
    var lnk = function (v, nombre, icono, extra) {
      return '<a href="' + base() + '/' + v + '"' + (v === vista ? ' aria-current="page"' : '') + '>' + ic(icono) + '<span>' + nombre + '</span>' + (extra || '') + '</a>';
    };
    var u = S.usuario || {};
    $app.innerHTML =
      '<div class="sis" id="sis">' +
      '<aside class="lateral" aria-label="Menú">' + marca(base() + '/inicio') +
      '<div class="empresa"><b>' + esc(S.empresa.nombre) + '</b><span>' + esc(R[S.empresa.rubro] ? R[S.empresa.rubro].nombre : '') + (S.modo === 'demo' ? ' · demo' : '') + '</span></div>' +
      '<nav class="menu">' + lnk('inicio', 'Inicio', 'inicio') +
      activos().map(function (m) { return lnk(m, nombreMod(m), M[m].icono, m === 'productos' && reponer ? '<span class="cuenta" title="Productos para reponer">' + reponer + '</span>' : ''); }).join('') +
      '<div class="menu-sep"></div>' + lnk('reportes', 'Reportes', 'reportes') + lnk('ajustes', 'Ajustes', 'ajustes') +
      ((GEBRO.ENLACES[S.empresa.rubro] || []).length ? '<div class="menu-sep"></div><p class="menu-titulo">Accesos directos</p>' + GEBRO.ENLACES[S.empresa.rubro].map(function (e) {
        return '<a href="' + e.url + '" target="_blank" rel="noopener">' + ic(/Constituci/.test(e.nombre) ? 'balanza' : 'enlace') + '<span>' + esc(e.nombre) + '</span></a>';
      }).join('') : '') + '</nav>' +
      '<div class="lateral-pie">' +
      (S.modo === 'demo' ? '<div class="cartel-demo"><b>Estás en la demo.</b> Probá todo lo que quieras: los cambios quedan solo en este navegador.</div>' +
        '<div class="usuario"><a class="btn btn-2 btn-chico" href="#/">' + ic('salir') + 'Salir de la demo</a></div>'
        : '<div class="usuario"><span class="avatar">' + esc(iniciales(u.email)) + '</span><span title="' + esc(u.email) + '">' + esc(u.email) + '</span><button class="btn btn-3 btn-icono" id="salir" title="Cerrar sesión" aria-label="Cerrar sesión">' + ic('salir') + '</button></div>') +
      '</div></aside>' +
      '<div class="barra-movil"><button class="btn btn-3 btn-icono" id="abrir-menu" aria-label="Abrir menú">' + ic('menu') + '</button><span class="titulo">' + esc(titulo) + '</span><span id="movil-accion"></span></div>' +
      '<main class="principal" id="principal"></main>' +
      '</div>';
    var sis = document.getElementById('sis');
    document.getElementById('abrir-menu').onclick = function () { sis.classList.add('menu-abierto'); };
    sis.addEventListener('click', function (e) {
      if (sis.classList.contains('menu-abierto') && (e.target === sis || e.target.closest('.menu a'))) sis.classList.remove('menu-abierto');
    });
    var salir = document.getElementById('salir');
    if (salir) salir.onclick = function () { cerrarSesion(); location.hash = '#/'; };
    dibujar();
  }

  function dibujar() {
    var p = document.getElementById('principal');
    if (!p) return;
    var v = vistaActual;
    if (v === 'inicio') p.innerHTML = vistaInicio();
    else if (v === 'reportes') p.innerHTML = vistaReportes();
    else if (v === 'ajustes') p.innerHTML = vistaAjustes();
    else p.innerHTML = vistaModulo(v);
    conectar(p);
    var ma = document.getElementById('movil-accion'), nuevo = p.querySelector('.cab-pagina [data-nuevo]');
    if (ma) ma.innerHTML = nuevo ? '<button class="btn btn-1 btn-chico" data-nuevo="' + nuevo.dataset.nuevo + '">' + ic('mas') + 'Nuevo</button>' : '';
    if (ma) conectar(ma);
  }

  function cabecera(titulo, sub, acciones) {
    return '<div class="cab-pagina"><div><h1>' + esc(titulo) + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div><div class="acciones">' + (acciones || '') + '</div></div>';
  }
  function botonNuevo(m, texto) {
    return '<button class="btn btn-1" data-nuevo="' + m + '">' + ic('mas') + (texto || 'Nuevo ' + singularMod(m)) + '</button>';
  }
  function cifra(nombre, valor, det, barra) {
    return '<div class="cifra"><div class="nombre">' + nombre + '</div><div class="valor">' + valor + '</div>' + (det ? '<div class="det">' + det + '</div>' : '') +
      (barra !== undefined ? '<div class="barrita"><i style="width:' + Math.max(0, Math.min(100, barra)) + '%"></i></div>' : '') + '</div>';
  }
  function chipEstado(m, v) {
    var mapa = {
      Confirmada: 'e-verde', 'En curso': 'e-azul', Pendiente: 'e-ambar', Finalizada: 'e-gris', Cancelada: 'e-rojo',
      Disponible: 'e-verde', Ocupada: 'e-azul', Limpieza: 'e-ambar', Mantenimiento: 'e-rojo',
      Reservado: 'e-ambar', Confirmado: 'e-verde', Atendido: 'e-gris', Ausente: 'e-rojo', Cancelado: 'e-rojo',
      Cobrado: 'e-verde', Ingreso: 'e-verde', Egreso: 'e-rojo',
      Enviado: 'e-azul', Aceptado: 'e-verde', Rechazado: 'e-rojo', Vencido: 'e-gris', Presentado: 'e-azul', Pagado: 'e-verde',
      'A cobrar': 'e-ambar', 'En trámite': 'e-azul', 'Con sentencia': 'e-verde', Archivado: 'e-gris', Cumplido: 'e-verde', Libre: 'e-gris', Propuesta: 'e-ambar', 'En revisión': 'e-ambar', Entregado: 'e-verde', Pausado: 'e-gris', Hecha: 'e-verde', 'Bajo receta': 'e-ambar', 'Receta archivada': 'e-rojo'
    };
    return v ? '<span class="estado ' + (mapa[v] || 'e-gris') + '">' + esc(v) + '</span>' : '';
  }

  /* ================= INICIO ================= */
  function vistaInicio() {
    var h = hoy(), html = '', r = S.empresa.rubro;
    var saludo = cabecera(S.empresa.nombre, fLarga(h).replace(/^./, function (c) { return c.toUpperCase(); }),
      tiene('reservas') ? botonNuevo('reservas', 'Nueva reserva') : tiene('turnos') ? botonNuevo('turnos', 'Nuevo turno') : tiene('ventas') ? botonVentaRapida() :
      tiene('proyectos') ? botonNuevo('proyectos', 'Nuevo proyecto') : tiene('vencimientos') ? botonNuevo('vencimientos', 'Nuevo vencimiento') : tiene('plazos') ? botonNuevo('plazos', 'Nuevo plazo o audiencia') : '');
    html += saludo;

    if (tiene('reservas') && tiene('habitaciones')) {
      var habs = filas('habitaciones'), res = filas('reservas');
      var ocupadas = res.filter(function (x) { return Motor.activa(x) && x.desde <= h && x.hasta > h || x.estado === 'En curso'; });
      var habOc = {}; ocupadas.forEach(function (x) { habOc[x.habitacion] = 1; });
      var nOc = Object.keys(habOc).length;
      var llegan = res.filter(function (x) { return x.desde === h && (x.estado === 'Confirmada' || x.estado === 'Pendiente' || x.estado === 'En curso'); });
      var salen = res.filter(function (x) { return x.hasta === h && (x.estado === 'En curso' || x.estado === 'Finalizada'); });
      var enCurso = res.filter(function (x) { return x.estado === 'En curso'; });
      var porCobrar = enCurso.reduce(function (s, x) { return s + Motor.cuentaReserva(S.db, x.id).saldo; }, 0);
      html += '<div class="cifras">' +
        cifra('Ocupación hoy', Math.round(nOc / (habs.length || 1) * 100) + '%', nOc + ' de ' + habs.length + ' habitaciones', nOc / (habs.length || 1) * 100) +
        cifra('Llegan hoy', llegan.length, llegan.filter(function (x) { return x.estado !== 'En curso'; }).length + ' sin check-in') +
        cifra('Se van hoy', salen.length, salen.filter(function (x) { return x.estado === 'En curso'; }).length + ' sin check-out') +
        cifra('Por cobrar', plata(porCobrar), enCurso.length + ' estadías en curso') + '</div>';
      html += '<div class="columnas">' +
        panelLista('Llegan hoy', llegan, function (x) {
          return { txt: et('clientes', x.cliente), sub: 'Hab. ' + Motor.etiqueta(S.db, 'habitaciones', x.habitacion).replace('Hab. ', '') + ' · ' + Motor.noches(x.desde, x.hasta) + ' noches · ' + x.personas + ' pers.', der: Motor.accionDisponible('reservas', 'checkin', x) ? '<button class="btn btn-2 btn-chico" data-accion="reservas:checkin:' + x.id + '">Check-in</button>' : chipEstado('reservas', x.estado), m: 'reservas', id: x.id };
        }, 'Nadie llega hoy.') +
        panelLista('Se van hoy', salen, function (x) {
          return { txt: et('clientes', x.cliente), sub: Motor.etiqueta(S.db, 'habitaciones', x.habitacion) + ' · saldo ' + plata(x.estado === 'En curso' ? Motor.cuentaReserva(S.db, x.id).saldo : 0), der: Motor.accionDisponible('reservas', 'checkout', x) ? '<button class="btn btn-1 btn-chico" data-accion="reservas:checkout:' + x.id + '">Check-out</button>' : chipEstado('reservas', x.estado), m: 'reservas', id: x.id };
        }, 'Nadie se va hoy.') + '</div>';
      html += '<div class="panel" style="margin-bottom:20px"><div class="panel-cab"><h2>Habitaciones</h2><div class="acciones"><a class="btn btn-3 btn-chico" href="' + base() + '/reservas">Ver calendario</a></div></div><div class="tablero">' +
        habs.slice().sort(ordenNat('numero')).map(function (x) {
          var r2 = res.filter(function (y) { return y.habitacion === x.id && y.estado === 'En curso'; })[0];
          return '<button class="hab ' + esc(x.estado) + '" data-editar="habitaciones:' + x.id + '"><b>' + esc(x.numero) + '</b><span>' + esc(x.tipo) + '</span><em>' + esc(x.estado) + '</em>' +
            (r2 ? '<span>' + esc(et('clientes', r2.cliente)) + '</span>' : '') + '</button>';
        }).join('') + '</div></div>';
    }

    if (tiene('turnos')) {
      var tur = filas('turnos').filter(function (t) { return t.fecha === h && t.estado !== 'Cancelado'; }).sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
      var atendidos = tur.filter(function (t) { return t.estado === 'Atendido'; }).length, ausentes = tur.filter(function (t) { return t.estado === 'Ausente'; }).length;
      var cobradoHoy = filas('caja').filter(function (c) { return c.fecha === h && c.tipo === 'Ingreso' && String(c.origen).indexOf('turno:') === 0; }).reduce(function (s, c) { return s + num(c.monto); }, 0);
      var semana = filas('turnos').filter(function (t) { return t.fecha > h && t.fecha <= sumar(h, 7) && (t.estado === 'Reservado' || t.estado === 'Confirmado'); }).length;
      html += '<div class="cifras">' + cifra('Turnos hoy', tur.length, atendidos + ' atendidos', tur.length ? atendidos / tur.length * 100 : 0) +
        cifra('Faltan atender', tur.length - atendidos - ausentes, ausentes + ' ausentes') + cifra('Cobrado hoy', plata(cobradoHoy)) +
        cifra('Próximos 7 días', semana, 'turnos dados') + '</div>';
      var ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
      html += '<div class="columnas">' + panelLista('Agenda de hoy', tur.filter(function (t) { return t.estado === 'Reservado' || t.estado === 'Confirmado'; }), function (t) {
        var s = Motor.buscar(S.db, 'servicios', t.servicio);
        return { hora: t.hora, txt: et('clientes', t.cliente), sub: (s ? s.nombre : '') + ' · ' + et('profesionales', t.profesional), der: '<button class="btn ' + (Motor.minutos(t.hora) <= ahoraMin ? 'btn-1' : 'btn-2') + ' btn-chico" data-accion="turnos:atendido:' + t.id + '">Atendido</button>', m: 'turnos', id: t.id };
      }, 'No quedan turnos para hoy.', '<a class="btn btn-3 btn-chico" href="' + base() + '/turnos">Ver agenda</a>') +
        panelLista('Ya atendidos', tur.filter(function (t) { return t.estado === 'Atendido' || t.estado === 'Ausente'; }).reverse(), function (t) {
          var s = Motor.buscar(S.db, 'servicios', t.servicio);
          return { hora: t.hora, txt: et('clientes', t.cliente), sub: (s ? s.nombre : '') + ' · ' + et('profesionales', t.profesional), der: chipEstado('turnos', t.estado), m: 'turnos', id: t.id };
        }, 'Todavía no atendieron a nadie hoy.') + '</div>';
    }

    if (tiene('ventas')) {
      var vh = filas('ventas').filter(function (v) { return v.fecha === h; });
      var vm = filas('ventas').filter(function (v) { return mesDe(v.fecha) === mesDe(h); });
      var tot = function (a) { return a.reduce(function (s, v) { return s + num(v.total); }, 0); };
      var reponer = tiene('productos') ? filas('productos').filter(function (p) { return num(p.stock) <= num(p.stock_min); }) : [];
      html += '<div class="cifras">' + cifra('Vendido hoy', plata(tot(vh)), vh.length + ' ventas') + cifra('Vendido en ' + MESES[+h.slice(5, 7) - 1], plata(tot(vm)), vm.length + ' ventas') +
        cifra('Venta promedio', plata(vm.length ? tot(vm) / vm.length : 0), 'en el mes') + cifra('Para reponer', reponer.length, 'productos bajo el mínimo') + '</div>';
      html += '<div class="columnas">' + panelLista('Últimas ventas', filas('ventas').slice().sort(function (a, b) { return b.fecha > a.fecha ? 1 : b.fecha < a.fecha ? -1 : (parseInt(b.id.slice(1)) - parseInt(a.id.slice(1))); }).slice(0, 8), function (v) {
        return { txt: et('productos', v.producto), sub: (v.fecha === h ? 'Hoy' : fCorta(v.fecha)) + ' · ' + v.cantidad + ' u. · ' + v.medio, der: '<span class="monto">' + plata(v.total) + '</span>', m: 'ventas', id: v.id };
      }, 'Todavía no hay ventas.', '<a class="btn btn-3 btn-chico" href="' + base() + '/ventas">Ver todas</a>') +
        (tiene('productos') ? panelLista('Para reponer', reponer.sort(function (a, b) { return num(a.stock) - num(b.stock); }), function (p) {
          return { txt: p.nombre, sub: 'Mínimo ' + p.stock_min + ' · ' + (p.categoria || ''), der: '<span class="estado ' + (num(p.stock) <= 0 ? 'e-rojo' : 'e-ambar') + '">Quedan ' + p.stock + '</span>', m: 'productos', id: p.id };
        }, 'Tenés stock de todo.') : '') + '</div>';
    }

    html += inicioNuevos(h);
    if (tiene('caja')) html += resumenCaja(mesDe(h), true);
    return html;
  }

  function inicioNuevos(h) {
    var html = '', en = function (n) { return sumar(h, n); };
    var sumaM = function (a, k) { return a.reduce(function (s, x) { return s + num(x[k || 'monto']); }, 0); };

    if (tiene('productos') && S.empresa.rubro === 'farmacia') {
      var porVencer = filas('productos').filter(function (p) { return p.vence && p.vence <= en(90); }).sort(function (a, b) { return a.vence < b.vence ? -1 : 1; });
      html += '<div class="columnas">' + panelLista('Medicamentos por vencer', porVencer, function (p) {
        return { txt: p.nombre, sub: (p.laboratorio || '') + ' · stock ' + p.stock, der: '<span class="estado ' + (p.vence < h ? 'e-rojo' : p.vence <= en(30) ? 'e-ambar' : 'e-gris') + '">' + (p.vence < h ? 'Vencido' : 'Vence ' + fCorta(p.vence)) + '</span>', m: 'productos', id: p.id };
      }, 'No hay medicamentos que venzan en los próximos 90 días.') +
        panelLista('Bajo receta', filas('productos').filter(function (p) { return p.receta && p.receta !== 'Libre'; }), function (p) {
          return { txt: p.nombre, sub: (p.laboratorio || '') + ' · ' + plata(p.precio), der: chipEstado('', p.receta), m: 'productos', id: p.id };
        }, 'No hay productos marcados como bajo receta.') + '</div>';
    }

    if (tiene('presupuestos')) {
      var abiertos = filas('presupuestos').filter(function (q) { return q.estado === 'Enviado'; });
      html += '<div class="columnas">' + panelLista('Presupuestos esperando respuesta', abiertos, function (q) {
        return { txt: et('clientes', q.cliente), sub: String(q.detalle).slice(0, 60) + (q.valido_hasta ? ' · válido hasta ' + fCorta(q.valido_hasta) : ''), der: '<span class="monto">' + plata(q.total) + '</span>', m: 'presupuestos', id: q.id };
      }, 'No hay presupuestos pendientes.', '<a class="btn btn-3 btn-chico" href="' + base() + '/presupuestos">Ver todos</a>') + '<div></div></div>';
    }

    if (tiene('proyectos')) {
      var activos = filas('proyectos').filter(function (p) { return p.estado === 'En curso' || p.estado === 'En revisión'; })
        .sort(function (a, b) { return (a.entrega || '9') < (b.entrega || '9') ? -1 : 1; });
      var aCobrar = tiene('honorarios') ? filas('honorarios').filter(function (x) { return x.estado === 'A cobrar'; }) : [];
      var cobradoMes = filas('caja').filter(function (c) { return c.tipo === 'Ingreso' && mesDe(c.fecha) === mesDe(h); });
      var tPend = tiene('tareas') ? filas('tareas').filter(function (t) { return t.estado !== 'Hecha'; }).sort(function (a, b) { return (a.fecha || '9') < (b.fecha || '9') ? -1 : 1; }) : [];
      html += '<div class="cifras">' + cifra('Proyectos activos', activos.length, (function (n) { return n + (n === 1 ? ' propuesta enviada' : ' propuestas enviadas'); })(filas('proyectos').filter(function (p) { return p.estado === 'Propuesta'; }).length)) +
        cifra('Entregas en 14 días', activos.filter(function (p) { return p.entrega && p.entrega <= en(14); }).length, activos.filter(function (p) { return p.entrega && p.entrega < h; }).length + ' atrasadas') +
        cifra('Cobrado en ' + MESES[+h.slice(5, 7) - 1], plata(sumaM(cobradoMes)), cobradoMes.length + ' cobros') +
        cifra('Falta cobrar', plata(sumaM(aCobrar)), aCobrar.length + ' pendientes') + '</div>';
      html += '<section class="panel" style="margin-bottom:20px"><div class="panel-cab"><h2>Proyectos en curso</h2><div class="acciones"><a class="btn btn-3 btn-chico" href="' + base() + '/proyectos">Ver todos</a></div></div>' +
        (activos.length ? '<ul class="lista proyectos-lista">' + activos.map(function (p) {
          var atrasado = p.entrega && p.entrega < h;
          return '<li class="clic" data-editar="proyectos:' + p.id + '"><div class="txt"><b>' + esc(p.nombre) + '</b><span>' + esc(et('clientes', p.cliente)) + ' · ' + esc(p.tipo || '') + '</span></div>' +
            '<div class="avance" title="' + num(p.avance) + '% hecho"><i style="width:' + num(p.avance) + '%"></i></div><span class="avance-n">' + num(p.avance) + '%</span>' +
            '<span class="estado ' + (atrasado ? 'e-rojo' : 'e-gris') + '">' + (p.entrega ? (atrasado ? 'Atrasado ' : 'Entrega ') + fCorta(p.entrega) : 'Sin fecha') + '</span></li>';
        }).join('') + '</ul>' : '<p class="vacio">No tenés proyectos en curso. Tocá "Nuevo proyecto" para cargar uno.</p>') + '</section>';
      html += '<div class="columnas">' + (tiene('tareas') ? panelLista('Tareas pendientes', tPend, function (t) {
        var p = Motor.buscar(S.db, 'proyectos', t.proyecto);
        return { hora: t.fecha ? (t.fecha === h ? 'Hoy' : fCorta(t.fecha)) : '', txt: t.tarea, sub: p ? p.nombre + ' · ' + et('clientes', p.cliente) : '',
          der: '<button class="btn btn-2 btn-chico" data-accion="tareas:hecha:' + t.id + '">Hecha</button>', m: 'tareas', id: t.id };
      }, 'No tenés tareas pendientes.', '<a class="btn btn-3 btn-chico" href="' + base() + '/tareas">Ver todas</a>') : '') +
        (tiene('honorarios') ? panelLista('Por cobrar', aCobrar.sort(function (a, b) { return (a.vence || '9') < (b.vence || '9') ? -1 : 1; }), function (x) {
          return { txt: et('clientes', x.cliente), sub: (x.proyecto ? et('proyectos', x.proyecto) + ' · ' : '') + x.concepto, der: '<button class="btn btn-1 btn-chico" data-accion="honorarios:cobrar:' + x.id + '">Cobrar ' + plata(x.monto) + '</button>', m: 'honorarios', id: x.id };
        }, 'No hay nada pendiente de cobro.') : '') + '</div>';
    }

    if (tiene('vencimientos')) {
      var pend = filas('vencimientos').filter(function (v) { return v.estado === 'Pendiente'; });
      var atrasados = pend.filter(function (v) { return v.fecha < h; }), semana = pend.filter(function (v) { return v.fecha >= h && v.fecha <= en(7); });
      var hon = tiene('honorarios') ? filas('honorarios').filter(function (x) { return x.estado === 'A cobrar'; }) : [];
      html += '<div class="cifras">' + cifra('Vencen esta semana', semana.length, 'obligaciones pendientes') +
        cifra('Atrasados', atrasados.length, atrasados.length ? 'revisalos hoy' : 'todo al día') +
        cifra('Clientes', filas('clientes').length, filas('clientes').filter(function (c) { return c.condicion === 'Monotributo'; }).length + ' monotributistas') +
        cifra('Honorarios a cobrar', plata(sumaM(hon)), hon.length + ' pendientes') + '</div>';
      html += '<div class="columnas">' + panelLista('Próximos vencimientos', pend.filter(function (v) { return v.fecha <= en(15); }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; }), function (v) {
        return { hora: fCorta(v.fecha), txt: et('clientes', v.cliente), sub: v.obligacion + (v.periodo ? ' ' + v.periodo : '') + (v.monto !== '' ? ' · ' + plata(v.monto) : ''),
          der: v.fecha < h ? '<span class="estado e-rojo">Atrasado</span>' : '<button class="btn btn-2 btn-chico" data-accion="vencimientos:presentado:' + v.id + '">Presentado</button>', m: 'vencimientos', id: v.id };
      }, 'No hay vencimientos en los próximos 15 días.', '<a class="btn btn-3 btn-chico" href="' + base() + '/vencimientos">Ver todos</a>') + panelArca() + '</div>';
    }

    if (tiene('plazos')) {
      var pp = filas('plazos').filter(function (x) { return x.estado === 'Pendiente'; }).sort(function (a, b) { return (a.fecha + a.hora) < (b.fecha + b.hora) ? -1 : 1; });
      var hoyP = pp.filter(function (x) { return x.fecha === h; }), venc = pp.filter(function (x) { return x.fecha < h; });
      var hon2 = tiene('honorarios') ? filas('honorarios').filter(function (x) { return x.estado === 'A cobrar'; }) : [];
      html += '<div class="cifras">' + cifra('Para hoy', hoyP.length, 'plazos y audiencias') + cifra('Próximos 7 días', pp.filter(function (x) { return x.fecha > h && x.fecha <= en(7); }).length, 'en agenda') +
        cifra('Expedientes en trámite', filas('expedientes').filter(function (e) { return e.estado === 'En trámite'; }).length, filas('expedientes').length + ' en total') +
        cifra('Honorarios a cobrar', plata(sumaM(hon2)), hon2.length + ' pendientes') + '</div>';
      if (venc.length) html += '<p class="error" style="margin-bottom:16px">Hay ' + venc.length + ' plazo' + (venc.length > 1 ? 's' : '') + ' de días anteriores sin marcar como cumplido.</p>';
      html += '<div class="columnas">' + panelLista('Agenda', pp.filter(function (x) { return x.fecha <= en(10); }), function (x) {
        var e = Motor.buscar(S.db, 'expedientes', x.expediente);
        return { hora: x.fecha === h ? (x.hora || 'Hoy') : fCorta(x.fecha), txt: x.tipo + (x.detalle ? ': ' + x.detalle : ''), sub: e ? e.caratula : '',
          der: '<button class="btn btn-2 btn-chico" data-accion="plazos:cumplido:' + x.id + '">Cumplido</button>', m: 'plazos', id: x.id };
      }, 'No hay plazos ni audiencias en los próximos 10 días.', '<a class="btn btn-3 btn-chico" href="' + base() + '/plazos">Ver agenda</a>') + panelLegal() + '</div>';
    }
    return html;
  }

  function panelArca() {
    var e = GEBRO.ENLACES.contadores;
    return '<section class="panel panel-acceso"><div class="panel-cab"><h2>ARCA</h2></div><div class="panel-cuerpo">' +
      '<p>Accesos directos a los servicios de ARCA. Se abren en otra pestaña con tu Clave Fiscal.</p><div class="accesos">' + e.map(function (x) {
        return '<a class="btn btn-2" href="' + x.url + '" target="_blank" rel="noopener">' + ic('enlace') + esc(x.nombre) + '</a>';
      }).join('') + '</div><p class="ayuda-chica">En la ficha de cada cliente tenés su CUIT para copiar y el botón para ver su constancia.</p></div></section>';
  }
  function panelLegal() {
    var e = GEBRO.ENLACES.abogados[0];
    return '<section class="panel panel-acceso"><div class="panel-cab"><h2>Consulta rápida</h2></div><div class="panel-cuerpo">' +
      '<a class="acceso-grande" href="' + e.url + '" target="_blank" rel="noopener">' + ic('balanza') + '<span><b>Constitución Nacional</b><small>Texto oficial en InfoLEG</small></span></a></div></section>';
  }

  function panelLista(titulo, items, fn, vacio, acciones) {
    return '<section class="panel"><div class="panel-cab"><h2>' + titulo + '</h2>' + (items.length ? '<span class="estado e-gris" style="padding-left:9px">' + items.length + '</span>' : '') +
      '<div class="acciones">' + (acciones || '') + '</div></div>' +
      (items.length ? '<ul class="lista">' + items.slice(0, 8).map(function (x) {
        var r = fn(x);
        return '<li class="clic" data-editar="' + r.m + ':' + r.id + '">' + (r.hora ? '<span class="hora">' + r.hora + '</span>' : '') +
          '<div class="txt"><b>' + esc(r.txt) + '</b><span>' + esc(r.sub) + '</span></div>' + r.der + '</li>';
      }).join('') + '</ul>' + (items.length > 8 ? '<div class="tabla-pie">y ' + (items.length - 8) + ' más</div>' : '') : '<p class="vacio">' + vacio + '</p>') + '</section>';
  }

  function resumenCaja(mes, enlace) {
    var mov = filas('caja').filter(function (c) { return mesDe(c.fecha) === mes; });
    var ing = mov.filter(function (c) { return c.tipo === 'Ingreso'; }).reduce(function (s, c) { return s + num(c.monto); }, 0);
    var egr = mov.filter(function (c) { return c.tipo === 'Egreso'; }).reduce(function (s, c) { return s + num(c.monto); }, 0);
    var hoyIng = mov.filter(function (c) { return c.fecha === hoy() && c.tipo === 'Ingreso'; }).reduce(function (s, c) { return s + num(c.monto); }, 0);
    return '<section class="panel"><div class="panel-cab"><h2>Caja de ' + MESES[+mes.slice(5, 7) - 1] + '</h2><div class="acciones">' + (enlace ? '<a class="btn btn-3 btn-chico" href="' + base() + '/caja">Ver movimientos</a>' : '') + '</div></div>' +
      '<div class="cifras" style="border:0;margin:0;border-radius:0 0 var(--r) var(--r)">' + cifra('Entró', plata(ing), mov.filter(function (c) { return c.tipo === 'Ingreso'; }).length + ' movimientos') +
      cifra('Salió', plata(egr), mov.filter(function (c) { return c.tipo === 'Egreso'; }).length + ' movimientos') +
      cifra('Resultado', '<span style="color:' + (ing - egr < 0 ? 'var(--rojo)' : 'inherit') + '">' + plata(ing - egr) + '</span>') + cifra('Entró hoy', plata(hoyIng)) + '</div></section>';
  }

  /* ================= MÓDULOS ================= */
  function vistaModulo(m) {
    var def = M[m], modo = S.vistaMod[m] || def.vista || 'tabla';
    var seg = def.vista ? '<div class="segmento" role="group" aria-label="Vista">' +
      '<button data-vista="' + m + ':' + def.vista + '" aria-pressed="' + (modo === def.vista) + '">' + (def.vista === 'calendario' ? 'Calendario' : 'Agenda') + '</button>' +
      '<button data-vista="' + m + ':tabla" aria-pressed="' + (modo === 'tabla') + '">Lista</button></div>' : '';
    var sub = def.nota || (m === 'caja' ? 'Las ventas, señas, check-outs y turnos atendidos se anotan solos.' : filas(m).length + ' ' + (filas(m).length === 1 ? singularMod(m) : nombreMod(m).toLowerCase()));
    var html = cabecera(nombreMod(m), sub, seg + (m === 'ventas' ? botonVentaRapida() + botonNuevo(m, 'Venta manual').replace('btn-1', 'btn-2') : botonNuevo(m, m === 'caja' ? 'Nuevo movimiento' : null)));
    if (m === 'caja') html += '<div style="margin-bottom:20px">' + resumenCaja(S.mesCaja || mesDe(hoy())) + '</div>';
    if (modo === 'calendario') return html + vistaCalendario();
    if (modo === 'agenda') return html + vistaAgenda();
    return html + vistaTabla(m);
  }

  function ordenNat(k) {
    return function (a, b) { return String(a[k]).localeCompare(String(b[k]), 'es', { numeric: true }); };
  }

  function vistaTabla(m) {
    var def = M[m], q = (S.busqueda[m] || '').toLowerCase(), filtro = S.filtros[m] || '';
    var campos = def.campos.filter(function (c) { return c.lista && GEBRO.campoVisible(c, S.empresa.rubro); });
    var cEstado = def.campos.filter(function (c) { return (c.k === 'estado' || c.k === 'tipo' || c.k === 'categoria') && c.lista; })[0];
    var opciones = cEstado ? (cEstado.opciones || unicos(filas(m).map(function (f) { return f[cEstado.k]; }))) : [];
    var lista = filas(m).slice();
    if (m === 'caja') lista = lista.filter(function (f) { return mesDe(f.fecha) === (S.mesCaja || mesDe(hoy())); });
    if (filtro) lista = lista.filter(function (f) { return f[cEstado.k] === filtro; });
    if (q) lista = lista.filter(function (f) {
      return def.campos.some(function (c) { var v = c.tipo === 'ref' ? et(c.ref, f[c.k]) : f[c.k]; return String(v).toLowerCase().indexOf(q) >= 0; }) || String(f.id).toLowerCase() === q;
    });
    var o = def.orden || 'id', desc = o[0] === '-'; o = o.replace('-', '');
    lista.sort(function (a, b) {
      var r = String(a[o]).localeCompare(String(b[o]), 'es', { numeric: true });
      if (!r) r = parseInt(String(a.id).slice(1)) - parseInt(String(b.id).slice(1));
      return desc ? -r : r;
    });
    var lim = S.limite[m] || 100;
    var html = '<div class="herramientas"><label class="buscador">' + ic('buscar') + '<span class="oculto">Buscar</span><input type="search" data-buscar="' + m + '" placeholder="Buscar en ' + esc(nombreMod(m).toLowerCase()) + '" value="' + esc(S.busqueda[m] || '') + '"></label>' +
      (opciones.length > 1 && opciones.length <= 8 ? '<div class="chips">' + ['', ].concat(opciones).map(function (op) {
        return '<button class="chip" data-filtro="' + m + ':' + esc(op) + '" aria-pressed="' + (op === filtro) + '">' + (op || 'Todos') + '</button>';
      }).join('') + '</div>' : '') +
      (m === 'caja' ? navMes('mesCaja', S.mesCaja || mesDe(hoy())) : '') + '</div>';
    html += '<section class="panel"><div class="tabla-envase"><table class="tabla"><thead><tr>' +
      campos.map(function (c, i) { return '<th class="' + (c.tipo === 'dinero' || c.tipo === 'numero' ? 'num' : '') + (i > 3 ? ' ocultar-movil' : '') + '">' + esc(etiquetaCampo(m, c)) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      lista.slice(0, lim).map(function (f) {
        return '<tr data-editar="' + m + ':' + f.id + '" tabindex="0">' + campos.map(function (c, i) {
          var v = f[c.k], txt;
          if (c.tipo === 'ref') txt = esc(et(c.ref, v));
          else if (c.tipo === 'dinero') txt = v === '' ? '' : (m === 'caja' && f.tipo === 'Egreso' ? '−' : '') + plata(v);
          else if (c.tipo === 'fecha') txt = fCorta(v) + (v && v.slice(0, 4) !== hoy().slice(0, 4) ? '/' + v.slice(2, 4) : '');
          else if (c.tipo === 'select' && (c.k === 'estado' || c.k === 'tipo')) txt = chipEstado(m, v);
          else txt = esc(v);
          var cls = (c.tipo === 'dinero' || c.tipo === 'numero' ? 'num' : '') + (i > 3 ? ' ocultar-movil' : '');
          if (m === 'productos' && c.k === 'stock' && num(v) <= num(f.stock_min)) cls += ' bajo';
          return '<td class="' + cls + '">' + txt + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      (lista.length ? '' : '<p class="vacio">' + (q || filtro ? 'No hay resultados para ese filtro.' : 'Todavía no cargaste ' + nombreMod(m).toLowerCase() + '. Tocá "' + (m === 'caja' ? 'Nuevo movimiento' : 'Nuevo ' + singularMod(m)) + '" para empezar.') + '</p>') +
      (lista.length > lim ? '<div class="tabla-pie"><span>Mostrando ' + lim + ' de ' + lista.length + '</span><button class="btn btn-2 btn-chico" data-mas="' + m + '">Mostrar más</button></div>' : lista.length ? '<div class="tabla-pie"><span>' + lista.length + ' en total</span></div>' : '') +
      '</section>';
    return html;
  }
  function unicos(a) { var o = {}; a.forEach(function (x) { if (x) o[x] = 1; }); return Object.keys(o).sort(); }
  function navMes(clave, mes) {
    return '<div class="navfecha"><button class="btn btn-2 btn-icono" data-mes="' + clave + ':-1" aria-label="Mes anterior">' + ic('izq') + '</button><span class="rotulo">' + mesNombre(mes) + '</span>' +
      '<button class="btn btn-2 btn-icono" data-mes="' + clave + ':1" aria-label="Mes siguiente">' + ic('der') + '</button></div>';
  }

  /* ---------- Calendario de reservas ---------- */
  function vistaCalendario() {
    var dias = ancho() < 600 ? 7 : ancho() < 1100 ? 10 : 14;
    var desde = S.calDesde || sumar(hoy(), -2);
    var hasta = sumar(desde, dias - 1), d1 = fdate(desde), d2 = fdate(hasta);
    var rot = d1.getDate() + (d1.getMonth() !== d2.getMonth() ? ' de ' + MESES[d1.getMonth()] : '') + ' al ' + d2.getDate() + ' de ' + MESES[d2.getMonth()];
    return '<div class="herramientas"><div class="navfecha"><button class="btn btn-2 btn-icono" data-cal="-' + dias + '" aria-label="Días anteriores">' + ic('izq') + '</button>' +
      '<span class="rotulo">' + rot + '</span><button class="btn btn-2 btn-icono" data-cal="' + dias + '" aria-label="Días siguientes">' + ic('der') + '</button></div>' +
      '<button class="btn btn-2 btn-chico" data-cal="hoy">Hoy</button></div>' +
      '<section class="panel">' + htmlCalendario(desde, dias, false) +
      '<div class="leyenda"><span><i style="background:var(--verde)"></i>Confirmada</span><span><i style="border:1.5px dashed var(--verde)"></i>Pendiente</span><span><i style="background:var(--azul)"></i>En curso</span><span><i style="background:var(--gris-suave)"></i>Finalizada</span><span>Tocá un día libre para reservar</span></div></section>';
  }

  function htmlCalendario(desde, dias, mini) {
    var h = hoy(), fechas = [];
    for (var i = 0; i < dias; i++) fechas.push(sumar(desde, i));
    var fin = sumar(desde, dias);
    var colorEst = { Disponible: 'var(--verde)', Ocupada: 'var(--azul)', Limpieza: 'var(--marcador)', Mantenimiento: 'var(--rojo)' };
    var cab = '<div class="cal-fila cal-cab"><div class="cal-hab"><b>' + (mini ? 'Hab.' : 'Habitación') + '</b></div>' + fechas.map(function (f, i) {
      var d = fdate(f), finde = d.getDay() === 0 || d.getDay() === 6;
      return '<div class="cal-dia' + (finde ? ' finde' : '') + (f === h ? ' hoy' : '') + '" style="grid-column:' + (i * 2 + 2) + '/span 2"><span>' + DIAS[d.getDay()] + '</span><b>' + d.getDate() + '</b></div>';
    }).join('') + '</div>';
    var filasHtml = filas('habitaciones').slice().sort(ordenNat('numero')).map(function (hab) {
      var celdas = fechas.map(function (f, i) {
        var d = fdate(f), finde = d.getDay() === 0 || d.getDay() === 6;
        return '<div class="cal-celda' + (finde ? ' finde' : '') + (f === h ? ' hoy' : '') + '" style="grid-column:' + (i * 2 + 2) + '/span 2"' + (mini ? '' : ' data-reservar="' + hab.id + ':' + f + '" title="Reservar hab. ' + esc(hab.numero) + ' el ' + fCorta(f) + '"') + '></div>';
      }).join('');
      var barras = filas('reservas').filter(function (r) { return r.habitacion === hab.id && r.estado !== 'Cancelada' && r.desde < fin && r.hasta > desde; }).map(function (r) {
        var ini = r.desde < desde ? 0 : Motor.noches(desde, r.desde) * 2 + 1;
        var ter = r.hasta > fin ? dias * 2 : Motor.noches(desde, r.hasta) * 2 + 1;
        var cls = r.estado === 'En curso' ? 'curso' : r.estado;
        if (r.desde < desde) cls += ' corta-izq';
        if (r.hasta > fin) cls += ' corta-der';
        var nombre = et('clientes', r.cliente), corto = nombre.split(' ')[0] + (nombre.split(' ')[1] ? ' ' + nombre.split(' ')[1][0] + '.' : '');
        return '<button class="cal-reserva ' + cls + '" style="grid-column:' + (ini + 2) + '/' + (ter + 2) + '"' + (mini ? ' tabindex="-1"' : ' data-editar="reservas:' + r.id + '"') +
          ' title="' + esc(nombre + ' · ' + fCorta(r.desde) + ' al ' + fCorta(r.hasta) + ' · ' + r.estado) + '"><span>' + esc(ter - ini > 3 ? nombre : corto) + '</span></button>';
      }).join('');
      return '<div class="cal-fila"><div class="cal-hab"><b>' + esc(hab.numero) + '</b><span><i style="background:' + (colorEst[hab.estado] || 'var(--tinta-3)') + '"></i>' + esc(mini ? hab.tipo : hab.tipo + ' · ' + hab.estado) + '</span></div>' + celdas + barras + '</div>';
    }).join('');
    if (!filas('habitaciones').length) filasHtml = '<p class="vacio">Primero cargá tus habitaciones en el módulo Habitaciones.</p>';
    return '<div class="cal" style="--dias:' + dias + (mini ? ';--col-hab:84px' : '') + '"><div class="cal-grilla">' + cab + filasHtml + '</div></div>';
  }

  /* ---------- Agenda de turnos ---------- */
  function vistaAgenda() {
    var f = S.agFecha || hoy();
    return '<div class="herramientas"><div class="navfecha"><button class="btn btn-2 btn-icono" data-ag="-1" aria-label="Día anterior">' + ic('izq') + '</button>' +
      '<span class="rotulo">' + fLarga(f).replace(/^./, function (c) { return c.toUpperCase(); }) + '</span><button class="btn btn-2 btn-icono" data-ag="1" aria-label="Día siguiente">' + ic('der') + '</button></div>' +
      '<button class="btn btn-2 btn-chico" data-ag="hoy">Hoy</button><input type="date" class="btn btn-2 btn-chico" data-agfecha value="' + f + '" aria-label="Ir a una fecha"></div>' +
      '<section class="panel">' + htmlAgenda(f, false) +
      '<div class="leyenda"><span><i style="background:var(--verde-suave);border:1px solid var(--verde)"></i>Reservado</span><span><i style="background:var(--verde)"></i>Confirmado</span><span><i style="background:var(--gris-suave)"></i>Atendido</span><span><i style="background:var(--rojo-suave)"></i>Ausente</span><span>Tocá un horario libre para dar un turno</span></div></section>';
  }

  function htmlAgenda(fecha, mini) {
    var profs = filas('profesionales').slice().sort(ordenNat('nombre'));
    if (!profs.length) return '<p class="vacio">Primero cargá los profesionales que atienden.</p>';
    var desdeMin = Math.min.apply(null, profs.map(function (p) { return Motor.minutos(p.desde_hora || '09:00'); }));
    var hastaMin = Math.max.apply(null, profs.map(function (p) { return Motor.minutos(p.hasta_hora || '18:00'); }));
    desdeMin = Math.floor(desdeMin / 60) * 60; hastaMin = Math.ceil(hastaMin / 60) * 60;
    if (mini) { var ahora = new Date().getHours() * 60; desdeMin = Math.max(desdeMin, Math.min(ahora - 60, hastaMin - 300)); desdeMin = Math.floor(desdeMin / 60) * 60; hastaMin = Math.min(hastaMin, desdeMin + 300); }
    var px = mini ? 0.9 : 1.4, alto = (hastaMin - desdeMin) * px;
    var horas = '';
    for (var t = desdeMin; t <= hastaMin; t += 60) horas += '<span style="top:' + ((t - desdeMin) * px) + 'px">' + Motor.hhmm(t) + '</span>';
    var esHoy = fecha === hoy(), ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
    var cols = profs.map(function (p) {
      var pi = Motor.minutos(p.desde_hora || '00:00'), pf = Motor.minutos(p.hasta_hora || '23:59');
      var fuera = (pi > desdeMin ? '<div class="ag-fuera" style="top:0;height:' + ((pi - desdeMin) * px) + 'px"></div>' : '') +
        (pf < hastaMin ? '<div class="ag-fuera" style="top:' + ((pf - desdeMin) * px) + 'px;bottom:0"></div>' : '');
      var turnos = filas('turnos').filter(function (t) { return t.profesional === p.id && t.fecha === fecha && t.estado !== 'Cancelado'; }).map(function (t) {
        var s = Motor.buscar(S.db, 'servicios', t.servicio), dur = s ? num(s.duracion) || 30 : 30, ini = Motor.minutos(t.hora);
        if (ini + dur <= desdeMin || ini >= hastaMin) return '';
        var top = Math.max(0, ini - desdeMin) * px, h = Math.min(dur, hastaMin - ini) * px - 3;
        return '<button class="ag-turno ' + t.estado + '" style="top:' + top + 'px;height:' + h + 'px"' + (mini ? ' tabindex="-1"' : ' data-editar="turnos:' + t.id + '"') +
          ' title="' + esc(t.hora + ' ' + et('clientes', t.cliente) + ' · ' + (s ? s.nombre : '') + ' · ' + t.estado) + '"><b>' + t.hora + ' ' + esc(et('clientes', t.cliente)) + '</b>' + (h > 34 ? '<span>' + esc(s ? s.nombre : '') + '</span>' : '') + '</button>';
      }).join('');
      var linea = esHoy && ahoraMin > desdeMin && ahoraMin < hastaMin ? '<div class="ag-ahora" style="top:' + ((ahoraMin - desdeMin) * px) + 'px"></div>' : '';
      return '<div class="ag-col" style="height:' + alto + 'px"' + (mini ? '' : ' data-turno-col="' + p.id + '" data-desde="' + desdeMin + '" data-px="' + px + '"') + '>' + fuera + turnos + linea + '</div>';
    }).join('');
    var cab = '<div class="ag-cab" style="border-left:0"></div>' + profs.map(function (p) {
      return '<div class="ag-cab"><b>' + esc(p.nombre) + '</b><span>' + esc((p.especialidad ? p.especialidad + ' · ' : '') + (p.desde_hora || '') + ' a ' + (p.hasta_hora || '')) + '</span></div>';
    }).join('');
    return '<div class="agenda" style="--hora:' + (60 * px) + 'px"><div class="ag-grilla" style="--profs:' + profs.length + (mini ? ';min-width:0;grid-template-columns:44px repeat(var(--profs),minmax(0,1fr))' : '') + '">' + cab +
      '<div class="ag-horas" style="height:' + alto + 'px">' + horas + '</div>' + cols + '</div></div>';
  }

  /* ================= REPORTES ================= */
  function vistaReportes() {
    var mes = S.mesRep || mesDe(hoy()), h = hoy();
    var html = cabecera('Reportes', 'Cómo le fue al negocio en el mes', navMes('mesRep', mes));
    var caja = filas('caja').filter(function (c) { return mesDe(c.fecha) === mes; });
    var ing = caja.filter(function (c) { return c.tipo === 'Ingreso'; }), egr = caja.filter(function (c) { return c.tipo === 'Egreso'; });
    var sum = function (a, k) { return a.reduce(function (s, x) { return s + num(x[k || 'monto']); }, 0); };
    var p = mes.split('-'), diasMes = new Date(+p[0], +p[1], 0).getDate();
    var cifras = [cifra('Entró', plata(sum(ing)), ing.length + ' movimientos'), cifra('Salió', plata(sum(egr)), egr.length + ' movimientos'), cifra('Resultado', plata(sum(ing) - sum(egr)))];

    if (tiene('reservas') && tiene('habitaciones')) {
      var habs = filas('habitaciones').length || 1, nochesVend = 0, ingresoEst = 0;
      filas('reservas').forEach(function (r) {
        if (r.estado === 'Cancelada') return;
        var tot = Motor.noches(r.desde, r.hasta), porNoche = num(r.total) / (tot || 1);
        for (var i = 0; i < tot; i++) { var f = sumar(r.desde, i); if (mesDe(f) === mes) { nochesVend++; ingresoEst += porNoche; } }
      });
      cifras.push(cifra('Ocupación del mes', Math.round(nochesVend / (habs * diasMes) * 100) + '%', nochesVend + ' noches · tarifa prom. ' + plata(nochesVend ? ingresoEst / nochesVend : 0), nochesVend / (habs * diasMes) * 100));
    } else if (tiene('turnos')) {
      var tm = filas('turnos').filter(function (t) { return mesDe(t.fecha) === mes && t.fecha <= h; });
      var aus = tm.filter(function (t) { return t.estado === 'Ausente'; }).length, at = tm.filter(function (t) { return t.estado === 'Atendido'; }).length;
      cifras.push(cifra('Ausentismo', Math.round(aus / ((aus + at) || 1) * 100) + '%', aus + ' ausentes de ' + (aus + at) + ' turnos'));
    } else if (tiene('ventas')) {
      var vmes = filas('ventas').filter(function (v) { return mesDe(v.fecha) === mes; }), gan = 0;
      vmes.forEach(function (v) { var pr = Motor.buscar(S.db, 'productos', v.producto); gan += num(v.total) - (pr ? num(pr.costo) * num(v.cantidad) : 0); });
      cifras.push(cifra('Ganancia sobre costo', plata(gan), vmes.length + ' ventas'));
    }
    html += '<div class="cifras">' + cifras.join('') + '</div>';

    // Ingresos por día (una sola serie)
    var porDia = [], max = 0;
    for (var d = 1; d <= diasMes; d++) {
      var f = mes + '-' + p2(d), v = sum(ing.filter(function (c) { return c.fecha === f; }));
      porDia.push({ f: f, v: v }); if (v > max) max = v;
    }
    html += '<section class="panel" style="margin-bottom:20px"><div class="panel-cab"><h2>Lo que entró cada día</h2><span class="sub" style="color:var(--tinta-3);font-size:13.5px">Máximo ' + plata(max) + '</span></div>' +
      '<div class="columnas-dia" role="img" aria-label="Ingresos por día de ' + mesNombre(mes) + '">' + porDia.map(function (x) {
        return '<div class="col' + (x.f === h ? ' hoy' : '') + '" data-tip="' + fCorta(x.f) + ': ' + plata(x.v) + '"><i style="height:' + (max ? x.v / max * 100 : 0) + '%"></i></div>';
      }).join('') + '</div><div class="eje-dias"><span>1</span><span>' + Math.round(diasMes / 2) + '</span><span>' + diasMes + '</span></div></section>';

    var bloques = [];
    bloques.push(barras('Ingresos por medio de pago', agrupar(ing, function (c) { return c.medio || 'Sin dato'; }, 'monto'), plata));
    if (tiene('reservas')) {
      var rm = filas('reservas').filter(function (r) { return mesDe(r.desde) === mes && r.estado !== 'Cancelada'; });
      bloques.push(barras('Reservas por canal', agrupar(rm, function (r) { return r.canal || 'Sin dato'; }), function (n) { return n + (n === 1 ? ' reserva' : ' reservas'); }));
    }
    if (tiene('ventas')) {
      var vm2 = filas('ventas').filter(function (v) { return mesDe(v.fecha) === mes; });
      bloques.push(barras('Productos más vendidos', agrupar(vm2, function (v) { return et('productos', v.producto); }, 'total').slice(0, 8), plata));
    }
    if (tiene('turnos')) {
      var tm2 = filas('turnos').filter(function (t) { return mesDe(t.fecha) === mes && t.estado === 'Atendido'; });
      bloques.push(barras('Turnos atendidos por profesional', agrupar(tm2, function (t) { return et('profesionales', t.profesional); }), function (n) { return n + ' turnos'; }));
    }
    if (tiene('honorarios')) {
      var hc = filas('honorarios').filter(function (x) { return x.estado === 'Cobrado'; }).map(function (x) {
        var mv = filas('caja').filter(function (c) { return c.origen === 'honorario:' + x.id; })[0]; return { cli: x.cliente, f: mv ? mv.fecha : '', monto: x.monto };
      }).filter(function (x) { return mesDe(x.f) === mes; });
      bloques.push(barras(nombreMod('honorarios') + ' cobrados por cliente', agrupar(hc, function (x) { return et('clientes', x.cli); }, 'monto').slice(0, 8), plata));
    }
    if (tiene('vencimientos')) {
      var vm3 = filas('vencimientos').filter(function (v) { return mesDe(v.fecha) === mes; });
      bloques.push(barras('Vencimientos del mes por obligación', agrupar(vm3, function (v) { return v.obligacion; }), function (n) { return n + (n === 1 ? ' vencimiento' : ' vencimientos'); }));
    }
    if (tiene('proyectos')) bloques.push(barras('Facturado por tipo de trabajo', agrupar(filas('proyectos').filter(function (p) { return p.estado !== 'Propuesta'; }), function (p) { return p.tipo || 'Otro'; }, 'presupuesto'), plata));
    if (tiene('tareas')) {
      var hp = filas('tareas').filter(function (t) { return mesDe(t.fecha || '') === mes && num(t.horas) > 0; });
      bloques.push(barras('Horas trabajadas por proyecto', agrupar(hp, function (t) { return et('proyectos', t.proyecto); }, 'horas').slice(0, 8), function (n) { return n + ' h'; }));
    }
    if (tiene('expedientes')) bloques.push(barras('Expedientes por fuero', agrupar(filas('expedientes'), function (e) { return e.fuero || 'Sin fuero'; }), function (n) { return n + (n === 1 ? ' expediente' : ' expedientes'); }));
    bloques.push(barras('En qué se fue la plata', agrupar(egr, function (c) { return c.concepto; }, 'monto').slice(0, 6), plata));
    html += '<div class="columnas">' + bloques.join('') + '</div>';
    return html;
  }
  function agrupar(lista, clave, campo) {
    var o = {};
    lista.forEach(function (x) { var k = clave(x); o[k] = (o[k] || 0) + (campo ? num(x[campo]) : 1); });
    return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function barras(titulo, datos, fmt) {
    var max = datos.length ? datos[0][1] : 0;
    return '<section class="panel"><div class="panel-cab"><h2>' + titulo + '</h2></div>' + (datos.length ? '<div class="barras">' + datos.map(function (d) {
      return '<div class="barra" title="' + esc(d[0] + ': ' + fmt(d[1])) + '"><span class="n">' + esc(d[0]) + '</span><span class="riel"><i style="width:' + (max ? d[1] / max * 100 : 0) + '%"></i></span><span class="v">' + fmt(d[1]) + '</span></div>';
    }).join('') + '</div>' : '<p class="vacio">Sin datos en este mes.</p>') + '</section>';
  }

  /* ================= AJUSTES ================= */
  function vistaAjustes() {
    var html = cabecera('Ajustes', 'Tu negocio, los módulos que ves y quién puede entrar');
    html += '<div class="ajustes">';
    html += '<section class="panel"><div class="panel-cab"><h2>Tu negocio</h2></div><div class="panel-cuerpo" style="display:grid;gap:14px">' +
      '<div class="par"><div class="campo"><label for="aj-nombre">Nombre</label><input id="aj-nombre" value="' + esc(S.empresa.nombre) + '"></div>' +
      '<div class="campo"><label>Rubro principal</label><input value="' + esc(R[S.empresa.rubro].nombre) + '" readonly></div></div>' +
      '<div><button class="btn btn-1" data-guardar-nombre>Guardar nombre</button></div></div></section>';
    html += '<section class="panel"><div class="panel-cab"><h2>Módulos</h2><span style="color:var(--tinta-3);font-size:13.5px">Prendé los que uses, aunque sean de otro rubro</span></div>';
    var usados = {};
    Object.keys(R).forEach(function (k) {
      var mods = R[k].modulos.filter(function (m) { return !usados[m]; });
      mods.forEach(function (m) { usados[m] = 1; });
      if (!mods.length) return;
      html += '<div class="grupo-mod"><h3>' + R[k].nombre + '</h3><div class="interruptores">' + mods.map(function (m) {
        return '<label class="interruptor"><input type="checkbox" data-modulo="' + m + '"' + (tiene(m) ? ' checked' : '') + '>' + ic(M[m].icono) + '<span>' + esc(nombreMod(m)) + '</span></label>';
      }).join('') + '</div></div>';
    });
    html += '</section>';
    html += '<section class="panel"><div class="panel-cab"><h2>Personas con acceso</h2></div><div id="aj-usuarios"><p class="vacio">Cargando…</p></div></section>';
    if (S.modo === 'demo') html += '<section class="panel"><div class="panel-cab"><h2>Datos de la demo</h2></div><div class="panel-cuerpo" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><p style="flex:1;min-width:220px;color:var(--tinta-2)">Si cambiaste o borraste cosas, podés volver a los datos de ejemplo.</p><button class="btn btn-2" data-reiniciar>Volver a los datos de ejemplo</button></div></section>';
    html += '</div>';
    setTimeout(cargarUsuarios, 0);
    return html;
  }
  function cargarUsuarios() {
    var el = document.getElementById('aj-usuarios');
    if (!el) return;
    S.api.usuarios(S.empresa.id).then(function (r) {
      el.innerHTML = '<ul class="lista">' + r.usuarios.map(function (u) {
        return '<li><span class="usuario"><span class="avatar">' + esc(iniciales(u.nombre || u.email)) + '</span></span><div class="txt"><b>' + esc(u.nombre || u.email) + '</b><span>' + esc(u.email) + '</span></div>' + chipEstado('', u.rol === 'dueño' ? 'Dueño' : 'Empleado').replace('e-gris', u.rol === 'dueño' ? 'e-verde' : 'e-gris') +
          (S.modo === 'real' && u.rol !== 'dueño' && S.empresa.rol === 'dueño' ? '<button class="btn btn-peligro btn-chico" data-quitar-usuario="' + esc(u.email) + '">Quitar</button>' : '') + '</li>';
      }).join('') + '</ul>' +
        (S.modo === 'demo' ? '<div class="tabla-pie">En tu cuenta real vas a poder sumar empleados con su mail de Google.</div>' :
          S.empresa.rol === 'dueño' ? '<div class="panel-cuerpo" style="border-top:1px solid var(--linea);display:flex;gap:8px;flex-wrap:wrap"><div class="campo" style="flex:1;min-width:220px"><label for="aj-mail" class="oculto">Mail de Google</label><input id="aj-mail" type="email" placeholder="mail@gmail.com"></div><button class="btn btn-2" data-sumar-usuario>Dar acceso</button></div>' : '');
      conectar(el);
    }).catch(function (e) { el.innerHTML = '<p class="vacio">' + esc(e.message) + '</p>'; });
  }

  /* ================= Formulario lateral ================= */
  function cerrarCapa() { $capa.innerHTML = ''; document.body.style.overflow = ''; }
  function abrirCapa(html, dialogo) {
    $capa.innerHTML = '<div class="fondo" data-cerrar></div><div class="' + (dialogo ? 'dialogo' : 'cajon') + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.style.overflow = 'hidden';
    $capa.querySelectorAll('[data-cerrar]').forEach(function (b) { b.onclick = cerrarCapa; });
    var primero = $capa.querySelector('input:not([readonly]), select, textarea, .cajon-pie .btn-1');
    if (primero) setTimeout(function () { primero.focus(); }, 30);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $capa.innerHTML) cerrarCapa(); });

  function campoHtml(m, c, v, fila) {
    var id = 'f-' + c.k, req = c.req && !c.soloLectura ? ' <span class="req" aria-hidden="true">*</span>' : '';
    var lab = '<label for="' + id + '">' + esc(etiquetaCampo(m, c)) + req + '</label>';
    var ayuda = c.ayuda ? '<span class="ayuda">' + esc(c.ayuda) + '</span>' : '';
    var ro = c.soloLectura ? ' readonly' : '', input;
    if (c.tipo === 'select') {
      input = '<select id="' + id + '" name="' + c.k + '">' + (c.req ? '' : '<option value="">—</option>') + c.opciones.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    } else if (c.tipo === 'ref') {
      var ops = filas(c.ref).slice();
      if (c.ref === 'reservas') ops = ops.filter(function (r) { return r.estado === 'En curso' || r.id === v; });
      ops.sort(function (a, b) { return et(c.ref, a.id).localeCompare(et(c.ref, b.id), 'es', { numeric: true }); });
      input = '<select id="' + id + '" name="' + c.k + '"><option value="">' + (c.req ? 'Elegí una opción' : '—') + '</option>' + ops.map(function (o) {
        var extra = c.ref === 'productos' ? ' · ' + plata(o.precio) + ' · stock ' + o.stock : c.ref === 'habitaciones' ? ' · ' + o.tipo + ' · ' + plata(o.tarifa) : c.ref === 'servicios' ? ' · ' + o.duracion + ' min' : '';
        return '<option value="' + esc(o.id) + '"' + (o.id === v ? ' selected' : '') + '>' + esc(et(c.ref, o.id) + extra) + '</option>';
      }).join('') + '</select>';
    } else if (c.tipo === 'largo') {
      input = '<textarea id="' + id + '" name="' + c.k + '">' + esc(v) + '</textarea>';
    } else {
      var t = { fecha: 'date', hora: 'time', numero: 'number', dinero: 'number', email: 'email', tel: 'tel' }[c.tipo] || 'text';
      input = '<input id="' + id + '" name="' + c.k + '" type="' + t + '" value="' + esc(v) + '"' + ro + (c.tipo === 'dinero' ? ' step="0.01" min="0" inputmode="decimal"' : c.tipo === 'numero' ? (c.decimales ? ' step="any" inputmode="decimal"' : ' step="1" inputmode="numeric"') : '') + (c.tipo === 'hora' ? ' step="900"' : '') + '>';
    }
    if (m === 'productos' && c.k === 'codigo') input = '<div class="con-boton">' + input + '<button type="button" class="btn btn-2 btn-icono" data-escanear-campo="' + id + '" aria-label="Escanear código con la cámara" title="Escanear con la cámara">' + ic('camara') + '</button></div>';
    return '<div class="campo">' + lab + input + ayuda + '</div>';
  }

  function abrirForm(m, id, preset) {
    var def = M[m], fila = id ? Motor.buscar(S.db, m, id) : null;
    if (id && !fila) return aviso('Ese registro ya no existe.', true);
    var datos = fila ? Object.assign({}, fila) : Object.assign(Motor.nuevaFila(m, hoy()), preset || {});
    var titulo = (fila ? 'Editar ' : 'Nuevo ') + singularMod(m);
    if (m === 'caja' && !fila) titulo = 'Nuevo movimiento';
    if (fila && m === 'reservas') titulo = 'Reserva de ' + et('clientes', fila.cliente);
    if (fila && m === 'turnos') titulo = 'Turno de ' + et('clientes', fila.cliente);
    var visibles = def.campos.filter(function (c) { return GEBRO.campoVisible(c, S.empresa.rubro) && !(c.soloLectura && !fila) && !(c.k === 'origen' && !datos.origen); });
    var cuerpo = '', i = 0;
    while (i < visibles.length) {
      var c = visibles[i], s = visibles[i + 1];
      var corto = function (x) { return x && ['fecha', 'hora', 'numero', 'dinero', 'select'].indexOf(x.tipo) >= 0; };
      if (corto(c) && corto(s)) { cuerpo += '<div class="par">' + campoHtml(m, c, datos[c.k], fila) + campoHtml(m, s, datos[s.k], fila) + '</div>'; i += 2; }
      else { cuerpo += campoHtml(m, c, datos[c.k], fila); i++; }
    }
    var extra = '';
    if (fila && m === 'reservas') {
      var cta = Motor.cuentaReserva(S.db, fila.id);
      extra = '<div class="nota">' + Motor.noches(fila.desde, fila.hasta) + ' noches · estadía ' + plata(cta.estadia) + ' · seña ' + plata(cta.sena) + ' · consumos pendientes ' + plata(cta.totalConsumos) + ' · <b>saldo ' + plata(cta.saldo) + '</b></div>';
    }
    if (fila && m === 'clientes' && S.empresa.rubro === 'contadores' && fila.documento) {
      var soloCuit = String(fila.documento).replace(/\D/g, '');
      extra += '<div class="nota cuit"><span>CUIT <b>' + esc(fila.documento) + '</b></span><button type="button" class="btn btn-2 btn-chico" data-copiar="' + soloCuit + '">Copiar</button>' +
        '<a class="btn btn-2 btn-chico" href="https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do" target="_blank" rel="noopener">' + ic('enlace') + 'Constancia en ARCA</a></div>';
    }
    if (fila && m === 'clientes' && tiene('proyectos')) {
      var susP = filas('proyectos').filter(function (p) { return p.cliente === fila.id; });
      var susC = tiene('honorarios') ? filas('honorarios').filter(function (x) { return x.cliente === fila.id; }) : [];
      var cob = susC.filter(function (x) { return x.estado === 'Cobrado'; }).reduce(function (a, x) { return a + num(x.monto); }, 0);
      var pen = susC.filter(function (x) { return x.estado !== 'Cobrado'; }).reduce(function (a, x) { return a + num(x.monto); }, 0);
      extra += '<div class="ficha-cliente"><div class="ficha-cifras"><span><small>Proyectos</small><b>' + susP.length + '</b></span><span><small>Cobrado</small><b>' + plata(cob) + '</b></span><span><small>Falta cobrar</small><b>' + plata(pen) + '</b></span></div>' +
        (susP.length ? '<ul class="ficha-proyectos">' + susP.map(function (p) {
          return '<li data-abrir="proyectos:' + p.id + '"><div><b>' + esc(p.nombre) + '</b><small>' + esc(p.tipo || '') + (p.entrega ? ' · entrega ' + fCorta(p.entrega) : '') + '</small></div>' + chipEstado('', p.estado) + '</li>';
        }).join('') + '</ul>' : '<p class="ayuda-chica">Todavía no tiene proyectos.</p>') +
        '<button type="button" class="btn btn-2 btn-chico" data-nuevo-de="proyectos:cliente:' + fila.id + '">' + ic('mas') + 'Nuevo proyecto para este cliente</button></div>';
    }
    if (fila && m === 'proyectos') {
      var tp = tiene('tareas') ? filas('tareas').filter(function (t) { return t.proyecto === fila.id; }) : [];
      var cp = tiene('honorarios') ? filas('honorarios').filter(function (x) { return x.proyecto === fila.id; }) : [];
      var horas = tp.reduce(function (a, t) { return a + num(t.horas); }, 0), cobP = cp.filter(function (x) { return x.estado === 'Cobrado'; }).reduce(function (a, x) { return a + num(x.monto); }, 0);
      extra += '<div class="ficha-cliente"><div class="ficha-cifras"><span><small>Tareas hechas</small><b>' + tp.filter(function (t) { return t.estado === 'Hecha'; }).length + ' de ' + tp.length + '</b></span><span><small>Horas</small><b>' + horas + '</b></span><span><small>Cobrado</small><b>' + plata(cobP) + '</b></span></div>' +
        (tp.length ? '<ul class="ficha-proyectos">' + tp.map(function (t) {
          return '<li data-abrir="tareas:' + t.id + '"><div><b>' + esc(t.tarea) + '</b><small>' + (t.fecha ? fCorta(t.fecha) : 'sin fecha') + (t.horas !== '' ? ' · ' + t.horas + ' h' : '') + '</small></div>' + chipEstado('', t.estado) + '</li>';
        }).join('') + '</ul>' : '') +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-2 btn-chico" data-nuevo-de="tareas:proyecto:' + fila.id + '">' + ic('mas') + 'Tarea</button>' +
        '<button type="button" class="btn btn-2 btn-chico" data-nuevo-de="honorarios:proyecto:' + fila.id + ':' + fila.cliente + '">' + ic('mas') + 'Cobro</button></div></div>';
    }
    if (fila && fila.origen) extra += '<div class="nota">Este movimiento se anotó solo desde ' + esc(fila.origen.split(':')[0]) + ' ' + esc(fila.origen.split(':')[1]) + '. Para cambiarlo, editá el original.</div>';
    var acciones = (def.acciones || []).filter(function (a) { return fila && Motor.accionDisponible(m, a.id, fila); });
    abrirCapa(
      '<div class="cajon-cab"><h2>' + esc(titulo) + '</h2><button class="btn btn-3 btn-icono" data-cerrar aria-label="Cerrar">' + ic('cerrar') + '</button></div>' +
      '<form class="cajon-cuerpo" id="formulario" novalidate>' + extra + cuerpo + '<div id="form-error"></div><button type="submit" hidden></button></form>' +
      '<div class="cajon-pie">' + (fila && !(fila.origen) ? '<button class="btn btn-peligro" id="f-borrar">Borrar</button>' : '') +
      acciones.map(function (a) { return '<button class="btn btn-2" data-accion="' + m + ':' + a.id + ':' + fila.id + '">' + esc(a.label) + '</button>'; }).join('') +
      '<div class="der"><button class="btn btn-3" data-cerrar>Cancelar</button>' + (fila && fila.origen ? '' : '<button class="btn btn-1" id="f-guardar">' + (fila ? 'Guardar cambios' : 'Guardar') + '</button>') + '</div></div>'
    );
    conectar($capa);
    var form = document.getElementById('formulario');
    // Ayudas en vivo
    if (m === 'ventas') {
      var actualizar = function () {
        var p = Motor.buscar(S.db, 'productos', form.producto.value), pu = form.precio_unit.value || (p ? p.precio : 0);
        if (form.total) form.total.value = Math.round(num(form.cantidad.value) * num(pu) * 100) / 100 || '';
        if (p && !form.precio_unit.value) form.precio_unit.placeholder = plata(p.precio);
      };
      ['producto', 'cantidad', 'precio_unit'].forEach(function (k) { form[k].addEventListener('input', actualizar); });
      actualizar();
    }
    if (m === 'reservas') {
      var calc = function () {
        var hab = Motor.buscar(S.db, 'habitaciones', form.habitacion.value), n = form.desde.value && form.hasta.value ? Motor.noches(form.desde.value, form.hasta.value) : 0;
        form.total.placeholder = hab && n > 0 ? plata(num(hab.tarifa) * n) + ' (' + n + ' noches)' : '';
      };
      ['habitacion', 'desde', 'hasta'].forEach(function (k) { form[k].addEventListener('input', calc); });
      form.desde.addEventListener('change', function () { if (!form.hasta.value || form.hasta.value <= form.desde.value) { form.hasta.value = sumar(form.desde.value, 1); calc(); } });
      calc();
    }
    var guardar = function (e) {
      if (e) e.preventDefault();
      var entrada = { id: fila ? fila.id : '' };
      def.campos.forEach(function (c) { if (form[c.k] && !c.soloLectura) entrada[c.k] = form[c.k].value; else if (fila) entrada[c.k] = fila[c.k]; });
      var b = document.getElementById('f-guardar'); b.disabled = true; b.textContent = 'Guardando…';
      ejecutar(S.api.guardar(S.empresa.id, m, entrada), function (r) {
        cerrarCapa();
        if (m === 'productos' && S.volverVenta) { var cv = S.volverVenta; S.volverVenta = null; setTimeout(function () { ventaRapida(cv); }, 60); }
        aviso((fila ? 'Cambios guardados' : (m === 'caja' ? 'Movimiento guardado' : singularMod(m).replace(/^./, function (x) { return x.toUpperCase(); }) + ' guardad' + (/a$|ión$/.test(singularMod(m)) ? 'a' : 'o'))) + '.' + (r.avisos && r.avisos.length ? ' ' + r.avisos.join(' ') : ''));
      }, function (msg) {
        document.getElementById('form-error').innerHTML = '<p class="error" role="alert">' + esc(msg) + '</p>';
        b.disabled = false; b.textContent = fila ? 'Guardar cambios' : 'Guardar';
      });
    };
    form.onsubmit = guardar;
    var bg = document.getElementById('f-guardar'); if (bg) bg.onclick = guardar;
    var bb = document.getElementById('f-borrar');
    if (bb) bb.onclick = function () {
      if (bb.dataset.seguro !== '1') { bb.dataset.seguro = '1'; bb.textContent = 'Tocá de nuevo para borrar'; return; }
      ejecutar(S.api.borrar(S.empresa.id, m, fila.id), function () { cerrarCapa(); aviso('Borrado.'); }, function (msg) {
        document.getElementById('form-error').innerHTML = '<p class="error" role="alert">' + esc(msg) + '</p>'; bb.dataset.seguro = ''; bb.textContent = 'Borrar';
      });
    };
  }

  // Corre una operación y sincroniza los datos locales
  function ejecutar(promesa, ok, mal) {
    return promesa.then(function (r) {
      if (S.modo === 'demo') return S.api.todo().then(function (t) { S.db = t.db; S.empresa = t.empresa; return r; });
      if (r.cambios) { Demo.aplicar(S.db, { cambios: r.cambios }); return r; }
      return recargar().then(function () { return r; });
    }).then(function (r) { ok(r); refrescarMenu(); dibujar(); })
      .catch(function (e) { mal ? mal(e.message) : aviso(e.message, true); });
  }
  function refrescarMenu() {
    var a = document.querySelector('.menu a[href$="/productos"] .cuenta'), n = tiene('productos') ? filas('productos').filter(function (p) { return num(p.stock) <= num(p.stock_min); }).length : 0;
    if (a) { a.textContent = n; a.hidden = !n; }
  }

  function correrAccion(m, acc, id) {
    var f = Motor.buscar(S.db, m, id);
    var medios = '<div class="campo"><label for="ac-medio">Medio de pago</label><select id="ac-medio">' + GEBRO.MEDIOS.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>';
    if (acc === 'checkout') {
      var cta = Motor.cuentaReserva(S.db, id);
      abrirCapa('<div class="cajon-cab"><h2>Check-out de ' + esc(et('clientes', f.cliente)) + '</h2><button class="btn btn-3 btn-icono" data-cerrar aria-label="Cerrar">' + ic('cerrar') + '</button></div>' +
        '<div class="cajon-cuerpo"><table class="cuenta-tabla"><tr><td>Estadía · ' + Motor.noches(f.desde, f.hasta) + ' noches</td><td>' + plata(cta.estadia) + '</td></tr>' +
        cta.consumos.map(function (c) { return '<tr><td>' + esc(c.concepto) + ' · ' + fCorta(c.fecha) + '</td><td>' + plata(c.monto) + '</td></tr>'; }).join('') +
        (cta.sena ? '<tr><td>Seña ya cobrada</td><td>−' + plata(cta.sena) + '</td></tr>' : '') +
        '<tr class="total"><td>A cobrar</td><td>' + plata(cta.saldo) + '</td></tr></table>' + (cta.saldo > 0 ? medios : '') + '<div id="form-error"></div></div>' +
        '<div class="cajon-pie"><div class="der"><button class="btn btn-3" data-cerrar>Cancelar</button><button class="btn btn-1" id="ac-ok">Cobrar y cerrar</button></div></div>', true);
    } else if (acc === 'atendido') {
      var s = Motor.buscar(S.db, 'servicios', f.servicio);
      abrirCapa('<div class="cajon-cab"><h2>' + esc(et('clientes', f.cliente)) + '</h2><button class="btn btn-3 btn-icono" data-cerrar aria-label="Cerrar">' + ic('cerrar') + '</button></div>' +
        '<div class="cajon-cuerpo"><table class="cuenta-tabla"><tr><td>' + esc(s ? s.nombre : 'Servicio') + ' · ' + f.hora + '</td><td>' + plata(s ? s.precio : 0) + '</td></tr></table>' + (s && num(s.precio) > 0 ? medios : '') + '<div id="form-error"></div></div>' +
        '<div class="cajon-pie"><div class="der"><button class="btn btn-3" data-cerrar>Cancelar</button><button class="btn btn-1" id="ac-ok">Marcar atendido</button></div></div>', true);
    } else {
      return ejecutar(S.api.accion(S.empresa.id, m, acc, id, {}), function (r) { cerrarCapa(); aviso(r.mensaje); });
    }
    document.getElementById('ac-ok').onclick = function () {
      var med = document.getElementById('ac-medio'); this.disabled = true;
      ejecutar(S.api.accion(S.empresa.id, m, acc, id, { medio: med ? med.value : 'Efectivo' }), function (r) { cerrarCapa(); aviso(r.mensaje); },
        function (msg) { document.getElementById('form-error').innerHTML = '<p class="error">' + esc(msg) + '</p>'; });
    };
  }

  /* ================= Eventos ================= */
  function conectar(raiz) {
    raiz.querySelectorAll('[data-nuevo]').forEach(function (b) { b.onclick = function () { abrirForm(b.dataset.nuevo); }; });
    raiz.querySelectorAll('[data-abrir]').forEach(function (b) { b.onclick = function () { var p = b.dataset.abrir.split(':'); abrirForm(p[0], p[1]); }; });
    raiz.querySelectorAll('[data-nuevo-de]').forEach(function (b) {
      b.onclick = function () {
        var p = b.dataset.nuevoDe.split(':'), pre = {}; pre[p[1]] = p[2];
        if (p[3]) pre.cliente = p[3];
        abrirForm(p[0], null, pre);
      };
    });
    raiz.querySelectorAll('[data-copiar]').forEach(function (b) {
      b.onclick = function () {
        var t = b.dataset.copiar;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { aviso('CUIT copiado: ' + t); }, function () { aviso('Copialo a mano: ' + t); });
      };
    });
    raiz.querySelectorAll('[data-venta-rapida]').forEach(function (b) { b.onclick = function () { ventaRapida(); }; });
    raiz.querySelectorAll('[data-escanear-campo]').forEach(function (b) {
      b.onclick = function () { var inp = document.getElementById(b.dataset.escanearCampo); abrirCamara(function (cod) { inp.value = cod; inp.dispatchEvent(new Event('input')); aviso('Código leído: ' + cod); return true; }); };
    });
    raiz.querySelectorAll('[data-editar]').forEach(function (b) {
      var go = function (e) { if (e.target.closest('[data-accion]')) return; var p = b.dataset.editar.split(':'); abrirForm(p[0], p[1]); };
      b.onclick = go;
      if (b.tagName === 'TR' || b.tagName === 'LI') b.onkeydown = function (e) { if (e.key === 'Enter') go(e); };
    });
    raiz.querySelectorAll('[data-accion]').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); var p = b.dataset.accion.split(':'); if ($capa.innerHTML) cerrarCapa(); correrAccion(p[0], p[1], p[2]); };
    });
    raiz.querySelectorAll('[data-reservar]').forEach(function (c) {
      c.onclick = function () { var p = c.dataset.reservar.split(':'); abrirForm('reservas', null, { habitacion: p[0], desde: p[1], hasta: sumar(p[1], 1) }); };
    });
    raiz.querySelectorAll('[data-turno-col]').forEach(function (c) {
      c.onclick = function (e) {
        if (e.target !== c && !e.target.classList.contains('ag-fuera')) return;
        var y = e.clientY - c.getBoundingClientRect().top, min = +c.dataset.desde + y / +c.dataset.px;
        min = Math.floor(min / 15) * 15;
        abrirForm('turnos', null, { profesional: c.dataset.turnoCol, fecha: S.agFecha || hoy(), hora: Motor.hhmm(min) });
      };
    });
    raiz.querySelectorAll('[data-vista]').forEach(function (b) { b.onclick = function () { var p = b.dataset.vista.split(':'); S.vistaMod[p[0]] = p[1]; dibujar(); }; });
    raiz.querySelectorAll('[data-cal]').forEach(function (b) {
      b.onclick = function () { S.calDesde = b.dataset.cal === 'hoy' ? null : sumar(S.calDesde || sumar(hoy(), -2), +b.dataset.cal); dibujar(); };
    });
    raiz.querySelectorAll('[data-ag]').forEach(function (b) {
      b.onclick = function () { S.agFecha = b.dataset.ag === 'hoy' ? null : sumar(S.agFecha || hoy(), +b.dataset.ag); dibujar(); };
    });
    raiz.querySelectorAll('[data-agfecha]').forEach(function (i) { i.onchange = function () { if (i.value) { S.agFecha = i.value; dibujar(); } }; });
    raiz.querySelectorAll('[data-mes]').forEach(function (b) {
      b.onclick = function () { var p = b.dataset.mes.split(':'); S[p[0]] = sumarMes(S[p[0]] || mesDe(hoy()), +p[1]); dibujar(); };
    });
    raiz.querySelectorAll('[data-buscar]').forEach(function (i) {
      i.oninput = function () {
        S.busqueda[i.dataset.buscar] = i.value; var pos = i.selectionStart; dibujar();
        var n = document.querySelector('[data-buscar="' + i.dataset.buscar + '"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
      };
    });
    raiz.querySelectorAll('[data-filtro]').forEach(function (b) { b.onclick = function () { var p = b.dataset.filtro.split(':'); S.filtros[p[0]] = p[1]; dibujar(); }; });
    raiz.querySelectorAll('[data-mas]').forEach(function (b) { b.onclick = function () { S.limite[b.dataset.mas] = (S.limite[b.dataset.mas] || 100) + 200; dibujar(); }; });
    raiz.querySelectorAll('[data-modulo]').forEach(function (c) {
      c.onchange = function () {
        var mods = Array.prototype.map.call(document.querySelectorAll('[data-modulo]:checked'), function (x) { return x.dataset.modulo; });
        // Un módulo necesita los que referencia (reservas → habitaciones y clientes)
        mods.slice().forEach(function (m) { M[m].campos.forEach(function (f) { if (f.tipo === 'ref' && f.req && mods.indexOf(f.ref) < 0) mods.push(f.ref); }); });
        if (!mods.length) { c.checked = true; return aviso('Dejá al menos un módulo prendido.', true); }
        S.api.ajustes(S.empresa.id, { modulos: mods }).then(function (r) { S.empresa = r.empresa; pantalla('ajustes'); aviso('Módulos actualizados.'); }).catch(function (e) { aviso(e.message, true); });
      };
    });
    raiz.querySelectorAll('[data-guardar-nombre]').forEach(function (b) {
      b.onclick = function () {
        var n = document.getElementById('aj-nombre').value.trim(); if (!n) return aviso('Escribí un nombre.', true);
        S.api.ajustes(S.empresa.id, { nombre: n }).then(function (r) { S.empresa = r.empresa; pantalla('ajustes'); aviso('Nombre guardado.'); }).catch(function (e) { aviso(e.message, true); });
      };
    });
    raiz.querySelectorAll('[data-reiniciar]').forEach(function (b) {
      b.onclick = function () { S.api.reiniciar().then(function () { S.db = null; entrarDemo(S.rubroDemo, 'inicio'); location.hash = base() + '/inicio'; aviso('Volviste a los datos de ejemplo.'); }); };
    });
    raiz.querySelectorAll('[data-sumar-usuario]').forEach(function (b) {
      b.onclick = function () {
        var mail = document.getElementById('aj-mail').value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return aviso('Escribí un mail válido.', true);
        S.api.usuarios(S.empresa.id, 'sumar', { email: mail }).then(function () { aviso('Listo: ' + mail + ' ya puede ingresar.'); cargarUsuarios(); }).catch(function (e) { aviso(e.message, true); });
      };
    });
    raiz.querySelectorAll('[data-quitar-usuario]').forEach(function (b) {
      b.onclick = function () { S.api.usuarios(S.empresa.id, 'quitar', { email: b.dataset.quitarUsuario }).then(function () { aviso('Acceso quitado.'); cargarUsuarios(); }).catch(function (e) { aviso(e.message, true); }); };
    });
  }

  var anchoPrevio = ancho();
  window.addEventListener('resize', function () {
    var a = ancho();
    if ((a < 600) !== (anchoPrevio < 600) || (a < 1100) !== (anchoPrevio < 1100)) { if (S.modo && S.db) dibujar(); else if (!S.modo) vitrina(); }
    anchoPrevio = a;
  });

  /* ================= Código de barras (comercio) ================= */
  function botonVentaRapida() { return '<button class="btn btn-1" data-venta-rapida>' + ic('barras') + 'Venta rápida</button>'; }
  S.carrito = [];

  function pitido() {
    try {
      var A = window.AudioContext || window.webkitAudioContext, a = new A(), o = a.createOscillator(), g = a.createGain();
      o.frequency.value = 1350; g.gain.value = 0.08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.09);
      setTimeout(function () { a.close(); }, 300);
    } catch (e) { }
  }

  function porCodigo(cod) {
    cod = String(cod).trim();
    return filas('productos').filter(function (p) { return String(p.codigo).trim() === cod; })[0] || null;
  }

  function ventaRapida(codigoInicial) {
    var mensaje = '', coincidencias = [];
    function total() { return S.carrito.reduce(function (s, it) { return s + it.cant * it.precio; }, 0); }
    function agregar(txt) {
      txt = String(txt || '').trim(); mensaje = ''; coincidencias = [];
      if (!txt) return pintar();
      var p = porCodigo(txt);
      if (!p) {
        var q = txt.toLowerCase();
        var lista = filas('productos').filter(function (x) { return String(x.nombre).toLowerCase().indexOf(q) >= 0; });
        if (lista.length === 1) p = lista[0];
        else if (lista.length > 1) { coincidencias = lista.slice(0, 8); return pintar(); }
      }
      if (!p) {
        mensaje = /^\d{4,}$/.test(txt) ? '<div class="error" role="alert">No hay ningún producto con el código ' + esc(txt) + '. <button class="btn btn-2 btn-chico" data-crear-codigo="' + esc(txt) + '">Crearlo ahora</button></div>' : '<div class="error" role="alert">No encontré "' + esc(txt) + '".</div>';
        return pintar();
      }
      var it = S.carrito.filter(function (x) { return x.pid === p.id; })[0];
      if (it) it.cant++; else S.carrito.push({ pid: p.id, cant: 1, precio: num(p.precio) });
      pitido(); pintar(p.id);
    }
    function pintar(resaltar) {
      var cuerpo = document.getElementById('vr-cuerpo');
      if (!cuerpo) return;
      cuerpo.innerHTML = mensaje +
        (coincidencias.length ? '<div class="panel"><div class="panel-cab"><h2>¿Cuál de estos?</h2></div><ul class="lista">' + coincidencias.map(function (p) {
          return '<li class="clic" data-elegir="' + p.id + '"><div class="txt"><b>' + esc(p.nombre) + '</b><span>' + esc(p.codigo || 'sin código') + ' · stock ' + p.stock + '</span></div><span class="monto">' + plata(p.precio) + '</span></li>';
        }).join('') + '</ul></div>' : '') +
        (S.carrito.length ? '<ul class="ticket">' + S.carrito.map(function (it, i) {
          var p = Motor.buscar(S.db, 'productos', it.pid) || { nombre: '(borrado)', stock: 0 };
          return '<li' + (it.pid === resaltar ? ' class="recien"' : '') + '><div class="txt"><b>' + esc(p.nombre) + '</b><span>' + plata(it.precio) + ' c/u' + (num(p.stock) < it.cant ? ' · <em>quedan ' + p.stock + '</em>' : '') + '</span></div>' +
            '<div class="cantidad"><button class="btn btn-2 btn-icono" data-cant="' + i + ':-1" aria-label="Uno menos">' + ic('menos') + '</button><span>' + it.cant + '</span><button class="btn btn-2 btn-icono" data-cant="' + i + ':1" aria-label="Uno más">' + ic('mas') + '</button></div>' +
            '<span class="monto">' + plata(it.cant * it.precio) + '</span></li>';
        }).join('') + '</ul>' : '<div class="vacio-scan">' + ic('barras') + '<p>Pasá el lector por el código del producto, o escribí el código o el nombre y apretá Enter.</p></div>');
      document.getElementById('vr-total').textContent = plata(total());
      document.getElementById('vr-cobrar').disabled = !S.carrito.length;
      document.getElementById('vr-items').textContent = S.carrito.reduce(function (s, x) { return s + x.cant; }, 0) + ' productos';
      cuerpo.querySelectorAll('[data-cant]').forEach(function (b) {
        b.onclick = function () { var p = b.dataset.cant.split(':'), it = S.carrito[+p[0]]; it.cant += +p[1]; if (it.cant <= 0) S.carrito.splice(+p[0], 1); pintar(); foco(); };
      });
      cuerpo.querySelectorAll('[data-elegir]').forEach(function (b) {
        b.onclick = function () { var p = Motor.buscar(S.db, 'productos', b.dataset.elegir); agregar(p.codigo || p.nombre); foco(); };
      });
      cuerpo.querySelectorAll('[data-crear-codigo]').forEach(function (b) {
        b.onclick = function () { S.volverVenta = b.dataset.crearCodigo; abrirForm('productos', null, { codigo: b.dataset.crearCodigo }); };
      });
    }
    function foco() { var i = document.getElementById('vr-codigo'); if (i) i.focus(); }

    abrirCapa(
      '<div class="cajon-cab"><h2>Venta rápida</h2><button class="btn btn-3 btn-icono" data-cerrar aria-label="Cerrar">' + ic('cerrar') + '</button></div>' +
      '<div class="escaner"><label class="oculto" for="vr-codigo">Código o nombre del producto</label>' +
      '<div class="escaner-campo">' + ic('barras') + '<input id="vr-codigo" autocomplete="off" placeholder="Escaneá o escribí el código" inputmode="search"></div>' +
      '<button class="btn btn-2" id="vr-camara">' + ic('camara') + '<span>Cámara</span></button></div>' +
      '<div class="cajon-cuerpo" id="vr-cuerpo"></div>' +
      '<div class="cajon-pie vr-pie"><div class="vr-total"><span id="vr-items"></span><b id="vr-total"></b></div>' +
      '<div class="campo"><label for="vr-medio" class="oculto">Medio de pago</label><select id="vr-medio">' + GEBRO.MEDIOS.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="der"><button class="btn btn-3" id="vr-vaciar">Vaciar</button><button class="btn btn-1" id="vr-cobrar">Cobrar</button></div></div>');
    var inp = document.getElementById('vr-codigo');
    inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); agregar(inp.value); inp.value = ''; } };
    document.getElementById('vr-camara').onclick = function () { abrirCamara(function (cod) { agregar(cod); return false; }, true); };
    document.getElementById('vr-vaciar').onclick = function () { S.carrito = []; mensaje = ''; pintar(); foco(); };
    document.getElementById('vr-cobrar').onclick = function () {
      var b = this, medio = document.getElementById('vr-medio').value, items = S.carrito.slice(), tot = total();
      b.disabled = true; b.textContent = 'Cobrando…';
      if (S.api.guardarVarios) {
        return ejecutar(S.api.guardarVarios(S.empresa.id, 'ventas', items.map(function (it) {
          return { fecha: hoy(), producto: it.pid, cantidad: it.cant, precio_unit: it.precio, medio: medio };
        })), function () { S.carrito = []; cerrarCapa(); aviso('Venta cobrada: ' + plata(tot) + ' en ' + medio.toLowerCase() + '.'); },
          function (msg) { mensaje = '<div class="error" role="alert">' + esc(msg) + '</div>'; pintar(); b.disabled = false; b.textContent = 'Cobrar'; });
      }
      var cadena = Promise.resolve();
      items.forEach(function (it) {
        cadena = cadena.then(function () {
          return S.api.guardar(S.empresa.id, 'ventas', { fecha: hoy(), producto: it.pid, cantidad: it.cant, precio_unit: it.precio, medio: medio }).then(function (r) {
            S.carrito.splice(S.carrito.indexOf(it), 1);
            if (S.modo !== 'demo' && r.cambios) Demo.aplicar(S.db, { cambios: r.cambios });
          });
        });
      });
      ejecutar(cadena.then(function () { return {}; }), function () { cerrarCapa(); aviso('Venta cobrada: ' + plata(tot) + ' en ' + medio.toLowerCase() + '.'); },
        function (msg) { mensaje = '<div class="error" role="alert">' + esc(msg) + '</div>'; pintar(); b.disabled = false; b.textContent = 'Cobrar'; });
    };
    pintar();
    if (codigoInicial) agregar(codigoInicial);
    setTimeout(foco, 40);
  }

  // Lector USB: escribe muy rápido y termina con Enter. Si pasa fuera de un campo, abre la venta rápida.
  var lector = { txt: '', t: 0 };
  document.addEventListener('keydown', function (e) {
    if (!S.modo || !S.db || !tiene('ventas') || $capa.innerHTML) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    var ahora = Date.now();
    if (ahora - lector.t > 80) lector.txt = '';
    lector.t = ahora;
    if (e.key === 'Enter') { if (lector.txt.length >= 6) { e.preventDefault(); ventaRapida(lector.txt); } lector.txt = ''; return; }
    if (e.key.length === 1 && /[0-9A-Za-z-]/.test(e.key)) lector.txt += e.key;
  });

  function cargarZXing() {
    if (window.ZXing) return Promise.resolve();
    return new Promise(function (ok, mal) {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'; s.onload = ok; s.onerror = function () { mal(new Error('No se pudo cargar el lector de códigos.')); };
      document.head.appendChild(s);
    });
  }

  // EAN-13, EAN-8, UPC-A (12) y UPC-E (8): números con dígito verificador
  function codigoValido(c) {
    if (!/^\d{8}$|^\d{12,13}$/.test(c)) return false;
    var d = c.split('').map(Number), ver = d.pop(), s = 0;
    d.reverse().forEach(function (x, i) { s += x * (i % 2 === 0 ? 3 : 1); });
    if ((10 - s % 10) % 10 === ver) return true;
    return c.length === 8 && /^[01]/.test(c); // UPC-E usa otro cálculo; se acepta si arranca en 0 o 1
  }

  // Abre la cámara y avisa cada código leído. Si onCodigo devuelve false, sigue escaneando.
  function abrirCamara(onCodigo, continuo) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return aviso('Este navegador no deja usar la cámara. Usá un lector o escribí el código.', true);
    var cap = document.createElement('div');
    cap.className = 'camara';
    cap.innerHTML = '<div class="camara-caja"><video playsinline muted></video><div class="camara-mira"></div>' +
      '<p id="cam-txt">Apuntá al código de barras</p><button class="btn btn-1">' + (continuo ? 'Listo' : 'Cerrar cámara') + '</button></div>';
    document.body.appendChild(cap);
    var video = cap.querySelector('video'), stream = null, vivo = true, ultimo = '', ultimoT = 0, zx = null;
    function cerrar() {
      vivo = false;
      if (zx) try { zx.reset(); } catch (e) { }
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      cap.remove();
      var i = document.getElementById('vr-codigo'); if (i) i.focus();
    }
    cap.querySelector('button').onclick = cerrar;
    var candidato = '', vecesCandidato = 0;
    function leido(cod) {
      cod = String(cod || '').trim();
      // Solo códigos de productos (EAN/UPC) con dígito verificador correcto
      if (!codigoValido(cod)) return;
      // Hay que leer el mismo número dos veces seguidas para aceptarlo
      if (cod !== candidato) { candidato = cod; vecesCandidato = 1; return; }
      if (++vecesCandidato < 2) return;
      var t = Date.now();
      if (cod === ultimo && t - ultimoT < 2500) return;
      ultimo = cod; ultimoT = t; candidato = ''; vecesCandidato = 0;
      var p = porCodigo(cod);
      document.getElementById('cam-txt').textContent = p ? 'Agregado: ' + p.nombre : 'Leí el código ' + cod + ', pero no está en tus productos.';
      cap.classList.add('ok'); setTimeout(function () { cap.classList.remove('ok'); }, 400);
      if (onCodigo(cod) !== false) cerrar();
    }
    var restricciones = { audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } };
    navigator.mediaDevices.getUserMedia(restricciones).then(function (st) {
      stream = st;
      if (!vivo) return cerrar();
      var pista = st.getVideoTracks()[0], cap2 = pista.getCapabilities ? pista.getCapabilities() : {};
      // Enfoque continuo y linterna, si el teléfono los tiene
      if (cap2.focusMode && cap2.focusMode.indexOf('continuous') >= 0) pista.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(function () { });
      if (cap2.torch) {
        var bl = document.createElement('button'); bl.className = 'btn btn-2'; bl.textContent = 'Linterna'; var prendida = false;
        bl.onclick = function () { prendida = !prendida; pista.applyConstraints({ advanced: [{ torch: prendida }] }).catch(function () { }); bl.textContent = prendida ? 'Apagar linterna' : 'Linterna'; };
        cap.querySelector('.camara-caja').appendChild(bl);
      }
      var nativo = 'BarcodeDetector' in window ? BarcodeDetector.getSupportedFormats().catch(function () { return []; }) : Promise.resolve([]);
      return nativo.then(function (formatos) {
        var queridos = ['ean_13', 'ean_8', 'upc_a', 'upc_e'].filter(function (f) { return formatos.indexOf(f) >= 0; });
        if (queridos.indexOf('ean_13') >= 0) {
          video.srcObject = st;
          return video.play().then(function () {
            var det = new BarcodeDetector({ formats: queridos });
            (function bucle() {
              if (!vivo) return;
              det.detect(video).then(function (r) { if (r.length) leido(r[0].rawValue); }).catch(function () { }).then(function () { if (vivo) setTimeout(bucle, 150); });
            })();
          });
        }
        return cargarZXing().then(function () {
          var Z = ZXing, pistas = new Map();
          pistas.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
          pistas.set(Z.DecodeHintType.TRY_HARDER, true);
          zx = new Z.BrowserMultiFormatReader(pistas, 200);
          zx.decodeFromStream(st, video, function (res) { if (res && vivo) leido(res.getText()); });
        });
      });
    }).catch(function (e) {
      cerrar();
      aviso(e && e.name === 'NotAllowedError' ? 'Tenés que permitir el uso de la cámara para escanear.' : (e.message || 'No se pudo abrir la cámara.'), true);
    });
  }


  ruta();
})();
