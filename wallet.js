async function loadWalletData() {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  const response = await fetch('http://127.0.0.1:8000/wallet/getbalance/',
    {
      method: "GET",
      headers: {
        "Content-Type":"application/json",
        "Authorization":`Bearer ${currentUser.access}`
      }
    })

    const balance = await response.json();
    console.log(balance);


  if (balance) {
    document.getElementById("balanceAmount").textContent = `$${(balance.balance).toFixed(2)}`
  }

  loadTransactionHistory()
}

function loadTransactionHistory() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const transactions = JSON.parse(localStorage.getItem("transactions")) || []
  const userTransactions = transactions.filter((t) => t.userId === currentUser.id)

  const list = document.getElementById("transactionsList")

  if (userTransactions.length === 0) {
    list.innerHTML = '<p class="empty-message">No transactions yet</p>'
    return
  }

  list.innerHTML = userTransactions
    .reverse()
    .map(
      (t) => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-info">
                <div class="transaction-type">${t.type === "credit" ? "+" : "-"} ${t.description}</div>
                <div class="transaction-date">${new Date(t.date).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount ${t.type === "credit" ? "amount-credit" : "amount-debit"}">
                ${t.type === "credit" ? "+" : "-"}$${t.amount.toFixed(2)}
            </div>
        </div>
    `,
    )
    .join("")
}

document.getElementById("addMoneyBtn").addEventListener("click", () => {
  document.getElementById("addMoneyDrawer").classList.add("active")
  document.getElementById("drawerOverlay").classList.add("active")
  document.getElementById("addMoneyAmount").value = null;
  document.getElementById("addMoneyAmount").placeholder = 0
})

document.getElementById("withdrawBtn").addEventListener("click", () => {
  document.getElementById("withdrawDrawer").classList.add("active")
  document.getElementById("drawerOverlay").classList.add("active")
})

function closeDrawer(drawerId) {
  document.getElementById(drawerId).classList.remove("active")
  document.getElementById("drawerOverlay").classList.remove("active")
}

function closeAllDrawers() {
  document.querySelectorAll(".drawer").forEach((d) => d.classList.remove("active"))
  document.getElementById("drawerOverlay").classList.remove("active")
}

document.getElementById("submitAddMoney").addEventListener("click", async () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }
  const amount = Number.parseFloat(document.getElementById("addMoneyAmount").value)
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount")
    document.getElementById("addMoneyAmount").value = null

    return
  }

  try{
    const response = await fetch('http://127.0.0.1:8000/wallet/topup',
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "Authorization":`Bearer ${currentUser.access}`
        },
        body: JSON.stringify({amount})
      });

      const details = await response.json();
      console.log(details.details.data.authorization_url)

      if (details && details.details && details.details.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = details.details.data.authorization_url;
      } else {
        setError('Failed to initialize top-up');
      }

    const reference = await fetch(`http://127.0.0.1:8000//wallet/verify-topup/${details.details.data.reference}`,
      {
        method: "GET",
        headers: {
          "Content-Type":"application/json",
          "Authorization":`Bearer ${currentUser.access}`
        }
      })

      const ref = await reference.json()
      

  }catch(error){
    alert('Transaction failed')
    throw new Error(`HTTP error! status`)
  }
  alert(`Successfully added $${amount.toFixed(2)} to your wallet!`)
  closeDrawer("addMoneyDrawer")
  loadWalletData()
  document.getElementById("addMoneyAmount").value = ""
  
})

document.getElementById("submitWithdraw").addEventListener("click", () => {
  const amount = Number.parseFloat(document.getElementById("withdrawAmount").value)
  const bankAccount = document.getElementById("bankAccount").value
  const routingNumber = document.getElementById("routingNumber").value

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount")
    return
  }

  if (!bankAccount || !routingNumber) {
    alert("Please fill in all bank details")
    return
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []
  const userIndex = users.findIndex((u) => u.id === currentUser.id)

  if (userIndex !== -1) {
    const balance = users[userIndex].walletBalance || 0
    if (balance < amount) {
      alert("Insufficient balance")
      return
    }

    users[userIndex].walletBalance = balance - amount
    localStorage.setItem("users", JSON.stringify(users))

    const transaction = {
      userId: currentUser.id,
      type: "debit",
      amount: amount,
      description: "Withdrew from wallet",
      date: new Date().toISOString(),
    }
    const transactions = JSON.parse(localStorage.getItem("transactions")) || []
    transactions.push(transaction)
    localStorage.setItem("transactions", JSON.stringify(transactions))

    alert(`Successfully withdrew $${amount.toFixed(2)}!`)
    closeDrawer("withdrawDrawer")
    loadWalletData()
    document.getElementById("withdrawAmount").value = ""
    document.getElementById("bankAccount").value = ""
    document.getElementById("routingNumber").value = ""
  }
})

document.addEventListener("DOMContentLoaded", loadWalletData)
