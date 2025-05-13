document.addEventListener('DOMContentLoaded', () => {
  const websiteUrlInput = document.getElementById('website-url');
  const scrapeButton = document.getElementById('scrape-button');
  const scrapeStatus = document.getElementById('scrape-status');
  const localPathInput = document.getElementById('local-path');
  const trainLocalButton = document.getElementById('train-local-button');
  const trainLocalStatus = document.getElementById('train-local-status');
  const questionInput = document.getElementById('question-input');
  const askButton = document.getElementById('ask-button');
  const chatMessages = document.getElementById('chat-messages');

  // Function to add a message to the chat
  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Function to show loading status
  function showLoading(element, message) {
    element.className = 'status loading';
    element.innerHTML = `
      <div class="loading-indicator"></div>
      ${message}
    `;
  }

  // Function to show success status
  function showSuccess(element, message) {
    element.className = 'status success';
    element.textContent = message;
  }

  // Function to show error status
  function showError(element, message) {
    element.className = 'status error';
    element.textContent = message;
  }

  // Event listener for scrape button
  scrapeButton.addEventListener('click', async () => {
    const websiteUrl = websiteUrlInput.value.trim();

    if (!websiteUrl) {
      showError(scrapeStatus, 'Please enter a valid website URL');
      return;
    }

    try {
      scrapeButton.disabled = true;
      showLoading(scrapeStatus, 'Training on website content. This may take a few minutes...');

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(scrapeStatus, `Successfully trained on ${data.urls.length} pages from the website.`);
        addMessage(`I've learned about ${websiteUrl}. You can now ask me questions about this website!`, false);
      } else {
        showError(scrapeStatus, `Error: ${data.error}`);
      }
    } catch (error) {
      showError(scrapeStatus, `Error: ${error.message}`);
    } finally {
      scrapeButton.disabled = false;
    }
  });

  // Event listener for train local button
  trainLocalButton.addEventListener('click', async () => {
    const localPath = localPathInput.value.trim();

    if (!localPath) {
      showError(trainLocalStatus, 'Please enter a valid local directory path');
      return;
    }

    try {
      trainLocalButton.disabled = true;
      showLoading(trainLocalStatus, 'Training on local files. This may take a few minutes...');

      const response = await fetch('/api/train-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dirPath: localPath }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(trainLocalStatus, `Successfully trained on ${data.fileCount} files from the directory.`);
        addMessage(`I've learned about Visafy from local files. You can now ask me questions about Visafy!`, false);
      } else {
        showError(trainLocalStatus, `Error: ${data.error}`);
      }
    } catch (error) {
      showError(trainLocalStatus, `Error: ${error.message}`);
    } finally {
      trainLocalButton.disabled = false;
    }
  });

  // Event listener for ask button
  askButton.addEventListener('click', async () => {
    const question = questionInput.value.trim();

    if (!question) {
      return;
    }

    addMessage(question, true);
    questionInput.value = '';
    askButton.disabled = true;

    // Add a temporary loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message');
    loadingDiv.innerHTML = '<div class="loading-indicator"></div> Thinking...';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      // Remove the loading message
      chatMessages.removeChild(loadingDiv);

      if (data.success) {
        addMessage(data.answer, false);
      } else {
        addMessage(`Error: ${data.error}`, false);
      }
    } catch (error) {
      // Remove the loading message
      chatMessages.removeChild(loadingDiv);
      addMessage(`Error: ${error.message}`, false);
    } finally {
      askButton.disabled = false;
    }
  });

  // Event listener for Enter key in question input
  questionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !askButton.disabled) {
      askButton.click();
    }
  });

  // Initial message
  addMessage('Welcome to the Visafy Immigration Assistant! Enter a website URL above and click "Train" to get started, or ask me a question about immigration programs and requirements.', false);
});
