async function renderCartItems() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  try{
    const response = await fetch('http://127.0.0.1:8000/cart/cart-items/',
      {
        method: "GET",
        headers: {
          "Content-Type":"application/json",
          "Authorization": `Bearer ${userData.access}`
        }
      });
      
    if (!response.ok){
      if(response.status === 401){
        alert("Redirecting to login");
        window.location.href = "login.html";
      }
    }
    const cart = await response.json();
    console.log(cart);

    const list = document.getElementById("cartItemsList");
  // Clear existing list before rendering new items
  list.innerHTML = "";

  if (cart.length === 0) {
      list.innerHTML = `
              <div class="empty-cart">
                  <div class="empty-cart-icon">🛒</div>
                  <div class="empty-cart-text">Your cart is empty</div>
                  <a href="index.html" style="color: var(--primary); text-decoration: none; font-weight: 600;">Continue Shopping</a>
              </div>
          `
      updateCartSummary();
      return
    }
  cart.forEach((item) => {
    // Normalize possible item shapes (backend vs localStorage)
    const productId = item.productId !== undefined ? item.productId : (item.product !== undefined ? item.product : (item.id !== undefined ? item.id : null));
    const productPrice = Number(item.product_price ?? item.price ?? item.unit_price ?? 0);
    const imageSrc = item.product_image[0]
    console.log(item)
    const itemName = item.product_name;
    const vendorName = item.vendor_name ?? (item.vendor && item.vendor.name) ?? item.vendorName ?? '';
    const quantity = Number(item.quantity ?? item.qty ?? 1);

    const itemTotal = productPrice * quantity;

    // Guard: if we don't have a productId, skip rendering that item
    if (productId === null) return;

    list.innerHTML += `
    <div class="cart-item" onclick="openProductModal(${productId})">
      <img src="${imageSrc}" alt="${itemName}" class="item-image">
      <div class="item-details">
        <div>
          <div class="item-name">${itemName}</div>
          <div class="item-price">$${productPrice.toFixed(2)}</div>
          <div class="item-vendor">${vendorName}</div>
        </div>
      </div>
      <div class="item-actions">
        <div class="quantity-control" onclick="event.stopPropagation()">
          <!-- Allow custom quantity input for individual items -->
          <button class="quantity-btn" onclick="updateQuantity(${productId}, -1)">−</button>
          <input type="text" class="quantity-input" value="${quantity}" readonly>
          <button class="quantity-btn" onclick="updateQuantity(${productId}, 1)">+</button>
        </div>
        <div class="item-checkout" onclick="event.stopPropagation()">
        </div>
        <label for="checkout">Checkout</label>
        <input type="checkbox" name="" id="">
        <button class="remove-btn" onclick="event.stopPropagation(); removeFromCart(${productId})">Remove</button>
      </div>
    </div>`
  })

    // list.innerHTML = html;
    updateCartSummary()
  }catch(error){
    return;
  }
  
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  cart = cart.filter((item) => item.productId !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
  renderCartItems()
}

function updateQuantity(productId, change) {

  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    } else {
      localStorage.setItem("cart", JSON.stringify(cart))
      renderCartItems()
    }
  }
}

async function updateCartSummary() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  try{
    const response = await fetch('http://127.0.0.1:8000/cart/cart-items/',
      {
        method: "GET",
        headers: {
          "Content-Type":"application/json",
          "Authorization": `Bearer ${userData.access}`
        }
      });
      
    if (!response.ok){
      if(response.status === 401){
        alert("Redirecting to login");
        window.location.href = "login.html";
      }
    }
    const cart = await response.json();

    let subtotal = 0
    cart.forEach((item) => {
      subtotal += item.product_price * item.quantity
    })

    const shipping = cart.length > 0 ? 5 : 0
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`
    document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`
    document.getElementById("tax").textContent = `$${tax.toFixed(2)}`
    document.getElementById("total").textContent = `$${total.toFixed(2)}`
  }catch(error){

  }

  
}

function getVendor(vendorId) {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  return vendors.find((v) => v.id === vendorId)
}

