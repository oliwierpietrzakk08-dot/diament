document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on clicking a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
             navLinks.classList.remove('active');
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

    // 3. Rozbudowany Kalkulator Zależny od Grubości
    const serviceType = document.getElementById('service-type');
    const areaSize = document.getElementById('area-size');
    const thicknessSize = document.getElementById('thickness-size');
    const areaVal = document.getElementById('area-val');
    const thicknessVal = document.getElementById('thickness-val');
    const calcResult = document.getElementById('calc-result');

    if (serviceType && areaSize && thicknessSize && areaVal && thicknessVal && calcResult) {
        // Cenniki bazowe
        // Piana PUR: Wg wskazań bazy 25cm grubości kosztuje 80 PLN za m2.
        // Daje to wskaźnik 80 / 25 = 3.2 PLN za każdy cm grubości na m2.
        const purCostPerCm = 3.2; 
        
        // Wylewki: Umowna stawka bazowa 40 pln / m2 przy standardzie 5cm.
        // Daje to 40 / 5 = 8.0 PLN za każdy cm wylewki na m2.
        const wylewkaCostPerCm = 8.0;

        function calculateCost() {
            const area = parseInt(areaSize.value);
            const type = serviceType.value;
            const thickness = parseInt(thicknessSize.value);
            
            let totalCost = 0;

            if (type.includes('piana')) {
                // Kalkulacja PUR oparta o grubość i powierzchnię
                totalCost = area * (thickness * purCostPerCm);
            } else if (type.includes('wylewka')) {
                // Kalkulacja wylewek oparta o grubość i powierzchnię
                totalCost = area * (thickness * wylewkaCostPerCm);
            }

            // Aktualizacja UI
            areaVal.textContent = area;
            thicknessVal.textContent = thickness;
            calcResult.textContent = Math.round(totalCost).toLocaleString('pl-PL') + ' PLN';
        }

        function adjustThicknessSlider() {
            const type = serviceType.value;
            
            if (type.includes('piana')) {
                thicknessSize.min = 10;
                thicknessSize.max = 30;
                thicknessSize.step = 1;
                if(parseInt(thicknessSize.value) < 10) thicknessSize.value = 15; 
            } else if (type.includes('wylewka')) {
                thicknessSize.min = 3;
                thicknessSize.max = 12;
                thicknessSize.step = 1;
                if(parseInt(thicknessSize.value) > 12) thicknessSize.value = 6;
            }
            calculateCost();
        }

        serviceType.addEventListener('change', adjustThicknessSlider);
        areaSize.addEventListener('input', calculateCost);
        thicknessSize.addEventListener('input', calculateCost);

        // Wywołanie początkowe
        adjustThicknessSlider();
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
                // Optional: stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // 5. System Galerii z Lightbox (Modal Po Pełnoekranowym Kliknięciu)
    
    // Konfiguracja folderów docelowych dla osobnych zbiorów zdjęć (Wylewki i Ocieplenia)
    const galleries = [
        { containerId: 'gallery-wylewki', folder: './images/wylewki/' },
        { containerId: 'gallery-ocieplenia', folder: './images/ocieplenia/' }
    ];

    let currentImages = [];
    let currentIndex = 0;
    const maxImages = 12; // Zwiększony limit: Próbujemy załadować do 12 zdjęć na każdą sekcję

    // Inicjalizacja Modal HTML z poziomu JS jeśli nieistnieje (wstawiamy go dynamicznie)
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

    // Funkcja pobierająca z pętli obrazkowej
    galleries.forEach(gal => {
        const container = document.getElementById(gal.containerId);
        if (container) {
            let imagesFound = 0;
            const galImages = []; // tymczasowa lokalna tablica na ścieżki dla danego gridu

            for (let i = 1; i <= maxImages; i++) {
                let img = new Image();
                img.src = `${gal.folder}${i}.jpg`;
                
                img.onload = function() {
                    imagesFound++;
                    galImages.push(this.src); // dodajemy do zbioru

                    // Usunięcie stanu pustego galerii po zaladowaniu przynajmniej 1 foto
                    let emptyState = container.querySelector('.gallery-empty');
                    if (emptyState) emptyState.remove();

                    let item = document.createElement('div');
                    item.className = 'gallery-item animate-on-scroll';
                    
                    let imageEl = document.createElement('img');
                    imageEl.src = this.src;
                    imageEl.alt = `Realizacja PLUS Izolacje ${i}`;
                    
                    item.appendChild(imageEl);
                    container.appendChild(item);
                    
                    // Podłącz Lightbox Trigger
                    item.addEventListener('click', () => {
                        openModal(galImages, galImages.indexOf(this.src));
                    });

                    // Dodanie obserwatora animacji
                    observer.observe(item);
                }
            }

            // Pusty stan fallbackowy po 800ms
            setTimeout(() => {
                if(imagesFound === 0 && !container.querySelector('.gallery-empty')) {
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

    // Zamykanie klawiszem ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modalEl.classList.contains('show')) {
            closeModal();
        }
    });
});
