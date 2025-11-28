import { useState } from 'react';
import { Transaction } from '@onelabs/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { MODULE_NAME, GAME_VAULT_ID, onechainClient } from '@/lib/onechain';
import { FACTION_MAP, Faction, MIN_DEPOSIT } from '@/types/contract';
import { CoinStruct } from '@onelabs/sui/client';
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

    // Check if user has enough balance
    const totalBalance = coins.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
    if (totalBalance < amountInBaseUnits) {
      toast.error('Insufficient balance');
      return;
    }

    setIsPending(true);
    try {
      console.log('Starting deposit...', {
        coinsCount: coins.length,
        totalBalance: coins.reduce((sum, c) => sum + BigInt(c.balance), 0n).toString(),
        requestedAmount: amountInBaseUnits.toString(),
      });

      const tx = new Transaction();

      // Sort coins by balance descending
      const sortedCoins = [...coins].sort(
        (a, b) => Number(BigInt(b.balance) - BigInt(a.balance))
      );

      console.log('Sorted coins:', sortedCoins.map(c => ({
        id: c.coinObjectId.slice(0, 10) + '...',
        balance: c.balance,
      })));

      let coinToUse;

      // Find a coin with exact or larger balance
      const suitableCoin = sortedCoins.find(
        (coin) => BigInt(coin.balance) >= amountInBaseUnits
      );

      if (suitableCoin) {
        console.log('Using suitable coin:', {
          balance: suitableCoin.balance,
          exact: BigInt(suitableCoin.balance) === amountInBaseUnits,
        });

        // If coin has exact amount, use it directly
        if (BigInt(suitableCoin.balance) === amountInBaseUnits) {
          coinToUse = tx.object(suitableCoin.coinObjectId);
        } else {
          // Split the coin to get exact amount
          console.log('Splitting coin...');
          const [splitCoin] = tx.splitCoins(
            tx.object(suitableCoin.coinObjectId),
            [tx.pure.u64(amountInBaseUnits)]
          );
          coinToUse = splitCoin;
        }
      } else {
        console.log('Need to merge coins...');
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

      // Set explicit gas budget (reduced to work with smaller gas coins)
      tx.setGasBudget(2000000); // 0.002 OCT (sufficient for deposit tx)

      console.log('Transaction built:', {
        faction,
        amount: amountInBaseUnits.toString(),
        vaultId: GAME_VAULT_ID,
      });

      console.log('Calling signAndExecute...');

      const result = await signAndExecute(
        {
          transaction: tx as any, // Type cast for OneChain compatibility
        }
      );

      console.log('Transaction result:', result);

      const octAmount = (Number(amountInBaseUnits) / 1_000_000).toFixed(2);
      toast.success(`Successfully deposited ${octAmount} OCT (${amountInBaseUnits.toString()} units) to ${faction} faction!`);
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Deposit failed:', err);

      // Extract detailed error message
      let errorMsg = 'Deposit failed';

      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Log full error object for debugging
        console.error('Full error object:', JSON.stringify(err, null, 2));

        // Try to extract meaningful error message
        const errObj = err as any;
        if (errObj.message) {
          errorMsg = errObj.message;
        } else if (errObj.error) {
          errorMsg = errObj.error;
        } else if (errObj.toString && errObj.toString() !== '[object Object]') {
          errorMsg = errObj.toString();
        }
      }

      // Parse contract error codes
      if (errorMsg.includes('EInvalidDepositAmount') || errorMsg.includes('error code: 3')) {
        errorMsg = 'Amount below minimum (1,000,000 units = 1 OCT)';
      } else if (errorMsg.includes('EDepositPhaseEnded') || errorMsg.includes('error code: 6')) {
        errorMsg = 'Epoch has ended. Wait for settlement before depositing.';
      } else if (errorMsg.includes('EInvalidFaction') || errorMsg.includes('error code: 1')) {
        errorMsg = 'Invalid faction selected';
      }

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

      // Set explicit gas budget
      tx.setGasBudget(2000000); // 0.002 OCT

      const result = await signAndExecute(
        {
          transaction: tx as any, // Type cast for OneChain compatibility
        }
      );

      console.log('Withdrawal result:', result);
      toast.success('Withdrawal successful!');
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Withdraw failed:', err);

      let errorMsg = 'Withdrawal failed';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        console.error('Full error object:', JSON.stringify(err, null, 2));
        const errObj = err as any;
        if (errObj.message) errorMsg = errObj.message;
        else if (errObj.error) errorMsg = errObj.error;
      }

      // Parse contract error codes
      if (errorMsg.includes('EInvalidReceipt') || errorMsg.includes('error code: 5')) {
        errorMsg = 'Invalid receipt: Can only withdraw from previous epoch';
      } else if (errorMsg.includes('ENotAuthorized') || errorMsg.includes('error code: 4')) {
        errorMsg = 'Not authorized: You do not own this receipt';
      } else if (errorMsg.includes('EInsufficientBalance') || errorMsg.includes('error code: 7')) {
        errorMsg = 'Vault has insufficient balance for payout';
      }

      toast.error(errorMsg);
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

      // Set explicit gas budget
      tx.setGasBudget(2000000); // 0.002 OCT

      const result = await signAndExecute(
        {
          transaction: tx as any, // Type cast for OneChain compatibility
        }
      );

      console.log('Settlement result:', result);
      toast.success('Epoch settled successfully!');
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Settle epoch failed:', err);

      let errorMsg = 'Settlement failed';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        console.error('Full error object:', JSON.stringify(err, null, 2));
        const errObj = err as any;
        if (errObj.message) errorMsg = errObj.message;
        else if (errObj.error) errorMsg = errObj.error;
      }

      // Parse contract error codes
      if (errorMsg.includes('EEpochNotEnded') || errorMsg.includes('error code: 2')) {
        errorMsg = 'Epoch has not ended yet. Please wait until epoch expires.';
      }

      toast.error(errorMsg);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { settleEpoch, isPending };
}
