document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Mobile dropdown — toggle na klik (dotyk)
    document.querySelectorAll('.dropdown > a').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = trigger.closest('.dropdown');
                const isOpen = dropdown.classList.contains('open');
                // Zamknij wszystkie inne
                document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
                if (!isOpen) dropdown.classList.add('open');
            }
        });
    });

    // Zamknij mobile menu po kliknięciu w link (nie dropdown trigger)
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Nie zamykaj jeśli to trigger dropdownu na mobile
            if (link.closest('.dropdown') && window.innerWidth <= 768 && link === link.closest('.dropdown').querySelector(':scope > a')) {
                return;
            }
            navLinks.classList.remove('active');
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        });
    });

    // 2. Navbar Scroll Effect (Glassmorphism shrink)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Kalkulator Tynków
    const serviceType = document.getElementById('service-type');
    const areaSize = document.getElementById('area-size');
    const areaVal = document.getElementById('area-val');
    const calcResult = document.getElementById('calc-result');

    if (serviceType && areaSize && areaVal && calcResult) {
        // Ceny robocizny za m2
        const prices = {
            tynk_gipsowo_wapienny: 35,
            tynk_gipsowy_twardy: 38,
            tynk_gipsowy_lekki: 36,
            tynk_cementowo_wapienny: 42
        };

        function calculateCost() {
            const area = parseInt(areaSize.value);
            const type = serviceType.value;
            const pricePerM2 = prices[type] || 35;
            const totalCost = area * pricePerM2;

            areaVal.textContent = area;
            calcResult.textContent = Math.round(totalCost).toLocaleString('pl-PL') + ' PLN';
        }

        serviceType.addEventListener('change', calculateCost);
        areaSize.addEventListener('input', calculateCost);

        // Wywołanie początkowe
        calculateCost();
    }

    // 4. Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // 5. System Galerii z Lightbox
    const galleries = [
        { containerId: 'gallery-tynki', folder: './images/tynki/' }
    ];

    let currentImages = [];
    let currentIndex = 0;
    const maxImages = 12;

    let modalEl = document.getElementById('lightbox-modal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'lightbox-modal';
        modalEl.className = 'modal';
        modalEl.innerHTML = `
            <a class="close-modal">&times;</a>
            <img class="modal-content" id="lightbox-img">
            <a class="modal-nav modal-prev">&#10094;</a>
            <a class="modal-nav modal-next">&#10095;</a>
        `;
        document.body.appendChild(modalEl);
    }

    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');

    galleries.forEach(gal => {
        const container = document.getElementById(gal.containerId);
        if (container) {
            let imagesFound = 0;
            const galImages = [];

            for (let i = 1; i <= maxImages; i++) {
                let img = new Image();
                img.src = `${gal.folder}${i}.jpg`;

                img.onload = function() {
                    imagesFound++;
                    galImages.push(this.src);

                    let emptyState = container.querySelector('.gallery-empty');
                    if (emptyState) emptyState.remove();

                    let item = document.createElement('div');
                    item.className = 'gallery-item animate-on-scroll';

                    let imageEl = document.createElement('img');
                    imageEl.src = this.src;
                    imageEl.alt = `Realizacja Diament - tynki maszynowe ${i}`;

                    item.appendChild(imageEl);
                    container.appendChild(item);

                    item.addEventListener('click', () => {
                        openModal(galImages, galImages.indexOf(this.src));
                    });

                    observer.observe(item);
                }
            }

            setTimeout(() => {
                if (imagesFound === 0 && !container.querySelector('.gallery-empty')) {
                    container.innerHTML = `
                        <div class="gallery-empty">
                            <svg style="width: 40px; height: 40px; margin-bottom: 1rem; opacity: 0.5; stroke: currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <p>Realizacje pojawią się automatycznie po dodaniu plików.<br/>Wrzuć zdjęcia do folderu <strong>${gal.folder}</strong> jako <em>1.jpg</em>, <em>2.jpg</em>, itd.</p>
                        </div>
                    `;
                }
            }, 800);
        }
    });

    // Kontrola Modalu
    function openModal(imgArray, index) {
        currentImages = imgArray;
        currentIndex = index;
        lightboxImg.src = currentImages[currentIndex];
        modalEl.classList.add('show');
    }

    function closeModal() {
        modalEl.classList.remove('show');
    }

    function changeSlide(step) {
        currentIndex += step;
        if (currentIndex >= currentImages.length) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = currentImages.length - 1;
        }
        lightboxImg.src = currentImages[currentIndex];
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modalEl.classList.contains('show')) {
            closeModal();
        }
    });

    // 6. Reviews Carousel (mobile only)
    (function() {
        const reviewsGrid = document.getElementById('reviews-slider');
        const dotsContainer = document.getElementById('slider-dots');
        const sliderPrev = document.querySelector('.slider-prev');
        const sliderNext = document.querySelector('.slider-next');
        const sliderControls = document.querySelector('.slider-controls');

        if (!reviewsGrid || !sliderControls) return;

        const cards = reviewsGrid.querySelectorAll('.review-card');
        const total = cards.length;
        let current = 0;

        function isMobile() {
            return window.innerWidth <= 768;
        }

        // Pokaż / ukryj kontrolki
        function toggleControls() {
            sliderControls.style.display = isMobile() ? 'flex' : 'none';
        }

        // Generuj kropki
        if (dotsContainer) {
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Opinia ' + (i + 1));
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
            });
        }

        function updateArrows() {
            if (sliderPrev) sliderPrev.disabled = current === 0;
            if (sliderNext) sliderNext.disabled = current === total - 1;
        }

        function goTo(index) {
            if (!isMobile()) return;
            current = Math.max(0, Math.min(index, total - 1));
            const width = reviewsGrid.parentElement.offsetWidth;
            reviewsGrid.style.transform = 'translateX(-' + (current * width) + 'px)';
            updateDots();
            updateArrows();
        }

        if (sliderPrev) sliderPrev.addEventListener('click', () => goTo(current - 1));
        if (sliderNext) sliderNext.addEventListener('click', () => goTo(current + 1));

        // Swipe / dotyk
        let touchStartX = 0;
        reviewsGrid.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        reviewsGrid.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        }, { passive: true });

        // Reset przy resize (przejście desktop ↔ mobile)
        window.addEventListener('resize', () => {
            toggleControls();
            if (!isMobile()) {
                reviewsGrid.style.transform = '';
                current = 0;
            } else {
                goTo(current);
            }
        });

        toggleControls();
        updateArrows();
    })();
});
