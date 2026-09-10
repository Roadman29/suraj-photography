const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 8123;
const rootDir = __dirname;
const portfolioDir = path.join(rootDir, '..');
const dbPath = path.join(rootDir, 'f1_tracker.sqlite');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/f1-card-tracker', express.static(rootDir));
app.get('/f1-card-tracker', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(portfolioDir, 'index.html'));
});

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Failed to open SQLite database:', error.message);
    process.exit(1);
  }
  console.log('SQLite database ready at', dbPath);
});

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

async function initDatabase() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      card_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, title),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  const session = await getSql('SELECT * FROM sessions WHERE token = ?', [token]);

  if (!session) {
    return null;
  }

  return getSql('SELECT id, name, email FROM users WHERE id = ?', [session.user_id]);
}

async function setUserSession(userId) {
  const token = createToken();
  await runSql('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [userId, token]);
  return token;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await getSql('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser) {
      return res.status(409).json({ error: 'An account already exists for that email.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const userResult = await runSql('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [String(name).trim(), normalizedEmail, passwordHash]);
    const token = await setUserSession(userResult.id);

    res.status(201).json({
      token,
      user: {
        id: userResult.id,
        name: String(name).trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Unable to register this user right now.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await getSql('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = await setUserSession(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Unable to log in right now.' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ownedRows = await allSql('SELECT title, card_json FROM collections WHERE user_id = ?', [user.id]);
    const cards = ownedRows.map((row) => JSON.parse(row.card_json));

    res.json({
      user,
      cards,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Unable to load profile.' });
  }
});

app.get('/api/collection', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rows = await allSql('SELECT title, card_json FROM collections WHERE user_id = ?', [user.id]);
    const cards = rows.map((row) => JSON.parse(row.card_json));

    res.json({ cards });
  } catch (error) {
    console.error('Collection fetch error:', error);
    res.status(500).json({ error: 'Unable to load your collection.' });
  }
});

app.post('/api/collection', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cards = Array.isArray(req.body?.cards) ? req.body.cards : [];
    await runSql('DELETE FROM collections WHERE user_id = ?', [user.id]);

    for (const card of cards) {
      if (!card || !card.title) {
        continue;
      }
      await runSql('INSERT INTO collections (user_id, title, card_json) VALUES (?, ?, ?)', [user.id, String(card.title), JSON.stringify(card)]);
    }

    res.json({
      success: true,
      cards,
      total: cards.length,
    });
  } catch (error) {
    console.error('Collection save error:', error);
    res.status(500).json({ error: 'Unable to save your collection.' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  if (req.path.startsWith('/f1-card-tracker')) {
    const relativePath = req.path.replace(/^\/f1-card-tracker/, '') || '/index.html';
    const requestedFile = path.join(rootDir, relativePath);
    const safeFile = path.resolve(rootDir, relativePath.replace(/^\//, ''));

    if (safeFile.startsWith(rootDir) && safeFile !== rootDir) {
      return res.sendFile(safeFile);
    }

    return res.sendFile(path.join(rootDir, 'index.html'));
  }

  const requestedFile = path.join(rootDir, req.path);
  const hasFile = requestedFile.startsWith(rootDir) && requestedFile !== rootDir;

  if (hasFile && !requestedFile.endsWith('/')) {
    return res.sendFile(requestedFile);
  }

  return res.sendFile(path.join(rootDir, 'index.html'));
});

async function startServer() {
  await initDatabase();
  app.listen(port, () => {
    console.log(`F1 Card Tracker API running at http://127.0.0.1:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
