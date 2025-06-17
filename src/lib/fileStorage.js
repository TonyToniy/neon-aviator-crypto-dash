
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.gamesFile = path.join(this.dataDir, 'games.json');
    this.depositsFile = path.join(this.dataDir, 'deposits.json');
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      await this.ensureFileExists(this.usersFile, []);
      await this.ensureFileExists(this.gamesFile, []);
      await this.ensureFileExists(this.depositsFile, []);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  async ensureFileExists(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }

  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      throw error;
    }
  }

  // User methods
  async createUser(email, hashedPassword) {
    const users = await this.readFile(this.usersFile);
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      balance: 1000, // Starting balance
      created_at: new Date().toISOString()
    };

    users.push(user);
    await this.writeFile(this.usersFile, users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email) {
    const users = await this.readFile(this.usersFile);
    return users.find(u => u.email === email);
  }

  async getUserById(id) {
    const users = await this.readFile(this.usersFile);
    const user = users.find(u => u.id === id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async updateUserBalance(userId, newBalance) {
    const users = await this.readFile(this.usersFile);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].balance = newBalance;
    await this.writeFile(this.usersFile, users);
    
    return users[userIndex].balance;
  }

  // Game history methods
  async saveGameHistory(userId, gameData) {
    const games = await this.readFile(this.gamesFile);
    
    const gameRecord = {
      id: crypto.randomUUID(),
      user_id: userId,
      ...gameData,
      created_at: new Date().toISOString()
    };

    games.push(gameRecord);
    await this.writeFile(this.gamesFile, games);
    
    return gameRecord;
  }

  async getGameHistory(userId) {
    const games = await this.readFile(this.gamesFile);
    return games.filter(g => g.user_id === userId).slice(-50); // Last 50 games
  }

  // Deposit methods
  async createDeposit(userId, depositData) {
    const deposits = await this.readFile(this.depositsFile);
    
    const deposit = {
      id: crypto.randomUUID(),
      user_id: userId,
      ...depositData,
      status: 'pending',
      confirmations: 0,
      created_at: new Date().toISOString()
    };

    deposits.push(deposit);
    await this.writeFile(this.depositsFile, deposits);
    
    return deposit;
  }

  async getDeposits(userId) {
    const deposits = await this.readFile(this.depositsFile);
    return deposits.filter(d => d.user_id === userId);
  }

  async updateDepositStatus(txHash, status, confirmations) {
    const deposits = await this.readFile(this.depositsFile);
    const depositIndex = deposits.findIndex(d => d.tx_hash === txHash);
    
    if (depositIndex === -1) {
      throw new Error('Deposit not found');
    }

    deposits[depositIndex].status = status;
    deposits[depositIndex].confirmations = confirmations;
    deposits[depositIndex].confirmed_at = new Date().toISOString();
    
    await this.writeFile(this.depositsFile, deposits);
    
    return deposits[depositIndex];
  }
}

module.exports = new FileStorage();
