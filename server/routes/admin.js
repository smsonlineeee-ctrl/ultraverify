const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user balance (add/subtract) - typically for admin use only
router.post('/users/:id/balance', async (req, res) => {
  try {
    const { amount, action } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const val = parseFloat(amount);
    if (isNaN(val)) return res.status(400).json({ msg: 'Invalid amount' });

    if (action === 'add') {
      user.balance += val;
      const tId = 'TXN_' + Date.now();
      user.transactions = user.transactions || [];
      user.transactions.push({
          id: tId, amount: val, type: 'Funding', action: 'credit', status: 'Completed', date: new Date().toISOString(), method: 'Manual Admin Funding'
      });
      user.markModified('transactions');
    } else if (action === 'subtract') {
      user.balance = Math.max(0, user.balance - val);
      const tId = 'TXN_' + Date.now();
      user.transactions = user.transactions || [];
      user.transactions.push({
          id: tId, amount: val, type: 'Debit', action: 'debit', status: 'Completed', date: new Date().toISOString(), method: 'Manual Admin Debit'  
      });
      user.markModified('transactions');
    } else {
      return res.status(400).json({ msg: 'Invalid action' });
    }

    await user.save();
    res.json({ msg: 'Balance updated', balance: user.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Admin Dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const users = await User.find().sort({ joinedAt: -1 });
    const totalUsers = users.length;
    let totalTransaction = 0;
    let successfulOrders = 0;
    let failedOrders = 0;
    let actualRevenue = 0;

    users.forEach(u => {
        if (u.orders) {
            u.orders.forEach(o => {
                if (o.code) {
                    successfulOrders++;
                    actualRevenue += Number(o.price) || 0;
                } else if (o.status === 'Cancelled' || o.status === 'cancel') {
                    failedOrders++;
                }
            });
        }
        if (u.transactions) {
            totalTransaction += u.transactions.length;
        }
    });

    const recentUsers = users.slice(0, 5); // 5 newest
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const newToday = users.filter(u => new Date(u.joinedAt) > startOfDay).length;

    res.json({
      totalUsers,
      activeNumbers: 0,
      revenue: actualRevenue,
      newToday,
      totalTransaction,
      successfulOrders,
      failedOrders,
      recentUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const users = await User.find({ "transactions.0": { $exists: true } }).select('email displayName transactions');
    let allTransactions = [];
    users.forEach(u => {
      if (u.transactions) {
        u.transactions.forEach(tx => {
           allTransactions.push({
             ...tx,
             userEmail: u.email,
             userName: u.displayName
           });
        });
      }
    });

    // Sort descending by date
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allTransactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/orders', async (req, res) => {
  try {
    const users = await User.find({ "orders.0": { $exists: true } }).select('email displayName orders');
    let allOrders = [];
    users.forEach(u => {
      if (u.orders) {
        u.orders.forEach(o => {
           allOrders.push({
             ...o,
             userEmail: u.email,
             userName: u.displayName
           });
        });
      }
    });

    // Sort descending by date
    allOrders.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    res.json(allOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Suspend/Activate User
router.post('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.status = user.status === 'Suspended' ? 'Active' : 'Suspended';
    if (!user.status) user.status = 'Suspended'; // fallback if undefined
    await user.save();

    res.json({ msg: 'Status updated', status: user.status });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


const Settings = require('../models/Settings');

// Get Settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Settings
router.post('/settings', async (req, res) => {
  try {
    const { activeProvider, exchangeRate, topUpPercentage } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }
    
    if (activeProvider) settings.activeProvider = activeProvider;
    if (exchangeRate !== undefined) settings.exchangeRate = Number(exchangeRate);
    if (topUpPercentage !== undefined) settings.topUpPercentage = Number(topUpPercentage);

    await settings.save();
    res.json({ msg: 'Settings updated', settings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
