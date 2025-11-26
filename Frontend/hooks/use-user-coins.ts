import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { onechainClient } from '@/lib/onechain';
import { CoinStruct } from '@mysten/sui/client';

// OCT coin type (OneChain native token)
// Note: Replace with actual USDC type in production
const OCT_COIN_TYPE = '0x2::oct::OCT';

export function useUserCoins() {
  const currentAccount = useCurrentAccount();
  const [coins, setCoins] = useState<CoinStruct[]>([]);
  const [totalBalance, setTotalBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = async () => {
    if (!currentAccount?.address) {
      setCoins([]);
      setTotalBalance(0n);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query all OCT coins owned by user
      const result = await onechainClient.getCoins({
        owner: currentAccount.address,
        coinType: OCT_COIN_TYPE,
      });

      setCoins(result.data);

      // Calculate total balance
      const total = result.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      );
      setTotalBalance(total);
    } catch (err) {
      console.error('Failed to fetch coins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch coins');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCoins();
  }, [currentAccount?.address]);

  return {
    coins,
    totalBalance,
    isLoading,
    error,
    refetch: fetchCoins,
  };
}

// Helper function to find suitable coin for deposit
export function findSuitableCoin(
  coins: CoinStruct[],
  requiredAmount: bigint
): CoinStruct | null {
  // Sort coins by balance descending
  const sortedCoins = [...coins].sort(
    (a, b) => Number(BigInt(b.balance) - BigInt(a.balance))
  );

  // Find exact match or smallest coin that's larger than required
  for (const coin of sortedCoins) {
    if (BigInt(coin.balance) >= requiredAmount) {
      return coin;
    }
  }

  return null;
}

// Helper to check if we have enough balance across all coins
export function hasEnoughBalance(
  coins: CoinStruct[],
  requiredAmount: bigint
): boolean {
  const total = coins.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  return total >= requiredAmount;
}
