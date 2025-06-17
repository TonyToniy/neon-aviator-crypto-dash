
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const DATA_DIR = '/var/www/site97/data';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Helper functions for file operations
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeJsonFile(filename, data) {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const users = await readJsonFile('users.json');
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            balance: 1000, // Starting balance
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        await writeJsonFile('users.json', users);

        // Generate token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const users = await readJsonFile('users.json');
        const user = users.find(u => u.email === email);

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// User routes
app.get('/api/users/:id/balance', authenticateToken, async (req, res) => {
    try {
        const users = await readJsonFile('users.json');
        const user = users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ balance: user.balance });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/users/:id/balance', authenticateToken, async (req, res) => {
    try {
        const { balance } = req.body;
        const users = await readJsonFile('users.json');
        const userIndex = users.findIndex(u => u.id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        users[userIndex].balance = balance;
        await writeJsonFile('users.json', users);

        res.json({ message: 'Balance updated successfully' });
    } catch (error) {
        console.error('Update balance error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Game history routes
app.get('/api/users/:id/games', authenticateToken, async (req, res) => {
    try {
        const games = await readJsonFile('games.json');
        const userGames = games.filter(g => g.user_id === req.params.id);
        res.json(userGames);
    } catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/users/:id/games', authenticateToken, async (req, res) => {
    try {
        const gameData = req.body;
        const games = await readJsonFile('games.json');
        
        const newGame = {
            id: Date.now().toString(),
            user_id: req.params.id,
            ...gameData,
            created_at: new Date().toISOString()
        };

        games.push(newGame);
        await writeJsonFile('games.json', games);

        res.json({ message: 'Game saved successfully' });
    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Deposit routes
app.get('/api/users/:id/deposits', authenticateToken, async (req, res) => {
    try {
        const deposits = await readJsonFile('deposits.json');
        const userDeposits = deposits.filter(d => d.user_id === req.params.id);
        res.json(userDeposits);
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/users/:id/deposits', authenticateToken, async (req, res) => {
    try {
        const depositData = req.body;
        const deposits = await readJsonFile('deposits.json');
        
        const newDeposit = {
            id: Date.now().toString(),
            user_id: req.params.id,
            ...depositData,
            confirmations: 0,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        deposits.push(newDeposit);
        await writeJsonFile('deposits.json', deposits);

        res.json(newDeposit);
    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
ensureDataDir().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on port ${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/`);
    });
}).catch(console.error);
