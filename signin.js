const form = document.getElementById('form');
const email_input = document.getElementById('email-input')
const firstname_input = document.getElementById('firstname-input')
const lastname_input = document.getElementById('lastname-input')
const age = document.getElementById('age')
const gender = document.getElementById('gender')
const state = document.getElementById('state')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let errors = []
  
  if(firstname_input) {
    // if we get first name input then we are in signup
    errors = getSignupFormErrors(
      firstname_input.value,
      lastname_input.value, 
      email_input.value,
      age.value,
      gender.value,
      state.value, 
      password_input.value, 
      repeat_password_input.value
    )
    
    if(errors.length === 0) {
      // Send signup data to backend
      const userData = {
        firstname: firstname_input.value,
        lastname: lastname_input.value,
        email: email_input.value,
        age: age.value,
        gender: gender.value,
        state: state.value,
        password: password_input.value
      };
      try {
        console.log('Sending signup data to backend:', userData);
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        const result = await response.json();
        console.log('Received response from backend:', result);
        if(response.ok) {
          // Signup successful, redirect to home.html
          window.location.href = 'home.html';
        } else {
          // Show error message from backend
          error_message.innerText = result.error || 'Signup failed';
        }
      } catch (error) {
        console.error('Error connecting to server:', error);
        error_message.innerText = 'Error connecting to server';
      }
      return false; // Prevent default form submission
    }
  } else {
    // if we dont get first name input then we are in login
    errors = getLoginFormErrors(email_input.value, password_input.value)
    
    if(errors.length === 0) {
      // For login, just redirect to home.html
      window.location.href = 'home.html';
    }
  }
  
  if(errors.length > 0){
    error_message.innerText = errors.join(". ")
  }
})

function getSignupFormErrors(firstname, lastname, email, age, gender, state, password, repeatpassword) {
    let errors=[]

    // Validate first name
    if(firstname===''|| firstname == null){
        errors.push('First name is required')
        firstname_input.parentElement.classList.add('incorrect')
    }

    // Validate last name
    if(lastname ===''|| lastname == null){
        errors.push('Last name is required')
        lastname_input.parentElement.classList.add('incorrect')
    }

    // Validate email
    if(email===''|| email == null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    } else if(!email.includes('@') || !email.includes('.')) {
        errors.push('Please enter a valid email address')
        email_input.parentElement.classList.add('incorrect')
    }

    // Validate age
    if(age ===''|| age == null){
        errors.push('Age is required')
        age.parentElement.classList.add('incorrect')
    } else if(age < 13) {
        errors.push('You must be at least 13 years old')
        age.parentElement.classList.add('incorrect')
    }

    // Validate state
    if(state ===''|| state == null || state === '-- Select --'){
        errors.push('State is required')
        state.parentElement.classList.add('incorrect')
    }

    // Validate password
    if(password ===''|| password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    } else if(password.length < 8){
        errors.push('Password must be at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    } else if(!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
        password_input.parentElement.classList.add('incorrect')
    } else if(!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
        password_input.parentElement.classList.add('incorrect')
    }

    // Validate password match
    if(password !== repeatpassword){
        errors.push('Passwords do not match')
        password_input.parentElement.classList.add('incorrect')
        repeat_password_input.parentElement.classList.add('incorrect')
    }


return errors;
}
function getLoginFormErrors(email,password){
    let errors=[]

    if(email===''|| email == null){
        errors.push('email is required')
    email_input.parentElement.classList.add('incorrect')
    }
    if(email.indexOf('@') === -1){
        errors.push('email is not valid')
    }
    if(password ===''|| password == null){
        errors.push('password is required')
    password_input.parentElement.classList.add('incorrect')
    }
    if(password.length < 8){
        errors.push('password must be at least 8 characters')
    password_input.parentElement.classList.add('incorrect')
    }
    return errors;


}
const allInputs = [
  email_input,
  firstname_input, 
  lastname_input,
  age,
  gender,
  state,
  password_input,
  repeat_password_input
].filter(input => input != null);

allInputs.forEach((input) => {
  input.addEventListener('input', () => {
    if(input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      error_message.innerText = '';
    }
  });
});
