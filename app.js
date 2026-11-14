'use strict';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Content stays visible without JavaScript or when motion is reduced.
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal,.detail-strip,.instrument-bottom,.history-strip,.ownership').forEach(el => {
    el.classList.add('reveal'); observer.observe(el);
  });
  document.documentElement.classList.add('motion-ready');
}
// Product gallery: buttons, keyboard and deliberate horizontal swipes.
const slides = [...document.querySelectorAll('.slide')];
const choices = [...document.querySelectorAll('[data-slide]')];
let current = 0;
function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  document.querySelector('#slide-status').textContent = `Tela ${current + 1} de ${slides.length}: ${choices[current].textContent}`;
}
choices.forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.slide))));
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => showSlide(current + Number(button.dataset.direction))));
function arrowNavigation(container, buttons, select, selected) {
  container.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const focused = buttons.indexOf(event.target.closest('button'));
    const origin = focused >= 0 ? focused : selected();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (origin + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    select(index); buttons[index].focus();
  });
}
arrowNavigation(document.querySelector('.segments'), choices, showSlide, () => current);
let touchStart = null;
const stage = document.querySelector('.gallery-stage');
stage.addEventListener('touchstart', e => { touchStart = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive:true });
stage.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart[0];
  const dy = e.changedTouches[0].clientY - touchStart[1];
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive:true });
stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive:true });
const mood = document.querySelector('#mood');
mood.addEventListener('input', () => {
  document.querySelector('.comparison').style.setProperty('--split', `${100 - Number(mood.value)}%`);
  mood.setAttribute('aria-valuetext', `${mood.value}% da tela no modo noturno`);
});
// Material studies are original illustrations, not screenshots of the application.
const materials = {
  vinyl: ['O começo de tudo.', 'Sulcos concêntricos, brilho sutil e a capa no selo. O vinil encontra uma nova superfície.', 'vinil'],
  cd: ['A luz encontra o disco.', 'Prata, reflexos e um pouco de arco-íris. A memória do CD, em uma superfície digital.', 'CD'],
  holo: ['Um disco. Muitas cores.', 'Reflexos holográficos para um objeto que muda com a luz. Uma das seis opções da tela Discos.', 'disco holográfico'],
  picture: ['A arte ocupa tudo.', 'A capa deixa o centro e toma o disco inteiro. No aplicativo, o desenho vem do álbum que está tocando.', 'picture disc'],
  opart: ['Os olhos também ouvem.', 'Contraste e repetição transformam o movimento em um padrão óptico. Experimente girar esta ilustração.', 'disco op-art'],
  acrylic: ['Um pouco de transparência.', 'Acrílico translúcido, leveza e cor. No aplicativo, o material recebe a cor do gênero musical.', 'disco de acrílico']
};
const materialButtons = [...document.querySelectorAll('[data-material-choice]')];
const disc = document.querySelector('.design-disc');
let materialIndex = 0;
function selectMaterial(index) {
  materialIndex = index;
  const id = materialButtons[index].dataset.materialChoice;
  const [title, copy, label] = materials[id];
  disc.dataset.material = id;
  materialButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
  document.querySelector('#material-index').textContent = `0${index + 1} / 06`;
  document.querySelector('#material-title').textContent = title;
  document.querySelector('#material-copy').textContent = copy;
  document.querySelector('#disc-preview').setAttribute('aria-label', `Ilustração de ${label}`);
}
materialButtons.forEach((button, i) => button.addEventListener('click', () => selectMaterial(i)));
arrowNavigation(document.querySelector('.material-choices'), materialButtons, selectMaterial, () => materialIndex);
const spinButton = document.querySelector('.motion-toggle');
function stopSpin() { disc.classList.remove('spinning'); spinButton.setAttribute('aria-pressed','false'); spinButton.innerHTML = 'Girar ilustração <span aria-hidden="true">↻</span>'; }
spinButton.addEventListener('click', () => {
  if (disc.classList.contains('spinning')) return stopSpin();
  disc.classList.add('spinning'); spinButton.setAttribute('aria-pressed','true');
  spinButton.innerHTML = 'Pausar ilustração <span aria-hidden="true">Ⅱ</span>';
});
function motionPreference() {
  stopSpin();
  spinButton.disabled = reduceMotion.matches;
  if (reduceMotion.matches) spinButton.textContent = 'Movimento reduzido ativado';
}
reduceMotion.addEventListener('change', motionPreference); motionPreference();
const labStage = document.querySelector('.lab-stage');
if ('IntersectionObserver' in window) new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting))).observe(labStage);
else labStage.classList.add('in-view');
// Educational Camelot diagram. This does not simulate the Radio ranking engine.
const keyNames = ['Lá♭ menor','Mi♭ menor','Si♭ menor','Fá menor','Dó menor','Sol menor','Ré menor','Lá menor','Mi menor','Si menor','Fá♯ menor','Dó♯ menor'];
const keyButtons = [...document.querySelectorAll('[data-key]')];
let chosenKey = 8;
function selectKey(n) {
  chosenKey = n; const before = n === 1 ? 12 : n - 1; const after = n === 12 ? 1 : n + 1;
  keyButtons.forEach(button => {
    const key = Number(button.dataset.key);
    button.setAttribute('aria-pressed', String(key === n));
    button.classList.toggle('neighbor', key === before || key === after);
  });
  document.querySelector('#key-value').textContent = `${n}A`;
  document.querySelector('#key-name').textContent = keyNames[n - 1];
  document.querySelector('#key-neighbors').textContent = `${before}A · ${after}A · ${n}B`;
}
keyButtons.forEach(button => button.addEventListener('click', () => selectKey(Number(button.dataset.key))));
arrowNavigation(document.querySelector('.harmonic-wheel'), keyButtons, i => selectKey(i + 1), () => chosenKey - 1);
selectKey(8);
const artistData = [
  ['artista','Página do artista Kendrick Lamar no SoundBoy','01 / Página do artista'],
  ['artista-discos','Discografia de Kendrick Lamar organizada em álbuns, remixes e participações','02 / Discografia e participações'],
  ['artistas','Grade de artistas da biblioteca filtrada por gênero','03 / Artistas da biblioteca']
];
const artistButtons = [...document.querySelectorAll('[data-artist]')]; let artistIndex = 0;
function selectArtist(index) {
  artistIndex = index;
  const [file, alt, caption] = artistData[index];
  artistButtons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === index)));
  const img = document.querySelector('#artist-image'); img.src = `img/shots/${file}.webp`; img.alt = alt;
  document.querySelector('#artist-caption').textContent = caption;
}
artistButtons.forEach((button, i) => button.addEventListener('click', () => selectArtist(i)));
arrowNavigation(document.querySelector('.artist-menu'), artistButtons, selectArtist, () => artistIndex);
// Open the answer before taking the reader to it.
document.querySelector('a[href="#faq-arquivos"]').addEventListener('click', () => { document.querySelector('#faq-arquivos').open = true; });
