#[test_only]
module onetriangle::game_vault_tests {
    use onetriangle::game_vault::{Self, GameVault, DepositReceipt, AdminCap};
    use one::test_scenario::{Self as ts, Scenario};
    use one::coin::{Self};
    use one::oct::OCT;

    const ADMIN: address = @0xAD;
    const PLAYER1: address = @0x1;
    const PLAYER2: address = @0x2;
    const PLAYER3: address = @0x3;

    const FACTION_ROCK: u8 = 0;
    const FACTION_PAPER: u8 = 1;
    const FACTION_SCISSORS: u8 = 2;

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            game_vault::init_for_testing(scenario.ctx());
        };
        scenario
    }

    #[test]
    fun test_init() {
        let mut scenario = setup_test();

        // Admin should receive AdminCap
        scenario.next_tx(ADMIN);
        {
            assert!(scenario.has_most_recent_for_sender<AdminCap>(), 0);
        };

        // GameVault should be shared
        scenario.next_tx(ADMIN);
        {
            let vault = scenario.take_shared<GameVault>();
            let (epoch, _, _) = game_vault::get_epoch_info(&vault);
            assert!(epoch == 1, 1);
            ts::return_shared(vault);
        };

        scenario.end();
    }

    #[test]
    fun test_deposit_rock() {
        let mut scenario = setup_test();

        // Player1 deposits 10 OCT to Rock
        scenario.next_tx(PLAYER1);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(10_000_000, scenario.ctx());

            game_vault::deposit(
                &mut vault,
                deposit_coin,
                FACTION_ROCK,
                scenario.ctx()
            );

            let (rock, paper, scissors) = game_vault::get_faction_pools(&vault);
            assert!(rock == 10_000_000, 2);
            assert!(paper == 0, 3);
            assert!(scissors == 0, 4);

            ts::return_shared(vault);
        };

        // Player1 should receive DepositReceipt
        scenario.next_tx(PLAYER1);
        {
            assert!(scenario.has_most_recent_for_sender<DepositReceipt>(), 5);
            let receipt = scenario.take_from_sender<DepositReceipt>();
            let (amount, faction, _, _) = game_vault::get_receipt_info(&receipt);
            assert!(amount == 10_000_000, 6);
            assert!(faction == FACTION_ROCK, 7);
            scenario.return_to_sender(receipt);
        };

        scenario.end();
    }

    #[test]
    fun test_multiple_deposits() {
        let mut scenario = setup_test();

        // Player1 deposits to Rock
        scenario.next_tx(PLAYER1);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(10_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_ROCK, scenario.ctx());
            ts::return_shared(vault);
        };

        // Player2 deposits to Paper
        scenario.next_tx(PLAYER2);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(15_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_PAPER, scenario.ctx());
            ts::return_shared(vault);
        };

        // Player3 deposits to Scissors
        scenario.next_tx(PLAYER3);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(5_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_SCISSORS, scenario.ctx());
            ts::return_shared(vault);
        };

        // Check faction pools
        scenario.next_tx(ADMIN);
        {
            let vault = scenario.take_shared<GameVault>();
            let (rock, paper, scissors) = game_vault::get_faction_pools(&vault);
            assert!(rock == 10_000_000, 8);
            assert!(paper == 15_000_000, 9);
            assert!(scissors == 5_000_000, 10);

            let (vault_balance, total_deposited, _, _) = game_vault::get_vault_stats(&vault);
            assert!(vault_balance == 30_000_000, 11);
            assert!(total_deposited == 30_000_000, 12);

            ts::return_shared(vault);
        };

        scenario.end();
    }

    #[test]
    fun test_inject_yield() {
        let mut scenario = setup_test();

        // Admin injects 5 OCT as yield
        scenario.next_tx(ADMIN);
        {
            let admin_cap = scenario.take_from_sender<AdminCap>();
            let mut vault = scenario.take_shared<GameVault>();
            let yield_coin = coin::mint_for_testing<OCT>(5_000_000, scenario.ctx());

            game_vault::inject_yield(&admin_cap, &mut vault, yield_coin, scenario.ctx());

            let (vault_balance, _, yield_pool, _) = game_vault::get_vault_stats(&vault);
            assert!(vault_balance == 5_000_000, 13);
            assert!(yield_pool == 5_000_000, 14);

            scenario.return_to_sender(admin_cap);
            ts::return_shared(vault);
        };

        scenario.end();
    }

    #[test]
    fun test_calculate_scores() {
        let mut scenario = setup_test();

        // Setup: Rock=35%, Paper=40%, Scissors=25%
        scenario.next_tx(PLAYER1);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(35_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_ROCK, scenario.ctx());
            ts::return_shared(vault);
        };

        scenario.next_tx(PLAYER2);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(40_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_PAPER, scenario.ctx());
            ts::return_shared(vault);
        };

        scenario.next_tx(PLAYER3);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(25_000_000, scenario.ctx());
            game_vault::deposit(&mut vault, deposit_coin, FACTION_SCISSORS, scenario.ctx());
            ts::return_shared(vault);
        };

        // Calculate scores
        scenario.next_tx(ADMIN);
        {
            let vault = scenario.take_shared<GameVault>();
            let (rock_score, paper_score, scissors_score) = game_vault::calculate_scores(&vault);

            // Rock Score = Scissors% - Paper% = 25 - 40 = -15
            // Paper Score = Rock% - Scissors% = 35 - 25 = 10
            // Scissors Score = Paper% - Rock% = 40 - 35 = 5
            // Paper should win

            assert!(paper_score > rock_score, 15);
            assert!(paper_score > scissors_score, 16);

            ts::return_shared(vault);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = 3)] // EInvalidDepositAmount
    fun test_deposit_below_minimum() {
        let mut scenario = setup_test();

        scenario.next_tx(PLAYER1);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(100_000, scenario.ctx()); // Less than MIN_DEPOSIT

            game_vault::deposit(&mut vault, deposit_coin, FACTION_ROCK, scenario.ctx());

            ts::return_shared(vault);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = 1)] // EInvalidFaction
    fun test_invalid_faction() {
        let mut scenario = setup_test();

        scenario.next_tx(PLAYER1);
        {
            let mut vault = scenario.take_shared<GameVault>();
            let deposit_coin = coin::mint_for_testing<OCT>(10_000_000, scenario.ctx());

            game_vault::deposit(&mut vault, deposit_coin, 99, scenario.ctx()); // Invalid faction

            ts::return_shared(vault);
        };

        scenario.end();
    }
}
