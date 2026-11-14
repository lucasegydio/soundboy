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

// Every product image is an actual capture. Controls select or enlarge captures.
document.querySelectorAll('[data-viewer]').forEach(viewer => {
 const buttons=[...viewer.querySelectorAll('[data-capture]')];
 const img=viewer.querySelector('img'); let index=0;
 const select=i=>{index=i;const button=buttons[i];img.src='img/real/'+button.dataset.capture+'.png';img.alt=button.textContent+' — captura do SoundBoy';buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));viewer.querySelector('.capture-caption').textContent=button.textContent+' / Captura do aplicativo';viewer.querySelector('.image-open').setAttribute('aria-label','Ampliar '+button.textContent);};
 buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
 arrowNavigation(viewer.querySelector('.real-controls'),buttons,select,()=>index);
 if(viewer.classList.contains('device-viewer')){
  const zoom=document.createElement('button');zoom.type='button';zoom.className='detail-toggle';zoom.textContent='Ver detalhe +';zoom.setAttribute('aria-pressed','false');
  zoom.addEventListener('click',()=>{const active=viewer.classList.toggle('detail-active');zoom.setAttribute('aria-pressed',String(active));zoom.textContent=active?'Ver tela completa −':'Ver detalhe +';});viewer.append(zoom);
 }
});
const captureDialog=document.querySelector('.capture-dialog');
document.querySelectorAll('.image-open').forEach(button=>button.addEventListener('click',()=>{
 const source=button.querySelector('img'); const img=captureDialog.querySelector('img');img.src=source.src;img.alt=source.alt;
 captureDialog.querySelector('p').textContent=source.alt;captureDialog.showModal();document.body.classList.add('capture-open');
}));
captureDialog.addEventListener('close',()=>document.body.classList.remove('capture-open'));
captureDialog.addEventListener('click',e=>{if(e.target===captureDialog)captureDialog.close();});
