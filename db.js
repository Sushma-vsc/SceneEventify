// db.js - This file handles the connection to the MySQL database and provides functions to interact with the database.

// Import the mysql2 module to connect to MySQL database
const mysql = require('mysql2');

// Create a connection pool to manage multiple connections efficiently
const pool = mysql.createPool({
  host: 'localhost',      // Database server address (localhost if running locally)
  user: 'root',           // Your MySQL username
  password: 'your_password', // Your MySQL password - replace with your actual password
  database: 'userdb'      // The database name where user data will be stored
});

// Function to execute a query with parameters and return a Promise
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      connection.query(sql, params, (error, results) => {
        connection.release(); // Release connection back to pool
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });
  });
}

// Export the query function for use in other files
module.exports = {
  query
};

/*
How this works:
- We use mysql module to connect to a MySQL database.
- A connection pool is created to efficiently manage multiple database connections.
- The query function wraps the pool.query method in a Promise for async/await usage.
- Other files can import this module and use the query function to interact with the database.

How frontend connects to backend and backend connects to SQL:
- Frontend (HTML/CSS/JS) sends HTTP requests (e.g., POST /signup) to the backend server.
- Backend server receives requests, processes data, and uses this db.js module to run SQL queries.
- The backend then sends responses back to the frontend based on database operations.
*/
