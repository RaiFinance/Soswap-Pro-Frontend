import { Currency, ETHER, Token } from 'zksdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ChainId } from 'constants/chainId'
import { useActiveWeb3React } from 'hooks/web3'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import AGLDLogo from '../../assets/images/agld.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

export const getTokenLogoURL = (symbol: string | undefined) =>
    `https://rai-static.s3.ap-northeast-1.amazonaws.com/sts/token/${symbol?.toLocaleLowerCase()}.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [getTokenLogoURL(currency.symbol)]
      }

      return [getTokenLogoURL(currency.symbol)]
    }
    return []
  }, [currency])

  if (currency === ETHER) {
    return <StyledEthereumLogo src={chainId === ChainId.LOOT ? AGLDLogo : EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
