const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const app = express();

const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from file if exists
let users = {};
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to save users
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ✅ REGISTER endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (users[username]) {
    return res.status(400).json({ message: 'User already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };
  saveUsers();

  res.json({ message: 'Registration successful!' });
});

// ✅ LOGIN endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }

  // ✅ Just send JSON response
  res.json({ message: 'Login successful!' });
});

// ✅ Serve frontend (login page by default)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'log.html'));
});

// ✅ Start server
const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
