# OneTriangle Smart Contract

This directory contains the Move smart contracts for the OneTriangle No-Loss Gamified Savings Protocol on OneChain (Sui fork).

##  Current Deployment (OneChain Testnet)

**Status:**  LIVE - Epoch 1 active until **November 28, 2025 08:57:59 UTC**

| Item | Address |
|------|---------|
| **Package ID** | `0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762` |
| **GameVault ID** | `0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9` |
| **AdminCap ID** | `0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61` |
| **UpgradeCap ID** | `0x7af359790051c93a5e7538babcc9eb47806505fd45b34507c82c06923d56d44e` |
| **Network** | OneChain Testnet |
| **RPC Endpoint** | https://rpc-testnet.onelabs.cc:443 |
| **Deployed On** | November 26, 2025 02:20:01 UTC |
| **Deployer** | `0x9e3203feda10c56d23f0e2ffd0149eb16b4962179adb0563d8194e5f56c4539e` |
| **Epoch 1** | Nov 25, 2025 08:57:59 → Nov 28, 2025 08:57:59 UTC |

### Quick Test Commands

```bash
# Check vault status
one client object 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9

# Make a test deposit (Rock faction)
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function deposit \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_ID> 0 \
  --gas-budget 10000000
```

---

## Contract Overview

The smart contract implements a Rock-Paper-Scissors yield distribution game where:
- Users deposit USDC (OCT for testnet demo) into one of three factions
- Deposits are locked for an epoch (3 days)
- Yield is generated and added to a pool
- Winning faction is determined by the "Target - Predator" scoring formula
- Winners receive 100% principal + share of yield pool
- Losers receive 100% principal back

## Architecture

### Core Components

**GameVault** (Shared Object)
- Stores all deposited funds
- Tracks faction pool sizes (rock_pool, paper_pool, scissors_pool)
- Manages epoch timing and state
- Holds yield pool for distribution

**DepositReceipt** (Owned Object/NFT)
- Proof of user's deposit
- Contains: amount, faction choice, epoch ID, depositor address
- Required for withdrawal

**AdminCap** (Owned Object)
- Admin capability for privileged functions
- Only deployer receives this on initialization
- Used for yield injection (demo purposes)

### Scoring Formula

```
Rock Score = (Scissors Pool %) - (Paper Pool %)
Paper Score = (Rock Pool %) - (Scissors Pool %)
Scissors Score = (Paper Pool %) - (Rock Pool %)
```

The faction with the highest score wins all yield for that epoch.

## Setup & Deployment

### Prerequisites

1. Install OneChain CLI:
```bash
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one
```

2. Configure OneChain Testnet:
```bash
one client new-env --alias onechain-testnet --rpc https://rpc-testnet.onelabs.cc:443
one client switch --env onechain-testnet
```

3. Get testnet OCT tokens from faucet:
```bash
one client faucet
# Or request via cURL (see OneChain docs)
```

### Build

```bash
cd Backend
one move build
```

### Deploy

```bash
one client publish --gas-budget 100000000
```

After deployment, you'll receive:
- **Package ID**: The deployed contract address
- **GameVault Object ID**: The shared vault object
- **AdminCap Object ID**: Admin capability (sent to deployer)

Save these IDs for frontend integration!

### Verify Deployment

```bash
# Check the GameVault object
one client object <GAME_VAULT_OBJECT_ID>

# Check your AdminCap
one client objects --owned
```

## Usage

### For Users

**1. Deposit & Join Faction**
```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function deposit \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_OBJECT_ID> <FACTION> \
  --gas-budget 10000000
```
- FACTION: 0 = Rock, 1 = Paper, 2 = Scissors
- Get COIN_OBJECT_ID from: `one client gas`
- Returns a DepositReceipt NFT to your wallet

**2. Check Epoch Status**
```bash
one client object 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 --json
```

**3. Withdraw After Epoch**
```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function withdraw \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <DEPOSIT_RECEIPT_ID> \
  --gas-budget 10000000
```

