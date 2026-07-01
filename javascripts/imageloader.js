// =========================================================================
// imageloader.js - CACHE-AWARE HARDWARE-ACCELERATED PRECACHE ENGINE
// =========================================================================
(function() {
    document.addEventListener("DOMContentLoaded", () => {

        // 1. HARDWARE-ACCELERATED IMAGE PRECACHE
        const styledElements = document.querySelectorAll('[style*="background-image"], [data-bg]');
        const standardImages = document.querySelectorAll('img');

        styledElements.forEach(element => {
            let imageUrl = element.getAttribute('data-bg');
            
            if (!imageUrl) {
                const computedStyle = window.getComputedStyle(element);
                const bgImageValue = computedStyle.backgroundImage;
                if (bgImageValue && bgImageValue !== 'none') {
                    imageUrl = bgImageValue.slice(4, -1).replace(/"/g, "");
                }
            }
            
            if (imageUrl) {
                const imgPreloader = new Image();
                
                imgPreloader.onload = () => {
                    element.classList.add('loaded');
                };
                
                imgPreloader.src = imageUrl;

                // FIX: If the image is already cached, apply the loaded class immediately
                if (imgPreloader.complete) {
                    element.classList.add('loaded');
                }
            }
        });

        standardImages.forEach(img => {
            if (img.src) {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                
                if (img.complete) {
                    img.style.opacity = '1';
                } else {
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                }
            }
        });
    });
})();