const foods = [

  {
    id: 1,
    name: "Classic Smash",
    price: 7.99,
    category: "Burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
  },

  {
    id: 2,
    name: "Double BBQ",
    price: 10.99,
    category: "Burgers",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349"
  },

  {
    id: 3,
    name: "Loaded Fries",
    price: 4.99,
    category: "Sides",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877"
  },

  {
    id: 4,
    name: "Chicken Strips",
    price: 6.49,
    category: "Chicken",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb36"
  },

  {
    id: 5,
    name: "Mega Chicken Burger",
    price: 8.99,
    category: "Chicken",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086"
  },

  {
    id: 6,
    name: "Coca Cola",
    price: 2.49,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1629203851122-3726ecdf080e"
  }

]

const menu =
  document.getElementById("menu")

const cartItems =
  document.getElementById("cartItems")

const totalEl =
  document.getElementById("total")

const cartCount =
  document.getElementById("cartCount")

const cart = []

function renderFoods(items) {

  menu.innerHTML = ""

  items.forEach(food => {

    menu.innerHTML += `

      <div class="card">

        <img src="${food.image}" />

        <div class="card-content">

          <h3>${food.name}</h3>

          <div class="price">
            £${food.price.toFixed(2)}
          </div>

          <button
            class="add-btn"
            onclick="addToCart(${food.id})"
          >
            ADD TO ORDER
          </button>

        </div>

      </div>

    `
  })
}

renderFoods(foods)

window.addToCart = function(id) {

  const item =
    foods.find(food => food.id === id)

  cart.push(item)

  updateCart()
}

function updateCart() {

  cartItems.innerHTML = ""

  let total = 0

  cart.forEach((item, index) => {

    total += item.price

    cartItems.innerHTML += `

      <div class="cart-item">

        <img src="${item.image}" />

        <div class="cart-info">

          <h4>${item.name}</h4>

          <p>£${item.price.toFixed(2)}</p>

          <button
            class="remove-btn"
            onclick="removeItem(${index})"
          >
            REMOVE
          </button>

        </div>

      </div>

    `
  })

  totalEl.innerText =
    total.toFixed(2)

  cartCount.innerText =
    cart.length
}

window.removeItem = function(index) {

  cart.splice(index, 1)

  updateCart()
}

const openCart =
  document.getElementById("openCart")

const closeCart =
  document.getElementById("closeCart")

const cartDrawer =
  document.getElementById("cart")

const overlay =
  document.getElementById("overlay")

openCart.addEventListener("click", () => {

  cartDrawer.classList.remove("hidden")

  overlay.classList.remove("hidden")
})

closeCart.addEventListener(
  "click",
  closeEverything
)

overlay.addEventListener(
  "click",
  closeEverything
)

function closeEverything() {

  cartDrawer.classList.add("hidden")

  adminPanel.classList.add("hidden")

  overlay.classList.add("hidden")
}

document
  .querySelectorAll(".category")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".category")
        .forEach(btn =>
          btn.classList.remove("active")
        )

      button.classList.add("active")

      const category =
        button.dataset.category

      if(category === "All") {

        renderFoods(foods)

      } else {

        const filtered =
          foods.filter(
            food =>
              food.category === category
          )

        renderFoods(filtered)
      }
    })
})

window.scrollToMenu = function() {

  document
    .getElementById("menu")
    .scrollIntoView({
      behavior: "smooth"
    })
}

document
  .getElementById("checkoutBtn")
  .addEventListener("click", async () => {

    if(cart.length === 0) {

      alert("Your cart is empty.")
      return
    }

    const orderNumber =
      Math.floor(Math.random() * 9000) + 1000

    const total =
      cart.reduce(
        (sum, item) => sum + item.price,
        0
      )

    await firebaseAddDoc(

      firebaseCollection(
        firebaseDB,
        "orders"
      ),

      {

        orderNumber,

        items: cart,

        total,

        created: new Date()
      }
    )

    alert(
      `Order #${orderNumber} placed successfully!`
    )

    cart.length = 0

    updateCart()

    closeEverything()
})

/* ADMIN */

const adminBtn =
  document.getElementById("adminBtn")

const adminPanel =
  document.getElementById("adminPanel")

const closeAdmin =
  document.getElementById("closeAdmin")

const ordersContainer =
  document.getElementById("ordersContainer")

adminBtn.addEventListener("click", () => {

  adminPanel.classList.remove("hidden")

  overlay.classList.remove("hidden")
})

closeAdmin.addEventListener(
  "click",
  closeEverything
)

firebaseOnSnapshot(

  firebaseCollection(
    firebaseDB,
    "orders"
  ),

  snapshot => {

    ordersContainer.innerHTML = ""

    snapshot.forEach(doc => {

      const order = doc.data()

      ordersContainer.innerHTML += `

        <div class="order-box">

          <h3>
            ORDER #${order.orderNumber}
          </h3>

          <p>
            Total:
            £${order.total.toFixed(2)}
          </p>

          <br>

          ${order.items.map(item => `

            <p>
              • ${item.name}
            </p>

          `).join("")}

        </div>

      `
    })
})