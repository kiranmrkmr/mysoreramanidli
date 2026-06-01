/* =============================================
   MYSORE RAMAN IDLI — Main JavaScript
   ============================================= */


/* --- Navbar --- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const isInnerPage = navbar.classList.contains('inner-page');
  const hamburger = navbar.querySelector('.hamburger');
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');

  // Set initial state
  if (!isInnerPage) {
    navbar.classList.add('transparent');
  }

  // Scroll handler
  function onScroll() {
    if (isInnerPage) return;
    if (window.scrollY > 50) {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (hamburger && drawer && overlay) {
    function openDrawer() {
      hamburger.classList.add('open');
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', () => {
      if (drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }
})();

/* --- Scroll Reveal (IntersectionObserver) --- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  // Apply stagger delays from data-delay (used as animation-delay on .visible)
  els.forEach(el => {
    const delay = el.dataset.delay;
    if (delay) el.dataset.animDelay = delay;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Double rAF ensures browser has painted opacity:0 before transitioning
        const el = entry.target;
        const delay = el.dataset.animDelay;
        if (delay) el.style.animationDelay = delay + 's';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.classList.add('visible');
          });
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Let browser paint opacity:0 first, then trigger transitions
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.forEach(el => {
        observer.observe(el);
      });
    });
  });
})();

/* --- Menu Page Tabs --- */
(function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.cat;
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Show/hide sections
      document.querySelectorAll('.menu-items-section').forEach(section => {
        if (section.dataset.cat === target) {
          section.style.display = 'grid';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
})();

/* --- Gallery Filter --- */
(function initGalleryFilter() {
  const btns = document.querySelectorAll('.gallery-filter-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.gallery-masonry-item').forEach(item => {
        if (cat === 'All' || item.dataset.cat === cat) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* --- Lightbox --- */
(function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let items = [];
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const img = items[currentIndex].querySelector('img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNavBtns();
  }

  function updateNavBtns() {
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex === items.length - 1 ? '0.3' : '1';
  }

  function showPrev() {
    if (currentIndex > 0) openLightbox(currentIndex - 1);
  }

  function showNext() {
    if (currentIndex < items.length - 1) openLightbox(currentIndex + 1);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Collect visible items (respects filter)
  function refreshItems() {
    items = Array.from(document.querySelectorAll('.gallery-masonry-item')).filter(
      el => el.style.display !== 'none'
    );
  }

  document.querySelectorAll('.gallery-masonry-item').forEach(item => {
    item.addEventListener('click', () => {
      refreshItems();
      const index = items.indexOf(item);
      if (index !== -1) openLightbox(index);
    });
  });

  // Also refresh items when filter changes
  document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { items = []; });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); showNext(); });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxImg.parentElement) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();

/* --- Contact Form --- */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const success = document.querySelector('.form-success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    if (success) success.classList.add('visible');
  });
})();

/* --- Home Gallery Carousel --- */
(function initHomeGalleryCarousel() {
  const carousel = document.getElementById('galleryCarousel');
  if (!carousel) return;
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const items = carousel.querySelectorAll('.gallery-carousel-item');
  let current = 0;

  function getVisible() {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function getItemWidth() {
    const gap = 16;
    return items[0].getBoundingClientRect().width + gap;
  }

  function maxIndex() {
    return Math.max(0, items.length - getVisible());
  }

  function update() {
    carousel.style.transform = `translateX(-${current * getItemWidth()}px)`;
    prevBtn.style.opacity = current === 0 ? '0.4' : '1';
    nextBtn.style.opacity = current >= maxIndex() ? '0.4' : '1';
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; update(); }
  });
  nextBtn.addEventListener('click', () => {
    if (current < maxIndex()) { current++; update(); }
  });

  window.addEventListener('resize', () => {
    current = Math.min(current, maxIndex());
    update();
  });

  update();
})();
