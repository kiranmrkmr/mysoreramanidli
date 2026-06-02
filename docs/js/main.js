/* =============================================
   MYSORE RAMAN IDLI — Main JavaScript
   ============================================= */

/* -----------------------------------------------
   NAVBAR (runs once — persists across transitions)
   ----------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const hamburger = navbar.querySelector('.hamburger');
  const drawer    = document.querySelector('.nav-drawer');
  const overlay   = document.querySelector('.nav-overlay');

  function onScroll() {
    if (navbar.classList.contains('inner-page')) return;
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
}

/* -----------------------------------------------
   Update navbar appearance + active link per page
   ----------------------------------------------- */
function updateNavForNamespace(namespace) {
  const navbar  = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-order), .nav-drawer a:not(.nav-drawer-order)');

  if (!navbar) return;

  if (namespace === 'home') {
    navbar.classList.remove('inner-page');
    if (window.scrollY <= 50) {
      navbar.classList.add('transparent');
      navbar.classList.remove('scrolled');
    }
  } else {
    navbar.classList.add('inner-page');
    navbar.classList.remove('transparent');
    navbar.classList.remove('scrolled');
  }

  // Map namespace → filename
  const nsMap = {
    home:      'index.html',
    menu:      'menu.html',
    about:     'about.html',
    gallery:   'gallery.html',
    locations: 'locations.html',
    contact:   'contact.html',
  };
  const targetFile = nsMap[namespace] || '';

  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const base = href.split('#')[0];
    link.classList.toggle('active', base === targetFile);
  });
}

/* -----------------------------------------------
   Scroll Reveal (IntersectionObserver)
   ----------------------------------------------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  // Reset any previously-visible state so reveals re-animate on new page
  els.forEach(el => {
    el.classList.remove('visible');
    el.style.removeProperty('animation-delay');
    el.style.removeProperty('transition');
    el.style.removeProperty('animation');
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || el.dataset.animDelay;
        if (delay) el.style.animationDelay = delay + 's';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.classList.add('visible');
        }));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    els.forEach(el => observer.observe(el));
  }));
}

/* -----------------------------------------------
   Menu Page Tabs
   ----------------------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  if (!tabs.length) return;

  const navbar     = document.querySelector('.navbar');
  const anchor     = document.getElementById('menu-anchor');
  const tabsScroll = document.querySelector('.menu-tabs');

  function getScrollTarget() {
    const navH = navbar ? navbar.offsetHeight : 0;
    return anchor ? anchor.offsetTop - navH : 0;
  }

  function scrollTabIntoView(tabEl) {
    if (!tabsScroll || !tabEl) return;
    const barRect = tabsScroll.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    const offset  = tabRect.left - barRect.left + tabsScroll.scrollLeft;
    const center  = offset - barRect.width / 2 + tabRect.width / 2;
    tabsScroll.scrollTo({ left: center, behavior: 'smooth' });
  }

  function activateTab(cat, scrollPage, scrollBehavior) {
    tabs.forEach(t => t.classList.remove('active'));
    const match = Array.from(tabs).find(t => t.dataset.cat === cat);
    if (match) {
      match.classList.add('active');
      scrollTabIntoView(match);
    }
    document.querySelectorAll('.menu-items-section').forEach(section => {
      section.style.display = section.dataset.cat === cat ? 'grid' : 'none';
    });
    if (scrollPage) {
      window.scrollTo({ top: getScrollTarget(), behavior: scrollBehavior || 'smooth' });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.cat, true, 'smooth');
      history.replaceState(null, '', '#' + tab.dataset.cat);
    });
  });

  // Activate from hash immediately (handles both initial load and Barba enter)
  const hash = window.location.hash.replace('#', '');
  if (hash && Array.from(tabs).some(t => t.dataset.cat === hash)) {
    activateTab(hash, true, 'instant');
  }

  // Intercept footer menu links when already on menu page
  document.querySelectorAll('a[href^="menu.html#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const h = link.getAttribute('href').split('#')[1];
      if (Array.from(tabs).some(t => t.dataset.cat === h)) {
        history.pushState(null, '', '#' + h);
        activateTab(h, true, 'smooth');
      }
    });
  });
}

/* -----------------------------------------------
   Gallery Filter
   ----------------------------------------------- */
function initGalleryFilter() {
  const btns = document.querySelectorAll('.gallery-filter-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gallery-masonry-item').forEach(item => {
        item.style.display = (cat === 'All' || item.dataset.cat === cat) ? 'block' : 'none';
      });
    });
  });
}

/* -----------------------------------------------
   Lightbox
   ----------------------------------------------- */
