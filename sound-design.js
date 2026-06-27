// ==========================================
// sound-design.js - SPATIAL AUDIO ENGINE
// ==========================================
const viewSoundDesign = document.getElementById('sound-design-container');
const siteHeader = document.getElementById('site-navigation');

// ==========================================
// 2. WEB AUDIO CORE ENGINE 
// ==========================================
let ambientEngineActive = false;
let activeSceneID = 'savannah-soundscape';

const ambientLoops = {
    'savannah-soundscape': new Howl({
        src: ['./assets/audio/savannah-loop.wav'], 
        html5: false, 
        loop: true,
        volume: 0.0,
        onplayerror: function() { Howler.ctx.resume(); }
    })
};

const soundEffects = {
    'trigger-birds': new Howl({
        src: ['./assets/audio/birds-singing.wav'], 
        volume: 0.7,
        onend: function() { resetHotspotState('trigger-birds'); }
    }),
    'trigger-lions': new Howl({
        src: ['./assets/audio/Lion SFX.wav'], 
        volume: 0.7,
        onend: function() { resetHotspotState('trigger-lions'); }
    })
};

const sceneHotspotMap = {
    'savannah-soundscape': ['trigger-birds', 'trigger-lions'],
    'rainforest-soundscape': ['trigger-rain', 'trigger-wildlife']
};

function resetHotspotState(id) {
    const targetElement = document.getElementById(id);
    if (targetElement) {
        targetElement.classList.remove('playing');
        updateAllButtonVisuals(); 
    }
}

// ==========================================
// 3. UNIFIED VISUAL UPDATER
// ==========================================
function updateAllButtonVisuals() {
    document.querySelectorAll('.ambient-play-btn').forEach(btn => {
        if (ambientEngineActive) {
            btn.classList.add('active');
            btn.innerHTML = `<span class="icon">❚❚</span> Stop`;
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `<span class="icon">▶</span> Play`;
        }
    });

    const visibleSection = document.getElementById(activeSceneID);
    let anyHotspotPlaying = false;
    
    if (visibleSection) {
        const activeHotspots = visibleSection.querySelectorAll('.hotspot');
        activeHotspots.forEach(spot => {
            if (spot.classList.contains('playing')) anyHotspotPlaying = true;
        });
    }
    
    let isAnythingPlaying = anyHotspotPlaying || ambientEngineActive;

    document.querySelectorAll('.toggle-all-btn').forEach(btn => {
        if (isAnythingPlaying) {
            btn.innerHTML = `<span class="icon">☵</span> Toggle All (off)`;
        } else {
            btn.innerHTML = `<span class="icon">☵</span> Toggle All (on)`;
        }
    });
}

// ==========================================
// 4. SCROLL ENGINE & AUDIO INSTANCE SAFEGUARDS
// ==========================================
const titleElement = document.getElementById('soundscape-title');
const descElement = document.getElementById('soundscape-desc');

const sceneTexts = {
    'savannah-soundscape': { title: "The Savannah", desc: "Click the hotspots to trigger spatial audio elements." },
    'rainforest-soundscape': { title: "Dense Rainforest", desc: "Click the hotspots to trigger spatial audio elements." }
};

let lastScrollTop = 0;
const scrollThreshold = 10; 

viewSoundDesign.addEventListener('scroll', () => {
    const scrollTop = viewSoundDesign.scrollTop;
    const viewportHeight = viewSoundDesign.clientHeight || window.innerHeight;
    
    if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
        if (scrollTop > lastScrollTop && scrollTop > 60) {
            siteHeader.classList.add('scroll-hide'); 
        } else {
            siteHeader.classList.remove('scroll-hide'); 
        }
        lastScrollTop = scrollTop;
    }

    let scrollRatio = scrollTop / viewportHeight;
    if (scrollRatio < 0) scrollRatio = 0;
    if (scrollRatio > 1) scrollRatio = 1;

    const newSceneID = scrollRatio < 0.5 ? 'savannah-soundscape' : 'rainforest-soundscape';
    
    if (newSceneID !== activeSceneID) {
        const previousSceneID = activeSceneID;
        activeSceneID = newSceneID;
        
        if (sceneHotspotMap[previousSceneID]) {
            sceneHotspotMap[previousSceneID].forEach(hotspotID => {
                const effect = soundEffects[hotspotID];
                if (effect && effect.playing()) {
                    effect.fade(effect.volume(), 0.0, 800);
                    setTimeout(() => { 
                        effect.stop(); 
                        resetHotspotState(hotspotID);
                    }, 800);
                } else {
                    resetHotspotState(hotspotID);
                }
            });
        }

        if (titleElement && descElement) {
            titleElement.style.opacity = '0';
            descElement.style.opacity = '0';
            titleElement.style.transition = "opacity 0.2s ease";
            descElement.style.transition = "opacity 0.2s ease";
            
            setTimeout(() => {
                if (sceneTexts[activeSceneID]) {
                    titleElement.textContent = sceneTexts[activeSceneID].title;
                    descElement.textContent = sceneTexts[activeSceneID].desc;
                }
                titleElement.style.opacity = '1';
                descElement.style.opacity = '1';
            }, 200);
        }
        
        updateAllButtonVisuals();
    }

    if (ambientEngineActive) {
        const savannahTrack = ambientLoops['savannah-soundscape'];
        if (savannahTrack) {
            if (!savannahTrack.playing()) {
                savannahTrack.play();
            }
            savannahTrack.volume((1 - scrollRatio) * 1.0); 
        }
    }
});

