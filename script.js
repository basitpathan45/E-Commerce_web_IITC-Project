const products = [
  { id: 1, name: "The everyday bottle", category: "Lifestyle", price: 32, salePrice: 24, rating: 4.9, stock: 18, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80", tone: "bottle" },
  { id: 2, name: "Sunday morning mug", category: "Home", price: 28, salePrice: 21, rating: 4.8, stock: 12, badge: "BEST LOVED", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80", tone: "mug" },
  { id: 3, name: "Soft landing candle", category: "Home", price: 36, salePrice: 27, rating: 5.0, stock: 7, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80", tone: "candle" },
  { id: 4, name: "The little carry-all", category: "Accessories", price: 48, salePrice: 36, rating: 4.9, stock: 16, badge: "BEST LOVED", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80", tone: "bag" },
  { id: 5, name: "Daylight face oil", category: "Wellness", price: 42, salePrice: 31, rating: 4.7, stock: 9, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80", tone: "oil" },
  { id: 6, name: "Slow Sunday throw", category: "Home", price: 88, salePrice: 66, rating: 4.9, stock: 5, badge: "JUST A FEW", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80", tone: "throw" },
  { id: 7, name: "Pocket-sized sunshine", category: "Lifestyle", price: 18, salePrice: 14, rating: 4.6, stock: 24, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80", tone: "sunshine" },
  { id: 8, name: "Little rituals journal", category: "Wellness", price: 24, salePrice: 18, rating: 4.8, stock: 20, badge: "BEST LOVED", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80", tone: "journal" },
  { id: 9, name: "Good mood hoops", category: "Accessories", price: 54, salePrice: 41, rating: 4.9, stock: 8, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80", tone: "hoops" },
  { id: 10, name: "The fresh start kit", category: "Wellness", price: 64, salePrice: 48, rating: 5.0, stock: 6, badge: "BEST LOVED", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80", tone: "kit" },
  { id: 11, name: "Weekend market tote", category: "Accessories", price: 38, salePrice: 29, rating: 4.7, stock: 14, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80", tone: "tote" },
  { id: 12, name: "A really good vase", category: "Lifestyle", price: 58, salePrice: 44, rating: 4.8, stock: 10, badge: "GOOD DEAL", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80", tone: "vase" }
];

const CART_KEY = "goodside-cart";
const COUPON_KEY = "goodside-coupon";
const SALE_KEY = "goodside-sale-ends";
const SALE_DURATION = 4 * 60 * 60 * 1000;
const FREE_DELIVERY_AT = 75;
const DELIVERY_FEE = 6.5;
const USD_TO_PKR = 276.956128;
const coupons = { NOVA10: { rate: 0.1, minimum: 50 }, SAVE15: { rate: 0.15, minimum: 100 } };

let activeCategory = "All";
let searchTerm = "";
let maxPrice = 200;
let sortBy = "featured";
let cart = loadCart();
let appliedCoupon = localStorage.getItem(COUPON_KEY) || "";
let saleEndsAt = Number(localStorage.getItem(SALE_KEY));
if (!Number.isFinite(saleEndsAt) || saleEndsAt <= 0) {
  saleEndsAt = Date.now() + SALE_DURATION;
  localStorage.setItem(SALE_KEY, String(saleEndsAt));
}

const productGrid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const checkoutModal = document.querySelector("#checkout-modal");
const money = amount => `PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Math.round(amount * USD_TO_PKR))}`;
const saleIsActive = () => Date.now() < saleEndsAt;
const priceFor = product => saleIsActive() ? product.salePrice : product.price;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0)
      .map(item => ({ id: item.id, quantity: Math.min(item.quantity, products.find(product => product.id === item.id).stock) }));
  } catch (error) {
    console.error("Could not read the saved shopping bag.", error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderProducts() {
  let visible = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch && priceFor(product) <= maxPrice;
  });
  if (sortBy === "low-high") visible.sort((a, b) => priceFor(a) - priceFor(b));
  if (sortBy === "high-low") visible.sort((a, b) => priceFor(b) - priceFor(a));
  if (sortBy === "rating") visible.sort((a, b) => b.rating - a.rating);

  productGrid.innerHTML = visible.map(product => {
    const currentPrice = priceFor(product);
    const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
    const badgeClass = product.badge === "BEST LOVED" ? "best" : "";
    return `<article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge ${badgeClass}">${saleIsActive() ? product.badge : "A GOOD FIND"}</span>
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag" ${inCart >= product.stock ? "disabled" : ""}>${inCart >= product.stock ? "✓" : "+"}</button>
      </div>
      <div class="product-meta"><span class="product-category">${product.category}</span><span class="product-rating">★ ${product.rating.toFixed(1)}</span></div>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-bottom"><span class="product-price">${money(currentPrice)}${saleIsActive() ? `<s>${money(product.price)}</s>` : ""}</span><span class="stock-note ${product.stock - inCart <= 5 ? "low" : ""}">${product.stock - inCart <= 5 ? `Only ${product.stock - inCart} left` : "In stock"}</span></div>
    </article>`;
  }).join("");
  document.querySelector("#result-count").textContent = visible.length;
  document.querySelector("#empty-state").hidden = visible.length !== 0;
  productGrid.hidden = visible.length === 0;
  renderFilterTags();
}

function renderFilterTags() {
  const tags = [];
  if (activeCategory !== "All") tags.push(`<button class="filter-tag" data-clear="category">Category: ${activeCategory} ×</button>`);
  if (searchTerm) tags.push(`<button class="filter-tag" data-clear="search">Search: ${escapeHtml(searchTerm)} ×</button>`);
  if (maxPrice < 200) tags.push(`<button class="filter-tag" data-clear="price">Up to ${money(maxPrice)} ×</button>`);
  document.querySelector("#active-filters").innerHTML = tags.join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const item = cart.find(entry => entry.id === id);
  if (!product || (item && item.quantity >= product.stock)) return;
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderProducts();
  renderCart();
}

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(entry => entry.id === item.id);
    return sum + (product ? priceFor(product) * item.quantity : 0);
  }, 0);
  const coupon = coupons[appliedCoupon];
  const discount = coupon && subtotal >= coupon.minimum ? subtotal * coupon.rate : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  const itemsEl = document.querySelector("#cart-items");
  itemsEl.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return "";
    return `<article class="cart-item">
      <img src="${product.image}" alt="">
      <div class="cart-item-info"><span class="cart-item-category">${product.category}</span><span class="cart-item-name">${product.name}</span><span class="cart-item-price">${money(priceFor(product))}</span>
        <div class="quantity-control"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity" ${item.quantity >= product.stock ? "disabled" : ""}>+</button></div>
      </div>
      <div class="cart-item-end"><strong>${money(priceFor(product) * item.quantity)}</strong><button class="remove-item" type="button" data-remove="${product.id}">Remove</button></div>
    </article>`;
  }).join("");
  const empty = cart.length === 0;
  document.querySelector("#cart-empty").classList.toggle("visible", empty);
  document.querySelector("#cart-summary").classList.toggle("is-empty", empty);
  const { subtotal, discount, delivery, total } = cartTotals();
  document.querySelector("#subtotal").textContent = money(subtotal);
  document.querySelector("#discount-row").hidden = discount === 0;
  document.querySelector("#discount-amount").textContent = `−${money(discount)}`;
  document.querySelector("#delivery").textContent = delivery === 0 && subtotal > 0 ? "FREE" : money(delivery);
  document.querySelector("#grand-total").textContent = money(total);
  document.querySelector("#delivery-note").textContent = subtotal > 0 && subtotal < FREE_DELIVERY_AT ? `You're ${money(FREE_DELIVERY_AT - subtotal)} away from free delivery.` : subtotal >= FREE_DELIVERY_AT ? "Your order ships on us. Good choice!" : "";
  document.querySelector("#coupon-input").value = appliedCoupon;
  document.querySelector("#checkout-button").disabled = empty;
}

function setDrawer(open) {
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  overlay.classList.toggle("visible", open || checkoutModal.classList.contains("open"));
  document.body.classList.toggle("no-scroll", open || checkoutModal.classList.contains("open"));
  if (open) document.querySelector("#close-cart").focus();
}

function openCheckout() {
  if (!cart.length) return;
  document.querySelector("#checkout-total").textContent = money(cartTotals().total);
  document.querySelector("#checkout-view").hidden = false;
  document.querySelector("#order-confirmation").hidden = true;
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  overlay.classList.add("visible");
  document.body.classList.add("no-scroll");
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.classList.remove("no-scroll");
}

function updateCountdown() {
  const remaining = Math.max(0, saleEndsAt - Date.now());
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.querySelector("#timer-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#timer-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#timer-seconds").textContent = String(seconds).padStart(2, "0");
  if (remaining === 0) {
    document.querySelector("#countdown").setAttribute("aria-label", "Flash sale has ended");
    renderProducts();
    renderCart();
    window.clearInterval(countdownInterval);
  }
}

document.querySelector("#search-input").addEventListener("input", event => {
  searchTerm = event.target.value;
  renderProducts();
});
document.querySelectorAll(".category-pill").forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-pill").forEach(pill => pill.classList.toggle("active", pill === button));
  renderProducts();
}));
document.querySelector("#price-filter").addEventListener("input", event => {
  maxPrice = Number(event.target.value);
  document.querySelector("#price-label").textContent = money(maxPrice);
  renderProducts();
});
document.querySelector("#sort-select").addEventListener("change", event => {
  sortBy = event.target.value;
  renderProducts();
});
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
document.querySelector("#active-filters").addEventListener("click", event => {
  const button = event.target.closest("[data-clear]");
  if (!button) return;
  if (button.dataset.clear === "category") {
    activeCategory = "All";
    document.querySelectorAll(".category-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.category === "All"));
  }
  if (button.dataset.clear === "search") {
    searchTerm = "";
    document.querySelector("#search-input").value = "";
  }
  if (button.dataset.clear === "price") {
    maxPrice = 200;
    document.querySelector("#price-filter").value = "200";
    document.querySelector("#price-label").textContent = money(200);
  }
  renderProducts();
});
document.querySelector("#reset-filters").addEventListener("click", () => {
  activeCategory = "All"; searchTerm = ""; maxPrice = 200;
  document.querySelector("#search-input").value = "";
  document.querySelector("#price-filter").value = "200";
  document.querySelector("#price-label").textContent = money(200);
  document.querySelectorAll(".category-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.category === "All"));
  renderProducts();
});
document.querySelector("#cart-items").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) cart = cart.filter(item => item.id !== Number(removeButton.dataset.remove));
  if (quantityButton) {
    const item = cart.find(entry => entry.id === Number(quantityButton.dataset.quantity));
    const product = products.find(entry => entry.id === Number(quantityButton.dataset.quantity));
    if (item && product) {
      item.quantity = Math.min(product.stock, item.quantity + Number(quantityButton.dataset.change));
      if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== item.id);
    }
  }
  saveCart(); renderCart(); renderProducts();
});
document.querySelector("#coupon-form").addEventListener("submit", event => {
  event.preventDefault();
  const code = document.querySelector("#coupon-input").value.trim().toUpperCase();
  const feedback = document.querySelector("#coupon-feedback");
  const coupon = coupons[code];
  const subtotal = cartTotals().subtotal;
  if (!coupon) {
    feedback.textContent = "That code doesn't look familiar. Try NOVA10 or SAVE15.";
    feedback.classList.add("error");
    appliedCoupon = "";
  } else if (subtotal < coupon.minimum) {
    feedback.textContent = `Add ${money(coupon.minimum - subtotal)} more to use ${code}.`;
    feedback.classList.add("error");
    appliedCoupon = "";
  } else {
    appliedCoupon = code;
    feedback.textContent = `${code} is on your order — nice one!`;
    feedback.classList.remove("error");
  }
  localStorage.setItem(COUPON_KEY, appliedCoupon);
  renderCart();
  if (!appliedCoupon) {
    document.querySelector("#coupon-input").value = code;
    feedback.textContent = coupon ? `Add ${money(Math.max(0, coupon.minimum - subtotal))} more to use ${code}.` : "That code doesn't look familiar. Try NOVA10 or SAVE15.";
    feedback.classList.add("error");
  }
});
document.querySelector("#open-cart").addEventListener("click", () => setDrawer(true));
document.querySelector("#close-cart").addEventListener("click", () => setDrawer(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setDrawer(false));
overlay.addEventListener("click", () => {
  if (checkoutModal.classList.contains("open")) closeCheckout();
  else setDrawer(false);
});
document.querySelector("#checkout-button").addEventListener("click", openCheckout);
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeCheckout));
document.querySelector("#checkout-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity() || !cart.length) return;
  const orderNumber = `GS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  document.querySelector("#order-number").textContent = orderNumber;
  document.querySelector("#checkout-view").hidden = true;
  document.querySelector("#order-confirmation").hidden = false;
  cart = [];
  appliedCoupon = "";
  localStorage.removeItem(COUPON_KEY);
  saveCart();
  renderCart();
  renderProducts();
});
document.querySelector("#finish-order").addEventListener("click", closeCheckout);
document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#newsletter-feedback").textContent = "You're on the list — 10% off is all yours: NOVA10.";
  event.currentTarget.reset();
});
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#search-input").focus();
  }
  if (event.key === "Escape") {
    if (checkoutModal.classList.contains("open")) closeCheckout();
    else if (cartDrawer.classList.contains("open")) setDrawer(false);
  }
});

renderProducts();
renderCart();
updateCountdown();
const countdownInterval = window.setInterval(updateCountdown, 1000);