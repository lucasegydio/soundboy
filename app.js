'use strict';
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reduceMotion.matches && 'IntersectionObserver' in window){
 const targets=document.querySelectorAll('.say .wrap,.feat .head,.gallery,#artistas .screen,#arquivos .screen,.night .comparison,.spec .grid>div,.get .steps');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:0.08});
 targets.forEach(el=>{el.classList.add('reveal');observer.observe(el)});document.documentElement.classList.add('motion-ready');
}
const slides=[...document.querySelectorAll('.slide')];
const choices=[...document.querySelectorAll('[data-slide]')];let current=0;
function showSlide(index){current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==current});choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));document.querySelector('#slide-status').textContent=`Tela ${current+1} de ${slides.length}: ${choices[current].textContent}`;}
choices.forEach(button=>button.addEventListener('click',()=>showSlide(Number(button.dataset.slide))));
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>showSlide(current+Number(button.dataset.direction))));
document.querySelector('.segments').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();showSlide(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowRight'?1:-1));choices[current].focus()}});
let touchX=null;const stage=document.querySelector('.gallery-stage');stage.addEventListener('touchstart',event=>{touchX=event.touches[0].clientX},{passive:true});stage.addEventListener('touchend',event=>{if(touchX!==null){const delta=event.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60)showSlide(current+(delta<0?1:-1));touchX=null}},{passive:true});
const mood=document.querySelector('#mood');mood.addEventListener('input',()=>{document.querySelector('.comparison').style.setProperty('--split',`${100-Number(mood.value)}%`);mood.setAttribute('aria-valuetext',`${mood.value}% da tela no modo noturno`)});
