import React, { useContext, useMemo, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from 'zksdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { Dots } from '../../components/swap/styleds'
import { getPairAddress } from 'utils'

export const PoolBody = styled.div`
  max-width: 640px;
  width: 100%;
  position: relative;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 30px;
  padding: 1rem;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account, library, chainId } = useActiveWeb3React()
  const [tokenPairsWithLiquidityTokens, setTokenPairsWithLiquidityTokens] = useState<any>([])
  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()


  useMemo(() => {
    const promises = trackedTokenPairs.map(([tokenA, tokenB]) => {
      return tokenA && tokenB && !tokenA.equals(tokenB) ? getPairAddress(library, tokenA, tokenB, chainId) : undefined
    })

    Promise.all(promises).then((res: any) => {
      setTokenPairsWithLiquidityTokens(trackedTokenPairs.map((tokens: any, i: number) => {
        return ({ liquidityToken: toV2LiquidityToken(tokens, res[i]), tokens })
      }))
    })
  },[trackedTokenPairs?.[0]?.[0]?.symbol, trackedTokenPairs?.[0]?.[1]?.symbol])

  // const tokenPairsWithLiquidityTokens = useMemo(
  //   () => trackedTokenPairs.map((tokens: any, i: number) => {
  //     return ({ liquidityToken: toV2LiquidityToken(tokens, pairAddresses[i]), tokens })
  //   }),
  //   [trackedTokenPairs, pairAddresses]
  // )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt: any) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }: any) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens } : any) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))


  return (
      <>
        <PoolBody>
          {/* <SwapPoolTabs active={'pool'} /> */}
          <AutoColumn gap="lg" justify="center">
            <ButtonPrimary id="join-pool-button" as={Link} style={{ padding: 16 }} to="/add/ETH">
              <Text fontWeight={500} fontSize={20}>
                Add Liquidity
              </Text>
            </ButtonPrimary>

            <AutoColumn gap="12px" style={{ width: '100%' }}>
              <RowBetween padding={'0 8px'}>
                <Text color={theme.text1} fontWeight={500}>
                  Your Liquidity
                </Text>
                <Question text="When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below." />
              </RowBetween>

              {!account ? (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
                      Connect to a wallet to view your liquidity.
                    </TYPE.body>
                  </LightCard>
              ) : v2IsLoading ? (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
                      <Dots>Loading</Dots>
                    </TYPE.body>
                  </LightCard>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                  <>
                    {allV2PairsWithLiquidity.map(v2Pair => (
                        <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                    ))}
                  </>
              ) : (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
                      No liquidity found.
                    </TYPE.body>
                  </LightCard>
              )}

              <div>
                <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                  {"Don't see a pool you joined?"}{' '}
                  <StyledInternalLink id="import-pool-link" to={'/find'}>
                    {'Import it.'}
                  </StyledInternalLink>
                </Text>
              </div>
            </AutoColumn>
          </AutoColumn>
        </PoolBody>

      </>
  )
}