import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FOOD DATA (UNCHANGED)
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
   SAFE DOM REFERENCES
========================= */

const menu = document.getElementById("menu");
const cartItems = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const cartCount = document.getElementById("cartCount");

const cart = [];

/* =========================
   SAFE INIT (FIXED MAIN BUG)
========================= */

window.addEventListener("DOMContentLoaded", () => {

  if (!menu) {
    console.error("❌ #menu not found in HTML");
    return;
  }

  renderFoods(foods);

});

/* =========================
   RENDER MENU (SAFE)
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

          <div class="price">
            £${food.price.toFixed(2)}
          </div>

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

  if (!cartItems) return;

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

  if (totalEl) totalEl.innerText = total.toFixed(2);
  if (cartCount) cartCount.innerText = cart.length;

}

window.removeItem = function(index) {

  cart.splice(index, 1);

  updateCart();

};

/* =========================
   CART UI
========================= */

const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cart");
const overlay = document.getElementById("overlay");

if (openCart) {

  openCart.addEventListener("click", () => {

    cartDrawer?.classList.remove("hidden");
    overlay?.classList.remove("hidden");

  });

}

if (closeCart) closeCart.addEventListener("click", closeEverything);
if (overlay) overlay.addEventListener("click", closeEverything);

function closeEverything() {

  cartDrawer?.classList.add("hidden");

  const adminPanel = document.getElementById("adminPanel");
  adminPanel?.classList.add("hidden");

  overlay?.classList.add("hidden");

}

/* =========================
   CATEGORY FILTER
========================= */

document.querySelectorAll(".category").forEach(button => {

  button.addEventListener("click", () => {

    document.querySelectorAll(".category")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    const category = button.dataset.category;

    if (category === "All") {

      renderFoods(foods);

    } else {

      renderFoods(
        foods.filter(food => food.category === category)
      );

    }

  });

});

/* =========================
   SCROLL
========================= */

window.scrollToMenu = function() {

  document.getElementById("menu")
    ?.scrollIntoView({ behavior: "smooth" });

};

/* =========================
   CHECKOUT (SAFE FIREBASE HOOK)
========================= */

document.getElementById("checkoutBtn")?.addEventListener("click", async () => {

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  try {

    const counterRef = doc(firebaseDB, "meta", "orderCounter");
    const counterSnap = await getDoc(counterRef);

    let current = counterSnap.data().value;
    let newOrderNumber = current + 1;

    await updateDoc(counterRef, {
      value: newOrderNumber
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);

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
    closeEverything();

  } catch (err) {

    console.error(err);
    alert("Order failed - check Firebase connection");

  }

});