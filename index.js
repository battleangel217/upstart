document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  let headers = {"Content-Type":"application/json"}
  if (currentUser) {
    headers = {
      "Content-Type":"application/json",
      "Authorization": `Bearer ${currentUser.access}`
    }
  }
  console.log(headers)

  try{
    const response = await fetch('https://upstartpy.onrender.com/products/',{
      method: "GET",
      headers: headers
    });

    if (!response.ok){
      const error = await response.json()
      console.log(error)
    }
    if (response.ok) hideLoadingModal();

    const products = await response.json();
    console.log(products[0].id);

    renderProducts(products);

  }catch(error){
    console.error('Error loading products (index.js):', error);
    hideLoadingModal();
  }

})

// function renderProducts(products = null) {
//   const allProducts = products || JSON.parse(localStorage.getItem("products")) || []
//   const grid = document.getElementById("productsGrid")

//   grid.innerHTML = allProducts
//     .map((product) => {
//       const vendor = getVendor(product.vendorId)
//       return `
//             <div class="product-card" onclick="openProductModal(${product.id})">
//                 <img src="${product.images[0]}" alt="${product.name}" class="product-image">
//                 <div class="product-card-body">
//                     <div class="product-card-name">${product.name}</div>
//                     <div class="product-card-price">$${product.price}</div>
//                     <div class="product-card-vendor">${vendor?.name || "Unknown"}</div>
//                     <div class="product-card-location">📍 ${product.location}</div>
//                 </div>
//             </div>
//         `
//     })
//     .join("")
// }

function renderProducts(product) {
  const productGrid = document.getElementById("productsGrid");

  product.forEach((item) => {
    productGrid.innerHTML += `
      <div class="product-card" id="productCard" onclick="openProductModal(${item.id})">
          <img src="${item.image_url[0]}" alt="${item.product_name}" class="product-image">
          <div class="product-card-body">
              <div class="product-card-name">${item.product_name}</div>
              <div class="product-card-price">${item.price}</div>
              <div class="product-card-vendor">${item.vendor_username}</div>
              <div class="product-card-location">📍 ${item.institute}</div>
          </div>
      </div>`;

      // document.getElementById("productCard").addEventListener('click', () => {
      //   openProductModal(item.id);
      // })
  })

}



// Open product modal
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

  // const vendor = product.

    // Store product ID in modal for button actions
    document.getElementById("productModal").dataset.productId = productId

  // Update modal content
  document.getElementById("productName").textContent = product.product_name
  document.getElementById("productPrice").textContent = `$${product.price}`
  document.getElementById("productDescription").textContent = product.description
  // document.getElementById("productColor").textContent = product.color
  document.getElementById("productLocation").textContent = product.institute
  document.getElementById("productCategory").textContent = product.category
  document.getElementById("quantityAvailable").textContent = product.quantity
  document.getElementById("viewCount").textContent = product.view_count
  // document.getElementById("reviewCount").textContent = `(${product.reviews.length} reviews)`
  document.getElementById("productRating").textContent =
    "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))

  document.getElementById("likesCount").textContent = product.likes || 0
  document.getElementById("vendorName").textContent = product.vendor_username
  document.getElementById("vendorEmail").textContent = product.vendor_email
  document.getElementById("vendorImage").src = product.pfp
  document.getElementById("vendorRating").textContent =
    "★".repeat(Math.round(product.vendor_rating)) + "☆".repeat(5 - Math.round(product.vendor_rating))

  // Set max quantity for input
  // const quantityInput = document.getElementById("cartQuantityInput")
  // if (quantityInput) {
  //   quantityInput.max = product.quantity
  //   quantityInput.value = 1
  // }

  // Update gallery
  document.getElementById("galleryMainImage").src = product.image_url[0]
  const thumbnails = document.getElementById("galleryThumbnails")
  thumbnails.innerHTML = product.image_url
    .map(
      (img, idx) => `
        <div class="gallery-thumbnail" onclick="event.stopPropagation(); document.getElementById('galleryMainImage').src='${img}'">
            <img src="${img}" alt="Image ${idx + 1}">
        </div>
    `,
    )
    .join("")


  const commentsList = document.getElementById("commentsList")
  if (product.reviews && product.reviews.length > 0) {
    commentsList.innerHTML = product.reviews
      .map(
        (comment) => `
        <div class="comment-item">
          <div class="comment-header">
            <strong>${comment.user}</strong>
            <span class="comment-rating">${"★".repeat(comment.rating)}${"☆".repeat(5 - comment.rating)}</span>
          </div>
          <p class="comment-text">${comment.text}</p>
          <span class="comment-time">${comment.timestamp}</span>
        </div>
      `,
      )
      .join("")
  } else {
    commentsList.innerHTML = `<p class="no-comments">No reviews yet. Be the first to review!</p>`
  }

  document.getElementById("likeBtn").onclick = () => {
    product.likes = (product.likes || 0) + 1
    const products = JSON.parse(localStorage.getItem("products")) || []
    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index] = product
      localStorage.setItem("products", JSON.stringify(products))
      document.getElementById("likesCount").textContent = product.likes
      document.getElementById("likeBtn").classList.add("liked")
    }
  }

  const addToCartBtn = document.getElementById("addToCartBtn")
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCartFromModal(productId);
    })
  }

  const contactVendorBtn = document.getElementById("contactVendorBtn")
  if (contactVendorBtn) {
    contactVendorBtn.onclick = async () => {
      console.log("[v0] Contact vendor clicked, vendorId:", product.vendorId)
      if (!currentUser){
        alert("Login to continue")
        window.location.href='login.html';
      }
      try{
        const response = await fetch(`https://upstartpy.onrender.com/chat/create/${product.vendor_id}`,{
          method: 'POST',
          headers: {
            "Authorization":`Bearer ${currentUser.access}`,
            "Content-Type":"application/json"
          }
        })
        if (!response.ok){
          const error = await response.json();
          console.log(error)
          if (response.status === 401) alert(error.message)
          else if (response.status === 404) alert(error.message)
          return
        }
        window.location.href = `chat.html?vendorId=${product.vendor_id}`
      }catch(error){
        alert('Something went wrong')
      }
    }
  }

  const viewVendorBtn = document.getElementById("viewVendorBtn")
  if (viewVendorBtn) {
    viewVendorBtn.onclick = () => {
      console.log("[v0] View vendor clicked, vendorId:", product.vendor_id)
      window.location.href = `vendor-profile.html?vendorId=${product.vendor_id}`
    }
  }

  
  document.getElementById("productModal").classList.add("active")
  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    modalContent.scrollTop = 0;
  }
}

