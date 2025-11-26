"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onechainClient, GAME_VAULT_ID, PACKAGE_ID } from '@/lib/onechain';
import { GameVault, DepositReceipt } from '@/types/contract';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface ContractState {
  vault: GameVault | null;
  userReceipts: DepositReceipt[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ContractContext = createContext<ContractState | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [vault, setVault] = useState<GameVault | null>(null);
  const [userReceipts, setUserReceipts] = useState<DepositReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();

  const fetchVaultState = async () => {
    try {
      setError(null);

      // Query GameVault object
      const vaultObj = await onechainClient.getObject({
        id: GAME_VAULT_ID,
        options: { showContent: true },
      });

      if (vaultObj.data?.content?.dataType === 'moveObject') {
        const fields = vaultObj.data.content.fields as any;
        setVault({
          id: fields.id.id,
          current_epoch: fields.current_epoch,
          epoch_start_time: fields.epoch_start_time,
          epoch_end_time: fields.epoch_end_time,
          vault_balance: fields.vault_balance,
          rock_pool: fields.rock_pool,
          paper_pool: fields.paper_pool,
          scissors_pool: fields.scissors_pool,
          total_deposited: fields.total_deposited,
          yield_pool: fields.yield_pool,
          total_players: fields.total_players,
          last_winner: parseInt(fields.last_winner),
        });
      }
    } catch (err) {
      console.error('Failed to fetch vault state:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchUserReceipts = async () => {
    if (!currentAccount?.address) {
      setUserReceipts([]);
      return;
    }

    try {
      // Query all objects owned by user
      const ownedObjects = await onechainClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::game_vault::DepositReceipt`,
        },
        options: { showContent: true },
      });

      const receipts: DepositReceipt[] = [];
      for (const obj of ownedObjects.data) {
        if (obj.data?.content?.dataType === 'moveObject') {
          const fields = obj.data.content.fields as any;
          receipts.push({
            id: fields.id.id,
            amount: fields.amount,
            faction: parseInt(fields.faction),
            epoch_id: fields.epoch_id,
            depositor: fields.depositor,
          });
        }
      }

      setUserReceipts(receipts);
    } catch (err) {
      console.error('Failed to fetch user receipts:', err);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await Promise.all([fetchVaultState(), fetchUserReceipts()]);
    setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    refetch();
  }, []);

  // Poll every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchVaultState, 15000);
    return () => clearInterval(interval);
  }, []);

  // Refetch user receipts when account changes
  useEffect(() => {
    fetchUserReceipts();
  }, [currentAccount?.address]);

  return (
    <ContractContext.Provider value={{ vault, userReceipts, isLoading, error, refetch }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) throw new Error('useContract must be used within ContractProvider');
  return context;
}
