import { ChainId } from 'constants/chainId';
import React, { useState, useEffect, useContext } from "react";
import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'
import { NavLink, useHistory } from 'react-router-dom'
import { useLocation } from 'react-router'
import { MenuOutlined } from '@ant-design/icons';
import styled from 'styled-components'
import DropdownSelect from 'components/DropdownSelect'
import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_pink.png'
import LogoWhite from '../../assets/images/logo-white.png'
import Wordmark from '../../assets/svg/wordmark_white.svg'
import WordmarkDark from '../../assets/svg/wordmark.svg'
import ZKNet from '../../assets/images/zk_net.svg'
import LootChain from '../../assets/svg/loot.svg'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { injected, walletconnect, walletlink, fortmatic, portis } from '../../connectors'

import { YellowCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'

import Row, { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import VersionSwitch from './VersionSwitch'
import { ExternalLink } from '../../theme'
import './index.less'

const RowBetweenDiv = styled(RowBetween)`
  padding: 1rem 8rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0;
  `};
`

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 12px;
    width: calc(100%);
    position: relative;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderLogoDiv = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
`
const HeaderNavBox = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
  border-radius: 8px;
  padding: 0 2px;
  background-color: ${({ theme }) => theme.bg2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    width: 100%;
    height: 200px;
    position: absolute;
    top: 64px;
    left: 0;
    z-index: 10;
    background: #fff;
    &.show{
      display: flex;
    }
    &.hide{
      display: none;
    }
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;

  :hover {
    cursor: pointer;
  }
`

const TitleText = styled(Row)`
  width: fit-content;
  white-space: nowrap;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 6px;
  white-space: nowrap;
  width: 100%;

  :focus {
    border: 1px solid blue;
  }
`

const TestnetWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;
  pointer-events: auto;
`

const NetworkCard = styled(YellowCard)`
  width: fit-content;
  margin-right: 10px;
  border-radius: 12px;
  padding: 8px 12px;
`

const NetworkBox = styled.div`
  width: fit-content;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
  .mobile{
    display: none;
  }
  .screen{
    display: inline-block;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    img { 
      width: 4.5rem;
    }
    .mobile{
      display: inline-block;
    }
    .screen{
      display: none;
    }
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 300px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 1rem;
  width: fit-content;
  margin: 0 19px;
  font-weight: 500;
  padding: 7px 3px 10px;
  height: 100%;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    justify-content: center;
    border-top: 1px solid #E4E4E7;
    &:last-of-type{
      border-bottom: 1px solid #E4E4E7;
    }
  `};
  &.${activeClassName} {
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
    border-bottom: 3px solid ${({ theme }) => theme.text1};
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    padding: 7px 0;
    :hover,
    :focus {
      color: ${({ theme }) => theme.text1};
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
      border-width: 1px;
      border-color: #E4E4E7;
      color: ${({ theme }) => theme.primary6};
    `};

  }

  :hover,
  :focus {
    color: ${({ theme }) => theme.text1};
  }
`



const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: 'Ethereum',
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.ZKSYNCTEST]: 'zksync-test',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.BASE_GOERLI]: 'Base Goerli',
  [ChainId.BASE]: 'Base',
  [ChainId.PZT]: 'Pzt',
  [ChainId.PZ]: 'Pz',
  [ChainId.LOOT]: 'Loot Chain'
}

const NETWORK_TOKEN: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: 'ETH',
  [ChainId.RINKEBY]: 'ETH',
  [ChainId.ROPSTEN]: 'ETH',
  [ChainId.GÖRLI]: 'ETH',
  [ChainId.KOVAN]: 'ETH',
  [ChainId.POLYGON]: 'ETH',
  [ChainId.ZKSYNCTEST]: 'ETH',
  [ChainId.ZKSYNC]: 'ETH',
  [ChainId.BASE]: 'ETH',
  [ChainId.BASE_GOERLI]: 'ETH',
  [ChainId.PZT]: 'ETH',
  [ChainId.PZ]: 'ETH',
  [ChainId.LOOT]: 'AGLD'
}

