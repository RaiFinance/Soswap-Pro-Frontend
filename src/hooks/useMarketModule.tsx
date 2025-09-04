/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
// import { NETWORK_NAMES, NETWORK_CHAIN_ID } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import useInterval from 'hooks/useInterval';
import useMarketInterface from 'hooks/useMarketInterface';
const timeIntervalInSeconds = 5;

// eslint-disable-next-line @typescript-eslint/unbound-method
const BN = BigNumber.from;

type Prices = {
  yes: string;
  no: string;
};

type ShareBalances = {
  yes: BigNumber;
  no: BigNumber;
};


const DEFAULT_BALANCES = { yes: BN(0), no: BN(0) };
const DEFAULT_LIQUIDITY = BN(0);
const DEFAULT_PRICES = { yes: '0', no: '0' };
const DEFAULT_FEE = BN(0);
const DEFAULT_MAX_SELL_AMOUNT = BN(0);

function useMarketModule({
  marketAddress,
  updatePrices,
  updateShares,
  setUpdateShares,
}: {
  marketAddress: string;
  updatePrices: boolean;
  updateShares: boolean;
  setUpdateShares: (value: boolean) => void;
}) {
  const { chainId, account, library } = useActiveWeb3React();

  const { marketContract, conditionalTokensContract } = useMarketInterface(marketAddress);

  const [shareBalances, setShareBalances] = useState<ShareBalances>(DEFAULT_BALANCES);
  const [marketLiquidity, setMarketLiquidity] = useState<BigNumber>(DEFAULT_LIQUIDITY);
  const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES);
  const [fee, setFee] = useState<BigNumber>(DEFAULT_FEE);

  useEffect(() => {
    setShareBalances(DEFAULT_BALANCES);
    setMarketLiquidity(DEFAULT_LIQUIDITY);
    setPrices(DEFAULT_PRICES);
    setFee(DEFAULT_FEE);
  }, [marketAddress]);

  const getYesPrice = async (): Promise<string> => marketContract && marketContract?.calcTokenPrice(0) || '0';
  const getNoPrice = async (): Promise<string> => marketContract && marketContract?.calcTokenPrice(1) || '0';

  const getMarketData = async () => {
    if (!marketContract) return;

    marketContract
      .getPoolBalances(2)
      .then((res: any) =>
        setShareBalances({
          yes: res[0],
          no: res[1],
        }),
      )
      .catch((err: any) => {
        console.log(account)
        console.error(err)
      });

    marketContract
      ?.getTotalSupply()
      .then((res: any) => setMarketLiquidity(res || BN(0)))
      .catch((err: any) => {
        console.error(err)
      });

    marketContract
      ?.getFee()
      .then((res: any) => setFee(res || BN(0)))
      .catch(
        (err: any) => {
          console.error(err)
        }
      );

    const yes: string = await getYesPrice();
    const no: string = await getNoPrice();
    setPrices({ yes, no });
  };

  useInterval(async () => {
    if (updatePrices) {
      const yes: string = await getYesPrice();
      const no: string = await getNoPrice();
      setPrices({ yes, no });
    }
  }, timeIntervalInSeconds * 1000);

  useInterval(async () => {
    if (updateShares && marketContract) {
      marketContract
        .getPoolBalances(2)
        .then(([yes, no]: any) => {
          if (
            yes.toHexString() !== shareBalances.yes.toHexString() ||
            no.toHexString() !== shareBalances.no.toHexString()
          ) {
            setShareBalances({ yes, no });
            setUpdateShares(false);
          }
        })
        .catch((err: any) => console.error(err));
    }
  }, timeIntervalInSeconds * 1000);

  useEffect(() => {
    getMarketData().catch((err) => console.error(err));
  }, [marketContract, conditionalTokensContract]);

  // if (chainId !== NETWORK_CHAIN_ID)
  //   return {
  //     error: true,
  //     message: `Network error: Please connect to the ${NETWORK_NAMES[NETWORK_CHAIN_ID]} network.`,
  //   };

  return {
    shareBalances,
    prices,
    marketLiquidity,
    getYesPrice,
    getNoPrice,
    fee,
    marketContract,
  };
}

export default useMarketModule;
