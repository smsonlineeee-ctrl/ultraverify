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
  const { userId, country, countryName, service, price } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if user has enough balance
    if (user.balance < Number(price)) {
        return res.status(400).json({ error: 'Insufficient Balance. Please top up your wallet.' });
    }

    // Ensure country is parsed as integer for Daisy API
    const countryIdInt = parseInt(country, 10);
    if (isNaN(countryIdInt)) {
        return res.status(400).json({ error: 'Invalid country ID provided. Please refresh and try placing the order again.' });
    }

    // Fetch the correct USD price and max price from Daisy directly so we satisfy their required field safely
    let daisyPrice = null;
    const priceRes = await axios.post(`${DAISY_BASE_URL}/prices`, { country: countryIdInt, service }, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    if (priceRes.data?.data?.tiers?.[0]) {
        daisyPrice = parseFloat(priceRes.data.data.tiers[0].price);
    } else {
        return res.status(400).json({ error: 'This service is currently unavailable or out of stock.' });
    }

    // Call Daisy API to purchase with the official USD price as constraint
    const response = await axios.post(`${DAISY_BASE_URL}/purchase`, { country: countryIdInt, service, price: daisyPrice }, {
      headers: { Authorization: `Bearer ${DAISY_API_KEY}` }
    });
    
    // Decrease user balance if success
    const purchaseData = response.data.data || response.data;
    const phoneNum = purchaseData.phone || purchaseData.phone_number || purchaseData.number;
    const orderId = purchaseData.id || purchaseData.activation_id || purchaseData.order_id;
    
    // In case daisy returns a success boolean or message, allow logging even if phone is nested
    if (response.data.success || phoneNum) {
      user.balance -= Number(price);
      
      // Store order history natively here too!
      user.orders = user.orders || [];
      user.orders.push({
          id: orderId || 'ORD_' + Date.now(),
          service: service,
          country: countryName || String(country), // Store the display name
          phone: phoneNum || 'Pending',
          price: Number(price),
          date: new Date().toISOString(),
          status: 'Waiting',
            provider: 'daisysim',
            code: null
      });
      user.markModified('orders');

      await user.save();
    }
    
    // We send back properties so the frontend sees 'phone' and 'id' easily
    res.json({
      success: response.data.success,
      message: response.data.message,
      phone: phoneNum,
      id: orderId,
      ...purchaseData
    });
  } catch (err) {
    console.error("Daisy API Purchase Error: ", err.response?.data || err.message);
    
    // Intercept specific provider errors so users aren't confused by OUR API wallet balance versus THEIR local wallet balance
    if (err.response?.data?.code === 'INSUFFICIENT_BALANCE' || err.response?.data?.error === 'Insufficient wallet balance.') {
        return res.status(500).json({ error: 'System out of stock or provider limits reached. Please contact the administrator.' });
    }

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

// 6. Webhook
router.all('/daisy/webhook', async (req, res) => {
  try {
    const rawPayload = req.method === 'GET' ? req.query : req.body;
    // Some providers wrap everything in a 'data' object
    const payload = rawPayload?.data || rawPayload;
    
    console.log('[DAISY WEBHOOK] Payload received:', rawPayload);

    // Extract relevant data, as DaisySim may send different keys based on API version
    const activationId = payload.id || payload.activation_id || payload.order_id || payload.orderId;
    const smsText = payload.text || payload.sms || payload.code || payload.message;
    const status = payload.status || 'Completed';

    if (!activationId || !smsText) {
      // Must respond 200 to acknowledge receipt even if parsing fails
      return res.status(200).send('OK'); 
    }

    // Find the user with this specific order id
    const user = await User.findOne({ 'orders.id': activationId });
    if (!user) {
      console.log('[DAISY WEBHOOK] User not found for order ID:', activationId);
      return res.status(200).send('OK');
    }

    // Update the exact order in the user's orders array
    let updated = false;
    for (let i = 0; i < user.orders.length; i++) {
        // loose equality to handle integer/string mismatches
        if (user.orders[i].id == activationId) {
            user.orders[i].code = smsText;
            user.orders[i].status = status;
            updated = true;
            break;
        }
    }

    if (updated) {
        user.markModified('orders');
        await user.save();
        console.log(`[DAISY WEBHOOK] Order ${activationId} successfully updated with code.`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[DAISY WEBHOOK] Error:', err.message);
    res.status(500).send('Webhook server error');
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
      console.log("=== POCKETFI WEBHOOK RECEIVED ===");
      console.log(JSON.stringify(req.body, null, 2));
      
      const event = req.body;

      // Using raw payload string if possible, or stringify req.body
      const payloadString = JSON.stringify(req.body);
      const pocketfiSignature = req.headers['pocketfi-signature'] || req.headers['http_pocketfi_signature'];

      // You can enable signature verification in production:
      // const crypto = require('crypto');
      // const hashkey = crypto.createHmac('sha512', POCKETFI_SECRET_KEY).update(payloadString).digest('hex');
      // if (pocketfiSignature && pocketfiSignature !== hashkey) {
      //     return res.status(400).json({ message: "Permission denied, invalid hash" });
      // }

      try {
          let amount, reference, description;
          let customerEmail, accountNumber, customerCode;

          // PocketFi Format (from documentation)
          if (event.order && event.transaction) {
              amount = event.order.amount || event.order.settlement_amount;
              reference = event.transaction.reference;
              description = event.order.description || '';
              
              // Extract identifiers from the description if they exist
              if (description) {
                  accountNumber = description.match(/\b\d{10}\b/)?.[0]; // NUBAN
                  customerEmail = description.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]; // Email
              }
          }
          // Legacy/Fallback matching (e.g. Paystack-like payload)
          else if (event.event === 'charge.success' || event.event === 'transfer.success') {
              amount = event.data?.amount;
              reference = event.data?.reference;
              customerCode = event.data?.customer?.customer_code;
              customerEmail = event.data?.customer?.email;
              accountNumber = event.data?.authorization?.receiver_bank_account_number || event.data?.account_number;
          }

          if (!amount || !reference) {
               console.log("Webhook ignored: Payload does not contain amount or reference.");
               return res.status(200).send('Ignored: Not a valid transaction event');
          }

          // Search for the user that owns this transaction
          let user = null;
          if (customerCode) user = await User.findOne({ pocketfi_customer_code: customerCode });
          if (!user && customerEmail) user = await User.findOne({ email: customerEmail });
          if (!user && accountNumber) user = await User.findOne({ virtual_account_number: accountNumber });

          if (user) {
              // Credit user's wallet
              const creditAmount = Number(amount); 
                  user.balance = (user.balance || 0) + creditAmount;
                  
                  // Also save their customerCode if we found them by email but didn't have code
                  if (!user.pocketfi_customer_code && customerCode) {
                      user.pocketfi_customer_code = customerCode;
                  }

                  // Add transaction record
                  const transactionRecord = {
                      id: 'TXN_' + Date.now() + Math.floor(Math.random() * 1000),
                      amount: creditAmount,
                      type: 'Funding',
                      status: 'Completed',
                      date: new Date().toISOString(),
                      method: 'PocketFi Virtual Account',
                      reference: reference || ''
                  };
                  user.transactions = user.transactions || [];
                  user.transactions.push(transactionRecord);

                  // Mark array as modified so mongoose saves it if it's mixed type Array
                  user.markModified('transactions');
                  await user.save();

                  console.log(`Successfully credited NGN ${creditAmount} to user ${user.email}`);
              } else {
                  console.log(`Webhook ignored: Could not find user with email ${customerEmail} or account ${accountNumber} or code ${customerCode}`);
              }
          
          res.status(200).send('Webhook received successfully');
          
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

router.post('/daisy/webhook', async (req, res) => { const { event, activation_id, code } = req.body; if (event !== 'code.received') return res.json({ok: true}); try { const user = await User.findOne({ 'orders.id': activation_id }); if (user) { const order = user.orders.find(o => o.id === activation_id); if (order) { order.code = code; order.status = 'Completed'; user.markModified('orders'); await user.save(); } } res.json({ok: true}); } catch(e) { res.status(500).json({error: e.message}); } });

module.exports = router;

module.exports = router;
