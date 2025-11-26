import { SuiClient } from '@onelabs/sui/client';

// Contract configuration from env
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK!;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
export const GAME_VAULT_ID = process.env.NEXT_PUBLIC_GAME_VAULT_ID!;
export const ADMIN_CAP_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_ID!;

// Create OneChain client
export const onechainClient = new SuiClient({
  url: RPC_URL,
});

// Contract module path
export const MODULE_NAME = `${PACKAGE_ID}::game_vault`;

// Helper to convert Move u64 strings to numbers
export function u64ToNumber(val: string): number {
  return parseInt(val, 10);
}

// Helper to format USDC amounts (6 decimals)
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return (num / 1_000_000).toFixed(2);
}
