async function loadLeaderboard() {
  try{
    const response = await fetch('https://upstartpy.onrender.com/customers/top-vendors/',
      {
        method: "GET",
        headers: {"Content-Type":"application/json"}
      })

    const vendors = await response.json();

    // Sort vendors by sales
    loadVendorsList(vendors)

  }catch(error){

  }

  try{
    const response = await fetch('https://upstartpy.onrender.com/customers/top-customers/',
      {
        method: "GET",
        headers: {"Content-Type":"application/json"}
      })

    const customers = await response.json();

    // Sort vendors by sales
    loadCustomersList(customers)
  }catch(error){

  }

  try{
    const response = await fetch('https://upstartpy.onrender.com/analytics/top-products/',
      {
        method: "GET",
        headers: {
          "Content-Type":"application/json"
        }
      });
    
    const products = await response.json();
    loadTrendingProducts(products);
    hideLoadingModal();

  }catch(error){
    hideLoadingModal();
  }

  // Sort products by views
  // const sortedProducts = [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  // loadTrendingProducts(sortedProducts.slice(0, 12))

  // Load top reviews (simulated)
  // loadTopReviews()
}

function loadVendorsList(vendors) {
  const list = document.getElementById("vendorsList")
  list.innerHTML = vendors
    .map((vendor, index) => {
      let rankClass = "default"
      if (index === 0) rankClass = "gold"
      else if (index === 1) rankClass = "silver"
      else if (index === 2) rankClass = "bronze"

      return `
            <div class="leaderboard-item" onclick="loadVendorPage(${vendor.vendor})">
                <div class="rank-badge ${rankClass}">${index + 1}</div>
                <img src="${vendor.pfp || "/placeholder.svg?height=48&width=48"}" alt="${vendor.username}" class="leaderboard-item-avatar">
                <div class="leaderboard-item-info" id="leaderboardItemInfo">
                    <div class="leaderboard-item-name">${vendor.username}</div>
                    <div class="leaderboard-item-details">${vendor.institute}</div>
                </div>
                <div class="leaderboard-item-stats">
                    <div class="stat">
                        <span class="stat-value">${vendor.total_sales || 0}</span>
                        <span class="stat-label">Sales</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(Number(vendor.rating) || 0).toFixed(1)}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    ${index === 0 ? '<div class="achievement-badge">🏆 TOP</div>' : ""}
                </div>
            </div>
        `
    })
    .join("")

    console.log(document.getElementById("leaderboardItemInfo"))

    
}

function loadCustomersList(customers) {
  const list = document.getElementById("customersList")
  list.innerHTML = customers
    .map((customer, index) => {
      let rankClass = "default"
      if (index === 0) rankClass = "gold"
      else if (index === 1) rankClass = "silver"
      else if (index === 2) rankClass = "bronze"

      return `
            <div class="leaderboard-item">
                <div class="rank-badge ${rankClass}">${index + 1}</div>
                <img src="${customer.pfp || "/placeholder.svg?height=48&width=48"}" alt="${customer.username}" class="leaderboard-item-avatar">
                <div class="leaderboard-item-info">
                    <div class="leaderboard-item-name">${customer.username}</div>
                    <div class="leaderboard-item-details">${customer.institute}</div>
                </div>
                <div class="leaderboard-item-stats">
                    <div class="stat">
                        <span class="stat-value">${customer.total_purchases || 0}</span>
                        <span class="stat-label">Purchases</span>
                    </div>
                </div>
            </div>
        `
    })
    .join("")
}

async function loadTrendingProducts(products) {
  const grid = document.getElementById("trendingProducts")
  grid.innerHTML = products
    .map((product) => {
      return `
            <div class="product-card" onclick="onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})"">
                <img src="${product.image_url[0]}" alt="${product.product_name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.product_name}</div>
                    <div class="product-price">$${product.unit_price}</div>
                    <div class="product-views">${product.units_sold || 0} Units Sold</div>
                </div>
            </div>
        `
    })
    .join("")

  grid.querySelectorAll('.product-card').forEach((card, index) => {
    card.addEventListener('click', () => openProductModal(products[index]));
  });
}

function openProductModal(product) {
  const html = `
        <div style="padding: 32px;">
            <img src="${product.image_url[0]}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">${product.product_name}</h2>
            <div style="font-size: 24px; color: var(--accent); font-weight: 700; margin-bottom: 16px;">$${product.unit_price}</div>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${product.description}</p>
            <div style="background: var(--secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Seller: <strong>${product.vendor_name || "Unknown"}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Views: <strong>${product.view_count || 0}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary);">Available: <strong>${product.quantity}</strong></div>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <button onclick="addLeaderboardProductToCart(${product.product_id})" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = html
  document.getElementById("productModal").classList.add("active")
}

async function addLeaderboardProductToCart(productId) {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if(!userData) {
    window.location.href = "login.html";
  }

  try{
    const response = await fetch(`https://upstartpy.onrender.com/cart/cart-items/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "Authorization": `Bearer ${userData.access}`
        }
    });

    if (!response.ok){
      if(response.status === 401){
        window.location.href = "login.html";
      }
      return;
    }
    alert(`Added to cart!`);
    const badge = document.getElementById("cartBadge")
    if (badge) {
      badge.textContent ++;
    }
    document.getElementById("productModal").classList.remove("active")
  }catch(error){
    alert("Can't connect to server")
  }
}

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tabId = this.dataset.tab
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
    this.classList.add("active")
    document.getElementById(tabId).classList.add("active")
  })
})

document.getElementById("closeProductModal").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("active")
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) this.classList.remove("active")
})

function loadVendorPage(vendorId){
  window.location.href = `vendor-profile.html?vendorId=${vendorId}`
}

// Helper function to hide loading modal with exit animation
function hideLoadingModal() {
  const loadingModal = document.getElementById("loadingModal");
  if (!loadingModal) return;
  
  loadingModal.classList.remove("show");
  loadingModal.classList.add("hide");
  loadingModal.setAttribute("aria-hidden", "true");
  
  // Remove hide class after animation completes
  setTimeout(() => {
    loadingModal.classList.remove("hide");
    document.body.classList.remove("loading-active");
  }, 600);
}

document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard()
})
