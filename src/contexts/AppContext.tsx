/* eslint-disable */
import React, { useState, useCallback, createContext, useEffect } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { providers } from 'ethers';
import { useActiveWeb3React } from '../hooks'
import { NETWORK_CHAIN_ID } from 'connectors/index';

export interface WalletContextValues {
  account: any;
  provider: Web3Provider | null;
  chainId: number | undefined;
  signer?: any;
}

const WalletContext = createContext<WalletContextValues>({
  account: '',
  provider: null,
  chainId: NETWORK_CHAIN_ID,
});

const injected = new InjectedConnector({
  supportedChainIds: [324, 280, 5151706, 84531]
});

const wallets = {
  MetaMask: injected,
};

const WalletProvider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<any>();
  const [signer, setSigner] = useState<any>();
  const { account, chainId, library } = useActiveWeb3React();

  const getSigner = (library: Web3Provider, account: string): JsonRpcSigner => {
    return library.getSigner(account).connectUnchecked();
  };

  const getProviderOrSigner = (
    library: Web3Provider,
    account?: string,
  ): Web3Provider | JsonRpcSigner => {
    return account ? getSigner(library, account) : library;
  };

  useEffect(() => {
    if (library && account) {
      const _signer = getSigner(library, account);
      const _provider = getProviderOrSigner(library, account).provider;
      setSigner(_signer);
      setProvider(_provider);
    }
  }, [library, account]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        chainId,
        signer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext };

export default WalletProvider;
