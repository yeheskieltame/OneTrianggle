// Contract object types matching Move structs
export interface GameVault {
  id: string;
  current_epoch: string;
  epoch_start_time: string;
  epoch_end_time: string;
  vault_balance: string;
  rock_pool: string;
  paper_pool: string;
  scissors_pool: string;
  total_deposited: string;
  yield_pool: string;
  total_players: string;
  last_winner: number; // 0=Rock, 1=Paper, 2=Scissors, 255=None
}

export interface DepositReceipt {
  id: string;
  amount: string;
  faction: number; // 0=Rock, 1=Paper, 2=Scissors
  epoch_id: string;
  depositor: string;
}

export type Faction = "rock" | "paper" | "scissors";

export const FACTION_MAP = {
  rock: 0,
  paper: 1,
  scissors: 2,
} as const;

export const FACTION_REVERSE = {
  0: "rock",
  1: "paper",
  2: "scissors",
} as const;

// Contract constants
export const MIN_DEPOSIT = 1_000_000; // 1 USDC with 6 decimals
export const EPOCH_DURATION = 259_200_000; // 3 days in ms
