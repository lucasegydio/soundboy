// Família mind · movimento comum dos 4 sites. Fonte única: sites-base/familia.js (tools/sites.py copia).
// - <canvas class="fam-art" data-art="cover|heat|rings|ribbons|glass" data-c="#hex,#hex">: arte gerativa
//   desenhada em baixa resolução (mosaico de pixels, como luz de capa) ou suave (vidro).
// - .device: notebook que levanta ao rolar.  - .fam-line: linha da família desenhada ao rolar.
// - video[data-src]: carrega perto da tela, toca só visível.  - .reveal: entrada suave.  - [data-open]: abre a pergunta.
// Pausa fora da tela e respeita "menos movimento".
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hex = h => { h = h.trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // colormap "turbo" (aproximação polinomial): o espectro de calor do Vision
  const turbo = x => {
    x = clamp(x);
    const r = 0.1357 + x * (4.6154 + x * (-42.6603 + x * (132.1311 + x * (-152.9424 + x * 59.2864))));
    const g = 0.0914 + x * (2.1942 + x * (4.8430 + x * (-14.1850 + x * (4.2773 + x * 2.8296))));
    const b = 0.1067 + x * (12.6419 + x * (-60.5820 + x * (110.3628 + x * (-89.9031 + x * 27.3482))));
    return [r * 255, g * 255, b * 255];
  };

  const PAL = {
    cover: ['#1FB5A8', '#f2c9a4', '#c9c3e8', '#9fe0d8', '#ff9a6b'],
    rings: ['#B07CFF', '#FF5B00', '#1FB5A8', '#FF4D8D', '#4DA3FF', '#FFD12E'],
    glass: ['#FFD12E', '#FF5B00', '#1FB5A8', '#B07CFF'],
  };

  // campo de cor por modo: devolve [r,g,b] pra (x,y) em 0..1 no tempo t
  function field(mode, pal, base, t) {
    if (mode === 'heat') {
      return (x, y) => {
        // espectrograma: bandas de energia que andam, mais forte embaixo (graves)
        const beat = 0.5 + 0.5 * Math.sin(t * 2.1 + x * 9);
        const band = Math.sin(x * 7 + t * 0.8) * Math.cos(y * 5 - t * 0.6);
        const v = 0.25 + 0.55 * (1 - y) * (0.6 + 0.4 * beat) + 0.25 * band;
        return turbo(v);
      };
    }
    if (mode === 'rings') {
      return (x, y, ar) => {
        const dx = (x - 0.5) * ar, dy = y - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy) * 2.1 - t * 0.12;
        const k = ((d % 1) + 1) % 1 * pal.length;
        const i = Math.floor(k), f = k - i, s = f * f * (3 - 2 * f);
        const a = pal[i % pal.length], b = pal[(i + 1) % pal.length];
        // some pra borda: anel claro no meio, fundo escuro em volta (como o anel borrado da referência)
        const r0 = Math.sqrt(dx * dx + dy * dy), m = clamp(1.15 - r0 * 1.5) * 0.85;
        return [0, 1, 2].map(j => base[j] + ((a[j] + (b[j] - a[j]) * s) - base[j]) * m);
      };
    }
    // cover / glass: manchas de luz que se movem devagar (a capa vira luz)
    const blobs = pal.map((c, i) => ({ c, px: 0.5 + 0.38 * Math.sin(t * 0.21 + i * 2.1), py: 0.5 + 0.38 * Math.cos(t * 0.17 + i * 1.7), r: 0.22 + 0.06 * ((i * 37) % 5) / 4 }));
    return (x, y, ar) => {
      let R = base[0], G = base[1], B = base[2], W = 1;
      for (const b of blobs) {
        const dx = (x - b.px) * ar, dy = y - b.py;
        const w = Math.exp(-(dx * dx + dy * dy) / (b.r * b.r)) * (mode === 'cover' ? 9 : 3);
        R += b.c[0] * w; G += b.c[1] * w; B += b.c[2] * w; W += w;
      }
      return [R / W, G / W, B / W];
    };
  }

  function ribbons(ctx, w, h, t) {
    // fitas espectrais saindo do canto (como luz saindo do deck)
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const n = 34;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), [r, g, b] = turbo(1 - u * 0.95);
      ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},.38)`;
      ctx.lineWidth = h * 0.034;
      ctx.beginPath();
      const x0 = w * 0.08, y0 = h * (0.78 + u * 0.08);
      ctx.moveTo(x0, y0);
      const wave = Math.sin(t * 0.7 + u * 3) * h * 0.06;
      ctx.bezierCurveTo(w * 0.42, y0 + wave, w * 0.55, h * (0.15 + u * 0.5) - wave, w * 1.02, h * (-0.05 + u * 0.55) + wave * 0.5);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function setup(cv) {
    const mode = cv.dataset.art || 'cover';
    const pal = (cv.dataset.c ? cv.dataset.c.split(',') : PAL[mode] || PAL.glass).map(hex);
    const base = hex(cv.dataset.base || (mode === 'cover' ? '#f3f1ee' : '#0b0b0c'));
    const soft = mode === 'glass';
    const cols = +(cv.dataset.cols || (soft ? 18 : mode === 'rings' ? 46 : 34));
    const ctx = cv.getContext('2d');
    const small = document.createElement('canvas'), sctx = small.getContext('2d');
    let w = 0, h = 0, on = true, last = 0, t0 = performance.now() / 1000 + Math.random() * 40;

    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      w = cv.width = Math.max(1, Math.round(r.width * (mode === 'ribbons' ? dpr : 1)));
      h = cv.height = Math.max(1, Math.round(r.height * (mode === 'ribbons' ? dpr : 1)));
      small.width = cols; small.height = Math.max(2, Math.round(cols * h / w));
    };
    const draw = now => {
      const t = now / 1000 - t0;
      if (mode === 'ribbons') return ribbons(ctx, w, h, t);
      const sw = small.width, sh = small.height, ar = sw / sh;
      const f = field(mode, pal, base, t), img = sctx.createImageData(sw, sh), d = img.data;
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
        const c = f((x + 0.5) / sw, (y + 0.5) / sh, ar), k = (y * sw + x) * 4;
        d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = soft;
      ctx.drawImage(small, 0, 0, w, h);
    };
    const loop = now => {
      if (!on) return;
      if (now - last > (mode === 'ribbons' ? 33 : 90)) { last = now; draw(now); }  // mosaico: ~11 quadros/s, de propósito
      requestAnimationFrame(loop);
    };
    size(); draw(performance.now());
    new ResizeObserver(() => { size(); draw(performance.now()); }).observe(cv);
    if (still) return;
    new IntersectionObserver(es => es.forEach(e => {
      const was = on; on = e.isIntersecting;
      if (on && !was) requestAnimationFrame(loop);
    })).observe(cv);
    requestAnimationFrame(loop);
  }
  document.querySelectorAll('canvas.fam-art').forEach(setup);

  // entrada suave
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => { const d = document.getElementById(a.dataset.open); if (d) d.open = true; }));

  // vídeos do programa rodando: baixam perto da tela, tocam só quando aparecem
  const vids = [...document.querySelectorAll('video[data-src]')];
  const vo = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      if (!still) v.play().catch(() => { });
    } else if (!v.paused) v.pause();
  }), { rootMargin: '300px 0px 300px 0px', threshold: 0.01 });
  vids.forEach(v => { v.muted = true; v.playsInline = true; v.loop = true; vo.observe(v); });

  // rolagem: notebook levanta, linha da família anda
  const scrolled = [...document.querySelectorAll('.device, .fam-line')];
  if (!scrolled.length) return;
  const tick = () => {
    const vh = innerHeight;
    for (const el of scrolled) {
      const r = el.getBoundingClientRect();
      const p = still ? 1 : clamp((vh - r.top) / (vh * 0.75));
      el.style.setProperty('--p', p.toFixed(3));
    }
  };
  let pend = false;
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; tick(); }); } }, { passive: true });
  addEventListener('resize', tick);
  tick();
})();
