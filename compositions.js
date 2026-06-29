// ==========================================
// compositions.js - INSTANT REAL-TIME VOLUME ENGINE WITH AMBIENT GLOW
// ==========================================

const compContainer = document.getElementById('theme-container');
const compTitle = document.getElementById('comp-title');
const compDesc = document.getElementById('comp-desc');
const compPlayBtn = document.getElementById('comp-play-btn');
const compFader = document.getElementById('comp-music-fader');
const compFaderLabel = document.getElementById('comp-fader-label');
const compVideoFader = document.getElementById('comp-video-fader');
const compVideoFaderLabel = document.getElementById('comp-video-fader-label');
const globalHeader = document.getElementById('site-navigation');

let activeCompID = 'scene-pigeon';
let faderInteractionId = 0; 
let videoFaderInteractionId = 0;
let isSeeking = false; 

if (compTitle && compDesc) {
    compTitle.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    compDesc.style.transition = "opacity 0.4s ease, transform 0.4s ease";
}

// Helper to reliably check if we are in the mobile/landscape-phone layout
const isMobileLayout = () => {
    return window.matchMedia("(max-width: 768px), (max-width: 949px) and (orientation: landscape)").matches;
};

// 1. Data Map for Videos & Audio (Updated with Backdrop Canvas Contexts)
const compData = {
    'scene-pigeon': {
        title: "The Young Offenders (Season 5 Ep. 6)",
        desc: "Composed by Joshua Hamilton",
        section: document.getElementById('scene-pigeon'),
        video: document.getElementById('vid-pigeon'),
        progressFill: document.getElementById('progress-pigeon'), 
        canvas: document.getElementById('canvas-backdrop-pigeon'),
        ctx: document.getElementById('canvas-backdrop-pigeon') ? document.getElementById('canvas-backdrop-pigeon').getContext('2d', { alpha: false }) : null,
        howl: new Howl({ src: ['./assets/audio/silly-pigeon.wav'], loop: false, volume: 0.8 }),
        musicVol: 0.8,
        videoVol: 1.0
    },
    'scene-beauties': {
        title: "The Young Offenders (Season 5 Ep. 6) scene 2", 
        desc: "Composed by Joshua Hamilton",
        section: document.getElementById('scene-beauties'),
        video: document.getElementById('vid-beauties'),
        progressFill: document.getElementById('progress-beauties'), 
        canvas: document.getElementById('canvas-backdrop-beauties'),
        ctx: document.getElementById('canvas-backdrop-beauties') ? document.getElementById('canvas-backdrop-beauties').getContext('2d', { alpha: false }) : null,
        howl: new Howl({ src: ['./assets/audio/these-beauties.wav'], loop: false, volume: 0.8 }),
        musicVol: 0.8,
        videoVol: 1.0
    }
};

// Default hardware limits for load context paths
compData['scene-pigeon'].video.volume = compData['scene-pigeon'].videoVol;
compData['scene-pigeon'].howl.volume(compData['scene-pigeon'].musicVol);

// 2. MASTER/SLAVE SYNC CONTROLLER
function updatePlayButtonsUI() {
    const currentScene = compData[activeCompID];
    const isPlaying = currentScene && !currentScene.video.paused;

    if (compPlayBtn) {
        if (isPlaying) {
            compPlayBtn.classList.add('active');
            compPlayBtn.innerHTML = `<span class="icon">❚❚</span> Pause Video`;
        } else {
            compPlayBtn.classList.remove('active');
            compPlayBtn.innerHTML = `<span class="icon">▶</span> Play Video`;
        }
    }

    Object.keys(compData).forEach(sceneID => {
        const mobBtn = compData[sceneID].section.querySelector('.mob-btn-shrunk');
        if (!mobBtn) return;
        if (sceneID === activeCompID && isPlaying) {
            mobBtn.classList.add('active');
            mobBtn.innerHTML = `❚❚ Pause`;
        } else {
            mobBtn.classList.remove('active');
            mobBtn.innerHTML = `▶ Play`;
        }
    });
}

