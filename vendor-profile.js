const params = new URLSearchParams(window.location.search)
const vendorId = Number.parseInt(params.get("vendorId"))

async function loadVendorProfile() {
  const currentUser = JSON.parse(localStorage.getItem('userData'))
  try{
    const response = await fetch(`https://upstartpy.onrender.com/auth/user/${vendorId}`,{
      method: "GET",
      headers: {
        "Content-Type":"application/json",
        "Authorization":`Bearer ${currentUser.access}`
      }
    })
    const vendor = await response.json()

    document.getElementById("vendorName").textContent = vendor.info.username
    document.getElementById("vendorUniversity").textContent = vendor.info.institute
    // document.getElementById("vendorDepartment").textContent = vendor.department
    // Contact details and bio
    document.getElementById("vendorEmail").textContent = vendor.info.email
    document.getElementById("vendorPhone").textContent = vendor.info.phone
    document.getElementById("vendorBio").textContent = vendor.info.bio
    document.getElementById("vendorImage").src = vendor.info.profile_url || "/placeholder.svg?height=120&width=120"
    document.getElementById("totalSales").textContent = vendor.sales || 0
    document.getElementById("avgRating").textContent = (vendor.info.rating || 0).toFixed(1)
    document.getElementById("vendorRating").textContent =
      "★".repeat(Math.round(vendor.info.rating || 0)) + "☆".repeat(5 - Math.round(vendor.info.rating || 0))
    // document.getElementById("reviewCount").textContent = `(${vendor.reviews || 0} reviews)`

    loadVendorProducts(vendorId)
    loadVendorVideos()
  }catch(error){
    console.log(error)
  }

  // if (!vendor) {
  //   alert("Vendor not found")
  //   window.location.href = "index.html"
  //   return
  // }

  
}

async function loadVendorProducts(vendorId) {
  const currentUser = JSON.parse(localStorage.getItem('userData'))
  try{
    const response = await fetch(`https://upstartpy.onrender.com/products/vendor-products/${vendorId}`, {
      method: "GET",
      headers: {
        "Content-Type":"application/json",
        "Authorization":`Bearer ${currentUser.access}`
      }
    })
    const vendorProducts = await response.json()
    document.getElementById("productCount").textContent = vendorProducts.length

    const grid = document.getElementById("productsGrid")

    if (vendorProducts.length === 0) {
      grid.innerHTML =
        '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No products listed yet</p>'
      return
    }

    
    grid.innerHTML = vendorProducts
    .map(
      (product) => `
          <div class="product-card" onclick="openProductModal(${product.id})">
              <img src="${product.image_url[0]}" alt="${product.product_name}" class="product-image">
              <div class="product-card-body">
                  <div class="product-card-name">${product.product_name}</div>
                  <div class="product-card-price">$${product.price}</div>
              </div>
          </div>
      `,
      )
      .join("")
  }catch(error){

  }

  
}

