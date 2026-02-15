'use strict';

/*
  Configuración principal de WhatsApp.
  Usa solo números con prefijo de país, por ejemplo: 34600111222
*/
const WHATSAPP_NUMBER = '34XXXXXXXXX';

const DEFAULT_WHATSAPP_MESSAGE =
  'Hola! Me gustaría saber más sobre vuestros tréboles.';

const PRODUCTS_JSON_PATH = './data/products.json';

function hasValidWhatsAppNumber() {
  return /^\d{9,15}$/.test(WHATSAPP_NUMBER);
}

function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || DEFAULT_WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function formatPrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

function safeText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function resolveBrandLogo() {
  const logoElement = document.getElementById('brandLogo');
  if (!logoElement) return;

  const candidates = [
    'assets/logo/logo.svg',
    'assets/logo/logo.png',
    'assets/logo/logo.SVG',
    'assets/logo/logo.PNG'
  ];

  const exists = (src) =>
    new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = src;
    });

  for (const src of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await exists(src);
    if (ok) {
      logoElement.src = src;
      logoElement.hidden = false;
      return;
    }
  }

  logoElement.hidden = true;
}

function getFallbackProducts() {
  const el = document.getElementById('products-fallback');
  if (!el) return [];

  try {
    const parsed = JSON.parse(el.textContent || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function loadProducts() {
  try {
    const response = await fetch(PRODUCTS_JSON_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${PRODUCTS_JSON_PATH}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (_) {
    // Fallback para modo file:// en navegadores que bloquean fetch local.
    return getFallbackProducts();
  }
}

function makeProductCard(product, whatsappEnabled) {
  const name = safeText(product.name);
  const image = safeText(product.image || '');
  const wallapop = safeText(product.wallapopUrl || '#');
  const message = product.whatsappMessage || `Hola! Me interesa ${product.name || 'este producto'}.`;

  const priceHtml =
    typeof product.price === 'number'
      ? `<p class="product-price">${formatPrice(product.price)}</p>`
      : '';

  const whatsappButton = whatsappEnabled
    ? `<a class="btn btn-secondary" target="_blank" rel="noopener noreferrer" href="${buildWhatsAppUrl(message)}">WhatsApp</a>`
    : '';

  return `
    <article class="product-card reveal">
      <div class="product-media">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="product-body">
        <h3 class="product-name">${name}</h3>
        ${priceHtml}
        <div class="product-actions">
          <a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${wallapop}">Ver en Wallapop</a>
          ${whatsappButton}
        </div>
      </div>
    </article>
  `;
}

function setupGlobalWhatsAppButtons(enabled) {
  const buttons = document.querySelectorAll('.js-whatsapp');

  buttons.forEach((button) => {
    if (!(button instanceof HTMLAnchorElement)) return;

    if (!enabled) {
      button.classList.add('hidden');
      return;
    }

    const custom = button.hasAttribute('data-whatsapp-custom');
    const message = custom
      ? 'Hola! Quiero hacer un encargo personalizado.'
      : DEFAULT_WHATSAPP_MESSAGE;

    button.href = buildWhatsAppUrl(message);
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  });
}

function activateReveal(elements) {
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

async function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  const status = document.getElementById('productsStatus');
  if (!grid || !status) return;

  const whatsappEnabled = hasValidWhatsAppNumber();
  const products = await loadProducts();

  if (!products.length) {
    grid.innerHTML = '';
    status.textContent = 'No hay productos para mostrar en este momento.';
    return;
  }

  grid.innerHTML = products
    .map((product) => makeProductCard(product, whatsappEnabled))
    .join('');

  status.textContent = `Mostrando ${products.length} producto${products.length === 1 ? '' : 's'}.`;
}

async function init() {
  await resolveBrandLogo();

  const whatsappEnabled = hasValidWhatsAppNumber();
  setupGlobalWhatsAppButtons(whatsappEnabled);

  await renderCatalog();

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  activateReveal(revealItems);
}

init();