export default function Header() {
  const location = useLocation()
  const history = useHistory();
  const { account, chainId } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [isNavVisible, setNavVisibility] = useState(false);

  const [isDark] = useDarkModeManager()

  // if(typeof(chainId) !== 'undefined' && account !== null && chainId === 42220){
  //   window.location.href = 'https://swap-celo.spacefi.io'
  // }
  // if(typeof(chainId) !== 'undefined' && account !== null && chainId === 44787){
  //   window.location.href = 'https://swap-celoalfa.spacefi.io'
  // }
  // if(typeof(chainId) !== 'undefined' && account !== null && chainId === 9000){
  //   window.location.href = 'https://swap-tevmos.spacefi.io'
  // }
  // if(typeof(chainId) !== 'undefined' && account !== null && chainId === 9001){
  //   window.location.href = 'https://swap-evmos.spacefi.io'
  // }
  // if(typeof(chainId) !== 'undefined' && account !== null && chainId === 324){
  //   window.location.href = 'https://swap-zksync.spacefi.io'
  // }

  // useEffect(() => {
  //   injected.getProvider().then(provider => {
  //     provider.request({
  //       method: 'wallet_switchEthereumChain',
  //       params: [{
  //         chainId: `0x4e9bda`
  //       }]
  //     }).catch((err: Error) => {
  //       if (!/Unrecognized chain ID/i.test(err.message)) {
  //         return;
  //       }
  //       provider.request({
  //         method: 'wallet_addEthereumChain',
  //         params: [{
  //           chainId: `0x4e9bda`,
  //           chainName: 'Loot Mainnet',
  //           nativeCurrency: {
  //             name: 'AGLD',
  //             symbol: 'AGLD',
  //             decimals: 18,
  //           },
  //           rpcUrls: [
  //             "https://rpc.lootchain.com/http"
  //           ],
  //           blockExplorerUrls: ['https://explorer.lootchain.com/']
  //         }]
  //       })
  //     })
  //     return true
  //   })
  // }, [])
  const toggleNav = () => {
    setNavVisibility(!isNavVisible);
};

  return (
    <HeaderFrame>
      <RowBetweenDiv>
        <button onClick={toggleNav} className="Burger">
          <MenuOutlined />
        </button>
        <HeaderLogoDiv>
          <Title href=".">
            <UniIcon>
              <img className='screen' style={{ width: '114px', height: '40px' }} src={LogoWhite} alt="logo" />
              <img className='mobile' style={{ width: '40px', height: '40px' }} src={Logo} alt="logo" />
            </UniIcon>
            {/* <TitleText> */}
              {/* Soswap */}
              {/* <img style={{ marginLeft: '4px', marginTop: '0px', width: '130px' }} src={Wordmark} alt="logo" /> */}
            {/* </TitleText> */}
          </Title>
        </HeaderLogoDiv>

        <HeaderNavBox className={`${isNavVisible ? 'show': 'hide'}`}>
          <StyledNavLink 
            onClick={() => {setNavVisibility(false)}} 
            id={`swap-nav-link`} 
            to={'/swap'}>
            Trade
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            onClick={() => {setNavVisibility(false)}}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            Pool
          </StyledNavLink>
          <StyledNavLink
            onClick={() => {setNavVisibility(false)}}
            id={`farm-nav-link`}
            to={'/farm'}
          >
            Farm
          </StyledNavLink>
          <StyledNavLink
            onClick={() => {setNavVisibility(false)}}
            id={`analytics-nav-link`}
            to={'/analytics'}
          >
            Analytics
          </StyledNavLink>

        </HeaderNavBox>
        <HeaderControls>
          <HeaderElement>
            <TestnetWrapper>
              {/* {!isMobile && chainId && NETWORK_LABELS[chainId] && <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>} */}
              {!isMobile && chainId && <NetworkBox>
                {chainId === ChainId.ZKSYNC && <img src={ZKNet} />}
                {chainId === ChainId.ZKSYNCTEST && <img src={ZKNet} />}
                {chainId === ChainId.LOOT && <img src={LootChain} />}
                <span style={{ fontWeight: 'bold', marginLeft: 8, color: '#000'}}>{NETWORK_LABELS[chainId]}</span>
              </NetworkBox>
              }
            </TestnetWrapper>
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {/* {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {userEthBalance?.toSignificant(4)}
                </BalanceText>
              ) : null} {!isMobile && chainId && NETWORK_TOKEN[chainId] && <Text>{NETWORK_TOKEN[chainId]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>} */}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          {/* <HeaderElementWrap>
            <VersionSwitch />
            <Settings />
            <Menu />
          </HeaderElementWrap> */}
        </HeaderControls>
      </RowBetweenDiv>
    </HeaderFrame>
  )
}
