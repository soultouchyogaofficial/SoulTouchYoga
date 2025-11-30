document.addEventListener('DOMContentLoaded', function() {

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('.main-nav').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Active nav link on scroll
    const navObserverOptions = {
        root: null,
        rootMargin: '-100px',
        threshold: 0.3
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    // Observe sections for active nav state and animations
    const sections = document.querySelectorAll('section');

    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        observer.observe(section);
        navObserver.observe(section);
    });

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Audio play/pause: ensure only one plays at a time
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;
    let countdownTimer = null;

    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const audio = btn.previousElementSibling;
            const card = btn.closest('.meditation-card');
            const countdownEl = card ? card.querySelector('.countdown') : null;
            const totalSeconds = card ? parseInt(card.getAttribute('data-duration') || '0', 10) : 0;
            if (!audio) return;

            // Pause currently playing audio if different
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                const prevBtn = currentAudio.nextElementSibling;
                if (prevBtn && prevBtn.classList.contains('play-btn')) {
                    prevBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                }
                clearInterval(countdownTimer);
                countdownTimer = null;
            }

            if (audio.paused) {
                audio.play();
                btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                currentAudio = audio;

                // Start countdown if available
                if (countdownEl && totalSeconds > 0) {
                    let remaining = totalSeconds;
                    updateCountdown(countdownEl, remaining);
                    clearInterval(countdownTimer);
                    countdownTimer = setInterval(() => {
                        remaining -= 1;
                        if (remaining <= 0) {
                            clearInterval(countdownTimer);
                            countdownTimer = null;
                            audio.pause();
                            audio.currentTime = 0;
                            btn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                            currentAudio = null;
                            updateCountdown(countdownEl, totalSeconds);
                        } else {
                            updateCountdown(countdownEl, remaining);
                        }
                    }, 1000);
                }
            } else {
                audio.pause();
                btn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                currentAudio = null;
                clearInterval(countdownTimer);
                countdownTimer = null;
                if (countdownEl && totalSeconds > 0) {
                    updateCountdown(countdownEl, totalSeconds);
                }
            }
        });
    });

    // Reset button text when audio ends
    const audios = document.querySelectorAll('#meditation audio');
    audios.forEach(a => {
        a.addEventListener('ended', () => {
            const btn = a.nextElementSibling;
            if (btn && btn.classList.contains('play-btn')) {
                btn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
            }
            currentAudio = null;
            clearInterval(countdownTimer);
            countdownTimer = null;
        });
    });

    function updateCountdown(el, seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${s}`;
    }

    // Gallery buttons scroll behavior
    const gallery = document.querySelector('#gallery .gallery-grid');
    const prevBtn = document.querySelector('#gallery .gallery-btn.prev'); // removed in UI, may be null
    const nextBtn = document.querySelector('#gallery .gallery-btn.next'); // removed in UI, may be null
    const progressBar = document.querySelector('.gallery-progress');
    const lightbox = document.querySelector('.lightbox');
    const lbImage = document.querySelector('.lightbox-image');
    const lbCaption = document.querySelector('.lightbox-caption');
    const lbClose = document.querySelector('.lightbox-close');
    const lbPrev = document.querySelector('.lightbox-nav.prev');
    const lbNext = document.querySelector('.lightbox-nav.next');
    const lbDots = document.querySelector('.lightbox-dots');
    const lbLive = document.getElementById('lightbox-live');
    // Slideshow toggle (in lightbox)
    let slideshowToggle = document.querySelector('.slideshow-toggle');
    // Simplified: no filters or view toggle
    let currentLbIndex = 0;
    let slideshowInterval = null; // retained for potential future use but not exposed

    const galleryItems = gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];

    if (gallery) {
        const scrollAmount = 440; // approx one larger card width + gap
        // Center first image
        const centerFirst = () => {
            const first = gallery.querySelector('.gallery-item');
            if (!first) return;
            const target = first.offsetLeft - (gallery.clientWidth - first.clientWidth) / 2;
            gallery.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
        };
        requestAnimationFrame(centerFirst);

        // Optional button listeners if buttons still exist (future flexibility)
        if (prevBtn) prevBtn.addEventListener('click', () => gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        if (nextBtn) nextBtn.addEventListener('click', () => gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

        // Keyboard scroll (arrow keys) when focused
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault(); gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (e.key === 'ArrowRight') {
                e.preventDefault(); gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });

        // Auto-scroll bounce
        let direction = 1;
        let autoScroll = setInterval(() => {
            const maxScroll = gallery.scrollWidth - gallery.clientWidth;
            const atEnd = gallery.scrollLeft >= maxScroll - 2;
            const atStart = gallery.scrollLeft <= 2;
            if (atEnd) direction = -1;
            if (atStart) direction = 1;
            gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }, 10000);

        // Expose pause/resume globally for lightbox logic
        window.galleryPause = () => { if (autoScroll) { clearInterval(autoScroll); autoScroll = null; } };
        window.galleryResume = () => { if (!autoScroll) { autoScroll = setInterval(() => {
            const maxScroll = gallery.scrollWidth - gallery.clientWidth;
            const atEnd = gallery.scrollLeft >= maxScroll - 2;
            const atStart = gallery.scrollLeft <= 2;
            if (atEnd) direction = -1;
            if (atStart) direction = 1;
            gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }, 10000); } };

        gallery.addEventListener('mouseenter', window.galleryPause);
        gallery.addEventListener('mouseleave', window.galleryResume);
        gallery.addEventListener('focusin', window.galleryPause);
        gallery.addEventListener('focusout', window.galleryResume);

        const updateProgress = () => {
            if (!progressBar) return;
            const maxScroll = gallery.scrollWidth - gallery.clientWidth;
            const ratio = maxScroll > 0 ? gallery.scrollLeft / maxScroll : 0;
            progressBar.style.setProperty('--progress', (ratio * 100).toFixed(2) + '%');
        };
        gallery.addEventListener('scroll', updateProgress);
        updateProgress();
    }

        // Lightbox setup
        if (lightbox && galleryItems.length) {
            // Ensure we have the latest reference to the slideshow toggle
            slideshowToggle = lightbox.querySelector('.slideshow-toggle');
            // Build dots
            galleryItems.forEach((_, idx) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.addEventListener('click', () => openLightbox(idx));
                lbDots.appendChild(b);
            });

            const updateDots = () => {
                const buttons = lbDots.querySelectorAll('button');
                buttons.forEach((btn, i) => {
                    btn.classList.toggle('active', i === currentLbIndex);
                });
            };

            const preloadNeighbors = (index) => {
                [index + 1, index - 1].forEach(i => {
                    const realIndex = (i + galleryItems.length) % galleryItems.length;
                    const item = galleryItems[realIndex];
                    if (item) {
                        const src = item.getAttribute('data-full');
                        const img = new Image();
                        img.src = src;
                    }
                });
            };

            const openLightbox = (idx) => {
                currentLbIndex = idx;
                const item = galleryItems[idx];
                if (!item) return;
                const fullSrc = item.getAttribute('data-full');
                const caption = item.getAttribute('data-caption');
                lbImage.style.opacity = 0;
                lbImage.src = fullSrc;
                lbImage.alt = caption || 'Gallery image';
                lbCaption.textContent = caption || '';
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                updateDots();
                lbImage.focus();
                if (window.galleryPause) window.galleryPause(); // pause gallery auto scroll while lightbox open
                if (lbLive) lbLive.textContent = caption || 'Image ' + (idx + 1);
                preloadNeighbors(idx);
                // Reset slideshow button state on open
                if (slideshowToggle) {
                    slideshowToggle.setAttribute('aria-pressed','false');
                    slideshowToggle.innerHTML = '<i class="fa-solid fa-play"></i> Slideshow';
                }
            };

            const closeLightbox = () => {
                lightbox.classList.remove('active');
                lightbox.setAttribute('aria-hidden', 'true');
                if (window.galleryResume) window.galleryResume();
                stopSlideshow();
            };

            const navigateLightbox = (dir) => {
                currentLbIndex = (currentLbIndex + dir + galleryItems.length) % galleryItems.length;
                openLightbox(currentLbIndex);
            };

            lbPrev.addEventListener('click', () => navigateLightbox(-1));
            lbNext.addEventListener('click', () => navigateLightbox(1));
            lbClose.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); navigateLightbox(-1); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); navigateLightbox(1); }
            });

            // Focus trap within lightbox
            const trapFocus = (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key !== 'Tab') return;
                const focusable = Array.from(lightbox.querySelectorAll('button, [href], img.lightbox-image, [tabindex]:not([tabindex="-1"])'))
                    .filter(el => !el.hasAttribute('disabled'));
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            };
            document.addEventListener('keydown', trapFocus);

            // Fade-in once image loads
            lbImage.addEventListener('load', () => {
                lbImage.style.opacity = 1;
            });

            // Swipe support for lightbox
            let startX = 0, endX = 0;
            lightbox.addEventListener('pointerdown', (e) => { startX = e.clientX; });
            lightbox.addEventListener('pointerup', (e) => {
                endX = e.clientX;
                const delta = endX - startX;
                if (Math.abs(delta) > 50) {
                    navigateLightbox(delta < 0 ? 1 : -1);
                }
            });

            // Click gallery item to open lightbox
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.getAttribute('data-index'), 10) || 0;
                    openLightbox(idx);
                });
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const idx = parseInt(item.getAttribute('data-index'), 10) || 0;
                        openLightbox(idx);
                    }
                });
                item.setAttribute('tabindex', '0');
            });

            // Slideshow controls
            const startSlideshow = () => {
                if (slideshowInterval) return;
                if (slideshowToggle) {
                    slideshowToggle.setAttribute('aria-pressed','true');
                    slideshowToggle.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                }
                slideshowInterval = setInterval(() => {
                    navigateLightbox(1);
                }, 5000);
            };
            const stopSlideshow = () => {
                if (!slideshowInterval) return;
                clearInterval(slideshowInterval);
                slideshowInterval = null;
                if (slideshowToggle) {
                    slideshowToggle.setAttribute('aria-pressed','false');
                    slideshowToggle.innerHTML = '<i class="fa-solid fa-play"></i> Slideshow';
                }
            };
            if (slideshowToggle) {
                // Avoid multiple bindings
                slideshowToggle.onclick = null;
                slideshowToggle.addEventListener('click', () => {
                    if (slideshowInterval) stopSlideshow(); else startSlideshow();
                });
            }
        }
});
