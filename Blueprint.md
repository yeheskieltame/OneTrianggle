# OneTriangle Project Blueprint

**Project Title:** OneTriangle
**Concept:** No-Loss Gamified Savings Protocol
**Network:** OneChain (Sui Fork)
**Asset Standard:** USDC (Mock/Testnet)

## 1. Executive Summary
OneTriangle is a DeFi protocol that gamifies stablecoin savings. It replaces traditional fixed APY with a competitive "Rock-Paper-Scissors" strategy game. Users deposit USDC into one of three factions. The principal capital is preserved (no-loss), while the yield generated from the total pool is distributed exclusively to the winning faction based on a "Target vs. Predator" liquidity formula.

## 2. Core Problem & Solution
**Problem:**
* **DeFi Fatigue:** Standard lending protocols are boring and passive.
* **High-Risk Gambling:** Prediction markets and casinos are zero-sum games where users lose their principal.
* **Engagement:** Retention in DeFi is driven by unsustainable token emissions, not intrinsic utility.

**Solution:**
* **Principal Protection:** Users never lose their initial USDC deposit.
* **Gamified Yield:** Interest is aggregated and gamified. The winner takes the yield of the losers.
* **Skill-Based:** Unlike random lotteries, victory depends on analyzing market sentiment and liquidity flows (Game Theory).

## 3. Game Mechanics & Logic

**The Factions:**
1.  **Rock** (Beats Scissors, loses to Paper)
2.  **Paper** (Beats Rock, loses to Scissors)
3.  **Scissors** (Beats Paper, loses to Rock)

**The Winning Formula (Target - Predator):**
The score for a faction is determined by the liquidity volume of its target minus the liquidity volume of its predator.

* **Rock Score** = (% Total TVL in Scissors) - (% Total TVL in Paper)
* **Paper Score** = (% Total TVL in Rock) - (% Total TVL in Scissors)
* **Scissors Score** = (% Total TVL in Paper) - (% Total TVL in Rock)

**The Cycle (Epoch System):**
1.  **Deposit Phase:** Users deposit USDC and select a faction.
2.  **Lock Phase:** Deposits are locked for the duration of the epoch (e.g., 3 days).
3.  **Yield Generation:** Underlying USDC is lent out (simulated via Mock Vault for Hackathon) to generate returns.
4.  **Settlement:** Smart contract calculates scores.
5.  **Distribution:**
    * **Winners:** Receive 100% Principal + Share of Total Yield.
    * **Losers:** Receive 100% Principal only.

## 4. Technical Architecture

**A. Smart Contract (OneChain / Move Language)**
* **Architecture:** Single Vault Model.
* **Object Model (Sui Specifics):**
    * `GameVault`: A shared object storing the total USDC and global state (current pool sizes).
    * `DepositReceipt`: A user-owned object (NFT) representing the deposit. It stores the `Amount`, `Faction Choice`, and `Epoch ID`.
* **Mock Yield Mechanism:** An admin function `inject_yield()` allows the deployer to add USDC to the pot to simulate external lending protocol returns during the demo.

**B. Frontend (Next.js)**
* **Framework:** Next.js 14 (App Router).
* **Styling:** Tailwind CSS (Clean, minimalist, data-heavy dashboard).
* **Integration:** OneWallet SDK for transaction signing.
* **Real-time Data:** Fetching on-chain object data to display live "Rock vs Paper vs Scissors" percentages.

## 5. User Flow (Step-by-Step)

1.  **Connect:** User connects OneWallet.
2.  **Analyze:** User views the "Live Liquidity" chart. They see Rock has too much liquidity (making it a target), so they decide to choose Paper.
3.  **Deposit:** User inputs 100 USDC and clicks "Join Paper Faction".
4.  **Transaction:** OneChain processes the transfer. The contract mints a `DepositReceipt` object to the user's wallet.
5.  **Wait:** The epoch timer counts down.
6.  **Claim:** Once the epoch ends, the user clicks "Withdraw".
    * If Paper won: Contract returns 100 USDC + 5 USDC (Yield Share) and burns the receipt.
    * If Paper lost: Contract returns 100 USDC and burns the receipt.

## 6. Hackathon Strategy

**Unique Selling Point (USP) for Judges:**
1.  **Demonstration of Move Objects:** By using `DepositReceipt` objects instead of a ledger balance mapping, you showcase the specific advantages of OneChain's architecture over EVM.
2.  **Clean UX:** Removing the proprietary token (OTRE) lowers the barrier to entry. It is immediately understandable as a "USDC Savings Game."
3.  **Financial Innovation:** It introduces "Positive-Sum Gaming" where wealth is created (yield), not transferred from losers to winners.