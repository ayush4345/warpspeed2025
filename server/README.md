# ETH Transfer Server for Base Network

This server provides API endpoints for sending ETH over the Base network to recipient addresses.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on the `.env.example` template:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your private key and other settings:
```
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
PORT=3001
```

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns the status of the server and the connected network.

### Get Wallet Balance
```
GET /api/balance
```
Returns the balance of the wallet associated with the provided private key.

### Send ETH
```
POST /api/send
```
Sends ETH to a recipient address.

Request body:
```json
{
  "recipientAddress": "0x...",
  "amount": "0.01"
}
```

### Check Transaction Status
```
GET /api/transaction/:txHash
```
Returns the status of a transaction by its hash.

## Security Notes

- Never share your private key or commit the `.env` file to version control
- Use environment variables for all sensitive information
- Consider implementing rate limiting for production use