### For Admins

**1. Inject Mock Yield**
```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function inject_yield \
  --args 0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_OBJECT_ID> \
  --gas-budget 10000000
```

**2. Settle Epoch (Anyone can call after epoch ends)**
```bash
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function settle_epoch \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 \
  --gas-budget 10000000
```

## Frontend Integration with OneWallet

### Key Object IDs to Store

The deployment IDs are already configured in `Frontend/.env.local`:

```env
NEXT_PUBLIC_NETWORK=onechain-testnet
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_PACKAGE_ID=0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762
NEXT_PUBLIC_GAME_VAULT_ID=0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9
NEXT_PUBLIC_ADMIN_CAP_ID=0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61
```

### OneWallet Integration Example

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Initialize client
const client = new SuiClient({
  url: 'https://rpc-testnet.onelabs.cc:443'
});

// Deposit function
async function deposit(walletAddress: string, amount: number, faction: 0 | 1 | 2) {
  const tx = new TransactionBlock();

  const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);

  tx.moveCall({
    target: `${PACKAGE_ID}::game_vault::deposit`,
    arguments: [
      tx.object(GAME_VAULT_ID),
      coin,
      tx.pure(faction, 'u8'),
    ],
  });

  // Sign with OneWallet
  // const result = await oneWallet.signAndExecuteTransactionBlock({ transactionBlock: tx });
  return tx;
}
```

### Reading Vault State

```typescript
// Get current epoch info
const vault = await client.getObject({
  id: GAME_VAULT_ID,
  options: { showContent: true }
});

// Parse faction pools, epoch times, etc from vault.data.content.fields
```

### Listening to Events

```typescript
// Subscribe to deposit events
const events = await client.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::game_vault::DepositMade`
  }
});
```

## Testing

### Run Move Tests
```bash
one move test
```

### Manual Testing Flow

1. **Deploy contract**
2. **Get test SUI from faucet**
3. **Make deposits** to different factions
4. **Inject yield** using AdminCap
5. **Wait for epoch to end** (or modify EPOCH_DURATION for testing)
6. **Settle epoch** to determine winner
7. **Withdraw** with deposit receipt

## Important Notes

### For Production

1. **Replace OCT with USDC**: Change all `Coin<OCT>` to `Coin<USDC>` where USDC is the actual USDC coin type on OneChain
2. **Adjust MIN_DEPOSIT**: Currently set to 1 USDC (1_000_000 with 6 decimals)
3. **Epoch Duration**: 3 days (259200000 ms) - adjust as needed
4. **Security Audit**: Get contract audited before mainnet deployment
5. **Remove test functions**: Remove `#[test_only]` functions in production

### Known Limitations (Demo Version)

- Uses OCT (OneChain testnet token) instead of USDC for testing
- No pause/emergency stop mechanism
- No upgrade capability (would need to add)
- Simple yield calculation (equal share per winning depositor)
- No partial withdrawals

## Contract State

### GameVault Fields
- `current_epoch`: Current epoch number
- `epoch_start_time`: Epoch start timestamp (ms)
- `epoch_end_time`: Epoch end timestamp (ms)
- `vault_balance`: Total SUI/USDC in vault
- `rock_pool`, `paper_pool`, `scissors_pool`: Faction deposits
- `total_deposited`: Sum of all deposits in epoch
- `yield_pool`: Available yield for distribution
- `total_players`: Number of deposits in epoch
- `last_winner`: Winning faction of previous epoch (255 = none)

## Events Emitted

1. **DepositMade**: User deposits funds
2. **EpochSettled**: Epoch ends, winner determined
3. **WithdrawalMade**: User withdraws principal + yield
4. **YieldInjected**: Admin adds mock yield
5. **NewEpochStarted**: New epoch begins

## Support

For issues or questions:
- OneChain GitHub: https://github.com/one-chain-labs/onechain
- Move Book: https://move-book.com
- Review Blueprint.md for game mechanics

## License

MIT
