import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyAJnS04WcEaSizVnd92hprBiml1XP7vzoE",
  authDomain: "borobbqorders.firebaseapp.com",
  projectId: "borobbqorders",
  storageBucket: "borobbqorders.firebasestorage.app",
  messagingSenderId: "608958491192",
  appId: "1:608958491192:web:a35df22ce7067f582d54cd",
  measurementId: "G-GHRWMRM0PZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   MENU DATA
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
   STATE
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
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {
  renderMenu(foods);
  bindUI();
});

/* =========================
   MENU RENDER
========================= */

function renderMenu(items) {

  menu.innerHTML = "";

  items.forEach(item => {

    menu.innerHTML += `
      <div class="card">
        <img src="${item.image}" />
        <div class="card-content">
          <h3>${item.name}</h3>
          <p>£${item.price.toFixed(2)}</p>
          <button onclick="addToCart(${item.id})">ADD</button>
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

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, i) => {

    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">
        <p>${item.name} - £${item.price.toFixed(2)}</p>
        <button onclick="removeItem(${i})">X</button>
      </div>
    `;

  });

  totalEl.innerText = total.toFixed(2);
  cartCount.innerText = cart.length;

}

window.removeItem = function(i) {
  cart.splice(i, 1);
  updateCart();
};

/* =========================
   UI
========================= */

function bindUI() {

  const openCart = document.getElementById("openCart");
  const closeCart = document.getElementById("closeCart");
  const cart = document.getElementById("cart");
  const overlay = document.getElementById("overlay");

  openCart?.addEventListener("click", () => {
    cart.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });

  closeCart?.addEventListener("click", closeAll);
  overlay?.addEventListener("click", closeAll);

  function closeAll() {
    cart.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  document.querySelectorAll(".category").forEach(btn => {

    btn.addEventListener("click", () => {

      const cat = btn.dataset.category;

      document.querySelectorAll(".category")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      if (cat === "All") {
        renderMenu(foods);
      } else {
        renderMenu(foods.filter(f => f.category === cat));
      }

    });

  });

}

/* =========================
   CHECKOUT (FIXED)
========================= */

document.getElementById("checkoutBtn")?.addEventListener("click", async () => {

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }

  try {

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    const orderData = {
      orderNumber: Math.floor(100000 + Math.random() * 900000),
      items: cart,
      total,
      status: "Preparing",
      completed: false,
      created: new Date()
    };

    await addDoc(collection(db, "orders"), orderData);

    alert("Order placed successfully!");

    cart.length = 0;
    updateCart();

    document.getElementById("cart")?.classList.add("hidden");
    document.getElementById("overlay")?.classList.add("hidden");

  } catch (err) {

    console.error("FIREBASE ERROR:", err);
    alert(err.message);

  }

});

/* =========================
   ADMIN LIVE ORDERS
========================= */

const ordersContainer = document.getElementById("ordersContainer");

if (ordersContainer) {

  onSnapshot(collection(db, "orders"), snapshot => {

    ordersContainer.innerHTML = "";

    snapshot.forEach(doc => {

      const o = doc.data();

      ordersContainer.innerHTML += `
        <div class="order-box">
          <h3>ORDER #${o.orderNumber}</h3>
          <p>Status: ${o.status}</p>
          <p>Total: £${o.total.toFixed(2)}</p>
        </div>
      `;

    });

  });

}