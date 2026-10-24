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
    servicios: 'Consultorio Sierras',
    ferreteria: 'Ferretería El Tornillo',
    farmacia: 'Farmacia Del Centro',
    contadores: 'Estudio Contable Ríos & Asoc.',
    abogados: 'Estudio Jurídico Méndez',
    freelancer: 'Martina Paz · Diseño y desarrollo'
  };

  function cuit(pre, dni) {
    var b = String(pre) + String(dni).padStart(8, '0'), pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], s = 0;
    for (var i = 0; i < 10; i++) s += (+b[i]) * pesos[i];
    var v = 11 - s % 11; if (v === 11) v = 0; if (v === 10) v = 9;
    return b + v;
  }

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

    if (rubro === 'ferreteria' || rubro === 'farmacia') {
      crearClientes(db, hoy, 12);
      var prods = rubro === 'ferreteria' ? [
        ['7790101', 'Tornillo autoperforante 8x1" (x100)', 'Fijaciones', 'Caja', 6800, 4300, 30, 8],
        ['7790102', 'Taco Fischer 8 mm (x50)', 'Fijaciones', 'Bolsa', 3200, 1900, 25, 8],
        ['7790103', 'Clavo punta paris 2"', 'Fijaciones', 'Kilo', 5400, 3500, 40, 10],
        ['7790104', 'Cable unipolar 2,5 mm', 'Electricidad', 'Metro', 950, 560, 300, 100],
        ['7790105', 'Llave de luz punto simple', 'Electricidad', 'Unidad', 2900, 1700, 18, 6],
        ['7790106', 'Cinta aisladora 20 m', 'Electricidad', 'Unidad', 1800, 900, 3, 10],
        ['7790107', 'Caño PVC 110 mm (4 m)', 'Sanitarios', 'Unidad', 14500, 9800, 12, 4],
        ['7790108', 'Sellador siliconado 280 ml', 'Sanitarios', 'Unidad', 6200, 3900, 2, 6],
        ['7790109', 'Látex interior 20 l', 'Pinturería', 'Unidad', 78000, 56000, 6, 2],
        ['7790110', 'Rodillo antigota 22 cm', 'Pinturería', 'Unidad', 8900, 5200, 9, 3],
        ['7790111', 'Martillo carpintero 27 mm', 'Herramientas', 'Unidad', 15800, 9900, 7, 2],
        ['7790112', 'Destornillador Phillips PH2', 'Herramientas', 'Unidad', 4900, 2800, 14, 4],
        ['7790113', 'Mecha widia 8 mm', 'Herramientas', 'Unidad', 3600, 2100, 1, 5],
        ['7790114', 'Cemento 50 kg', 'Construcción', 'Bolsa', 13900, 10800, 40, 10],
        ['7790115', 'Arena fina', 'Construcción', 'Bolsa', 4200, 2600, 55, 15]
      ] : [
        ['7795301', 'Ibuprofeno 400 mg x 20', 'Analgésicos', 'Libre', 'Laboratorio Norte', 5900, 3600, 60, 15, 300],
        ['7795302', 'Paracetamol 500 mg x 20', 'Analgésicos', 'Libre', 'Laboratorio Norte', 3900, 2300, 80, 20, 420],
        ['7795303', 'Amoxicilina 500 mg x 16', 'Antibióticos', 'Bajo receta', 'Farma Sur', 12800, 8100, 22, 8, 180],
        ['7795304', 'Losartán 50 mg x 30', 'Cardiología', 'Bajo receta', 'Farma Sur', 9800, 6000, 35, 10, 25],
        ['7795305', 'Omeprazol 20 mg x 28', 'Digestivos', 'Libre', 'Laboratorio Norte', 7400, 4400, 4, 10, 260],
        ['7795306', 'Clonazepam 0,5 mg x 30', 'Psicofármacos', 'Receta archivada', 'Andes Pharma', 8600, 5100, 12, 5, 400],
        ['7795307', 'Alcohol en gel 250 ml', 'Higiene', 'Libre', 'Cuidado Total', 3100, 1700, 40, 12, 600],
        ['7795308', 'Protector solar FPS 50', 'Dermocosmética', 'Libre', 'Cuidado Total', 21500, 14200, 9, 4, 12],
        ['7795309', 'Pañales talle G x 30', 'Bebés', 'Libre', 'Cuidado Total', 18900, 13500, 2, 6, 700],
        ['7795310', 'Termómetro digital', 'Accesorios', 'Libre', 'MedTec', 7900, 4600, 11, 3, 900],
        ['7795311', 'Jarabe para la tos 120 ml', 'Respiratorio', 'Libre', 'Laboratorio Norte', 8200, 5100, 15, 5, 40],
        ['7795312', 'Vitamina C 1 g x 10', 'Suplementos', 'Libre', 'Andes Pharma', 4600, 2700, 28, 8, 90]
      ];
      prods.forEach(function (p) {
        var f = rubro === 'ferreteria'
          ? { codigo: p[0], nombre: p[1], categoria: p[2], unidad: p[3], precio: p[4], costo: p[5], stock: p[6] + 30, stock_min: p[7] }
          : { codigo: p[0], nombre: p[1], categoria: p[2], receta: p[3], laboratorio: p[4], precio: p[5], costo: p[6], stock: p[7] + 30, stock_min: p[8], vence: d(p[9]) };
        aplicar(db, Motor.guardar(db, 'productos', f, ctx()));
      });
      var med = ['Efectivo', 'Débito', 'Mercado Pago', 'Transferencia', 'Crédito'];
      for (var dv = -30; dv <= 0; dv++) {
        var nv = 3 + Math.floor(rnd() * 7);
        for (var kv = 0; kv < nv; kv++) {
          var pv = db.productos[Math.floor(rnd() * db.productos.length)];
          var cant = pv.unidad === 'Metro' ? 5 + Math.floor(rnd() * 20) : pv.unidad === 'Kilo' ? 0.5 + Math.floor(rnd() * 4) * 0.5 : 1 + Math.floor(rnd() * 2);
          if (Motor.num(pv.stock) <= cant + 3) continue;
          aplicar(db, Motor.guardar(db, 'ventas', { fecha: d(dv), producto: pv.id, cantidad: cant, medio: med[Math.floor(rnd() * med.length)] }, ctx(d(dv))));
        }
      }
      db.productos.forEach(function (p, i) { if (i % 5 === 2) p.stock = Math.max(0, Motor.num(p.stock_min) - 2); });
      (rubro === 'ferreteria' ? [['Distribuidora Bulonera', 'Carlos Ibáñez', 'Fijaciones'], ['Electro Mayorista', 'Laura Pérez', 'Electricidad'], ['Pinturas del Sur', 'Diego Sosa', 'Pinturería']]
        : [['Droguería Central', 'Marta Gil', 'Medicamentos'], ['Distribuidora Salud', 'Pablo Ruiz', 'Perfumería e higiene']]).forEach(function (p, i) {
        aplicar(db, Motor.guardar(db, 'proveedores', { nombre: p[0], contacto: p[1], rubro: p[2], telefono: '249 45' + (21300 + i * 4417) }, ctx()));
      });
      if (rubro === 'ferreteria') {
        [['Ampliación de baño: caños, sellador y accesorios', 186500, -6, 'Aceptado'], ['Instalación eléctrica cocina: 60 m de cable, 6 llaves', 98400, -3, 'Enviado'],
         ['Pintura de frente: 3 latas de látex y rodillos', 251000, -1, 'Enviado'], ['Materiales para contrapiso', 412000, -18, 'Vencido']].forEach(function (q, i) {
          aplicar(db, Motor.guardar(db, 'presupuestos', { fecha: d(q[2]), cliente: db.clientes[i + 2].id, detalle: q[0], total: q[1], valido_hasta: d(q[2] + 10), estado: q[3] }, ctx()));
        });
      } else {
        db.clientes.forEach(function (c, i) { c.obra_social = ['PAMI', 'OSDE', 'IOMA', 'Swiss Medical', 'OSECAC', ''][i % 6]; });
      }
      [['Pago a proveedor', 380000, -12], ['Alquiler del local', 720000, -10], ['Luz e internet', 115000, -4]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }

    if (rubro === 'contadores') {
      var conds = ['Monotributo', 'Monotributo', 'Responsable inscripto', 'Monotributo', 'Responsable inscripto', 'Relación de dependencia'];
      NOMBRES.slice(0, 14).forEach(function (n, i) {
        aplicar(db, Motor.guardar(db, 'clientes', { nombre: n, documento: cuit(i % 3 ? 20 : 27, 17254000 + i * 731117 % 25000000), condicion: conds[i % conds.length], telefono: '249 4' + String(200000 + i * 51113 % 799999) }, ctx()));
      });
      aplicar(db, Motor.guardar(db, 'clientes', { nombre: 'Panadería La Espiga SRL', documento: cuit(30, 71234567), condicion: 'Responsable inscripto' }, ctx()));
      var mes = hoy.slice(5, 7), anio = hoy.slice(0, 4), prevM = ('0' + ((+mes + 10) % 12 + 1)).slice(-2);
      db.clientes.forEach(function (c, i) {
        var fv = d(-5 + (i * 3) % 22);
        var obl = c.condicion === 'Monotributo' ? 'Monotributo' : c.condicion === 'Responsable inscripto' ? 'IVA' : 'Ganancias';
        var est = fv < hoy ? (rnd() < 0.85 ? 'Pagado' : 'Pendiente') : rnd() < 0.3 ? 'Presentado' : 'Pendiente';
        aplicar(db, Motor.guardar(db, 'vencimientos', { fecha: fv, cliente: c.id, obligacion: obl, periodo: prevM + '/' + anio, monto: obl === 'Monotributo' ? [37000, 42000, 58000][i % 3] : 120000 + i * 23000, estado: est }, ctx()));
        if (c.condicion === 'Responsable inscripto') aplicar(db, Motor.guardar(db, 'vencimientos', { fecha: Motor.sumarDias(fv, 3), cliente: c.id, obligacion: 'Ingresos Brutos', periodo: prevM + '/' + anio, estado: 'Pendiente' }, ctx()));
        var abono = c.condicion === 'Responsable inscripto' ? 95000 : 45000;
        aplicar(db, Motor.guardar(db, 'honorarios', { cliente: c.id, concepto: 'Abono mensual', periodo: prevM + '/' + anio, monto: abono, vence: anio + '-' + mes + '-10' }, ctx()));
        var hr = db.honorarios[db.honorarios.length - 1];
        if (rnd() < 0.65) aplicar(db, Motor.accion(db, 'honorarios', 'cobrar', hr.id, { hoy: anio + '-' + mes + '-' + ('0' + (5 + i % 10)).slice(-2), medio: 'Transferencia' }));
      });
      [['Alquiler de la oficina', 540000, -14], ['Suscripción software contable', 68000, -8]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }

    if (rubro === 'abogados') {
      crearClientes(db, hoy, 12);
      [['Fernández, Lucía c/ Seguros del Plata S.A. s/ daños y perjuicios', 'Civil', 'Juzgado Civil y Comercial N.º 2'],
       ['Gómez, Martín c/ Transportes Andinos SRL s/ despido', 'Laboral', 'Tribunal de Trabajo N.º 1'],
       ['Romero, Sofía s/ sucesión ab intestato', 'Civil', 'Juzgado Civil y Comercial N.º 1'],
       ['Acosta, Julián y Ruiz, Valentina s/ divorcio', 'Familia', 'Juzgado de Familia N.º 1'],
       ['Herrera, Tomás c/ Banco Regional S.A. s/ amparo', 'Comercial', 'Juzgado Civil y Comercial N.º 3'],
       ['Molina, Camila c/ Municipalidad s/ pretensión anulatoria', 'Contencioso administrativo', 'Juzgado Contencioso Administrativo'],
       ['Díaz, Facundo s/ jubilación', 'Previsional', 'Juzgado Federal'],
       ['Sosa, Agustina c/ Inmobiliaria Centro s/ cumplimiento de contrato', 'Civil', 'Juzgado Civil y Comercial N.º 2']
      ].forEach(function (e, i) {
        aplicar(db, Motor.guardar(db, 'expedientes', { numero: (15000 + i * 731) + '/' + (i % 3 ? '2025' : '2026'), caratula: e[0], cliente: db.clientes[i].id, fuero: e[1], juzgado: e[2], estado: i === 6 ? 'Con sentencia' : 'En trámite' }, ctx()));
      });
      var tipos = [['Vencimiento de plazo', 'Contestar traslado'], ['Audiencia', 'Audiencia preliminar'], ['Vencimiento de plazo', 'Expresar agravios'], ['Mediación', 'Mediación prejudicial'],
        ['Reunión con cliente', 'Revisar documentación'], ['Audiencia', 'Audiencia de vista de causa'], ['Vencimiento de plazo', 'Ofrecer prueba']];
      for (var dp = -8; dp <= 20; dp++) {
        var fp = d(dp), dw = new Date(fp + 'T12:00:00Z').getUTCDay();
        if (dw === 0 || dw === 6) continue;
        for (var vez = 0; vez < (dp === 0 ? 3 : 1 + Math.floor(rnd() * 2)); vez++) {
        var tp = tipos[Math.floor(rnd() * tipos.length)];
        aplicar(db, Motor.guardar(db, 'plazos', { fecha: fp, hora: tp[0] === 'Vencimiento de plazo' ? '' : ['09:30', '10:00', '11:30', '12:00'][Math.floor(rnd() * 4)], expediente: db.expedientes[Math.floor(rnd() * db.expedientes.length)].id, tipo: tp[0], detalle: tp[1], estado: dp < 0 ? 'Cumplido' : 'Pendiente' }, ctx()));
        tp = tipos[Math.floor(rnd() * tipos.length)];
        }
      }
      db.expedientes.forEach(function (e, i) {
        aplicar(db, Motor.guardar(db, 'honorarios', { cliente: e.cliente, concepto: i % 2 ? 'Anticipo de honorarios' : 'Cuota de honorarios', periodo: '', monto: [250000, 180000, 420000, 150000][i % 4], vence: d(-10 + i * 4) }, ctx()));
        if (i % 3 === 0) aplicar(db, Motor.accion(db, 'honorarios', 'cobrar', db.honorarios[db.honorarios.length - 1].id, { hoy: d(-10 + i * 4), medio: 'Transferencia' }));
      });
      [['Alquiler del estudio', 610000, -12], ['Tasas judiciales y bonos', 84000, -5]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Transferencia' }, ctx()));
      });
    }

    if (rubro === 'freelancer') {
      [['Café Molienda', 'Lucas Ferreyra'], ['Inmobiliaria Sierras', 'Andrea Quiroga'], ['Estudio Contable Ríos', 'Pablo Ríos'], ['Bodega Las Lomas', 'Sofía Aguirre'],
       ['Gimnasio Fuerza', 'Diego Medina'], ['Escuela de Idiomas Babel', 'Laura Vera']].forEach(function (c, i) {
        aplicar(db, Motor.guardar(db, 'clientes', { nombre: c[0], notas: 'Contacto: ' + c[1], telefono: '249 4' + String(310000 + i * 41117), email: c[1].split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@ejemplo.com' }, ctx()));
      });
      [
        [0, 'Tienda online', 'Sitio web', 'En curso', 850000, -40, 12, 65],
        [0, 'Contenido para Instagram (octubre)', 'Marketing y redes', 'En curso', 220000, -20, 7, 50],
        [1, 'Sitio web con buscador de propiedades', 'Sitio web', 'En revisión', 1200000, -60, 3, 90],
        [2, 'Rediseño de logo y papelería', 'Diseño', 'Entregado', 320000, -45, -10, 100],
        [3, 'Etiquetas para la línea reserva', 'Diseño', 'En curso', 480000, -15, 18, 30],
        [3, 'Video institucional', 'Fotografía y video', 'Propuesta', 650000, -2, 40, 0],
        [4, 'App de reservas de clases', 'Desarrollo', 'En curso', 1800000, -30, 35, 40],
        [5, 'Landing para inscripciones 2027', 'Sitio web', 'Pausado', 380000, -25, 25, 20]
      ].forEach(function (p) {
        aplicar(db, Motor.guardar(db, 'proyectos', { nombre: p[1], cliente: db.clientes[p[0]].id, tipo: p[2], estado: p[3], presupuesto: p[4], inicio: d(p[5]), entrega: d(p[6]), avance: p[7] }, ctx()));
      });
      var tareasP = {
        Y1: ['Armar catálogo de productos', 'Configurar Mercado Pago', 'Diseñar ficha de producto', 'Probar el carrito en celular'],
        Y2: ['Calendario de posteos', 'Diseñar 8 placas', 'Editar 2 reels'],
        Y3: ['Corregir textos de la home', 'Cargar 20 propiedades', 'Revisión final con el cliente'],
        Y5: ['Bocetos de 3 etiquetas', 'Prueba de impresión'],
        Y7: ['Pantalla de login', 'Calendario de clases', 'Pagos con tarjeta', 'Notificaciones'],
        Y8: ['Formulario de inscripción']
      };
      Object.keys(tareasP).forEach(function (pid) {
        tareasP[pid].forEach(function (t, i) {
          var dd = -6 + i * 3 + Math.floor(rnd() * 3);
          aplicar(db, Motor.guardar(db, 'tareas', { tarea: t, proyecto: pid, fecha: d(dd), horas: dd < 0 ? 2 + Math.floor(rnd() * 10) / 2 : '', estado: dd < 0 ? 'Hecha' : dd < 2 ? 'En curso' : 'Pendiente' }, ctx()));
        });
      });
      db.proyectos.slice().forEach(function (p) {
        if (p.estado === 'Propuesta') return;
        var pres = Motor.num(p.presupuesto);
        aplicar(db, Motor.guardar(db, 'honorarios', { cliente: p.cliente, proyecto: p.id, concepto: 'Anticipo 50 %', monto: pres / 2, vence: p.inicio }, ctx()));
        aplicar(db, Motor.accion(db, 'honorarios', 'cobrar', db.honorarios[db.honorarios.length - 1].id, { hoy: p.inicio, medio: 'Transferencia' }));
        aplicar(db, Motor.guardar(db, 'honorarios', { cliente: p.cliente, proyecto: p.id, concepto: 'Saldo a la entrega', monto: pres / 2, vence: p.entrega }, ctx()));
        if (p.estado === 'Entregado') aplicar(db, Motor.accion(db, 'honorarios', 'cobrar', db.honorarios[db.honorarios.length - 1].id, { hoy: p.entrega, medio: 'Transferencia' }));
      });
      [['Suscripción Adobe y Figma', 95000, -9], ['Hosting y dominios de clientes', 62000, -4]].forEach(function (e) {
        aplicar(db, Motor.guardar(db, 'caja', { fecha: d(e[2]), tipo: 'Egreso', concepto: e[0], monto: e[1], medio: 'Crédito' }, ctx()));
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
