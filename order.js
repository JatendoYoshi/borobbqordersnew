/* =========================================================
   BORO BURGERS - SAFE KIOSK SYSTEM (NO CRASH VERSION)
   ========================================================= */

/* =========================
   FIREBASE IMPORTS (SAFE)
========================= */

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FOOD DATA
========================= */

const foods = [
  {
    id: 1,
    name: "Classic Smash",
    price: 7.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
  },
  {
    id: 2,
    name: "Double BBQ",
    price: 10.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349"
  },
  {
    id: 3,
    name: "Loaded Fries",
    price: 4.99,
    category: "Sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877"
  },
  {
    id: 4,
    name: "Chicken Strips",
    price: 6.49,
    category: "Chicken",
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb36"
  },
  {
    id: 5,
    name: "Mega Chicken Burger",
    price: 8.99,
    category: "Chicken",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086"
  },
  {
    id: 6,
    name: "Coca Cola",
    price: 2.49,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e"
  }
];

/* =========================
   GLOBAL STATE
========================= */

const cart = [];

/* =========================
   SAFE DOM GETTER
========================= */

function get(id) {
  const el = document.getElementById(id);
  if (!el) console.warn("Missing element:", id);
  return el;
}

/* =========================
   INITIALISE AFTER DOM LOAD
========================= */

window.addEventListener("DOMContentLoaded", () => {
  console.log("🍔 Boro Burgers Loaded");

  renderFoods(foods);
  bindUI();
});

/* =========================
   RENDER MENU (SAFE)
========================= */

function renderFoods(items) {

  const menu = get("menu");
  if (!menu) return;

  menu.innerHTML = "";

  items.forEach(food => {

    menu.innerHTML += `
      <div class="card">

        <img src="${food.image}" alt="${food.name}" />

        <div class="card-content">

          <h3>${food.name}</h3>

          <div class="price">£${food.price.toFixed(2)}</div>

          <button onclick="addToCart(${food.id})">
            ADD TO ORDER
          </button>

        </div>

      </div>
    `;

  });
}

/* =========================
   CART SYSTEM
========================= */

window.addToCart = function(id) {

  const item = foods.find(f => f.id === id);
  if (!item) return;

  cart.push(item);
  updateCart();

};

function updateCart() {

  const cartItems = get("cartItems");
  const totalEl = get("total");
  const cartCount = get("cartCount");

  if (!cartItems || !totalEl || !cartCount) return;

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {

    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">

        <img src="${item.image}" />

        <div class="cart-info">

          <h4>${item.name}</h4>
          <p>£${item.price.toFixed(2)}</p>

          <button onclick="removeItem(${index})">
            REMOVE
          </button>

        </div>

      </div>
    `;

  });

  totalEl.innerText = total.toFixed(2);
  cartCount.innerText = cart.length;

}

window.removeItem = function(index) {
  cart.splice(index, 1);
  updateCart();
};

/* =========================
   UI CONTROLS
========================= */

function bindUI() {

  const openCart = get("openCart");
  const closeCart = get("closeCart");
  const cartPanel = get("cart");
  const overlay = get("overlay");

  if (openCart) {
    openCart.addEventListener("click", () => {
      cartPanel?.classList.remove("hidden");
      overlay?.classList.remove("hidden");
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", closeAll);
  }

  if (overlay) {
    overlay.addEventListener("click", closeAll);
  }

  function closeAll() {

    cartPanel?.classList.add("hidden");

    const admin = get("adminPanel");
    admin?.classList.add("hidden");

    overlay?.classList.add("hidden");

  }

  /* =========================
     CATEGORY FILTER
  ========================= */

  document.querySelectorAll(".category").forEach(btn => {

    btn.addEventListener("click", () => {

      document.querySelectorAll(".category")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const cat = btn.dataset.category;

      if (cat === "All") {
        renderFoods(foods);
      } else {
        renderFoods(foods.filter(f => f.category === cat));
      }

    });

  });

}

/* =========================
   SCROLL
========================= */

window.scrollToMenu = function() {
  get("menu")?.scrollIntoView({ behavior: "smooth" });
};

/* =========================
   CHECKOUT (SAFE FIREBASE)
========================= */

const checkoutBtn = get("checkoutBtn");

if (checkoutBtn) {

  checkoutBtn.addEventListener("click", async () => {

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {

      const counterRef = doc(firebaseDB, "meta", "orderCounter");
      const counterSnap = await getDoc(counterRef);

      let current = counterSnap.exists()
        ? counterSnap.data().value
        : 5000;

      let newOrderNumber = current + 1;

      await updateDoc(counterRef, {
        value: newOrderNumber
      });

      const total = cart.reduce((sum, i) => sum + i.price, 0);

      await firebaseAddDoc(
        firebaseCollection(firebaseDB, "orders"),
        {
          orderNumber: newOrderNumber,
          items: cart,
          total,
          status: "Preparing",
          completed: false,
          created: new Date()
        }
      );

      alert(`Order #${newOrderNumber} placed`);

      cart.length = 0;
      updateCart();
      get("cart")?.classList.add("hidden");
      get("overlay")?.classList.add("hidden");

    } catch (err) {

      console.error("Checkout error:", err);
      alert("Order failed - Firebase issue");

    }

  });

}

/* =========================
   ADMIN SAFE HOOK (NO CRASH)
========================= */

const adminBtn = get("adminBtn");
const adminPanel = get("adminPanel");
const closeAdmin = get("closeAdmin");
const ordersContainer = get("ordersContainer");

if (adminBtn && adminPanel) {

  adminBtn.addEventListener("click", () => {
    adminPanel.classList.remove("hidden");
    get("overlay")?.classList.remove("hidden");
  });

}

if (closeAdmin) {

  closeAdmin.addEventListener("click", () => {
    adminPanel?.classList.add("hidden");
    get("overlay")?.classList.add("hidden");
  });

}

/* =========================
   LIVE ORDERS (SAFE)
========================= */

try {

  firebaseOnSnapshot(
    firebaseCollection(firebaseDB, "orders"),
    snapshot => {

      if (!ordersContainer) return;

      ordersContainer.innerHTML = "";

      snapshot.forEach(docSnap => {

        const order = docSnap.data();

        ordersContainer.innerHTML += `
          <div class="order-box">

            <h3>ORDER #${order.orderNumber}</h3>

            <p>Status: ${order.status || "N/A"}</p>

            <p>Total: £${(order.total || 0).toFixed(2)}</p>

            <div>
              ${order.items?.map(i => `<p>• ${i.name}</p>`).join("") || ""}
            </div>

          </div>
        `;

      });

    }
  );

} catch (e) {
  console.warn("Admin listener failed safely:", e);
}