/* ── State ──────────────────────────────────────────── */
let products = [];
let cart = [];
let activeProduct = null;

/* ── DOM refs ───────────────────────────────────────── */
const productGrid    = document.getElementById('productGrid');
const cartBtn        = document.getElementById('cartBtn');
const cartCount      = document.getElementById('cartCount');
const cartDrawer     = document.getElementById('cartDrawer');
const cartOverlay    = document.getElementById('cartOverlay');
const cartDrawerClose= document.getElementById('cartDrawerClose');
const cartItemsEl    = document.getElementById('cartItems');
const cartEmptyEl    = document.getElementById('cartEmpty');
const cartFooterEl   = document.getElementById('cartFooter');
const cartTotalEl    = document.getElementById('cartTotal');
const checkoutBtn    = document.getElementById('checkoutBtn');

const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalImage     = document.getElementById('modalImage');
const modalTag       = document.getElementById('modalTag');
const modalTitle     = document.getElementById('modalTitle');
const modalDesc      = document.getElementById('modalDesc');
const modalPrice     = document.getElementById('modalPrice');
const modalQty       = document.getElementById('modalQty');
const qtyMinus       = document.getElementById('qtyMinus');
const qtyPlus        = document.getElementById('qtyPlus');
const modalAddBtn    = document.getElementById('modalAddBtn');

/* ── Fetch products ─────────────────────────────────── */
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    products = await res.json();
    renderGrid();
  } catch (err) {
    productGrid.innerHTML = '<p style="color:#e85d7a;text-align:center;grid-column:1/-1">Could not load products. Is the server running?</p>';
  }
}

/* ── Render product cards ───────────────────────────── */
function renderGrid() {
  productGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View ${p.name}`);
    card.innerHTML = `
      <div class="card-image" style="background:${p.gradient}">
        <span class="card-emoji">${p.emoji}</span>
        <div class="card-image-overlay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Quick View
        </div>
      </div>
      <div class="card-body">
        <span class="card-tag">${p.tag}</span>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="card-footer">
          <span class="card-price">$${p.price.toFixed(2)}</span>
          <button class="card-view-btn">View Card</button>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(p); });
    productGrid.appendChild(card);
  });
}

/* ── Modal ──────────────────────────────────────────── */
function openModal(product) {
  activeProduct = product;
  modalImage.style.background = product.gradient;
  modalImage.textContent = product.emoji;
  modalTag.textContent = product.tag;
  modalTitle.textContent = product.name;
  modalDesc.textContent = product.description;
  modalPrice.textContent = `$${product.price.toFixed(2)}`;
  modalQty.value = 1;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  activeProduct = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal(); });

qtyMinus.addEventListener('click', () => {
  const v = parseInt(modalQty.value, 10);
  if (v > 1) modalQty.value = v - 1;
});
qtyPlus.addEventListener('click', () => {
  const v = parseInt(modalQty.value, 10);
  if (v < 20) modalQty.value = v + 1;
});

modalAddBtn.addEventListener('click', () => {
  if (!activeProduct) return;
  addToCart(activeProduct, parseInt(modalQty.value, 10));
  closeModal();
  openCart();
});

/* ── Cart logic ─────────────────────────────────────── */
function addToCart(product, qty = 1) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  saveCart();
  renderCart();
  bumpCartCount();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function saveCart() {
  localStorage.setItem('bloom_cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('bloom_cart');
  if (saved) cart = JSON.parse(saved);
}

function bumpCartCount() {
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  cartCount.textContent = total;
}

/* ── Render cart drawer ─────────────────────────────── */
function renderCart() {
  cartItemsEl.innerHTML = '';
  const empty = cart.length === 0;

  cartEmptyEl.style.display = empty ? 'flex' : 'none';
  cartFooterEl.style.display = empty ? 'none' : 'flex';

  if (empty) return;

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-image" style="background:${item.gradient}">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span>${item.quantity}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button>
    `;
    cartItemsEl.appendChild(el);
  });

  cartTotalEl.textContent = `$${total.toFixed(2)}`;

  cartItemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => updateQty(btn.dataset.id, parseInt(btn.dataset.delta, 10)));
  });
  cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  bumpCartCount();
}

/* ── Cart open/close ────────────────────────────────── */
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartDrawerClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* ── Stripe Checkout ────────────────────────────────── */
checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return;

  checkoutBtn.textContent = 'Redirecting…';
  checkoutBtn.disabled = true;

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ priceId: i.priceId, quantity: i.quantity }))
      })
    });

    const data = await res.json();

    if (data.url) {
      localStorage.removeItem('bloom_cart');
      window.location.href = data.url;
    } else {
      alert('Checkout error: ' + (data.error || 'Unknown error'));
      checkoutBtn.textContent = 'Checkout with Stripe';
      checkoutBtn.disabled = false;
    }
  } catch (err) {
    alert('Could not connect to checkout. Make sure the server is running.');
    checkoutBtn.textContent = 'Checkout with Stripe';
    checkoutBtn.disabled = false;
  }
});

/* ── Init ───────────────────────────────────────────── */
loadCart();
renderCart();
bumpCartCount();
loadProducts();