// Close product modal
function closeProductModal() {
  console.log("[v0] Closing product modal")
  document.getElementById("productModal").classList.remove("active")
}

// Add to cart
// function addToCart(productId) {
//   const cart = JSON.parse(localStorage.getItem("cart")) || []
//   const existingItem = cart.find((item) => item.productId === productId)

//   if (existingItem) {
//     existingItem.quantity += 1
//   } else {
//     cart.push({ productId, quantity: 1 })
//   }

//   localStorage.setItem("cart", JSON.stringify(cart))

//   // Show notification
//   alert("Product added to cart!")
//   closeProductModal()
// }




// Chat functionality
const chatMessages = [
  "Hi there! I'm Upstart Assistant. How can I help you?",
  "Looking for something specific? Try using the search bar!",
  "Need help with payment? Visit our wallet page.",
  "Want to sell? Create a vendor account!",
  "Check out our leaderboard for top sellers and products.",
  "Having trouble? Contact our support team.",
]

const chatIndex = 0

const chatBubbleBtn = document.getElementById("chatBubbleBtn")
const chatWidget = document.getElementById("chatWidget")
if (chatBubbleBtn && chatWidget) {
  chatBubbleBtn.addEventListener("click", () => {
    chatWidget.classList.toggle("active")
  })
}

const closeChatWidgetBtn = document.getElementById("closeChatWidget")
if (closeChatWidgetBtn && chatWidget) {
  closeChatWidgetBtn.addEventListener("click", () => {
    chatWidget.classList.remove("active")
  })
}

const chatSendBtn = document.getElementById("chatSendBtn")
if (chatSendBtn) {
  chatSendBtn.addEventListener("click", () => {
    const input = document.getElementById("chatInput")
    const message = input?.value?.trim()

    if (!message) return

    const chatMessages = document.getElementById("chatMessages")
    if (!chatMessages) return

    // Add user message
    const userMsg = document.createElement("div")
    userMsg.className = "message user-message"
    userMsg.innerHTML = `<p>${message}</p>`
    chatMessages.appendChild(userMsg)

    if (input) input.value = ""

    // Add bot response
    setTimeout(() => {
      const botMsg = document.createElement("div")
      botMsg.className = "message bot-message"
      const responses = [
        "Great question! I'll help with that.",
        "That's a popular item!",
        "Let me assist you with that.",
        "I understand. What else can I help with?",
        "Anything else I can help you with?",
      ]
      botMsg.innerHTML = `<p>${responses[Math.floor(Math.random() * responses.length)]}</p>`
      chatMessages.appendChild(botMsg)
      chatMessages.scrollTop = chatMessages.scrollHeight
    }, 500)

    chatMessages.scrollTop = chatMessages.scrollHeight
  })
}

// Modal close on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProductModal()
  }
})

const productModalEl = document.getElementById("productModal")
if (productModalEl) {
  productModalEl.addEventListener("click", function (e) {
    if (e.target === this) {
      console.log("[v0] Overlay clicked, closing modal")
      closeProductModal()
    }
  })
}

const closeBtn = document.getElementById("closeProductModal")
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    console.log("[v0] Close button clicked")
    closeProductModal()
  })
}


// Chat helper function
function openChat(vendorId) {
  localStorage.setItem("selectedVendor", JSON.stringify(vendorId))
  window.location.href = "chat.html"
}

async function addToCartFromModal(productId) {
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
