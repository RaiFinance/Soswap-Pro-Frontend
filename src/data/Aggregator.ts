import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from "@ethersproject/units"
import {
  BigintIsh,
  Currency,
  CurrencyAmount,
  currencyEquals,
  ETHER,
  JSBI,
  Pair,
  Percent,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
} from 'zksdk'
import { RAIProxy_contract_address } from 'constants/index'
import { ChainId } from 'constants/chainId'
import { useMemo, useState } from 'react'
import { useRAIProxyContract } from '../hooks/useContract'
import { useActiveWeb3React } from '../hooks'
import { tryParseAmount } from '../state/swap/hooks'
import { usePairIsInAggregator } from 'state/lists/hooks'
import { useAllTokens } from '../hooks/Tokens'
import { useV1FactoryContract } from '../hooks/useContract'
import { Version } from '../hooks/useToggledVersion'
import { NEVER_RELOAD, useSingleCallResult, useSingleContractMultipleData } from '../state/multicall/hooks'
import { useETHBalances, useTokenBalance, useTokenBalances } from '../state/wallet/hooks'

/**
 * Returns the trade to execute on V1 to go between input and output token
 */
export function useAggregatorTrade(
  isExactIn?: boolean,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  exactAmount?: CurrencyAmount
): any | undefined {
  const { chainId } = useActiveWeb3React()
  const RAIProxy = useRAIProxyContract(RAIProxy_contract_address[chainId || ChainId.BASE])
  const pairInAggregator = usePairIsInAggregator(inputCurrency?.symbol, outputCurrency?.symbol)
  const userHasSpecifiedInputOutput = Boolean(
    inputCurrency && outputCurrency && exactAmount?.greaterThan(JSBI.BigInt(0))
  )
  const [route, setRoute] = useState<string>('')
  const [outputAmount, setOutputAmount] = useState<CurrencyAmount>()
  useMemo(() => {
    if (pairInAggregator && RAIProxy && userHasSpecifiedInputOutput) {
      RAIProxy
      .getUniV2Routers(
        `0x${exactAmount?.raw.toString(16)}`,
        //@ts-ignore
        inputCurrency?.address,
        //@ts-ignore
        outputCurrency?.address
      ).then((res: any) => {
        const maxOutputAmount = res[1].reduce((preAmount: BigNumber, nextAmount: BigNumber) => {
          return preAmount.gt(nextAmount) ? preAmount : nextAmount
        })
        const findRouter = res[0][res[1].findIndex((outputAmount: BigNumber) => outputAmount.eq(maxOutputAmount))]
        setRoute(findRouter)
        const outputParsedAmount = tryParseAmount(formatUnits(maxOutputAmount, outputCurrency?.decimals), outputCurrency)
        setOutputAmount(outputParsedAmount)
      })
    }else{
      setRoute('')
    }
  }, [pairInAggregator, RAIProxy, userHasSpecifiedInputOutput, exactAmount?.toExact()])

  return useMemo(() => {
    let trade: any
    try {
      trade =
        route && exactAmount
          ? {
            route,
            inputAmount: exactAmount,
            outputAmount,
          }
          : undefined
    } catch (error) {
      console.debug('Failed to create V1 trade', error)
    }
    return trade
  },[route, outputAmount])
  // const route = inputCurrency && pairs && pairs.length > 0 && new Route(pairs, inputCurrency, outputCurrency)

}
