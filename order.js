/* =========================================================
   BORO BURGERS - SIMPLE SAFE ORDER SYSTEM (NO COUNTER)
   ========================================================= */

import {
  doc,
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
    name: "Coke",
    price: 2.49,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e"
  }
];

/* =========================
   CART STATE
========================= */

const cart = [];

/* =========================
   DOM
========================= */

const menu = document.getElementById("menu");
const cartItems = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const cartCount = document.getElementById("cartCount");

/* =========================
   INIT SAFE LOAD
========================= */

window.addEventListener("DOMContentLoaded", () => {

  if (!menu) {
    console.error("Menu missing");
    return;
  }

  renderFoods(foods);
  bindUI();

});

/* =========================
   MENU RENDER
========================= */

function renderFoods(items) {

  if (!menu) return;

  menu.innerHTML = "";

  items.forEach(food => {

    menu.innerHTML += `
      <div class="card">

        <img src="${food.image}" />

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
   CART
========================= */

window.addToCart = function(id) {

  const item = foods.find(f => f.id === id);
  if (!item) return;

  cart.push(item);
  updateCart();

};

function updateCart() {

  if (!cartItems || !totalEl || !cartCount) return;

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {

    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">

        <img src="${item.image}" />

        <div>

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

  const openCart = document.getElementById("openCart");
  const closeCart = document.getElementById("closeCart");
  const cartPanel = document.getElementById("cart");
  const overlay = document.getElementById("overlay");

  openCart?.addEventListener("click", () => {
    cartPanel?.classList.remove("hidden");
    overlay?.classList.remove("hidden");
  });

  closeCart?.addEventListener("click", closeAll);
  overlay?.addEventListener("click", closeAll);

  function closeAll() {
    cartPanel?.classList.add("hidden");
    document.getElementById("adminPanel")?.classList.add("hidden");
    overlay?.classList.add("hidden");
  }

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
  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
};

/* =========================
   CHECKOUT (RANDOM ORDER ID)
========================= */

document.getElementById("checkoutBtn")?.addEventListener("click", async () => {

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  try {

    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    await firebaseAddDoc(
      firebaseCollection(firebaseDB, "orders"),
      {
        orderNumber,
        items: cart,
        total,
        status: "Preparing",
        completed: false,
        created: new Date()
      }
    );

    alert(`Order #${orderNumber} placed successfully`);

    cart.length = 0;
    updateCart();

    document.getElementById("cart")?.classList.add("hidden");
    document.getElementById("overlay")?.classList.add("hidden");

  } catch (err) {

    console.error("Checkout error:", err);
    alert(err.message);

  }

});