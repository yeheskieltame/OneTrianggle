module onetriangle::game_vault {
    use one::coin::{Self, Coin};
    use one::balance::{Self, Balance};
    use one::oct::OCT;
    use one::event;

    // ===== Error Codes =====
    const EInvalidFaction: u64 = 1;
    const EEpochNotEnded: u64 = 2;
    const EInvalidDepositAmount: u64 = 3;
    const ENotAuthorized: u64 = 4;
    const EInvalidReceipt: u64 = 5;
    const EDepositPhaseEnded: u64 = 6;
    const EInsufficientBalance: u64 = 7;

    // ===== Constants =====
    const EPOCH_DURATION: u64 = 259200000; // 3 days in milliseconds
    const MIN_DEPOSIT: u64 = 1_000_000; // 1 USDC (6 decimals)

    // Faction IDs
    const FACTION_ROCK: u8 = 0;
    const FACTION_PAPER: u8 = 1;
    const FACTION_SCISSORS: u8 = 2;

    // ===== Structs =====

    /// Admin capability - only the deployer has this
    public struct AdminCap has key, store {
        id: UID
    }

    /// Main game vault shared object
    public struct GameVault has key {
        id: UID,
        /// Current epoch number
        current_epoch: u64,
        /// Epoch start timestamp
        epoch_start_time: u64,
        /// Epoch end timestamp
        epoch_end_time: u64,
        /// Total USDC in vault (using OCT for testnet, replace with USDC type for production)
        vault_balance: Balance<OCT>,
        /// Rock faction total deposits in current epoch
        rock_pool: u64,
        /// Paper faction total deposits in current epoch
        paper_pool: u64,
        /// Scissors faction total deposits in current epoch
        scissors_pool: u64,
        /// Total deposited in current epoch
        total_deposited: u64,
        /// Yield pool for current epoch
        yield_pool: u64,
        /// Total players in current epoch
        total_players: u64,
        /// Winning faction of last settled epoch (255 = none)
        last_winner: u8,
    }

    /// User's deposit receipt (NFT)
    public struct DepositReceipt has key, store {
        id: UID,
        /// Amount deposited
        amount: u64,
        /// Faction chosen (0=Rock, 1=Paper, 2=Scissors)
        faction: u8,
        /// Epoch ID when deposited
        epoch_id: u64,
        /// User address
        depositor: address,
    }

    // ===== Events =====

    public struct DepositMade has copy, drop {
        epoch: u64,
        user: address,
        amount: u64,
        faction: u8,
        receipt_id: ID,
    }

    public struct EpochSettled has copy, drop {
        epoch: u64,
        winner: u8,
        rock_pool: u64,
        paper_pool: u64,
        scissors_pool: u64,
        rock_score: u64,
        paper_score: u64,
        scissors_score: u64,
        yield_distributed: u64,
    }

    public struct WithdrawalMade has copy, drop {
        epoch: u64,
        user: address,
        principal: u64,
        yield_earned: u64,
        faction: u8,
    }

    public struct YieldInjected has copy, drop {
        epoch: u64,
        amount: u64,
    }

    public struct NewEpochStarted has copy, drop {
        epoch: u64,
        start_time: u64,
        end_time: u64,
    }

    // ===== Init Function =====

    /// Called once when the module is published
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        let epoch_start = ctx.epoch_timestamp_ms();
        let epoch_end = epoch_start + EPOCH_DURATION;

        let game_vault = GameVault {
            id: object::new(ctx),
            current_epoch: 1,
            epoch_start_time: epoch_start,
            epoch_end_time: epoch_end,
            vault_balance: balance::zero(),
            rock_pool: 0,
            paper_pool: 0,
            scissors_pool: 0,
            total_deposited: 0,
            yield_pool: 0,
            total_players: 0,
            last_winner: 255, // No winner yet
        };

        // Emit event before sharing
        event::emit(NewEpochStarted {
            epoch: 1,
            start_time: epoch_start,
            end_time: epoch_end,
        });

        // Transfer admin cap to deployer
        transfer::transfer(admin_cap, ctx.sender());

        // Share the vault
        transfer::share_object(game_vault);
    }

    // ===== Public Entry Functions =====

    /// Deposit USDC and join a faction
    /// @param vault: The shared game vault
    /// @param payment: Coin to deposit (OCT for testnet, USDC in production)
    /// @param faction: 0=Rock, 1=Paper, 2=Scissors
    public entry fun deposit(
        vault: &mut GameVault,
        payment: Coin<OCT>,
        faction: u8,
        ctx: &mut TxContext
    ) {
        // Validate faction
        assert!(faction <= 2, EInvalidFaction);

        let amount = payment.value();
        assert!(amount >= MIN_DEPOSIT, EInvalidDepositAmount);

        // Check if still in deposit phase
        let current_time = ctx.epoch_timestamp_ms();
        assert!(current_time < vault.epoch_end_time, EDepositPhaseEnded);

        // Add to vault balance
        let deposit_balance = payment.into_balance();
        vault.vault_balance.join(deposit_balance);

        // Update faction pool
        if (faction == FACTION_ROCK) {
            vault.rock_pool = vault.rock_pool + amount;
        } else if (faction == FACTION_PAPER) {
            vault.paper_pool = vault.paper_pool + amount;
        } else {
            vault.scissors_pool = vault.scissors_pool + amount;
        };

        vault.total_deposited = vault.total_deposited + amount;
        vault.total_players = vault.total_players + 1;

        // Create deposit receipt
        let receipt = DepositReceipt {
            id: object::new(ctx),
            amount,
            faction,
            epoch_id: vault.current_epoch,
            depositor: ctx.sender(),
        };

        let receipt_id = object::id(&receipt);

        event::emit(DepositMade {
            epoch: vault.current_epoch,
            user: ctx.sender(),
            amount,
            faction,
            receipt_id,
        });

        // Transfer receipt to user
        transfer::transfer(receipt, ctx.sender());
    }

    /// Withdraw principal + yield (if winner) after epoch ends
    public entry fun withdraw(
        vault: &mut GameVault,
        receipt: DepositReceipt,
        ctx: &mut TxContext
    ) {
        // Validate receipt epoch
        assert!(receipt.epoch_id == vault.current_epoch - 1, EInvalidReceipt);

        let DepositReceipt {
            id,
            amount,
            faction,
            epoch_id: _,
            depositor
        } = receipt;

        // Verify ownership
        assert!(depositor == ctx.sender(), ENotAuthorized);

        let mut payout = amount;
        let mut yield_earned = 0u64;

        // Calculate yield if winner
        if (faction == vault.last_winner) {
            // Winner gets share of yield pool
            // Calculate winner's pool size from last epoch
            let winner_pool = if (vault.last_winner == FACTION_ROCK) {
                vault.rock_pool
            } else if (vault.last_winner == FACTION_PAPER) {
                vault.paper_pool
            } else {
                vault.scissors_pool
            };

            if (winner_pool > 0) {
                // Yield share = (user_deposit / winner_pool) * yield_pool
                yield_earned = (amount * vault.yield_pool) / winner_pool;
                payout = payout + yield_earned;
            }
        };

        // Ensure vault has sufficient balance
        assert!(vault.vault_balance.value() >= payout, EInsufficientBalance);

        // Transfer payout
        let payout_balance = vault.vault_balance.split(payout);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, depositor);

        event::emit(WithdrawalMade {
            epoch: vault.current_epoch - 1,
            user: depositor,
            principal: amount,
            yield_earned,
            faction,
        });

        object::delete(id);
    }

    /// Settle current epoch and start new one
    /// Can be called by anyone after epoch ends
    public entry fun settle_epoch(
        vault: &mut GameVault,
        ctx: &mut TxContext
    ) {
        let current_time = ctx.epoch_timestamp_ms();
        assert!(current_time >= vault.epoch_end_time, EEpochNotEnded);

        // Calculate scores using actual signed logic
        let total = vault.total_deposited;

        let winner = if (total > 0) {
            // Calculate percentages
            let scissors_pct = (vault.scissors_pool * 1000) / total;
            let paper_pct = (vault.paper_pool * 1000) / total;
            let rock_pct = (vault.rock_pool * 1000) / total;

            // Calculate signed scores (using i128 arithmetic simulation)
            // Rock Score = Scissors% - Paper%
            let rock_score_pos = scissors_pct >= paper_pct;
            let rock_score_abs = if (rock_score_pos) { scissors_pct - paper_pct } else { paper_pct - scissors_pct };

            // Paper Score = Rock% - Scissors%
            let paper_score_pos = rock_pct >= scissors_pct;
            let paper_score_abs = if (paper_score_pos) { rock_pct - scissors_pct } else { scissors_pct - rock_pct };

            // Scissors Score = Paper% - Rock%
            let scissors_score_pos = paper_pct >= rock_pct;
            let scissors_score_abs = if (scissors_score_pos) { paper_pct - rock_pct } else { rock_pct - paper_pct };

            // Determine winner (highest signed score)
            if (rock_score_pos && (!paper_score_pos || rock_score_abs > paper_score_abs) && (!scissors_score_pos || rock_score_abs > scissors_score_abs)) {
                FACTION_ROCK
            } else if (paper_score_pos && (!scissors_score_pos || paper_score_abs > scissors_score_abs)) {
                FACTION_PAPER
            } else if (scissors_score_pos) {
                FACTION_SCISSORS
            } else if (rock_score_abs > paper_score_abs && rock_score_abs > scissors_score_abs) {
                FACTION_ROCK
            } else if (paper_score_abs > scissors_score_abs) {
                FACTION_PAPER
            } else {
                FACTION_SCISSORS
            }
        } else {
            255 // No winner if no deposits
        };

        let (rock_score, paper_score, scissors_score) = calculate_scores(vault);

        vault.last_winner = winner;

        event::emit(EpochSettled {
            epoch: vault.current_epoch,
            winner,
            rock_pool: vault.rock_pool,
            paper_pool: vault.paper_pool,
            scissors_pool: vault.scissors_pool,
            rock_score,
            paper_score,
            scissors_score,
            yield_distributed: vault.yield_pool,
        });

        // Start new epoch
        vault.current_epoch = vault.current_epoch + 1;
        vault.epoch_start_time = current_time;
        vault.epoch_end_time = current_time + EPOCH_DURATION;
        vault.rock_pool = 0;
        vault.paper_pool = 0;
        vault.scissors_pool = 0;
        vault.total_deposited = 0;
        vault.total_players = 0;
        vault.yield_pool = 0;

        event::emit(NewEpochStarted {
            epoch: vault.current_epoch,
            start_time: vault.epoch_start_time,
            end_time: vault.epoch_end_time,
        });
    }

    // ===== Admin Functions =====

    /// Inject mock yield into the vault (for demo/testing)
    public entry fun inject_yield(
        _admin: &AdminCap,
        vault: &mut GameVault,
        yield_payment: Coin<OCT>,
        _ctx: &mut TxContext
    ) {
        let amount = yield_payment.value();
        let yield_balance = yield_payment.into_balance();

        vault.vault_balance.join(yield_balance);
        vault.yield_pool = vault.yield_pool + amount;

        event::emit(YieldInjected {
            epoch: vault.current_epoch,
            amount,
        });
    }

    // ===== View Functions =====

    /// Get current epoch info
    public fun get_epoch_info(vault: &GameVault): (u64, u64, u64) {
        (vault.current_epoch, vault.epoch_start_time, vault.epoch_end_time)
    }

    /// Get faction pools
    public fun get_faction_pools(vault: &GameVault): (u64, u64, u64) {
        (vault.rock_pool, vault.paper_pool, vault.scissors_pool)
    }

    /// Get vault stats
    public fun get_vault_stats(vault: &GameVault): (u64, u64, u64, u8) {
        (
            vault.vault_balance.value(),
            vault.total_deposited,
            vault.yield_pool,
            vault.last_winner
        )
    }

    /// Calculate current scores (returns as i64-like with separate positive/negative flag)
    /// Note: Scores can be negative, so we return the absolute value
    /// In actual settlement, we compare these values directly
    public fun calculate_scores(vault: &GameVault): (u64, u64, u64) {
        let total = vault.total_deposited;

        if (total == 0) {
            return (0, 0, 0)
        };

        // Calculate percentages
        let scissors_pct = (vault.scissors_pool * 100) / total;
        let paper_pct = (vault.paper_pool * 100) / total;
        let rock_pct = (vault.rock_pool * 100) / total;

        // For rock: scissors% - paper%
        let rock_score = if (scissors_pct >= paper_pct) {
            scissors_pct - paper_pct
        } else {
            0 // Return 0 for negative scores in view function
        };

        // For paper: rock% - scissors%
        let paper_score = if (rock_pct >= scissors_pct) {
            rock_pct - scissors_pct
        } else {
            0
        };

        // For scissors: paper% - rock%
        let scissors_score = if (paper_pct >= rock_pct) {
            paper_pct - rock_pct
        } else {
            0
        };

        (rock_score, paper_score, scissors_score)
    }

    /// Get receipt info
    public fun get_receipt_info(receipt: &DepositReceipt): (u64, u8, u64, address) {
        (receipt.amount, receipt.faction, receipt.epoch_id, receipt.depositor)
    }

    // ===== Test Helper Functions =====

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