function loadVendorVideos() {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const vendorProducts = products.filter((p) => p.vendorId === vendorId && p.videoUrl)

  const videosSection = document.getElementById("videosSection")
  const videosGrid = document.getElementById("videosGrid")

  if (vendorProducts.length === 0) {
    videosSection.style.display = "none"
    return
  }

  videosSection.style.display = "block"

  videosGrid.innerHTML = vendorProducts
    .map(
      (product, index) => `
        <div class="video-card" data-video-index="${index}">
            <div class="video-container">
                <video src="${product.videoUrl}" class="video-player-preview"></video>
                <div class="video-overlay">
                    <span class="video-play-icon">▶️</span>
                    <span class="video-title">${product.name}</span>
                </div>
            </div>
            <div class="video-stats">
                <div class="video-stat">
                    <span class="stat-icon">❤️</span>
                    <span>${product.likes || 0} Likes</span>
                </div>
                <div class="video-stat">
                    <span class="stat-icon">👁️</span>
                    <span>${product.viewCount || 0} Views</span>
                </div>
                <div class="video-stat">
                    <span class="stat-icon">💬</span>
                    <span>${product.comments ? product.comments.length : 0} Comments</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  // Add event listeners to video cards
  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.videoIndex)
      initVideoViewer(vendorProducts, index)
    })
  })
}

// Load vendor's content (videos posted by the vendor)
async function loadVendorContent() {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  const grid = document.getElementById('contentsGrid')
  if (!grid) return

  // Show a loading placeholder
  grid.innerHTML = `<div class="empty-inventory" style="grid-column: 1/-1;"><p class="empty-text">Loading content...</p></div>`

  if (!currentUser || !currentUser.access) {
    window.location.href = 'login.html'
    return
  }

  try {
    // Fetch content posted by this specific vendor
    const res = await fetch(`https://upstartpy.onrender.com/customers/vendorcontents/${vendorId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${currentUser.access}` }
    })
    if (!res.ok) throw new Error('Failed to fetch')
    const items = await res.json()
    if (!Array.isArray(items) || items.length === 0) {
      grid.innerHTML = `<div class="empty-inventory" style="grid-column: 1/-1;"><div class="empty-icon">🎬</div><p class="empty-text">No content available from this vendor.</p></div>`
      return
    }
    // expose items to the global scope so we can safely reference them from inline
    // onclick handlers without embedding the entire array into the HTML string,
    // which previously caused a "missing ] after element list" SyntaxError.
    window._vendorContentItems = items

    grid.innerHTML = items.map((it, index) => {
      return `
        <div class="product-card">
          <div class="video-container" onclick="initVideoViewer(window._vendorContentItems, ${index})">
            <video src="${it.video || '#'}" class="video-player-preview"></video>
          </div>
          <div class="product-card-body">
            <div class="product-card-name">${it.caption || 'Untitled'}</div>
          </div>
        </div>
      `
    }).join('')

  } catch (err) {
    console.error('Error loading vendor content', err)
    grid.innerHTML = `<div class="empty-inventory" style="grid-column: 1/-1;"><p class="empty-text">Failed to load content.</p></div>`
  }
}

async function openProductModal(productId) {
  const currentUser = JSON.parse(localStorage.getItem('userData'))
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (currentUser) {
    headers["Authorization"] = `Bearer ${currentUser.access}`;
  }
  const response = await fetch(`https://upstartpy.onrender.com/products/${productId}`,
    {
      method: "GET",
      headers
    }
  )

  const product = await response.json();

  if (!product) return

  document.getElementById("productName").textContent = product.name
  document.getElementById("productPrice").textContent = `$${product.price}`
  document.getElementById("productDescription").textContent = product.description
  document.getElementById("productLocation").textContent = product.institute
  document.getElementById("quantityAvailable").textContent = product.quantity
  document.getElementById("galleryMainImage").src = product.image_url[0]

  document.getElementById("addToCartBtn").onclick = async () => {
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
      // Update cart badge
      const badge = document.getElementById("cartBadge")
      if (badge) {
        badge.textContent ++;
      }
    }catch(error){

    }
    closeProductModal()
  }

  document.getElementById("productModal").classList.add("active")
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active")
}

document.addEventListener("DOMContentLoaded", () => {
  loadVendorProfile()
  
  document.getElementById("closeProductModal").addEventListener("click", closeProductModal)
  document.getElementById("productModal").addEventListener("click", function (e) {
    if (e.target === this) closeProductModal()
  })

  document.getElementById("contactBtn").addEventListener("click", () => {
    const vendors = JSON.parse(localStorage.getItem("vendors")) || []
    const vendor = vendors.find((v) => v.id === vendorId)
    if (vendor) {
      localStorage.setItem("selectedVendor", JSON.stringify(vendor.id))
      window.location.href = "chat.html"
    }
  })

  // Tab switching logic for Products/Content
  const tabProductsBtn = document.getElementById('tabProducts')
  const tabContentBtn = document.getElementById('tabContent')
  const productsSection = document.getElementById('productsSection')
  const contentSection = document.getElementById('contentSection')

  function activateTab(tabName) {
    if (tabName === 'products') {
      tabProductsBtn?.classList.add('active')
      tabContentBtn?.classList.remove('active')
      productsSection?.classList.remove('hidden')
      contentSection?.classList.add('hidden')
      loadVendorProducts(vendorId)
    } else if (tabName === 'content') {
      tabProductsBtn?.classList.remove('active')
      tabContentBtn?.classList.add('active')
      productsSection?.classList.add('hidden')
      contentSection?.classList.remove('hidden')
      loadVendorContent()
    }
  }

  if (tabProductsBtn) tabProductsBtn.addEventListener('click', () => activateTab('products'))
  if (tabContentBtn) tabContentBtn.addEventListener('click', () => activateTab('content'))
})
