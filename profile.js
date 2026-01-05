let isEditing = false

async function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  const user = currentUser.user
  console.log(user)

  // Load profile data
  document.getElementById("profileName").textContent = user.username
  document.getElementById("username").value = user.username
  document.getElementById("email").value = user.email
  document.getElementById("phone").value = user.phone
  document.getElementById("profileRole").textContent = user.role
  document.getElementById("profileImg").src = user.profile_url
  document.getElementById("bio").value = user.bio


  const select = document.getElementById('university');
  const bio = document.getElementById("bio");
  try{
    const response = await fetch('https://university-domains-list-api-tn4l.onrender.com/search?country=Nigeria',
    {
      method: 'GET',
      headers: {"Content-Type":"application/json"}
    }
    );

    if(!response.ok){
      alert("Can't connect to server");
    }

    const res = await response.json();

    res.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      select.appendChild(option);

    })

    


  }catch(error){
     select.innerHTML = '<option value="" disabled>Error loading universities</option>';
  }
  select.disabled = true;
  bio.disabled = true;
  document.getElementById("university").value = user.institute
  hideLoadingModal()
}

// Edit profile
document.getElementById("editBtn").addEventListener("click", () => {
  isEditing = true
  document.querySelectorAll(".form-input").forEach((input) => {
    if (input.id !== "username" && input.id !== "email" && input.id !== "phone") {
      input.removeAttribute("readonly")
      input.removeAttribute("disabled")
    }
  })
  document.getElementById("editBtn").style.display = "none"
  document.getElementById("saveBtn").style.display = "block"
  document.getElementById("cancelBtn").style.display = "block"
})

// Save changes
document.getElementById("saveBtn").addEventListener("click", async () => {
  // Show loading modal
  const loadingModal = document.getElementById("loadingModal");
  loadingModal.classList.remove("hide");
  loadingModal.classList.add("show");
  loadingModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("loading-active");

  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    hideLoadingModal();
    window.location.href = "login.html"
    return
  }

  const bio = document.getElementById("bio").value;
  const institute = document.getElementById("university").value;
  console.log(JSON.stringify({bio, institute}))
  try{
    const response = await fetch('https://upstartpy.onrender.com/auth/users/me/', 
      {
        method: "PATCH",
        headers: {
          "Content-Type":"application/json",
          "Authorization":`Bearer ${currentUser.access}`
        },
        body: JSON.stringify({bio, institute})
      })

    if (response.ok){
      hideLoadingModal();
      const data = await response.json()
      alert("Profile updated successfully!")
      currentUser.user.bio = data.bio
      currentUser.user.institute = data.institute

      localStorage.setItem("userData", JSON.stringify(currentUser));

      isEditing = false
      document.querySelectorAll(".form-input").forEach((input) => {
        input.setAttribute("readonly", "")
        input.setAttribute("disabled", "")
      })
      document.getElementById("editBtn").style.display = "block"
      document.getElementById("saveBtn").style.display = "none"
      document.getElementById("cancelBtn").style.display = "none"
      loadUserProfile()
    } else {
      hideLoadingModal();
    }


  }catch(error){
    hideLoadingModal();
  }


})

// Cancel edit
document.getElementById("cancelBtn").addEventListener("click", () => {
  isEditing = false
  document.querySelectorAll(".form-input").forEach((input) => {
    input.setAttribute("readonly", "")
    input.setAttribute("disabled", "")
  })
  document.getElementById("editBtn").style.display = "block"
  document.getElementById("saveBtn").style.display = "none"
  document.getElementById("cancelBtn").style.display = "none"
  loadUserProfile()
})

// Change photo
document.getElementById("changePhotoBtn").addEventListener("click", () => {
  document.getElementById("photoInput").click()
})

document.getElementById("photoInput").addEventListener("change", async (e) => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  const file = e.target.files[0]
  
  const formData = new FormData();
  formData.append('profile_picture', file);

  try{
    const response = await fetch('https://upstartpy.onrender.com/auth/users/me/', 
      {
        method: "PATCH",
        headers: {
          "Authorization":`Bearer ${currentUser.access}`
        },
        body: formData
      })

    if (response.ok){
      const data = await response.json()
      alert("Profile picture updated successfully!")

      document.getElementById("profileImg").src = data.profile_url

      currentUser.user.profile_url = data.profile_url
      localStorage.setItem("userData", JSON.stringify(currentUser))
    }


  }catch(error){

  }
})

// Helper function to hide loading modal with exit animation
function hideLoadingModal() {
  const loadingModal = document.getElementById("loadingModal");
  loadingModal.classList.remove("show");
  loadingModal.classList.add("hide");
  loadingModal.setAttribute("aria-hidden", "true");
  
  // Remove hide class after animation completes
  setTimeout(() => {
    loadingModal.classList.remove("hide");
    document.body.classList.remove("loading-active");
  }, 600);
}

// // Logout
// document.getElementById("logoutBtn").addEventListener("click", () => {
//   localStorage.setItem("currentUser", JSON.stringify(null))
//   window.location.href = "login.html"
// })

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }
  
  const profileNav = document.getElementById('viewProfile')
  if (profileNav) profileNav.style.display = "none"

  loadUserProfile()
})
