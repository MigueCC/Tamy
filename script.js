(function () {
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  
  var INICIO = new Date(2023, 1, 14, 0, 0, 0);
  var UNIDADES = [
    ['anios', 'año', 'años'], ['meses', 'mes', 'meses'], ['dias', 'día', 'días'],
    ['horas', 'hora', 'horas'], ['minutos', 'minuto', 'minutos'], ['segundos', 'segundo', 'segundos']
  ];
  var nodos = {};
  UNIDADES.forEach(function (u) {
    nodos[u[0]] = { n: $('n-' + u[0]), e: $('e-' + u[0]) };
  });
  var totalEl = $('total');

  function tiempo(ahora) {
    var meses = (ahora.getFullYear() - INICIO.getFullYear()) * 12 + (ahora.getMonth() - INICIO.getMonth());
    var ancla = new Date(INICIO.getFullYear(), INICIO.getMonth() + meses, INICIO.getDate());
    if (ancla > ahora) {
      meses--;
      ancla = new Date(INICIO.getFullYear(), INICIO.getMonth() + meses, INICIO.getDate());
    }
    var hoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    var dias = Math.round((hoy - Date.UTC(ancla.getFullYear(), ancla.getMonth(), ancla.getDate())) / 86400000);
    var total = Math.round((hoy - Date.UTC(INICIO.getFullYear(), INICIO.getMonth(), INICIO.getDate())) / 86400000);
    return {
      anios: Math.floor(meses / 12), meses: meses % 12, dias: dias,
      horas: ahora.getHours(), minutos: ahora.getMinutes(), segundos: ahora.getSeconds(),
      total: total
    };
  }

  function pintar() {
    var ahora = new Date();
    if (ahora < INICIO) ahora = INICIO;
    var t = tiempo(ahora);
    UNIDADES.forEach(function (u) {
      var v = t[u[0]];
      nodos[u[0]].n.textContent = v;
      nodos[u[0]].e.textContent = v === 1 ? u[1] : u[2];
    });
    totalEl.textContent = t.total.toLocaleString('es-MX');
  }
  function ciclo() {
    pintar();
    setTimeout(ciclo, 1000 - (Date.now() % 1000) + 5);
  }
  ciclo();

  
  function corazones() {
    var cont = $('corazones');
    for (var i = 0; i < 16; i++) {
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('aria-hidden', 'true');
      var u = document.createElementNS(NS, 'use');
      u.setAttribute('href', '#corazon');
      s.appendChild(u);
      var w = 10 + Math.random() * 16;
      s.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + w + 'px;height:' + w + 'px;' +
        '--t:' + (5 + Math.random() * 4) + 's;--r:' + (Math.random() * 3.5) + 's;' +
        '--x:' + ((Math.random() - 0.5) * 60) + 'px';
      cont.appendChild(s);
    }
  }

  
  var plano = $('plano'), firma = $('firma');
  var contorno = $('contorno'), relleno = $('relleno'), anidados = $('anidados');
  var lapiz = $('lapiz'), tVal = $('t-val'), rutaTexto = $('ruta-texto'), tp = $('tp'), ejesG = $('ejes');

  var S = 10.5, CX = 200, CY = 205, OY = -2.55, N = 480;  

  function el(nombre, attrs, texto) {
    var e = document.createElementNS(NS, nombre);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texto != null) e.textContent = texto;
    return e;
  }
  function punto(t, k) {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [CX + S * k * x, CY - S * k * (y - OY)];
  }
  function puntos(k) {
    var a = [];
    for (var i = 0; i <= N; i++) a.push(punto(i / N * 2 * Math.PI, k));
    return a;
  }
  function trazo(pts, hasta, cerrar) {
    var d = '';
    for (var i = 0; i <= hasta; i++) d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    return cerrar ? d + 'Z' : d;
  }
  var PTS = puntos(1);

  function etiqueta(v) { return (v < 0 ? '−' : '') + Math.abs(v); }

  function dibujarEjes() {
    var ox = CX, oy = CY + S * OY;
    ejesG.appendChild(el('line', { x1: 14, y1: oy, x2: 386, y2: oy }));
    ejesG.appendChild(el('line', { x1: ox, y1: 14, x2: ox, y2: 386 }));
    [-15, -10, -5, 5, 10, 15].forEach(function (v) {
      var x = ox + S * v;
      ejesG.appendChild(el('line', { x1: x, y1: oy - 3, x2: x, y2: oy + 3 }));
      ejesG.appendChild(el('text', { x: x, y: oy + 14, 'text-anchor': 'middle', 'class': 'num' }, etiqueta(v)));
    });
    [-15, -10, -5, 5, 10].forEach(function (v) {
      var y = oy - S * v;
      ejesG.appendChild(el('line', { x1: ox - 3, y1: y, x2: ox + 3, y2: y }));
      ejesG.appendChild(el('text', { x: ox - 7, y: y + 3, 'text-anchor': 'end', 'class': 'num' }, etiqueta(v)));
    });
    ejesG.appendChild(el('text', { x: 382, y: oy - 7, 'text-anchor': 'end', 'class': 'nombre-eje' }, 'x'));
    ejesG.appendChild(el('text', { x: ox + 8, y: 24, 'class': 'nombre-eje' }, 'y'));
  }

  function construir() {
    dibujarEjes();
    relleno.setAttribute('d', trazo(PTS, N, true));
    rutaTexto.setAttribute('d', trazo(puntos(1.13), N, true));
    [0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].forEach(function (k, i) {
      var p = el('path', { d: trazo(puntos(k), N, true), 'class': 'anidado', pathLength: '1' });
      p.style.opacity = (0.22 + i * 0.07).toFixed(2);
      p.style.setProperty('--d', (3.4 + i * 0.22).toFixed(2) + 's');
      anidados.appendChild(p);
    });
  }

  
  var UNIDAD = 'x = 16 sin³ t · y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t · 0 ≤ t ≤ 2π · ';
  function ajustarTexto() {
    try {
      var txt = tp.parentNode;
      var L = rutaTexto.getTotalLength();
      txt.style.letterSpacing = '0px';
      tp.textContent = UNIDAD;
      var w = txt.getComputedTextLength();
      if (!(w > 0) || !(L > 0)) return;
      var n = Math.max(1, Math.floor(L / w)), s = '';
      for (var i = 0; i < n; i++) s += UNIDAD;
      tp.textContent = s;
      var total = txt.getComputedTextLength();
      txt.style.letterSpacing = ((L - total) / s.length) + 'px';
    } catch (e) { /* si el navegador no mide el texto, queda sin ajuste */ }
  }

  function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

  function completo() {
    contorno.setAttribute('d', trazo(PTS, N, true));
    tVal.textContent = (2 * Math.PI).toFixed(2);
    ajustarTexto();
  }

  var iniciado = false;
  function iniciar() {
    if (iniciado) return;
    iniciado = true;
    ajustarTexto();
    plano.classList.add('dibujado');
    lapiz.style.opacity = 1;
    var t0 = null, DUR = 4200;
    function paso(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR), e = ease(p);
      var m = Math.max(1, Math.round(e * N));
      contorno.setAttribute('d', trazo(PTS, m, false));
      lapiz.setAttribute('cx', PTS[m][0].toFixed(1));
      lapiz.setAttribute('cy', PTS[m][1].toFixed(1));
      tVal.textContent = (e * 2 * Math.PI).toFixed(2);
      if (p < 1) {
        requestAnimationFrame(paso);
      } else {
        completo();
        lapiz.style.opacity = 0;
        plano.classList.add('listo');
      }
    }
    requestAnimationFrame(paso);
    setTimeout(function () { firma.classList.add('visto'); }, 5400);
  }

  construir();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTexto);

  
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animado = 'IntersectionObserver' in window && !reduce;

  if (animado) {
    document.documentElement.classList.add('anim');

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visto');
        if (en.target.getAttribute('data-lanza')) corazones();
        io.unobserve(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-rev="t"]:not([data-espera]), [data-rev="m"]').forEach(function (e) { io.observe(e); });

    
    var ioFinal = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { iniciar(); ioFinal.disconnect(); }
      });
    }, { threshold: 0.4 });
    ioFinal.observe(plano);
    ioFinal.observe(firma);
  } else {
    completo();
  }
})();
