/* Gebro — modo demo: los datos viven en el navegador (localStorage) y se arman con las mismas
 * reglas que usa el backend real. Sirve para mostrar el sistema sin registrarse.
 */
var Demo = (function () {
  var NOMBRES = ['Lucía Fernández', 'Martín Gómez', 'Sofía Romero', 'Julián Acosta', 'Valentina Ruiz', 'Tomás Herrera',
    'Camila Molina', 'Facundo Díaz', 'Agustina Sosa', 'Nicolás Benítez', 'Florencia Castro', 'Matías Ortiz',
    'Rocío Medina', 'Santiago Rojas', 'Paula Aguirre', 'Federico Luna', 'Micaela Peralta', 'Joaquín Vera',
    'Carolina Ríos', 'Ezequiel Godoy'];

  var EMPRESAS = {
    hoteleria: 'Hostería Los Aromos',
    comercio: 'Almacén La Esquina',
    servicios: 'Consultorio Sierras'
  };

  function azar(semilla) {
    var s = semilla;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function aplicar(db, r) {
    if (!r || r.error) throw new Error(r ? r.error : 'sin resultado');
    r.cambios.forEach(function (c) {
      var filas = db[c.m] = db[c.m] || [];
      var i = filas.findIndex(function (f) { return f.id === c.fila.id; });
      if (c.op === 'del') { if (i >= 0) filas.splice(i, 1); }
      else if (i >= 0) filas[i] = c.fila; else filas.push(c.fila);
    });
    return r;
  }

  function crearClientes(db, hoy, n) {
    for (var i = 0; i < n; i++) {
      aplicar(db, Motor.guardar(db, 'clientes', {
        nombre: NOMBRES[i], documento: String(20000000 + i * 734521 % 25000000),
        telefono: '249 4' + String(100000 + i * 37717 % 899999)
      }, { hoy: hoy }));
    }
  }

  function semilla(rubro, hoy) {
    var db = {}, rnd = azar(7 + rubro.length), d = function (n) { return Motor.sumarDias(hoy, n); };
    var ctx = function (h, medio) { return { hoy: h || hoy, medio: medio || 'Efectivo' }; };

    if (rubro === 'hoteleria') {
      crearClientes(db, hoy, 20);
      [['1', 'Single', 1, 52000], ['2', 'Doble', 2, 68000], ['3', 'Doble', 2, 68000], ['4', 'Doble', 2, 72000],
       ['5', 'Triple', 3, 85000], ['6', 'Triple', 3, 85000], ['7', 'Cuádruple', 4, 98000], ['8', 'Suite', 2, 115000],
       ['9', 'Doble', 2, 72000], ['10', 'Cuádruple', 4, 98000]].forEach(function (h) {
        aplicar(db, Motor.guardar(db, 'habitaciones', { numero: h[0], tipo: h[1], capacidad: h[2], tarifa: h[3], estado: 'Disponible' }, ctx()));
      });
      var canales = ['Directo', 'WhatsApp', 'Booking', 'Teléfono', 'Booking', 'Airbnb'], ci = 0;
      db.habitaciones.slice().forEach(function (h, hi) {
        var dia = -12 + Math.floor(rnd() * 4);
        while (dia < 24) {
          var largo = 1 + Math.floor(rnd() * 4), hueco = Math.floor(rnd() * 3);
          if (rnd() < 0.18) { dia += largo + 2; continue; }
          var desde = d(dia), hasta = d(dia + largo);
          var r = aplicar(db, Motor.guardar(db, 'reservas', {
            habitacion: h.id, cliente: db.clientes[(hi * 3 + ci) % 20].id, desde: desde, hasta: hasta,
            personas: Math.min(h.capacidad, 1 + Math.floor(rnd() * h.capacidad) + 1), canal: canales[ci % canales.length],
            estado: dia > 3 && rnd() < 0.3 ? 'Pendiente' : 'Confirmada', sena: rnd() < 0.6 ? Math.round(h.tarifa * 0.3 / 1000) * 1000 : ''
          }, ctx(d(Math.min(dia - 5, 0)))));
          ci++;
          var id = r.fila.id;
          if (dia + largo <= 0) { // ya terminó
            aplicar(db, Motor.accion(db, 'reservas', 'checkin', id, ctx(desde)));
            if (rnd() < 0.5) aplicar(db, Motor.guardar(db, 'consumos', { reserva: id, fecha: desde, concepto: 'Frigobar', monto: 4500 + Math.floor(rnd() * 4) * 1500 }, ctx()));
            aplicar(db, Motor.accion(db, 'reservas', 'checkout', id, ctx(hasta, rnd() < 0.5 ? 'Transferencia' : 'Efectivo')));
          } else if (dia <= 0) { // en curso
            aplicar(db, Motor.accion(db, 'reservas', 'checkin', id, ctx(desde)));
            aplicar(db, Motor.guardar(db, 'consumos', { reserva: id, fecha: desde, concepto: 'Cena', monto: 18500 }, ctx()));
            if (rnd() < 0.6) aplicar(db, Motor.guardar(db, 'consumos', { reserva: id, fecha: hoy, concepto: 'Lavandería', monto: 6000 }, ctx()));
          }
          dia += largo + hueco;
        }
      });
      // Una habitación en limpieza y una en mantenimiento para que se vean los estados
      var limpias = 0;
      db.habitaciones.forEach(function (h) {
        if (h.estado === 'Limpieza' && ++limpias > 2) h.estado = 'Disponible';
      });
      [['Compra de blanquería', 186000, -6], ['Servicio de luz', 94000, -3], ['Proveedor de desayunos', 132000, -1]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }

    if (rubro === 'comercio') {
      crearClientes(db, hoy, 10);
      [['779001', 'Yerba mate 1 kg', 'Almacén', 4300, 3100, 36, 10], ['779002', 'Azúcar 1 kg', 'Almacén', 1350, 950, 40, 12],
       ['779003', 'Fideos tirabuzón 500 g', 'Almacén', 1250, 820, 50, 15], ['779004', 'Aceite girasol 1,5 l', 'Almacén', 3900, 2900, 18, 8],
       ['779005', 'Arroz largo fino 1 kg', 'Almacén', 1900, 1300, 30, 10], ['779006', 'Harina 0000 1 kg', 'Almacén', 1100, 760, 4, 10],
       ['779007', 'Galletitas de agua', 'Almacén', 1500, 1000, 45, 12], ['779008', 'Dulce de leche 400 g', 'Almacén', 2600, 1800, 22, 6],
       ['779009', 'Leche entera 1 l', 'Lácteos', 1450, 1050, 3, 12], ['779010', 'Yogur bebible 1 l', 'Lácteos', 2300, 1600, 14, 6],
       ['779011', 'Queso cremoso x kg', 'Lácteos', 9800, 7200, 9, 3], ['779012', 'Manteca 200 g', 'Lácteos', 2900, 2100, 11, 4],
       ['779013', 'Gaseosa cola 2,25 l', 'Bebidas', 3600, 2500, 26, 10], ['779014', 'Agua mineral 2 l', 'Bebidas', 1300, 800, 40, 12],
       ['779015', 'Cerveza lata 473 cc', 'Bebidas', 1900, 1250, 60, 24], ['779016', 'Vino tinto 750 ml', 'Bebidas', 5200, 3600, 16, 6],
       ['779017', 'Lavandina 1 l', 'Limpieza', 1200, 780, 20, 6], ['779018', 'Detergente 750 ml', 'Limpieza', 2100, 1450, 2, 6],
       ['779019', 'Papel higiénico x4', 'Limpieza', 3300, 2350, 19, 8], ['779020', 'Jabón en polvo 800 g', 'Limpieza', 4700, 3300, 8, 4],
       ['779021', 'Pan lactal', 'Panificados', 2800, 1950, 12, 5], ['779022', 'Medialunas x6', 'Panificados', 3000, 1700, 0, 0]
      ].forEach(function (p) {
        aplicar(db, Motor.guardar(db, 'productos', { codigo: p[0], nombre: p[1], categoria: p[2], precio: p[3], costo: p[4], stock: p[5] + 40, stock_min: p[6] }, ctx()));
      });
      var medios = ['Efectivo', 'Efectivo', 'Débito', 'Mercado Pago', 'Transferencia', 'Crédito'];
      for (var dia = -34; dia <= 0; dia++) {
        var n = dia === 0 ? 7 : 4 + Math.floor(rnd() * 8);
        for (var k = 0; k < n; k++) {
          var p = db.productos[Math.floor(rnd() * db.productos.length)];
          if (Motor.num(p.stock) <= 4 + Math.floor(rnd() * 3)) continue;
          aplicar(db, Motor.guardar(db, 'ventas', {
            fecha: d(dia), producto: p.id, cantidad: 1 + Math.floor(rnd() * 3), medio: medios[Math.floor(rnd() * medios.length)],
            cliente: rnd() < 0.2 ? db.clientes[Math.floor(rnd() * 10)].id : ''
          }, ctx(d(dia))));
        }
      }
      // Dejar algunos productos por debajo del mínimo para que se vea el aviso
      db.productos.forEach(function (p) { if (['779006', '779009', '779018', '779022'].indexOf(p.codigo) >= 0) p.stock = [4, 3, 2, 0][['779006', '779009', '779018', '779022'].indexOf(p.codigo)]; });
      [['Distribuidora del Centro', 'Raúl Paz', 'Almacén y bebidas'], ['Lácteos La Serrana', 'Mónica Ibarra', 'Lácteos'],
       ['Panadería El Trigal', 'Hugo Ferreyra', 'Panificados'], ['Limpieza Total', 'Andrea Quiroga', 'Artículos de limpieza']
      ].forEach(function (p, i) {
        aplicar(db, Motor.guardar(db, 'proveedores', { nombre: p[0], contacto: p[1], rubro: p[2], telefono: '249 45' + (11200 + i * 3311) }, ctx()));
      });
      [['Pago a Distribuidora del Centro', 420000, -20], ['Alquiler del local', 650000, -15], ['Pago a Lácteos La Serrana', 185000, -8], ['Luz e internet', 98000, -4]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }

    if (rubro === 'servicios') {
      crearClientes(db, hoy, 20);
      [['Dra. Laura Méndez', 'Clínica médica', '08:00', '14:00'], ['Lic. Pablo Ferraro', 'Kinesiología', '09:00', '18:00'],
       ['Lic. Inés Galván', 'Nutrición', '13:00', '19:00']].forEach(function (p) {
        aplicar(db, Motor.guardar(db, 'profesionales', { nombre: p[0], especialidad: p[1], desde_hora: p[2], hasta_hora: p[3] }, ctx()));
      });
      [['Consulta clínica', 30, 28000], ['Control', 15, 15000], ['Sesión de kinesiología', 45, 22000],
       ['Primera consulta nutricional', 60, 32000], ['Control nutricional', 30, 20000]].forEach(function (s) {
        aplicar(db, Motor.guardar(db, 'servicios', { nombre: s[0], duracion: s[1], precio: s[2] }, ctx()));
      });
      var porProf = { F1: ['S1', 'S2'], F2: ['S3'], F3: ['S4', 'S5'] };
      for (var dd = -10; dd <= 12; dd++) {
        var fecha = d(dd), dow = new Date(fecha + 'T12:00:00Z').getUTCDay();
        if (dow === 0 || dow === 6) continue;
        db.profesionales.forEach(function (p) {
          var t = Motor.minutos(p.desde_hora), fin = Motor.minutos(p.hasta_hora);
          while (t < fin) {
            var sid = porProf[p.id][Math.floor(rnd() * porProf[p.id].length)], s = Motor.buscar(db, 'servicios', sid);
            var dur = Motor.num(s.duracion);
            if (t + dur > fin) break;
            var ocupar = dd < 0 ? 0.75 : dd === 0 ? 0.7 : Math.max(0.15, 0.7 - dd * 0.05);
            if (rnd() < ocupar) {
              var r = Motor.guardar(db, 'turnos', {
                fecha: fecha, hora: Motor.hhmm(t), profesional: p.id, servicio: sid,
                cliente: db.clientes[Math.floor(rnd() * 20)].id, estado: dd > 0 && rnd() < 0.5 ? 'Confirmado' : 'Reservado'
              }, ctx());
              if (!r.error) {
                aplicar(db, r);
                if (dd < 0 || (dd === 0 && t < 11 * 60)) aplicar(db, Motor.accion(db, 'turnos', rnd() < 0.9 ? 'atendido' : 'ausente', r.fila.id, ctx(fecha, rnd() < 0.5 ? 'Transferencia' : 'Efectivo')));
              }
            }
            t += dur + (rnd() < 0.3 ? 15 : 0);
          }
        });
      }
      [['Alquiler del consultorio', 480000, -9], ['Insumos descartables', 76000, -5], ['Limpieza', 60000, -2]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }
    return db;
  }

  /* ---------- API con la misma forma que la del backend real ---------- */
  function clave(rubro) { return 'gebro_demo_v1_' + rubro; }
  function leer(rubro) { try { return JSON.parse(localStorage.getItem(clave(rubro)) || 'null'); } catch (e) { return null; } }
  function escribir(rubro, est) { try { localStorage.setItem(clave(rubro), JSON.stringify(est)); } catch (e) { /* sin almacenamiento: queda en memoria */ } }
  var memoria = {};

  function estado(rubro, hoy) {
    var e = memoria[rubro] || leer(rubro);
    if (!e || e.hoy !== hoy) { // cada día se vuelve a armar alrededor de la fecha de hoy
      e = {
        hoy: hoy,
        empresa: { id: 'demo-' + rubro, nombre: EMPRESAS[rubro], rubro: rubro, modulos: GEBRO.RUBROS[rubro].modulos.slice(), plan: 'Demo', rol: 'dueño' },
        db: semilla(rubro, hoy)
      };
      escribir(rubro, e);
    }
    memoria[rubro] = e;
    return e;
  }

  function demora(v) { return new Promise(function (ok) { setTimeout(function () { ok(v); }, 120); }); }

  function api(rubro, hoyFn) {
    function est() { return estado(rubro, hoyFn()); }
    function correr(r) {
      if (r.error) return Promise.reject(new Error(r.error));
      var e = est(); aplicar(e.db, r); escribir(rubro, e);
      return demora(r);
    }
    return {
      modo: 'demo',
      yo: function () { var e = est(); return demora({ email: 'demo@gebro.app', nombre: 'Demo', empresas: [e.empresa] }); },
      todo: function () { var e = est(); return demora({ empresa: e.empresa, db: JSON.parse(JSON.stringify(e.db)) }); },
      guardar: function (_, modulo, fila) { return correr(Motor.guardar(est().db, modulo, fila, { hoy: hoyFn() })); },
      borrar: function (_, modulo, id) { return correr(Motor.borrar(est().db, modulo, id)); },
      accion: function (_, modulo, acc, id, extra) { return correr(Motor.accion(est().db, modulo, acc, id, { hoy: hoyFn(), medio: (extra || {}).medio })); },
      ajustes: function (_, cambios) {
        var e = est();
        if (cambios.nombre) e.empresa.nombre = cambios.nombre;
        if (cambios.modulos) e.empresa.modulos = cambios.modulos;
        escribir(rubro, e); return demora({ empresa: e.empresa });
      },
      usuarios: function () { return demora({ usuarios: [{ email: 'demo@gebro.app', rol: 'dueño', nombre: 'Vos' }] }); },
      reiniciar: function () { delete memoria[rubro]; try { localStorage.removeItem(clave(rubro)); } catch (e) { } return demora({}); }
    };
  }

  return { api: api, semilla: semilla, aplicar: aplicar, EMPRESAS: EMPRESAS };
})();