async function openProductModal(productId) {
    const response = await fetch(`http://127.0.0.1:8000/products/${productId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    )

    const product = await response.json();

  if (!product) return

  // const vendor = getVendor(product.vendorId)

  const html = `
    <div style="display: grid; grid-template-columns: 1.8fr 1fr; gap: 20px; align-items: start;">
      <div>
        <img src="${product.image_url[0]}" style="width: 100%; max-height: 800px; object-fit: contain; border-radius: 8px;">
      </div>
            <div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">${product.product_name}</h3>
                <div style="font-size: 24px; color: var(--accent); font-weight: 700; margin-bottom: 16px;">$${product.price}</div>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">${product.description}</p>
                <div style="background: var(--secondary); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Location: <strong>${product.institute}</strong></div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Available: <strong>${product.quantity}</strong></div>
                </div>
                <div style="background: var(--secondary); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Seller</div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${product.vendor_username}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${product.vendor_email}</div>
                </div>
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = html
  document.getElementById("productModal").classList.add("active")
}

function checkoutItem(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []

  const cartItem = cart.find((item) => item.productId === productId)
  if (!cartItem) {
    alert("Item not found in cart")
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) return

  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex === -1) return

  const itemTotal = product.price * cartItem.quantity
  const balance = users[userIndex].walletBalance || 0

  if (balance < itemTotal) {
    alert(`Insufficient wallet balance. You need $${itemTotal.toFixed(2)} but have $${balance.toFixed(2)}`)
    return
  }

  // Deduct from wallet
  users[userIndex].walletBalance = balance - itemTotal
  localStorage.setItem("users", JSON.stringify(users))

  // Create transaction
  const transaction = {
    userId: currentUser.id,
    type: "debit",
    amount: itemTotal,
    description: `Checkout: ${product.name} (Qty: ${cartItem.quantity})`,
    date: new Date().toISOString(),
  }

  const transactions = JSON.parse(localStorage.getItem("transactions")) || []
  transactions.push(transaction)
  localStorage.setItem("transactions", JSON.stringify(transactions))

  // Remove from cart
  removeFromCart(productId)

  // Add notifications
  const notifications = JSON.parse(localStorage.getItem("notifications")) || []
  notifications.push({
    id: Date.now(),
    userId: product.vendorId,
    type: "payment",
    message: `Payment received for ${product.name}. Confirm product delivery.`,
    read: false,
    date: new Date().toISOString(),
  })
  localStorage.setItem("notifications", JSON.stringify(notifications))

  alert(`Payment of $${itemTotal.toFixed(2)} successful! Order placed.`)
  renderCartItems()
}


document.getElementById("closeProductModal").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("active")
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active")
  }
})

document.getElementById("checkoutAllBtn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  if (cart.length === 0) {
    alert("Your cart is empty")
    return
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []
  const userIndex = users.findIndex((u) => u.id === currentUser.id)

  if (userIndex !== -1) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    let totalAmount = 0

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        totalAmount += product.price * item.quantity
      }
    })

    const balance = users[userIndex].walletBalance || 0
    if (balance < totalAmount) {
      alert("Insufficient wallet balance. Please add money to your wallet.")
      return
    }

    // Deduct from wallet
    users[userIndex].walletBalance = balance - totalAmount

    // Create transaction
    const transaction = {
      userId: currentUser.id,
      type: "debit",
      amount: totalAmount,
      description: "Checkout All Items",
      date: new Date().toISOString(),
    }

    const transactions = JSON.parse(localStorage.getItem("transactions")) || []
    transactions.push(transaction)

    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("transactions", JSON.stringify(transactions))

    // Add notifications for each product vendor
    const notifications = JSON.parse(localStorage.getItem("notifications")) || []
    const notifiedVendors = new Set()

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product && !notifiedVendors.has(product.vendorId)) {
        notifications.push({
          id: Date.now() + Math.random(),
          userId: product.vendorId,
          type: "payment",
          message: "Payment received. Confirm product delivery.",
          read: false,
          date: new Date().toISOString(),
        })
        notifiedVendors.add(product.vendorId)
      }
    })

    localStorage.setItem("notifications", JSON.stringify(notifications))
    localStorage.setItem("cart", JSON.stringify([]))

    alert("Checkout successful! All orders have been placed.")
    updateCartBadge()
    renderCartItems()
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
  }
  renderCartItems()
})
