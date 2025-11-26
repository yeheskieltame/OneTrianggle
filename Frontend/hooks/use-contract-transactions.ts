import { useState } from 'react';
import { Transaction } from '@onelabs/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { MODULE_NAME, GAME_VAULT_ID } from '@/lib/onechain';
import { FACTION_MAP, Faction, MIN_DEPOSIT } from '@/types/contract';
import { CoinStruct } from '@mysten/sui/client';
import { toast } from 'sonner';

export function useDeposit() {
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const deposit = async (
    coins: CoinStruct[],
    amountInBaseUnits: bigint,
    faction: Faction,
    onSuccess?: () => void
  ) => {
    if (!currentAccount) {
      toast.error('Please connect wallet first');
      return;
    }

    // Validate amount
    if (amountInBaseUnits < BigInt(MIN_DEPOSIT)) {
      toast.error(`Minimum deposit is ${MIN_DEPOSIT / 1_000_000} USDC`);
      return;
    }

    // Check if user has enough balance
    const totalBalance = coins.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
    if (totalBalance < amountInBaseUnits) {
      toast.error('Insufficient balance');
      return;
    }

    setIsPending(true);
    try {
      const tx = new Transaction();

      // Sort coins by balance descending
      const sortedCoins = [...coins].sort(
        (a, b) => Number(BigInt(b.balance) - BigInt(a.balance))
      );

      let coinToUse;

      // Find a coin with exact or larger balance
      const suitableCoin = sortedCoins.find(
        (coin) => BigInt(coin.balance) >= amountInBaseUnits
      );

      if (suitableCoin) {
        // If coin has exact amount, use it directly
        if (BigInt(suitableCoin.balance) === amountInBaseUnits) {
          coinToUse = tx.object(suitableCoin.coinObjectId);
        } else {
          // Split the coin to get exact amount
          const [splitCoin] = tx.splitCoins(
            tx.object(suitableCoin.coinObjectId),
            [tx.pure.u64(amountInBaseUnits)]
          );
          coinToUse = splitCoin;
        }
      } else {
        // Need to merge multiple coins
        // Take the largest coin as primary
        const primaryCoin = sortedCoins[0];
        const primaryCoinArg = tx.object(primaryCoin.coinObjectId);

        // Merge other coins into primary
        const coinsToMerge = sortedCoins.slice(1).map((coin) =>
          tx.object(coin.coinObjectId)
        );

        if (coinsToMerge.length > 0) {
          tx.mergeCoins(primaryCoinArg, coinsToMerge);
        }

        // Now split the exact amount from merged coin
        const [splitCoin] = tx.splitCoins(primaryCoinArg, [
          tx.pure.u64(amountInBaseUnits),
        ]);
        coinToUse = splitCoin;
      }

      // Call deposit with the prepared coin
      tx.moveCall({
        target: `${MODULE_NAME}::deposit`,
        arguments: [
          tx.object(GAME_VAULT_ID),           // &mut GameVault
          coinToUse,                          // Coin<OCT>
          tx.pure.u8(FACTION_MAP[faction]),   // u8 faction
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      toast.success(`Successfully deposited ${Number(amountInBaseUnits) / 1_000_000} USDC to ${faction} faction!`);
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Deposit failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Deposit failed';
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { deposit, isPending };
}

export function useWithdraw() {
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const withdraw = async (
    receiptObjectId: string,
    onSuccess?: () => void
  ) => {
    setIsPending(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${MODULE_NAME}::withdraw`,
        arguments: [
          tx.object(GAME_VAULT_ID),     // &mut GameVault
          tx.object(receiptObjectId),   // DepositReceipt (consumed)
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      toast.success('Withdrawal successful!');
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Withdraw failed:', err);
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { withdraw, isPending };
}

export function useSettleEpoch() {
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const settleEpoch = async (onSuccess?: () => void) => {
    setIsPending(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${MODULE_NAME}::settle_epoch`,
        arguments: [
          tx.object(GAME_VAULT_ID),     // &mut GameVault
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      toast.success('Epoch settled successfully!');
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Settle epoch failed:', err);
      toast.error(err instanceof Error ? err.message : 'Settlement failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { settleEpoch, isPending };
}
