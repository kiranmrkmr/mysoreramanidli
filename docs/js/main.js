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

  const navbar = document.querySelector('.navbar');
  const anchor = document.getElementById('menu-anchor');

  function getScrollTarget() {
    const navH = navbar ? navbar.offsetHeight : 0;
    // Use the non-sticky sentinel anchor for reliable position
    return anchor ? anchor.offsetTop - navH : 0;
  }

  function activateTab(cat) {
    tabs.forEach(t => t.classList.remove('active'));
    const match = Array.from(tabs).find(t => t.dataset.cat === cat);
    if (match) match.classList.add('active');
    document.querySelectorAll('.menu-items-section').forEach(section => {
      section.style.display = section.dataset.cat === cat ? 'grid' : 'none';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.cat);
      history.replaceState(null, '', '#' + tab.dataset.cat);
    });
  });

  // On initial page load — activate tab from hash, instant scroll
  window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && Array.from(tabs).some(t => t.dataset.cat === hash)) {
      activateTab(hash);
      window.scrollTo({ top: getScrollTarget(), behavior: 'instant' });
    }
  });

  // Intercept footer menu links when already on menu page
  document.querySelectorAll('a[href^="menu.html#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const hash = link.getAttribute('href').split('#')[1];
      if (Array.from(tabs).some(t => t.dataset.cat === hash)) {
        history.pushState(null, '', '#' + hash);
        activateTab(hash);
        window.scrollTo({ top: getScrollTarget(), behavior: 'smooth' });
      }
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

/* --- Order Modal (WhatsApp) --- */
(function initOrderModal() {
  const backdrop = document.getElementById('orderModalBackdrop');
  if (!backdrop) return;

  const closeBtn = document.getElementById('orderModalClose');
  const titleEl  = document.getElementById('orderModalTitle');
  const priceEl  = backdrop.querySelector('.order-modal-price');
  const qtyInput = document.getElementById('orderQty');
  const minusBtn = document.getElementById('orderQtyMinus');
  const plusBtn  = document.getElementById('orderQtyPlus');
  const totalEl  = document.getElementById('orderTotal');
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

  // Open modal on dish order button click
  // Name/price can come from data attributes OR from sibling DOM elements in the card
  document.querySelectorAll('[data-dish]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Try data attributes first (home page dish cards)
      let name = btn.dataset.name;
      let price = btn.dataset.price;

      // Fallback: read from nearest card's name/price elements (menu page)
      if (!name) {
        const card = btn.closest('.menu-card, .dish-card');
        if (card) {
          const nameEl = card.querySelector('.menu-card-name, .dish-name');
          const priceEl = card.querySelector('.menu-card-price, .dish-price');
          if (nameEl) name = nameEl.textContent.trim();
          if (priceEl) price = priceEl.textContent.replace(/[^\d]/g, '');
        }
      }

      if (name && price) openModal(name, price);
    });
  });

  // Quantity controls
  minusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value) || 1;
    if (v > 1) { qtyInput.value = v - 1; updateTotal(); }
  });
  plusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value) || 1;
    if (v < 20) { qtyInput.value = v + 1; updateTotal(); }
  });

  // Send to WhatsApp
  submitBtn.addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    const total = currentDish.price * qty;
    const msg =
      `Hello! I'd like to place an order from Mysore Raman Idli.\n\n` +
      `*Item:* ${currentDish.name}\n` +
      `*Quantity:* ${qty} plate${qty > 1 ? 's' : ''}\n` +
      `*Price per plate:* ₹${currentDish.price}\n` +
      `*Total:* ₹${total}\n\n` +
      `Please confirm my order. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closeModal();
  });

  // Close on backdrop click or close button
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });
})();

/* --- Reviews Carousel Arrows --- */
(function initReviewsArrows() {
  const scroll = document.getElementById('reviewsScroll');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  if (!scroll || !prevBtn || !nextBtn) return;

  function getScrollAmount() {
    const card = scroll.querySelector('.review-card');
    return card ? card.offsetWidth + 20 : 320;
  }

  function updateArrows() {
    const atStart = scroll.scrollLeft <= 4;
    const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
    prevBtn.style.opacity = atStart ? '0.4' : '1';
    prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
    nextBtn.style.opacity = atEnd ? '0.4' : '1';
    nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
  }

  prevBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  scroll.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows(); // set initial state
})();

/* --- Page Loader --- */
(function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    loader.classList.add('hidden');
  });
  // Fallback: hide after 3s even if load event is slow
  setTimeout(() => loader.classList.add('hidden'), 3000);
})();