// ==========================================
// 5. MASTER CONTROLLER EVENTS
// ==========================================
document.querySelectorAll('.ambient-play-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }

        const savannahTrack = ambientLoops['savannah-soundscape'];
        if (!savannahTrack) return;

        if (ambientEngineActive) {
            ambientEngineActive = false;
            savannahTrack.fade(savannahTrack.volume(), 0.0, 1000);
            setTimeout(() => { if (!ambientEngineActive) savannahTrack.stop(); }, 1000);
        } else {
            ambientEngineActive = true;
            if (!savannahTrack.playing()) {
                savannahTrack.play();
            }
            viewSoundDesign.dispatchEvent(new Event('scroll'));
        }
        updateAllButtonVisuals();
    });
});

document.querySelectorAll('.toggle-all-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }

        const visibleSection = document.getElementById(activeSceneID);
        const activeHotspots = visibleSection.querySelectorAll('.hotspot');
        const savannahTrack = ambientLoops['savannah-soundscape'];
        
        let anyHotspotPlaying = false;
        activeHotspots.forEach(spot => {
            if (spot.classList.contains('playing')) anyHotspotPlaying = true;
        });

        let isAnythingPlaying = anyHotspotPlaying || ambientEngineActive;

        if (isAnythingPlaying) {
            activeHotspots.forEach(spot => {
                spot.classList.remove('playing');
                const effect = soundEffects[spot.id];
                if (effect) {
                    effect.stop();
                }
            });
            
            if (ambientEngineActive && savannahTrack) {
                ambientEngineActive = false;
                savannahTrack.fade(savannahTrack.volume(), 0.0, 1000);
                setTimeout(() => { if (!ambientEngineActive) savannahTrack.stop(); }, 1000);
            }
        } else {
            activeHotspots.forEach(spot => {
                spot.classList.add('playing');
                const effect = soundEffects[spot.id];
                if (effect) {
                    effect.stop(); 
                    effect.volume(0.7); 
                    effect.play();
                }
            });
            
            if (!ambientEngineActive && savannahTrack) {
                ambientEngineActive = true;
                if (!savannahTrack.playing()) {
                    savannahTrack.play();
                }
                viewSoundDesign.dispatchEvent(new Event('scroll'));
            }
        }
        
        updateAllButtonVisuals();
    });
});

// ==========================================
// 6. INDIVIDUAL HOTSPOT CLICKS
// ==========================================
document.querySelectorAll('.hotspot').forEach(spot => {
    spot.addEventListener('click', function() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }

        this.classList.toggle('playing');

        const effect = soundEffects[this.id];
        if (effect) {
            if (this.classList.contains('playing')) {
                effect.volume(0.7); 
                effect.play();
            } else {
                effect.stop();
            }
        }
        
        updateAllButtonVisuals();
    });
});

// ==========================================
// INITIALIZE PAGE STATE
// ==========================================
updateAllButtonVisuals();
// ==========================================
// 7. GLOBAL AUDIO KILL SWITCH
// ==========================================
window.addEventListener('stopAllAudio', () => {
    // 1. Stop all hotspots
    const visibleSection = document.getElementById(activeSceneID);
    if (visibleSection) {
        const activeHotspots = visibleSection.querySelectorAll('.hotspot');
        activeHotspots.forEach(spot => {
            spot.classList.remove('playing');
            const effect = soundEffects[spot.id];
            if (effect) effect.stop();
        });
    }
    
    // 2. Stop the ambient engine smoothly
    const savannahTrack = ambientLoops['savannah-soundscape'];
    if (ambientEngineActive && savannahTrack) {
        ambientEngineActive = false;
        savannahTrack.fade(savannahTrack.volume(), 0.0, 500);
        setTimeout(() => { if (!ambientEngineActive) savannahTrack.stop(); }, 500);
    }
    
    // 3. Reset the buttons
    updateAllButtonVisuals();
});