// login.js - Handles login form submission and communicates with backend server

const form = document.getElementById('form');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  let errors = [];
  if (!email_input.value) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (!password_input.value) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }
  if (errors.length > 0) {
    error_message.innerText = errors.join('. ');
    return;
  }

  // Send login data to backend
  const loginData = {
    email: email_input.value,
    password: password_input.value
  };

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    const result = await response.json();
    if (response.ok) {
      // Login successful, redirect to home.html
      window.location.href = 'home.html';
    } else {
      // Show error message from backend
      error_message.innerText = result.error || 'Login failed';
    }
  } catch (error) {
    error_message.innerText = 'Error connecting to server';
  }
});

// Remove error styling on input
[email_input, password_input].forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      error_message.innerText = '';
    }
  });
});

/*
How this works:
- The login form submission is intercepted.
- Basic client-side validation is performed.
- Login credentials are sent to backend /login endpoint via fetch POST.
- Backend response is handled to redirect or show error messages.
*/
