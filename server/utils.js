const { ethers } = require('ethers');

/**
 * Validates an Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
function isValidAddress(address) {
  return ethers.isAddress(address);
}

/**
 * Formats error messages for API responses
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(error) {
  // Check for common ethers.js errors
  if (error.message.includes('insufficient funds')) {
    return {
      code: 'INSUFFICIENT_FUNDS',
      message: 'Not enough ETH to complete this transaction',
      details: error.message
    };
  }
  
  if (error.message.includes('nonce')) {
    return {
      code: 'NONCE_ERROR',
      message: 'Transaction nonce issue, please try again',
      details: error.message
    };
  }
  
  if (error.message.includes('gas')) {
    return {
      code: 'GAS_ERROR',
      message: 'Gas estimation failed or gas price too low',
      details: error.message
    };
  }
  
  // Default error
  return {
    code: 'TRANSACTION_ERROR',
    message: 'Failed to process transaction',
    details: error.message
  };
}

/**
 * Estimates gas for a transaction
 * @param {Object} provider - Ethers provider
 * @param {Object} tx - Transaction object
 * @returns {Promise<BigNumber>} - Estimated gas
 */
async function estimateGas(provider, tx) {
  try {
    const gasEstimate = await provider.estimateGas(tx);
    // Add 20% buffer to gas estimate
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Gas estimation error:', error);
    // Return default gas limit if estimation fails
    return ethers.BigNumber.from(21000);
  }
}

/**
 * Gets current gas price with options for Base network
 * @param {Object} provider - Ethers provider
 * @returns {Promise<Object>} - Gas price information
 */
async function getBaseGasPrice(provider) {
  const feeData = await provider.getFeeData();
  
  return {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    gasPrice: feeData.gasPrice
  };
}

module.exports = {
  isValidAddress,
  formatErrorResponse,
  estimateGas,
  getBaseGasPrice
};
