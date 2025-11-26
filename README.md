# OneTriangle

**No-Loss Gamified Savings Protocol on OneChain**

---

## Quick Access

**Live Demo Application:** [https://one-trianggle.vercel.app](https://one-trianggle.vercel.app)

**Video Demo:** [https://youtu.be/QUS0-dI-vGo](https://youtu.be/QUS0-dI-vGo)

**Download Project (Alternative):** [Google Drive - Download ZIP](https://drive.google.com/drive/folders/11BUyoV9SBKb1uSJMMcR688QJjdSiA98q?usp=drive_link)
*For judges who prefer to download and run locally without cloning the repository*

---

## Team

**Team Type:** Solo Developer

**Developer:** Yeheskiel Yunus Tame
- Student at Duta Wacana Christian University
- Major: Informatics (7th Semester)
- Role: Fullstack Developer & Web3 Developer

---

##  About

OneTriangle transforms passive DeFi savings into an engaging strategy game. Users deposit USDC into Rock, Paper, or Scissors factions, compete for yield using game theory, and always receive 100% of their principal back—regardless of outcome.

## Game Mechanics

### The Factions

- **Rock** → Beats Scissors, loses to Paper
- **Paper** → Beats Rock, loses to Scissors
- **Scissors** → Beats Paper, loses to Rock

### Winning Formula: Target - Predator

The faction with the highest score wins all yield for that epoch. Scores are calculated using pool percentages:

```
Rock Score     = (Scissors % TVL) - (Paper % TVL)
Paper Score    = (Rock % TVL) - (Scissors % TVL)
Scissors Score = (Paper % TVL) - (Rock % TVL)
```

**Example:**
- Rock pool: 45% | Paper pool: 30% | Scissors pool: 25%
- Rock: 25 - 30 = **-5** (loses)
- Paper: 45 - 25 = **+20** (wins)
- Scissors: 30 - 45 = **-15** (loses)

**Strategy:** Target the largest pool while avoiding your predator.

### Epoch Cycle (3 Days)

1. **Deposit Phase** → Users deposit and choose faction
2. **Lock Phase** → Funds locked, yield generated
3. **Settlement** → Smart contract calculates winner
4. **Distribution** → Winners get principal + yield share, losers get principal

## Deployment (OneChain Testnet)

**Status:**  LIVE | **Epoch 1 ends:** November 28, 2025 08:57:59 UTC

```
Package ID:     0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762
GameVault ID:   0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9
AdminCap ID:    0x319d5df37bbad14ce35d62ed0bcc389c68fb9877518b9f1443a653efeb2d4c61

Network:        OneChain Testnet
RPC:            https://rpc-testnet.onelabs.cc:443
Transaction:    Q6qe9UBTDeShDVjDdxoJJvWuhZ3FsUvQsUrL6SVxzuU
```

## Architecture

### Smart Contract (Move on OneChain)

**GameVault** - Shared object storing all deposits and game state
- Tracks faction pools (rock, paper, scissors)
- Manages epoch timing and settlement
- Holds yield pool for distribution

**DepositReceipt** - User-owned NFT proving deposit
- Contains: amount, faction choice, epoch ID, depositor address
- Required for withdrawal

**AdminCap** - Capability for privileged functions
- Used for `inject_yield()` (testnet demo only)

**Key Functions:**
- `deposit(vault, coin, faction)` → Join a faction
- `withdraw(vault, receipt)` → Claim principal + yield (if winner)
- `settle_epoch(vault)` → Calculate winner, start new epoch (anyone can call)
- `inject_yield(admin_cap, vault, coin)` → Add mock yield (admin only)

### Frontend (Next.js 14)

- **Framework:** Next.js with App Router
- **Styling:** Tailwind CSS
- **Wallet:** OneWallet SDK integration
- **Data:** Real-time on-chain object fetching for live faction percentages

## Technical Highlights

1. **Object-Oriented Design** - Leverages OneChain's Move object model (DepositReceipt NFTs) instead of EVM balance mappings
2. **Principal Protection** - 100% guaranteed return via smart contract logic
3. **Infinite Epochs** - Automated cycle renewal, no redeployment needed
4. **Skill-Based Gaming** - Victory depends on analyzing liquidity flows and game theory, not random chance

## Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for complete deployment and testing instructions.

**Test the contract:**
```bash
# Check vault status
one client object 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9

# Make a deposit (Rock faction)
one client call \
  --package 0xbe5ff682041431df2eb1033bee50f8ee81708dd74084b48ec8a69d490ba68762 \
  --module game_vault \
  --function deposit \
  --args 0xbeeb3463d50eec7704cd8b8bb8443f4eda38116c1bc8c46b6c240388c77546d9 <COIN_ID> 0 \
  --gas-budget 10000000
```

## Project Structure

```
OneTriangle/
├── Backend/
│   ├── sources/
│   │   └── game_vault.move          # Smart contract
│   ├── Move.toml                     # Package config
│   └── deployment.json               # Deployment data
├── Frontend/
│   ├── app/                          # Next.js pages
│   ├── components/                   # React components
│   └── .env.local                    # Contract IDs
└── README.md                         # This file
```

## Innovation

**Positive-Sum Gaming:** Unlike traditional gambling, wealth is created (yield generation), not transferred from losers. Everyone gets their principal back.

**DeFi Engagement:** Combines financial incentives with strategic gameplay, solving DeFi's retention problem without unsustainable token emissions.

**Move Showcase:** Demonstrates OneChain's object capabilities, shared objects, and capability-based access control.

---

**Built for OneChain Hackathon 2025**