function coreSyncLoop() {
    requestAnimationFrame(coreSyncLoop);

    const scene = compData[activeCompID];
    if (!scene || scene.video.paused || isSeeking) return;

    // --- REAL-TIME AMBIENT GLOW BACKDROP RENDER ENGINE ---
    if (scene.canvas && scene.ctx) {
        if (scene.canvas.width !== scene.video.videoWidth && scene.video.videoWidth > 0) {
            // Downscale canvas internal dimensions to boost GPU performance significantly while preserving blur detail
            scene.canvas.width = 320;
            scene.canvas.height = 180;
        }
        scene.ctx.drawImage(scene.video, 0, 0, scene.canvas.width, scene.canvas.height);
    }

    if (scene.video.duration) {
        const percentage = (scene.video.currentTime / scene.video.duration) * 100;
        if (scene.progressFill) {
            scene.progressFill.style.width = `${percentage}%`;
        }

        const timeLeft = scene.video.duration - scene.video.currentTime;
        if (timeLeft <= 1.5 && timeLeft > 0) {
            scene.video.style.filter = "brightness(0)";
        } else if (timeLeft > 1.5) {
            scene.video.style.filter = "brightness(1)";
        }
    }

    if (scene.howl.playing()) {
        const audioTime = scene.howl.seek();
        const videoTime = scene.video.currentTime;
        
        if (typeof audioTime === 'number') {
            const drift = audioTime - videoTime;

            if (Math.abs(drift) > 0.3) {
                scene.howl.seek(videoTime);
            } else if (drift > 0.08 && scene.video.playbackRate !== 1.04) {
                scene.video.playbackRate = 1.04;
            } else if (drift < -0.08 && scene.video.playbackRate !== 0.96) {
                scene.video.playbackRate = 0.96;
            } else if (Math.abs(drift) <= 0.03 && scene.video.playbackRate !== 1.0) {
                scene.video.playbackRate = 1.0;
            }
        }
    }
}
requestAnimationFrame(coreSyncLoop);

Object.values(compData).forEach(scene => {
    scene.video.addEventListener('play', updatePlayButtonsUI);
    scene.video.addEventListener('pause', updatePlayButtonsUI);

    scene.video.addEventListener('seeking', () => {
        isSeeking = true;
        scene.howl.pause();
    });

    scene.video.addEventListener('seeked', () => {
        isSeeking = false;
        scene.howl.seek(scene.video.currentTime);
        if (!scene.video.paused && !scene.howl.playing()) {
            scene.howl.play();
        }
    });

    scene.video.addEventListener('waiting', () => { scene.howl.pause(); });
    scene.video.addEventListener('playing', () => {
        scene.howl.seek(scene.video.currentTime);
        if (!scene.howl.playing()) scene.howl.play();
    });
    scene.video.addEventListener('pause', () => { scene.howl.pause(); });
    scene.video.addEventListener('ended', () => {
        scene.howl.stop();
        scene.video.playbackRate = 1.0;
    });
});

document.querySelectorAll('.progress-bar-container').forEach(container => {
    container.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const sceneID = this.getAttribute('data-scene');
        const scene = compData[sceneID];
        
        if (scene && scene.video.duration) {
            scene.video.currentTime = percentage * scene.video.duration;
        }
    });
});

function executeToggle() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
    const currentScene = compData[activeCompID];
    if (!currentScene) return;

    if (currentScene.video.paused) {
        if (currentScene.video.currentTime >= currentScene.video.duration) {
            currentScene.video.currentTime = 0;
        }
        currentScene.video.volume = currentScene.videoVol;
        currentScene.howl.volume(currentScene.musicVol);
        currentScene.video.play().catch(e => console.log("Context baseline set."));
    } else {
        currentScene.video.pause();
    }
    updatePlayButtonsUI();
}

if (compPlayBtn) compPlayBtn.addEventListener('click', executeToggle);

document.querySelectorAll('.mob-btn-shrunk').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const targetedID = this.getAttribute('data-scene');
        if (targetedID !== activeCompID) {
            switchActiveScene(targetedID);
        }
        executeToggle();
    });
});

// =========================================================================
// 3. UI Slider Sync Controllers - CLEANED AND DE-LAGGED
// =========================================================================
function runMusicVolumeUpdate(sceneID, val) {
    const scene = compData[sceneID];
    if (!scene) return;
    
    scene.musicVol = val;
    scene.howl.volume(val);

    if (sceneID === activeCompID && compFader) compFader.value = val;
    const mobInput = scene.section.querySelector('.comp-music-fader');
    if (mobInput) mobInput.value = val;
}

function runVideoVolumeUpdate(sceneID, val) {
    const scene = compData[sceneID];
    if (!scene) return;

    scene.videoVol = val;
    scene.video.volume = val;

    if (sceneID === activeCompID && compVideoFader) compVideoFader.value = val;
    const mobInput = scene.section.querySelector('.comp-video-fader');
    if (mobInput) mobInput.value = val;
}

document.querySelectorAll('.mob-row-layout').forEach(row => {
    row.addEventListener('touchstart', function(e) {
        if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
        const sceneID = this.getAttribute('data-scene');
        const scene = compData[sceneID];
        if (scene && scene.video.paused && scene.video.currentTime === 0) {
            scene.video.load(); 
        }
    }, { passive: true });
});

if (compFader) compFader.addEventListener('input', (e) => runMusicVolumeUpdate(activeCompID, parseFloat(e.target.value)));
if (compVideoFader) compVideoFader.addEventListener('input', (e) => runVideoVolumeUpdate(activeCompID, parseFloat(e.target.value)));

