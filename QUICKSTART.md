# OneTriangle - Quick Start Guide

Fast track guide to deploy and test the OneTriangle smart contract on OneChain testnet.

##  Live Deployment

**Current Status:**  ACTIVE on OneChain Testnet

```
Package ID:     0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762
GameVault ID:   0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9
AdminCap ID:    0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61

Network:        https://rpc-testnet.onelabs.cc:443
Epoch 1 End:    2025-11-28 08:57:59 UTC
```

**You can test using these IDs immediately!**

---

## Prerequisites

### 1. Install OneChain CLI

```bash
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one
```

### 2. Setup Wallet

```bash
# Create new wallet
one client new-address ed25519

# Or import existing
one client import <your-private-key> ed25519
```

### 3. Get Testnet OCT

```bash
# Via CLI
one client faucet

# Or via API
curl --location --request POST 'https://faucet-testnet.onelabs.cc/gas' \
--header 'Content-Type: application/json' \
--data-raw '{"FixedAmountRequest": {"recipient": "<YOUR_ADDRESS>"}}'
```

---

## Testing the Live Contract

### 1. Check Vault Status

```bash
one client object 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9
```

Expected output:
```json
{
  "current_epoch": "1",
  "rock_pool": "...",
  "paper_pool": "...",
  "scissors_pool": "...",
  "total_deposited": "...",
  "yield_pool": "..."
}
```

### 2. Make a Deposit

**Get coin ID first:**
```bash
one client gas
```

**Deposit to Rock (faction 0):**
```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function deposit \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_ID> 0 \
  --gas-budget 10000000
```

**Factions:**
- `0` = Rock
- `1` = Paper
- `2` = Scissors

### 3. Check Your Deposit Receipt

```bash
# List your objects
one client objects --owned

# View receipt details
one client object <DEPOSIT_RECEIPT_ID>
```

### 4. Inject Yield (Admin Only)

**Note:** Only works if you have the AdminCap

```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function inject_yield \
  --args 0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_ID> \
  --gas-budget 10000000
```

### 5. Settle Epoch

**Anyone can call after epoch ends (Nov 28, 2025):**

```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function settle_epoch \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 \
  --gas-budget 10000000
```

### 6. Withdraw

**After epoch settlement:**

```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function withdraw \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <DEPOSIT_RECEIPT_ID> \
  --gas-budget 10000000
```

---

## Deploy Your Own Instance

### 1. Build Contract

```bash
cd Backend
one move build
```

### 2. Deploy

```bash
./deploy.sh
```

This will:
- Configure OneChain testnet
- Build and deploy contract
- Save IDs to `deployment.json`
- Create `Frontend/.env.local`

### 3. Verify

```bash
one client object <YOUR_GAME_VAULT_ID>
```

---

## Run Tests

```bash
cd Backend
one move test
```

Expected: **7 tests passed**

---

## Game Scenarios

### Scenario 1: Simple Win/Loss

1. Player A deposits 100 OCT to Rock
2. Player B deposits 100 OCT to Paper
3. Admin injects 10 OCT yield
4. Settlement: Paper wins (targets Rock)
5. Player A withdraws 100 OCT (principal)
6. Player B withdraws 110 OCT (principal + yield)

### Scenario 2: Strategic Play

**Pool distribution:**
- Rock: 45% (largest)
- Paper: 30%
- Scissors: 25%

**Scores:**
- Rock: 25 - 30 = -5 (loses)
- Paper: 45 - 25 = 20 (WINS)
- Scissors: 30 - 45 = -15 (loses)

**Strategy:** Join Paper to target the large Rock pool!

### Scenario 3: Epoch Cycle

1. Epoch 1: Deposits, yield injection, settlement
2. Winners withdraw with yield
3. Epoch 2 automatically starts
4. New deposits accepted for Epoch 2
5. Cycle repeats infinitely

---

## Frontend Integration

Environment variables already configured in `Frontend/.env.local`:

```env
NEXT_PUBLIC_NETWORK=onechain-testnet
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_PACKAGE_ID=0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762
NEXT_PUBLIC_GAME_VAULT_ID=0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9
```

**Example code:**

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const client = new SuiClient({
  url: process.env.NEXT_PUBLIC_RPC_URL!
});

// Deposit function
async function deposit(amount: number, faction: 0 | 1 | 2) {
  const tx = new TransactionBlock();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);

  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::game_vault::deposit`,
    arguments: [
      tx.object(process.env.NEXT_PUBLIC_GAME_VAULT_ID!),
      coin,
      tx.pure(faction, 'u8'),
    ],
  });

  return tx;
}
```

---

## Troubleshooting

### "Insufficient gas"
Increase `--gas-budget` to 20000000

### "Object not found"
- Check network: `one client active-env`
- Verify using correct IDs from deployment

### "EDepositPhaseEnded"
Epoch has ended. Call `settle_epoch` first, then join new epoch

### "EInvalidReceipt"
Receipt is from wrong epoch. Can only withdraw from previous epoch after settlement

### Tests fail
Rebuild: `one move build --force`

---

## Monitoring

### View Events

```bash
one client events --sender 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 --limit 10
```

### Query Programmatically

```typescript
const events = await client.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::game_vault::DepositMade`
  },
  limit: 50
});
```

---

## Key Concepts

**Epoch:** 3-day game cycle. Deposits locked, winner calculated, new epoch starts automatically.

**No-Loss:** 100% principal always returned. Only yield is competed for.

**Target-Predator:** Winning formula based on pool percentages. Target the largest pool while avoiding your predator.

**DepositReceipt:** NFT proving ownership. Required for withdrawal.

---

## Support

- **OneChain Docs:** https://docs.onelabs.cc
- **GitHub:** https://github.com/one-chain-labs/onechain
- **Move Book:** https://move-book.com

---

**Ready to test!** Use the live deployment IDs above or deploy your own instance.