function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('img');
  const closeBtn    = lightbox.querySelector('.lightbox-close');
  const prevBtn     = lightbox.querySelector('.lightbox-prev');
  const nextBtn     = lightbox.querySelector('.lightbox-next');

  let items = [];
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const img = items[currentIndex].querySelector('img');
    if (img) { lightboxImg.src = img.src; lightboxImg.alt = img.alt; }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNavBtns();
  }

  function updateNavBtns() {
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex === items.length - 1 ? '0.3' : '1';
  }

  function showPrev() { if (currentIndex > 0) openLightbox(currentIndex - 1); }
  function showNext() { if (currentIndex < items.length - 1) openLightbox(currentIndex + 1); }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function refreshItems() {
    items = Array.from(document.querySelectorAll('.gallery-masonry-item'))
      .filter(el => el.style.display !== 'none');
  }

  document.querySelectorAll('.gallery-masonry-item').forEach(item => {
    item.addEventListener('click', () => {
      refreshItems();
      const index = items.indexOf(item);
      if (index !== -1) openLightbox(index);
    });
  });

  document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { items = []; });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
  if (nextBtn)  nextBtn.addEventListener('click', e => { e.stopPropagation(); showNext(); });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxImg.parentElement) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

/* -----------------------------------------------
   Contact Form
   ----------------------------------------------- */
function initContactForm() {
  const form    = document.querySelector('.contact-form');
  if (!form) return;
  const success = document.querySelector('.form-success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    if (success) success.classList.add('visible');
  });
}

/* -----------------------------------------------
   Home Gallery Carousel
   ----------------------------------------------- */
function initHomeGalleryCarousel() {
  const carousel = document.getElementById('galleryCarousel');
  if (!carousel) return;

  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const items   = carousel.querySelectorAll('.gallery-carousel-item');
  let current   = 0;

  function getVisible() {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 600)  return 2;
    return 1;
  }

  function getItemWidth() {
    return items[0].getBoundingClientRect().width + 16;
  }

  function maxIndex() { return Math.max(0, items.length - getVisible()); }

  function update() {
    carousel.style.transform = `translateX(-${current * getItemWidth()}px)`;
    prevBtn.style.opacity = current === 0 ? '0.4' : '1';
    nextBtn.style.opacity = current >= maxIndex() ? '0.4' : '1';
  }

  prevBtn.addEventListener('click', () => { if (current > 0) { current--; update(); } });
  nextBtn.addEventListener('click', () => { if (current < maxIndex()) { current++; update(); } });
  window.addEventListener('resize', () => { current = Math.min(current, maxIndex()); update(); });

  update();
}

/* -----------------------------------------------
   Order Modal (WhatsApp)
   ----------------------------------------------- */
