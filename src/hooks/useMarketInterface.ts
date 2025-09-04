/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { useEffect, useCallback, useState, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFpmmInterface, useConditionalTokenInterface } from 'hooks/useContract';
import { WalletContext } from 'contexts/AppContext';

// eslint-disable-next-line @typescript-eslint/unbound-method

function useMarketInterface(marketAddress: string) {
  const { account } = useWeb3React();
  const { provider } = useContext(WalletContext);
  const marketContract = useFpmmInterface(marketAddress, provider!, account || '');
  const [conditionalTokensAddress, setConditionalTokensAddress] = useState('');
  const conditionalTokensContract = useConditionalTokenInterface(
    provider!,
    conditionalTokensAddress,
  );

  const getConditionalTokensAddress = useCallback(async () => {
    if (!marketContract) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const response = await marketContract.getConditionalTokenAddress();
    setConditionalTokensAddress(response);
  }, [marketContract]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getConditionalTokensAddress();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    // marketContract?.getStage().then((res: any) => console.log('STAGE', res));
  }, [marketContract]);

  return {
    marketContract,
    conditionalTokensContract,
  };
}

export default useMarketInterface;
