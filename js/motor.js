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
      msg = 'Turno marcado como ausente.';
    }
    cambios.unshift({ m: modulo, op: 'set', fila: f });
    return { fila: f, cambios: cambios, mensaje: msg };
  }

  return {
    num: n0, plata: plata, sumarDias: sumarDias, noches: noches, minutos: minutos, hhmm: hhmm,
    buscar: buscar, etiqueta: etiqueta, nuevaFila: nuevaFila, guardar: guardar, borrar: borrar,
    accion: accion, accionDisponible: accionDisponible, cuentaReserva: cuentaReserva, activa: activa
  };
})();
if (typeof module !== 'undefined') module.exports = Motor;