function initOrderModal() {
  const backdrop  = document.getElementById('orderModalBackdrop');
  if (!backdrop) return;

  const closeBtn  = document.getElementById('orderModalClose');
  const titleEl   = document.getElementById('orderModalTitle');
  const priceEl   = backdrop.querySelector('.order-modal-price');
  const qtyInput  = document.getElementById('orderQty');
  const minusBtn  = document.getElementById('orderQtyMinus');
  const plusBtn   = document.getElementById('orderQtyPlus');
  const totalEl   = document.getElementById('orderTotal');
  const submitBtn = document.getElementById('orderModalSubmit');

  const WHATSAPP_NUMBER = '919633299529';
  let currentDish = { name: '', price: 0 };

  function updateTotal() {
    const qty = parseInt(qtyInput.value) || 1;
    totalEl.textContent = '₹' + (currentDish.price * qty);
  }

  function openModal(name, price) {
    currentDish = { name, price: parseInt(price) };
    titleEl.textContent = name;
    priceEl.textContent = '₹' + price + ' per plate';
    qtyInput.value = 1;
    updateTotal();
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-dish]').forEach(btn => {
    btn.addEventListener('click', () => {
      let name  = btn.dataset.name;
      let price = btn.dataset.price;
      if (!name) {
        const card = btn.closest('.menu-card, .dish-card');
        if (card) {
          const nameEl  = card.querySelector('.menu-card-name, .dish-name');
          const priceEl = card.querySelector('.menu-card-price, .dish-price');
          if (nameEl)  name  = nameEl.textContent.trim();
          if (priceEl) price = priceEl.textContent.replace(/[^\d]/g, '');
        }
      }
      if (name && price) openModal(name, price);
    });
  });

  minusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value) || 1;
    if (v > 1) { qtyInput.value = v - 1; updateTotal(); }
  });
  plusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value) || 1;
    if (v < 20) { qtyInput.value = v + 1; updateTotal(); }
  });

  submitBtn.addEventListener('click', () => {
    const qty   = parseInt(qtyInput.value) || 1;
    const total = currentDish.price * qty;
    const msg   =
      `Hello! I'd like to place an order from Mysore Raman Idli.\n\n` +
      `*Item:* ${currentDish.name}\n` +
      `*Quantity:* ${qty} plate${qty > 1 ? 's' : ''}\n` +
      `*Price per plate:* ₹${currentDish.price}\n` +
      `*Total:* ₹${total}\n\n` +
      `Please confirm my order. Thank you!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });
}

/* -----------------------------------------------
   Reviews Carousel
   ----------------------------------------------- */
function initReviewsArrows() {
  const scroll  = document.getElementById('reviewsScroll');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  if (!scroll || !prevBtn || !nextBtn) return;

  function getScrollAmount() {
    const card = scroll.querySelector('.review-card');
    return card ? card.offsetWidth + 20 : 320;
  }

  function updateArrows() {
    const atStart = scroll.scrollLeft <= 4;
    const atEnd   = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
    prevBtn.style.opacity      = atStart ? '0.4' : '1';
    prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
    nextBtn.style.opacity      = atEnd ? '0.4' : '1';
    nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
  }

  prevBtn.addEventListener('click', () => scroll.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => scroll.scrollBy({ left:  getScrollAmount(), behavior: 'smooth' }));
  scroll.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();
}

/* -----------------------------------------------
   Page Loader (first-visit only, runs once)
   ----------------------------------------------- */
function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  const LOADER_KEY    = 'mri_loader_shown';
  const SHOW_DURATION = 2000;

  function revealHeroElements() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transition  = 'none';
        el.style.animation   = 'none';
        el.style.opacity     = '1';
        el.style.transform   = 'translateY(0)';
        el.classList.add('visible');
      }
    });
  }

  if (localStorage.getItem(LOADER_KEY)) {
    loader.style.display = 'none';
    revealHeroElements();
    return;
  }

  localStorage.setItem(LOADER_KEY, '1');

  function hideLoader() {
    loader.classList.add('hidden');
    revealHeroElements();
  }

  const startTime = Date.now();
  window.addEventListener('load', () => {
    const elapsed   = Date.now() - startTime;
    const remaining = SHOW_DURATION - elapsed;
    if (remaining > 0) setTimeout(hideLoader, remaining);
    else hideLoader();
  });
  setTimeout(hideLoader, SHOW_DURATION + 1000);
}

/* -----------------------------------------------
   Run all page-specific inits
   ----------------------------------------------- */
function initPage() {
  initReveal();
  initMenuTabs();
  initGalleryFilter();
  initLightbox();
  initContactForm();
  initHomeGalleryCarousel();
  initOrderModal();
  initReviewsArrows();
}

/* -----------------------------------------------
   BARBA.JS — Smooth page transitions
   ----------------------------------------------- */
(function initBarba() {
  if (typeof barba === 'undefined') {
    // Barba not loaded (fallback) — just run page inits normally
    initNavbar();
    initPageLoader();
    initPage();
    return;
  }

  // One-time persistent inits
  initNavbar();
  initPageLoader();

  barba.init({
    // Prevent Barba from handling anchor-only links or external links
    prevent: ({ el }) => {
      // Let browser handle mailto/tel/hash-only
      const href = el.getAttribute('href') || '';
      if (href.startsWith('#')) return true;
      return false;
    },

    transitions: [{
      name: 'fade',

      async leave({ current }) {
        // Fade out current container
        current.container.style.transition = 'opacity 0.25s ease';
        current.container.style.opacity    = '0';
        await new Promise(r => setTimeout(r, 260));
      },

      async enter({ next }) {
        // Start invisible, then fade in after browser paints
        next.container.style.opacity    = '0';
        next.container.style.transition = 'opacity 0.3s ease';
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        next.container.style.opacity = '1';
        await new Promise(r => setTimeout(r, 310));
      }
    }],

    hooks: {
      // Before fetching next page
      before() {
        // Close mobile drawer if open
        const drawer  = document.querySelector('.nav-drawer');
        const overlay = document.querySelector('.nav-overlay');
        const hamburger = document.querySelector('.hamburger');
        if (drawer && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          if (overlay)  overlay.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      },

      afterEnter({ next }) {
        // Scroll to top
        window.scrollTo(0, 0);
        // Update navbar state + active link
        updateNavForNamespace(next.namespace);
        // Re-init all page-specific components
        initPage();
      }
    }
  });

  // Run page inits for the initial page load
  initPage();
  // Set navbar state for the initial page
  const initialContainer = document.querySelector('[data-barba="container"]');
  if (initialContainer) {
    updateNavForNamespace(initialContainer.dataset.barbaNamespace);
  }
})();
