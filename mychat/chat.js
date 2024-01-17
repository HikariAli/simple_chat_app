document.addEventListener('DOMContentLoaded', () => {
  const messagesDiv = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const loginForm = document.getElementById('loginForm');

  let username = '';

  // Establish SSE connection
  const eventSource = new EventSource('/sse');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    username = document.getElementById('username').value.trim();
    loginForm.style.display = 'none';
  });

  // Handle incoming messages
  eventSource.addEventListener('message', (event) => {
    const message = event.data;
    appendMessage(message);
  });

  // Handle form submission
  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();

    // Submit message to the server
    fetch(`/chat?username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to send message. Status: ${response.status}`);
        }
      })
      .catch((error) => console.error(error));

    messageInput.value = '';
  });

  // Function to append a message to the messages div
  const appendMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
  };
});
