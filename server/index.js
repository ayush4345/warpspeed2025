require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize provider for Base network
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');

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
