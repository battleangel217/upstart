// Toast notification utility function
function showToast(message, type = 'info', options = {}) {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.style.position = 'fixed';
    el.style.top = '20px';
    el.style.right = '20px';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    return el;
  })();

  const timeout = options.timeout ?? 3500;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.padding = '12px 16px';
  toast.style.marginBottom = '8px';
  toast.style.borderRadius = '4px';
  toast.style.backgroundColor = type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3';
  toast.style.color = 'white';
  toast.style.fontSize = '14px';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

  const text = document.createElement('div');
  text.textContent = message;
  toast.appendChild(text);

  const close = document.createElement('button');
  close.className = 'close-btn';
  close.type = 'button';
  close.textContent = '×';
  close.style.marginLeft = '12px';
  close.style.background = 'none';
  close.style.border = 'none';
  close.style.color = 'white';
  close.style.cursor = 'pointer';
  close.style.fontSize = '20px';
  close.addEventListener('click', () => dismiss());
  toast.appendChild(close);

  let removed = false;
  function dismiss() {
    if (removed) return;
    removed = true;
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }

  container.appendChild(toast);

  if (timeout > 0) {
    setTimeout(dismiss, timeout);
  }
  return { dismiss };
}

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
      const error = await response.json();
      console.error('Error loading products:', response.status, error);
      showToast(`Failed to load products: ${error.detail || 'Unknown error'}`, 'error');
      await hideLoadingModal();
      return;
    }

    const products = await response.json();
    if (!products || products.length === 0) {
      console.warn('No products returned from server');
    } else {
      console.log('Products loaded successfully:', products.length, 'items');
    }
    
  renderProducts(products);
  // Wait for skeletons to fade out and be removed, then trigger product fade-ins
  await hideLoadingModal();
  const cards = Array.from(document.querySelectorAll('.product-card'));
  cards.forEach((card, idx) => setTimeout(() => card.classList.add('fade-in'), idx * 50));

  }catch(error){
    console.error('Error loading products (index.js):', error);
    showToast('Failed to load products. Please check your connection and try again.', 'error');
    await hideLoadingModal();
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
    <div class="product-card" onclick="openProductModal(${item.id})">
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
  
  try {
    const response = await fetch(`https://upstartpy.onrender.com/products/${productId}`,
      {
        method: "GET",
        headers
      }
    )

    if (!response.ok) {
      console.error('Error fetching product details:', response.status);
      showToast('Failed to load product details. Please try again.', 'error');
      return;
    }

    const product = await response.json();
    if (!product) {
      console.error('No product data received');
      showToast('Product not found.', 'error');
      return;
    }

    console.log('Product loaded successfully:', product.id);

    // Store product ID in modal for button actions
    document.getElementById("productModal").dataset.productId = productId

    // Update modal content
    document.getElementById("productName").textContent = product.product_name
    document.getElementById("productPrice").textContent = `$${product.price}`
    document.getElementById("productDescription").textContent = product.description
    document.getElementById("productLocation").textContent = product.institute
    document.getElementById("productCategory").textContent = product.category
    document.getElementById("quantityAvailable").textContent = product.quantity
    document.getElementById("viewCount").textContent = product.view_count
    document.getElementById("productRating").textContent =
      "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))

    document.getElementById("likesCount").textContent = product.likes || 0
    document.getElementById("vendorName").textContent = product.vendor_username
    document.getElementById("vendorEmail").textContent = product.vendor_email
    document.getElementById("vendorImage").src = product.pfp
    document.getElementById("vendorRating").textContent =
      "★".repeat(Math.round(product.vendor_rating)) + "☆".repeat(5 - Math.round(product.vendor_rating))

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
        console.log("[v0] Contact vendor clicked, vendorId:", product.vendor_id)
        if (!currentUser){
          showToast("Please log in to contact vendor", "error");
          window.location.href='login.html';
          return;
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
            console.error('Error creating conversation:', response.status, error)
            showToast(error.message || 'Failed to create conversation', 'error');
            return
          }
          window.location.href = `chat.html?vendorId=${product.vendor_id}`
        }catch(error){
          console.error('Error contacting vendor:', error);
          showToast('Failed to contact vendor. Please try again.', 'error');
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
  } catch(error) {
    console.error('Error opening product modal:', error);
    await hideLoadingModal();
    showToast('An unexpected error occurred. Please try again.', 'error');
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
    showToast('Please log in to add items to cart', 'error');
    window.location.href = "login.html";
    return;
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
        showToast('Session expired. Please log in again.', 'error');
        window.location.href = "login.html";
        return;
      }
      const error = await response.json();
      console.error('Error adding to cart:', response.status, error);
      showToast(error.detail || 'Failed to add item to cart', 'error');
      return;
    }
    
    showToast('Item added to cart!', 'success');
    // Update cart badge
    const badge = document.getElementById("cartBadge")
    if (badge) {
      badge.textContent++;
    }
  }catch(error){
    console.error('Error adding to cart:', error);
    showToast('Failed to add item to cart. Please try again.', 'error');
  }

  closeProductModal()
}

// Helper function to hide loading modal with exit animation
function hideLoadingModal() {
  const loadingSkeleton = document.querySelectorAll(".product-card-skeleton");
  if (!loadingSkeleton || loadingSkeleton.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    loadingSkeleton.forEach(card => card.classList.add('fade-out'));
    setTimeout(() => {
      loadingSkeleton.forEach(card => card.remove());
      resolve();
    }, 350);
  });
}
