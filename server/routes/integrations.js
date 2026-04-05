const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
const Settings = require('../models/Settings');

// DAISY API KEY
const DAISY_API_KEY = 'DA_ukTKQvkNPqdmBZ0SYREIuJ6MT5yAOraDlJF37nEb';
const DAISY_BASE_URL = 'https://daisysim.com/api/v1/virtual';

// POCKETFI.NG KEYS
const POCKETFI_API_KEY = '22952|3vrbP75xZ2SGJNL4OJwMsTUNhm5CeiR3a51cgSQh8cb09726';
const POCKETFI_SECRET_KEY = '24b0161ced02c8e115ac71b4c2860c84c3bc6491f353b3c8c8877a219a3151c5';
const POCKETFI_BUSINESS_ID = '29836'; // <--- Using your actual PocketFi merchant business ID

// ---------------------------
// DAISY SIM ROUTES
// ---------------------------

// 1. Get Countries
router.get('/daisy/countries', async (req, res) => {
  try {
    const response = await axios.get(`${DAISY_BASE_URL}/countries`, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || 'Failed to fetch countries' });
  }
});

// 2. Get Services
router.get('/daisy/services/:country_id', async (req, res) => {
  try {
    const response = await axios.get(`${DAISY_BASE_URL}/services/${req.params.country_id}`, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || 'Failed to fetch services' });
  }
});

// 3. Get Prices
router.post('/daisy/prices', async (req, res) => {
  try {
    const response = await axios.post(`${DAISY_BASE_URL}/prices`, req.body, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || 'Failed to fetch prices' });
  }
});

// 4. Purchase Number
router.post('/daisy/purchase', async (req, res) => {
  const { userId, country, service, service_name, price } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if user has enough balance
    if (user.balance < Number(price)) {
        return res.status(400).json({ error: 'Insufficient Balance. Please top up your wallet.' });
    }

    const response = await axios.post(`${DAISY_BASE_URL}/purchase`, { country, service, service_name, price }, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    
    // Decrease user balance if success
    if (response.data && response.data.success) {
      user.balance -= Number(price);
      await user.save();
    }
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || 'Failed to purchase number' });
  }
});

// 5. Poll check status
router.get('/daisy/check/:activation_id', async (req, res) => {
  try {
    const response = await axios.get(`${DAISY_BASE_URL}/check/${req.params.activation_id}`, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || 'Failed to poll status' });
  }
});

// ---------------------------
// POCKETFI.NG PAYMENT ROUTES (Virtual Accounts)
// ---------------------------

// 1. Create a Virtual Account for the Customer
router.post('/pocketfi/virtual-account', async (req, res) => {
    const { userId } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const displayNameParts = (user.displayName || 'User').split(' ');

        // Using standard integration params format required by pocketfi
        const payload = {
            first_name: displayNameParts[0],
            last_name: displayNameParts[1] || 'User',
            phone: user.phone || '00000000000',
            email: user.email,
            businessId: POCKETFI_BUSINESS_ID, // <--- Using your actual PocketFi merchant business ID
            bank: "kuda" // Can be 'kuda', 'paga', '9psb', 'palmpay'
        };

        const response = await axios.post('https://api.pocketfi.ng/api/v1/virtual-accounts/create', payload, {
            headers: { 
                Authorization: `Bearer ${POCKETFI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        
        let accNum = null;
        let bnkName = null;
        
        // Parse PocketFi array response: 'banks[0]'
        if (response.data?.status === true && response.data?.banks && response.data.banks.length > 0) {
            accNum = response.data.banks[0].accountNumber; 
            bnkName = response.data.banks[0].bankName;
        }

        // Save the virtual bank account details to the user model so they can view it anytime
        if (accNum) {
            user.virtual_account_number = accNum;
            user.virtual_account_bank = bnkName;
            await user.save();
            res.json({ account_number: accNum, bank_name: bnkName });
        } else {
            res.status(400).json({ error: 'Could not extract account details', data: response.data });
        }
    } catch (err) {
        res.status(500).json({ error: err.response?.data || 'Failed to create virtual account' });
    }
});

// 3. Webhook for Instant Funding 

// Added a GET route just so you can check it in your browser comfortably!
router.get('/pocketfi/webhook', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 2rem; text-align: center; color: #333;">
        <h2 style="color: #2e7d32;">✅ Webhook Endpoint is Live</h2>
        <p>This URL is correctly set up on the Render server.</p>
        <p style="color: #666; font-size: 0.9em;">(It is currently waiting for <b>POST</b> requests from PocketFi in the background)</p>
      </body>
    </html>
  `);
});

router.post('/pocketfi/webhook', async (req, res) => {
    // Pocketfi sends event triggers here whenever a transfer is made to a user's Virtual Account
    const event = req.body;
    
    // Note: Always verify the signature hash in headers in production for security
    // const signature = req.headers['x-pocketfi-signature'];

    try {
        if (event && event.event === 'charge.success' && event.data) {
            const { amount, customer } = event.data;
            const customerCode = customer.customer_code;

            if (customerCode) {
                // Find your user based on the pocketfi customer code
                const user = await User.findOne({ pocketfi_customer_code: customerCode });
                
                if (user) {
                    // Credit user's wallet (ensure you handle currency units correctly, e.g., if amount is in kobo, divide by 100)
                    user.balance += (Number(amount)); 
                    await user.save();
                    console.log(`Successfully credited ${amount} to user ${user.email}`);
                }
            }
        }
        // Respond with 200 OK fast so PocketFi knows you received it
        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook processing failed:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Basic BVN Enquiry
router.post('/pocketfi/verification/basic', async (req, res) => {
    try {
        const payload = {
            ...req.body,
            type: "basic",
            verify_type: "bvn",
        };
        const response = await axios.post('https://api.pocketfi.ng/api/v1/verification', payload, {
            headers: { 
                Authorization: `Bearer ${POCKETFI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || 'PocketFi basic verification failed' });
    }
});

// Enhanced BVN Enquiry
router.post('/pocketfi/verification/enhanced', async (req, res) => {
    try {
        const payload = {
            ...req.body,
            type: "enhanced",
            verify_type: "bvn",
        };
        const response = await axios.post('https://api.pocketfi.ng/api/v1/verification', payload, {
            headers: { 
                Authorization: `Bearer ${POCKETFI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || 'PocketFi enhanced verification failed' });
    }
});

// BVN Verification (Match details)
router.post('/pocketfi/verification/bvn', async (req, res) => {
    try {
        const response = await axios.post('https://api.pocketfi.ng/api/v1/verification/bvn', req.body, {
            headers: { 
                Authorization: `Bearer ${POCKETFI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || 'PocketFi BVN match verification failed' });
    }
});

module.exports = router;
