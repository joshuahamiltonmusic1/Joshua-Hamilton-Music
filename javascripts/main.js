// ==========================================
// main.js - GLOBAL SITE NAVIGATION
// ==========================================
const navBtnCompositions = document.getElementById('nav-compositions');
const navBtnSoundDesign = document.getElementById('nav-sound-design');
const navViewCompositions = document.getElementById('theme-container');
const navViewSoundDesign = document.getElementById('sound-design-container');
const navSiteHeader = document.getElementById('site-navigation');

navBtnSoundDesign.addEventListener('click', function() {
    window.dispatchEvent(new Event('stopAllAudio')); 
    
    navBtnSoundDesign.classList.add('active');
    navBtnCompositions.classList.remove('active');
    
    navViewCompositions.classList.add('hidden');
    navViewSoundDesign.classList.remove('hidden');
});

navBtnCompositions.addEventListener('click', function() {
    window.dispatchEvent(new Event('stopAllAudio')); 
    
    navBtnCompositions.classList.add('active');
    navBtnSoundDesign.classList.remove('active');
    
    navViewSoundDesign.classList.add('hidden');
    navViewCompositions.classList.remove('hidden');
    
    navSiteHeader.classList.remove('scroll-hide');
});