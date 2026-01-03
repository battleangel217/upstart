let currentConversationId = null
let statusTransitionTimer = null
let currentVendorId = null

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  if(!currentUser){
    window.location.href = "login.html";
    return
  }

  self.ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat?token=${currentUser.access}`)
  ws.onopen = function() {
    console.log('🔌 Websocket connected');
  };
  
  ws.onmessage = function(e) {
    const data = JSON.parse(e.data);
    
    if (data.type === 'conversation_list') {
        console.log('💬 Conversations:', data.conversations);
        loadConversations(data.conversations);
    }else if (data.type === "my_messages"){
      console.log(data.messages)
      loadMessages(data.messages)
    }else if (data.type === "new_message"){
      console.log(data)
      const isSent = data.sender === currentUser.user.id
      addMessage(isSent, data.message, data.timestamp, data.conversation_id)
    }else if (data.type === "mark_chat"){
      const isSent = data.sender === currentUser.user.id
      markAsRead(data.conversation_id, isSent)
    }
  };

  ws.onclose = function(e) {
    console.log('🔌 WebSocket closed:', e.code);
  };
    
  ws.onerror = function(error) {
    console.error('❌ WebSocket error:', error);
  };

  // Reset scroll positions to default on page load.
  // This ensures any preserved/previous scroll positions are cleared
  // and the UI starts at the top for both conversations and messages.
  try {
    // Small timeout to ensure elements are available and styles applied
    setTimeout(() => {
      const messagesList = document.getElementById('messagesList')
      const conversationsList = document.getElementById('conversationsList')
      if (messagesList) {
        messagesList.scrollTop = 0
        // remove any inline height if present so CSS can control it
        if (messagesList.style && messagesList.style.height) messagesList.style.height = ''
      }
      if (conversationsList) conversationsList.scrollTop = 0
      // also reset the page scroll
      window.scrollTo(0, 0)
    }, 50)
  } catch (e) {
    console.warn('Could not reset scroll positions on load', e)
  }


})



async function loadConversations(conversations) {
    const currentUser = JSON.parse(localStorage.getItem('userData'))
    const list = document.getElementById("conversationsList")
    if (conversations.length === 0) {
      list.innerHTML =
      '<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 14px;">No conversations yet</div>'
      return
    }
    
    let html = ""
    conversations.forEach((participant) => {
        let isRead = '';
        const lastMessageText = participant.last_message?.text ?? "No messages yet"
        if(participant.last_message.sender === currentUser.user.id){
          isRead = participant.last_message?.is_read ? "Seen" : "Delivered"
        }
        const unreadHTML = (participant.unread_count && participant.unread_count > 0) ? `<span class="conversation-unread-badge">${participant.unread_count}</span>` : `<span class="conversation-unread-badge" style="display: none;">${participant.unread_count}</span>`
        html += `
          <div class="conversation-item" data-conversation-id="${participant.id}" onclick="openConversation('${participant.id}', '${participant.other_user.username}', '${participant.other_user.profile_picture}', ${participant.other_user.status}, '${participant.other_user.last_seen}', '${participant.other_user.id}')">
            <img src="${participant.other_user.profile_picture}" alt="${participant.other_user.username}" class="conversation-avatar">
            <div class="conversation-info">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <div class="conversation-name">${participant.other_user.username}</div>
                ${unreadHTML}
              </div>
              <div class="conversation-last-message">
                <span class="conversation-last-message-text" title="${lastMessageText}">${lastMessageText}</span>
                <span class="conversation-read-status">${isRead}</span>
              </div>
            </div>
          </div>
        `
    })
    list.innerHTML = html 

}

function openConversation(participantId, participantName, pfp, status, last_seen, vendorId) {
  currentConversationId = participantId
  currentVendorId = vendorId

  // Update UI
  document.querySelectorAll(".conversation-item").forEach((el) => el.classList.remove("active"))
  // Find the conversation item by data attribute and mark it active
  const el = document.querySelector(`.conversation-item[data-conversation-id="${participantId}"]`)
  if (el) el.classList.add("active")

  document.getElementById("chatEmpty").style.display = "none"
  document.getElementById("chatView").style.display = "flex"
  document.getElementById("chatUserName").textContent = participantName
  document.getElementById('chatUserAvatar').src = pfp
  const onlineStatus = document.getElementById('chatUserStatus')

  // Clear any existing timer
  if (statusTransitionTimer) {
    clearTimeout(statusTransitionTimer)
  }

  if (status){
    onlineStatus.innerText = "Online"
  }else{
    // Show full date initially
    onlineStatus.innerHTML = new Date(last_seen).toLocaleString([], { 
      weekday: "short",
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    })
    
    // Transition to time-only after 3 seconds
    statusTransitionTimer = setTimeout(() => {
      if (!status && document.getElementById('chatUserStatus') === onlineStatus) {
        onlineStatus.style.transition = 'opacity 0.3s ease-in-out'
        onlineStatus.style.opacity = '0.7'
        
        setTimeout(() => {
          onlineStatus.innerHTML = new Date(last_seen).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })
          onlineStatus.style.opacity = '1'
        }, 300)
      }
    }, 3000)
  }

  ws.send(JSON.stringify({
    "action":"get_message",
    "conversation_id": currentConversationId
  }))
  console.log("hehie")
}

function loadMessages(conversationMessages) {
  const currentUser = JSON.parse(localStorage.getItem("userData"))
  const list = document.getElementById("messagesList")
  
  ws.send(JSON.stringify({
    "action": "mark_as_read",
    "conversation_id": currentConversationId
  }))

  const unreadBadge = document.querySelector(
    `.conversation-item[data-conversation-id="${currentConversationId}"] .conversation-unread-badge`
  );

  if (unreadBadge) {
    unreadBadge.style.display = "none";
  }

  let html = ""
  conversationMessages.forEach((msg, index) => {
    const isSent = msg.sender === currentUser.user.id
    const isLastMessage = index === conversationMessages.length - 1
    console.log(msg.is_read)
    // Determine status for the last message if it's sent by current user
    let statusText = ""
    if (isSent && isLastMessage) {
      statusText = msg.is_read ? " • Seen" : " • Delivered"
    }
    
    html += `
      <div class="message ${isSent ? "sent" : "received"}">
        <div class="message-bubble">${msg.text}</div>
        <div class="message-time">
          ${new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${statusText}
        </div>
      </div>
    `
  })

  list.innerHTML = html
  list.scrollTop = list.scrollHeight
}

function addMessage(isSent, message, timestamp, conversationId){
  const chatMessages = document.getElementById('messagesList')
  const messageElement = document.createElement('div')
  const lastMessageTime = document.querySelector('.message.sent:last-child .message-time')
  if (lastMessageTime && isSent) {
    lastMessageTime.textContent = lastMessageTime.textContent.replace('• Delivered', '')
  }

  messageElement.className = `message ${isSent ? "sent" : "received"}`
  const status = isSent ? "• Delivered" : ""
  messageElement.innerHTML = `
    <div class="message-bubble">${message}</div>
    <div class="message-time">${new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${status}</div>
  `
  chatMessages.appendChild(messageElement)

  if(currentConversationId === conversationId){
    ws.send(JSON.stringify({
      "action": "mark_as_read",
      "conversation_id": currentConversationId
    }))
  }
}

function markAsRead(conversation_id, isSent){
  // Only update if the OTHER person is reading MY messages
  if (isSent) return;

    // Update sidebar
  const lastMessageReadEl = document.querySelector(
    `.conversation-item[data-conversation-id="${conversation_id}"] .conversation-read-status`
  )
  if (lastMessageReadEl) {
    lastMessageReadEl.textContent = lastMessageReadEl.textContent.replace('Delivered', 'Seen')
  }
  // Update chat messages
  const allSentMessages = document.querySelectorAll('.message.sent .message-time')
  const lastIndex = allSentMessages.length - 1
  
  allSentMessages.forEach((timeEl, index) => {
    if (index === lastIndex) {
      // Last message: show "Seen"
      timeEl.textContent = timeEl.textContent
        .replace(/ • (Delivered|Seen)/g, '') // Remove old status
        + ' • Seen' // Add new status
    } else {
      // All other messages: remove status completely
      timeEl.textContent = timeEl.textContent.replace(/ • (Delivered|Seen)/g, '')
    }
  })
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("messageInput")
  const text = input.value.trim()
  const chatMessages = document.getElementById('messagesList')

  if (!text || !currentConversationId) return
  ws.send(JSON.stringify({
    "action":"send_message",
    "conversation_id":currentConversationId,
    "message": text
  }))

  input.value = ""
  chatMessages.scrollTop = chatMessages.scrollHeight
})

document.getElementById("chatUserInfo").addEventListener("click", () => {
  window.location.href = `vendor-profile.html?vendorId=${currentVendorId}`
})
document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("sendBtn").click()
  }
})