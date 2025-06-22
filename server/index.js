require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize provider for Base network
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
let serviceAccountCreds;

try {
  // Try to load service account credentials
  serviceAccountCreds = require('./service-account.json');
} catch (error) {
  console.warn('Service account credentials not found. Google Sheets API will not work.');
  serviceAccountCreds = null;
}

// Function to initialize JWT client for Google Sheets
const getJwtClient = () => {
  if (!serviceAccountCreds) {
    throw new Error('Google service account credentials not found');
  }
  
  return new JWT({
    email: serviceAccountCreds.client_email,
    key: serviceAccountCreds.private_key,
    scopes: SCOPES
  });
};

// Function to fetch data from Google Sheets
async function fetchSheetData(spreadsheetId, sheetIndex = 0) {
  try {
    const jwt = getJwtClient();
    const doc = new GoogleSpreadsheet(spreadsheetId, jwt);
    
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[sheetIndex];
    await sheet.loadHeaderRow();
    
    const rows = await sheet.getRows();

    console.log("Rows fetched from Google Sheets:", rows);
    
    return rows.map(row => {
      console.log("Row raw data:", row._rawData);
      console.log("Headers:", sheet.headerValues);
      
      const rowData = {};
      
      // Map headers to values using the row.get() method
      sheet.headerValues.forEach((header, index) => {
        // Use the get method to access cell values by header name
        rowData[header] = row.get(header);
        
        // If that doesn't work, try accessing by index from _rawData
        if (rowData[header] === undefined && row._rawData && index < row._rawData.length) {
          rowData[header] = row._rawData[index];
        }
      });
      
      return rowData;
    });
    
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// Create wallet from private key
const getWallet = () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('Private key not found in environment variables');
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
};

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', network: 'Base' });
});

// Google Sheets API endpoints
app.get('/api/sheets/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { sheetIndex = 0 } = req.query;
    
    const data = await fetchSheetData(spreadsheetId, parseInt(sheetIndex));
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in Google Sheets API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch data from Google Sheets' 
    });
  }
});

// Get tasks from Google Sheets with specific format for AeVA app
app.get('/api/tasks', async (req, res) => {
  try {
    const spreadsheetId = process.env.TASKS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'TASKS_SPREADSHEET_ID not configured in environment variables' 
      });
    }

    console.log("Fetching tasks from Google Sheets...")
    
    const sheetIndex = parseInt(process.env.TASKS_SHEET_INDEX || '0');
    const data = await fetchSheetData(spreadsheetId, sheetIndex);

    console.log("Tasks fetched from Google Sheets:", data);
    
    // Transform data to match AeVA app's workflow format
    const tasks = data.map((row, index) => ({
      id: parseInt(row.id) || index + 1000,
      name: row.name || row.title || 'Untitled Task',
      body: row.body || row.description || '',
      status: (row.status || 'pending').toLowerCase(),
      triggered_by: 'google_sheets',
      updated_at: row.updated_at || new Date().toISOString()
    }));
    
    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch tasks from Google Sheets' 
    });
  }
});

// Get wallet balance
app.get('/api/balance', async (req, res) => {
  try {
    const wallet = getWallet();
    const balance = await provider.getBalance(wallet.address);
    
    res.status(200).json({
      address: wallet.address,
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send ETH to recipient
app.post('/api/send', async (req, res) => {
  try {
    const { recipientAddress, amount } = req.body;
    
    // Validate input
    if (!recipientAddress || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }
    
    if (!ethers.isAddress(recipientAddress)) {
      return res.status(400).json({ error: 'Invalid recipient address' });
    }
    
    const wallet = getWallet();
    
    // Convert amount from ETH to Wei
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check if wallet has enough balance
    const balance = await provider.getBalance(wallet.address);
    if (balance < amountWei) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: amount,
        available: ethers.formatEther(balance)
      });
    }
    
    // Prepare transaction
    const tx = {
      to: recipientAddress,
      value: amountWei
    };
    
    // Add optional gas parameters if provided in .env
    if (process.env.GAS_LIMIT) {
      tx.gasLimit = process.env.GAS_LIMIT;
    }
    
    if (process.env.MAX_PRIORITY_FEE && process.env.MAX_FEE) {
      const maxPriorityFeePerGas = ethers.parseUnits(process.env.MAX_PRIORITY_FEE, 'gwei');
      const maxFeePerGas = ethers.parseUnits(process.env.MAX_FEE, 'gwei');
      
      tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
      tx.maxFeePerGas = maxFeePerGas;
    }
    
    // Send transaction
    const txResponse = await wallet.sendTransaction(tx);
    
    // Return transaction details
    res.status(200).json({
      success: true,
      transactionHash: txResponse.hash,
      from: wallet.address,
      to: recipientAddress,
      amount: amount,
      amountWei: amountWei.toString()
    });
    
  } catch (error) {
    console.error('Error sending ETH:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction status
app.get('/api/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }
    
    const txReceipt = await provider.getTransactionReceipt(txHash);
    
    if (!txReceipt) {
      return res.status(200).json({ 
        status: 'pending',
        hash: txHash
      });
    }
    
    res.status(200).json({
      status: txReceipt.status === 1 ? 'confirmed' : 'failed',
      hash: txHash,
      blockNumber: txReceipt.blockNumber,
      gasUsed: txReceipt.gasUsed.toString(),
      effectiveGasPrice: ethers.formatUnits(txReceipt.effectiveGasPrice, 'gwei')
    });
    
  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`ETH transfer server running on port ${port}`);
  console.log(`Connected to Base network at ${process.env.BASE_RPC_URL || 'https://mainnet.base.org'}`);
});
