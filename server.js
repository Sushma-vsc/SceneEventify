// server.js - This file sets up the Express backend server to handle user signup and login requests.

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For hashing passwords securely
const cors = require('cors'); // To allow cross-origin requests from frontend
const nodemailer = require('nodemailer'); // For sending emails on signup
const session = require('express-session'); // For session management
const db = require('./db'); // Import the database module for SQL queries

const app = express();
const port = 3000; // Port where the server will listen

// Middleware setup
const corsOptions = {
  origin: ['http://localhost:5501', 'http://127.0.0.1:5501'], // Allow requests from both localhost and 127.0.0.1 on port 5501
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions)); // Enable CORS with specific origin and credentials
app.use(bodyParser.json()); // Parse JSON request bodies

// Session middleware
app.use(session({
  secret: 'sceneevntify_secret_key', // Use a strong secret in production and store securely
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// The database connection is managed in db.js file, which connects to the MySQL database 'userdb'.
// This connection is used here via the imported 'db' module to execute SQL queries.

// Nodemailer transporter setup for sending emails on account creation
// Replace the auth user and pass with your actual Gmail credentials or use environment variables for security
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com', // Your Gmail address
    pass: 'yourgmailpassword'    // Your Gmail password or app password
  }
});

// Route: POST /signup
// This route handles user registration by receiving user details,
// hashing the password, storing the data in the SQL database,
// and sending a confirmation email to the user's Gmail address.
app.post('/signup', async (req, res) => {
  const { email, password, firstname, lastname, age, gender, state } = req.body;

  console.log('Signup request received with data:', req.body); // Log incoming data

  // Validate required fields
  if (!email || !password || !firstname || !lastname || !age || !gender || !state) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the database using the db.query function from db.js
    const sql = 'INSERT INTO users (email, password, firstname, lastname, age, gender, state) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [email, hashedPassword, firstname, lastname, age, gender, state]);

    // Send confirmation email to the user
    const mailOptions = {
      from: 'yourgmail@gmail.com',
      to: email,
      subject: 'Account Created - SCENE EVENTIFY',
      text: `Hello ${firstname},\n\nYour account has been successfully created on SCENE EVENTIFY.\n\nThank you for joining us!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        // We do not fail the signup if email sending fails, just log the error
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle duplicate email error (unique constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already registered' });
    } else {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Route: POST /login
// This route handles user login by verifying the email and password
// against the stored credentials in the database.
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Query user by email using db.query from db.js
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await db.query(sql, [email]);

    if (results.length === 0) {
      // No user found with this email
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare provided password with hashed password in database
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Passwords match - login successful
      // Create session
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.firstname = user.firstname;
      req.session.lastname = user.lastname;
      res.json({ message: 'Login successful' });
    } else {
      // Passwords do not match
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: GET /account
// Returns user profile info and purchase history (dummy data for now)
app.get('/account', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch user info from database
    const sqlUser = 'SELECT id, email, firstname, lastname, age, gender, state FROM users WHERE id = ?';
    const users = await db.query(sqlUser, [req.session.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];

    // Fetch purchase history - for demo, return dummy data
    const purchaseHistory = [
      {
        event: 'Sample Event 1',
        date: '2024-12-01',
        location: 'Venue A',
        ticketType: 'VIP',
        quantity: 2,
        totalPrice: 3000
      },
      {
        event: 'Sample Event 2',
        date: '2024-11-15',
        location: 'Venue B',
        ticketType: 'General Admission',
        quantity: 1,
        totalPrice: 500
      }
    ];

    res.json({ user, purchaseHistory });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: POST /logout
// Destroys the user session and logs out
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

/*
How frontend connects to backend and backend connects to SQL:
- Frontend HTML/JS sends HTTP POST requests to /signup and /login endpoints with user data.
- Backend receives these requests, processes data, hashes passwords, and uses db.js to run SQL queries.
- The db.js file manages the connection to the MySQL database 'userdb' and executes SQL queries.
- Backend sends JSON responses indicating success or failure.
- Frontend handles these responses to update UI or redirect users accordingly.

Use of SQL Developer Extension in VSCode:
- SQL Developer extension is a powerful tool integrated into VSCode that allows developers to visually manage and interact with SQL databases.
- It is used during development to create, modify, and query the 'userdb' MySQL database.
- This extension helps in managing database schemas, running SQL queries, and inspecting data without leaving the VSCode environment.
- Although it is not directly used in the code, it facilitates efficient database management and debugging.
- The backend code connects to the MySQL database configured in db.js, which is the same database managed via SQL Developer extension.
- This setup ensures seamless integration between development tools and backend code for database operations.
*/