document.querySelectorAll('.comp-music-fader').forEach(slider => {
    slider.addEventListener('input', function(e) {
        e.stopPropagation();
        runMusicVolumeUpdate(this.getAttribute('data-scene'), parseFloat(this.value));
    });
});

document.querySelectorAll('.comp-video-fader').forEach(slider => {
    slider.addEventListener('input', function(e) {
        e.stopPropagation();
        runVideoVolumeUpdate(this.getAttribute('data-scene'), parseFloat(this.value));
    });
});

// 4. EXPLICIT HARD-TRIGGER SCENE SWITCH ENGINE
function switchActiveScene(targetSceneID) {
    if (targetSceneID === activeCompID) return;

    Object.keys(compData).forEach(sceneID => {
        const scene = compData[sceneID];
        scene.video.pause();
        scene.howl.pause();
        scene.video.playbackRate = 1.0;
    });

    activeCompID = targetSceneID;
    const newScene = compData[activeCompID];

    if (newScene.section) {
        newScene.section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.querySelectorAll('.nav-dot-row').forEach(row => {
        if (row.getAttribute('data-target') === targetSceneID) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    });

    if (compTitle && compDesc) {
        compTitle.style.opacity = '0';
        compDesc.style.opacity = '0';
        compTitle.style.transform = "translateY(-4px)";
        compDesc.style.transform = "translateY(-4px)";
        
        setTimeout(() => {
            compTitle.textContent = newScene.title;
            compDesc.textContent = newScene.desc;
            
            compTitle.style.opacity = '1';
            compDesc.style.opacity = '1';
            compTitle.style.transform = "translateY(0)";
            compDesc.style.transform = "translateY(0)";
            
            if (compFader) compFader.value = newScene.musicVol;
            if (compVideoFader) compVideoFader.value = newScene.videoVol;
        }, 250);
    }

    updatePlayButtonsUI();
}

document.querySelectorAll('.nav-dot-row').forEach(row => {
    row.addEventListener('click', function() {
        const targetID = this.getAttribute('data-target');
        switchActiveScene(targetID);
    });
});

// 5. UNTOUCHED PC TRACKPAD PHYSICS ENGINE (100% Isolated from Mobile)
let wheelDebounce = false;
window.addEventListener('wheel', (e) => {
    if (isMobileLayout()) return; 

    if (wheelDebounce) return;

    if (e.deltaY > 50 && activeCompID === 'scene-pigeon') {
        wheelDebounce = true;
        switchActiveScene('scene-beauties');
        setTimeout(() => wheelDebounce = false, 800); 
    } else if (e.deltaY < -50 && activeCompID === 'scene-beauties') {
        wheelDebounce = true;
        switchActiveScene('scene-pigeon');
        setTimeout(() => wheelDebounce = false, 800);
    }
}, { passive: true });

// UNIVERSAL MULTI-LAYER MOB TRACKER SWITCH EXECUTION
let mobileScrollTimeout;
function unifiedScrollProcessor() {
    if (!isMobileLayout()) return; 

    clearTimeout(mobileScrollTimeout);
    mobileScrollTimeout = setTimeout(() => {
        const currentContainerTop = compContainer ? compContainer.scrollTop : 0;
        const currentWindowTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        
        const absoluteScrollPosition = Math.max(currentContainerTop, currentWindowTop);
        const screenHeight = window.innerHeight;

        let resolvedTargetID = 'scene-pigeon';
        if (absoluteScrollPosition >= screenHeight * 0.45) {
            resolvedTargetID = 'scene-beauties';
        }

        if (resolvedTargetID !== activeCompID) {
            Object.keys(compData).forEach(sceneID => {
                const scene = compData[sceneID];
                scene.video.pause();
                scene.howl.pause();
            });
            
            activeCompID = resolvedTargetID;
            updatePlayButtonsUI();
            
            document.querySelectorAll('.nav-dot-row').forEach(row => {
                if (row.getAttribute('data-target') === resolvedTargetID) row.classList.add('active');
                else row.classList.remove('active');
            });
        }
    }, 80);
}

window.addEventListener('scroll', unifiedScrollProcessor, { passive: true });
if (compContainer) {
    compContainer.addEventListener('scroll', unifiedScrollProcessor, { passive: true });
}
document.body.addEventListener('scroll', unifiedScrollProcessor, { passive: true });

// 6. GLOBAL AUDIO KILL SWITCH
window.addEventListener('stopAllAudio', () => {
    Object.values(compData).forEach(scene => {
        scene.video.pause();
        scene.howl.pause();
        scene.video.playbackRate = 1.0;
    });
    updatePlayButtonsUI();
});