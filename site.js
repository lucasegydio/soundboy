// SoundBoy · site (v4): entrada ao rolar, claro ⇄ noturno, link "Primeira vez" abre a pergunta de instalação.
(() => {
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  document.querySelectorAll('[data-theme-swap]').forEach(box => {
    box.querySelectorAll('[data-sw]').forEach(b => b.addEventListener('click', () => {
      box.classList.toggle('dark', b.dataset.sw === 'dark');
      box.querySelectorAll('[data-sw]').forEach(x => x.classList.toggle('on', x === b));
    }));
  });

  document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => {
    const d = document.getElementById(a.dataset.open);
    if (d) d.open = true;
  }));
})();
