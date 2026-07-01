// =========================================================================
// player.js - UNIVERSAL DYNAMIC PORTFOLIO AUDIO ENGINE
// =========================================================================
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const trackCards = document.querySelectorAll('.audio-track-card');
        let currentActiveAudio = null;
        let currentActiveButton = null;

        trackCards.forEach(card => {
            const playButton = card.querySelector('.play-button-disk');
            const progressBar = card.querySelector('.timeline-progress-bar');
            const durationStamp = card.querySelector('.track-duration-stamp');
            const timelineContainer = card.querySelector('.timeline-container');
            
            if (!playButton) return;

            const audioSrc = playButton.getAttribute('data-track-src');
            let audio = new Audio(audioSrc);
            let isPlaying = false;

            // Format time utility (e.g., 0:00)
            function formatTime(secs) {
                if (isNaN(secs)) return "0:00";
                const minutes = Math.floor(secs / 60);
                const seconds = Math.floor(secs % 60);
                return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }

            // Load metadata to accurately display duration stamp
            audio.addEventListener('loadedmetadata', () => {
                durationStamp.textContent = formatTime(audio.duration);
            });

            // Fallback display if metadata takes a second to catch up
            if (audio.readyState >= 1) {
                durationStamp.textContent = formatTime(audio.duration);
            }

            // Playback management control system
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // If a completely separate track is clicked, kill the running audio instance first
                if (currentActiveAudio && currentActiveAudio !== audio) {
                    currentActiveAudio.pause();
                    currentActiveAudio.currentTime = 0;
                    if (currentActiveButton) {
                        currentActiveButton.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
                    }
                    // Trigger global event in case compositions.js or other layers need to reset
                    window.dispatchEvent(new CustomEvent('stopAllAudio'));
                }

                if (isPlaying) {
                    audio.pause();
                    playButton.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
                    currentActiveAudio = null;
                    currentActiveButton = null;
                } else {
                    audio.play();
                    playButton.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
                    currentActiveAudio = audio;
                    currentActiveButton = playButton;
                }
                isPlaying = !isPlaying;
            });

            // Drive timeline alignment parameters
            audio.addEventListener('timeupdate', () => {
                if (!audio.duration) return;
                const progress = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = `${progress}%`;
                durationStamp.textContent = formatTime(audio.currentTime);
            });

            // Automatically clean up running cache flags when sound clips complete
            audio.addEventListener('ended', () => {
                isPlaying = false;
                if (progressBar) progressBar.style.width = '0%';
                durationStamp.textContent = formatTime(audio.duration);
                playButton.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
                if (currentActiveAudio === audio) {
                    currentActiveAudio = null;
                    currentActiveButton = null;
                }
            });

            // Linear timeline scrubbing click mechanism
            if (timelineContainer) {
                timelineContainer.addEventListener('click', (e) => {
                    const rect = timelineContainer.getBoundingClientRect();
                    const clickPosition = (e.clientX - rect.left) / rect.width;
                    if (audio.duration) {
                        audio.currentTime = clickPosition * audio.duration;
                    }
                });
            }
        });
    });
})();