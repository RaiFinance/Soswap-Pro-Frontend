import { JSBI, Percent, Token, WETH as UWETH } from 'zksdk'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId } from './chainId';
import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

export const timeframeOptions = {
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  HALF_YEAR: '6 months',
  ALL_TIME: 'All time',
}

export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const ROUTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.ZKSYNC]: '0x68e11D77DDedF31B836B3a899e0B52BB847a7e21',
  [ChainId.ZKSYNCTEST]:'0xcbF1Cc529bEC564efB8F6473f596F9394027CbEf',
  [ChainId.LOOT]: '0x3fE7BFa0704BC9CD393C23474381c83607D0a5D6',
  [ChainId.BASE]: '0xD55a4d54f39baF26da2F3EE7bE9a6388c15F9831',
}
export const FACTORY_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.ZKSYNC]: '0x2e5cd8fB90ECc8C227feCE339F7027bB7d8c4424',
  [ChainId.ZKSYNCTEST]:'0x71B5Fef83c4FdC19736F2F8e4c5Ac92B2CD56667',
  [ChainId.LOOT]: '0x6668738E5913686FCD6C5211d489D8C47A9143E6',
  [ChainId.BASE]: '0x539db2B4FE8016DB2594d7CfbeAb4d2B730b723E',
}

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const USDT = {
  [ChainId.LOOT]: new Token(ChainId.LOOT, '0x99880520F81931d89330181271e82444659eDB3E', 6, 'USDT', 'Tether USD'),
}
export const DAI = {
  [ChainId.LOOT]: new Token(ChainId.LOOT, '0x7E25eb56a8A7c0fa8514dF2d39faf3aF783Ff807', 6, 'DAI', 'DAI'),
  [ChainId.BASE]: new Token(ChainId.LOOT, '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 18, 'DAI', 'DAI'),
}
export const USDC: any = {
  [ChainId.BASE]: new Token(ChainId.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin'),
}
export const USDbc: any = {
  [ChainId.BASE]: new Token(ChainId.BASE, '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 6, 'USDbC', 'USD Base Coin'),
}
export const Rebase: any = {
  [ChainId.BASE]: new Token(ChainId.BASE, '0x3421cc14F0e3822Cf3B73C3a4BEC2A1023b8d9Cf', 6, 'Rebase', 'Rebase'),
}
export const SOFI = {
  [ChainId.BASE]: new Token(ChainId.BASE, '0x703D57164CA270b0B330A87FD159CfEF1490c0a5', 18, 'SOFI', 'RaiFinance'),
}
// export const zkSTART = new Token(ChainId.ZKSYNCTEST, '0x880F03cA84e6Cf0D0871c9818A2981DEBabA22b3', 18, 'tSPACE', 'tSPACE')
// export const zkUSDC = new Token(ChainId.ZKSYNCTEST, '0x0faF6df7054946141266420b43783387A78d82A9', 6,  'USDC', 'USDC')
export const zkwBTC = new Token(ChainId.ZKSYNCTEST, '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c', 8, 'wBTC', 'wBTC')
export const zkLINK = new Token(ChainId.ZKSYNCTEST, '0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78', 18,  'LINK', 'LINK')
export const zkDAI = new Token(ChainId.ZKSYNCTEST, '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b', 18,  'DAI', 'DAI')
export const zkSOFI = new Token(ChainId.ZKSYNCTEST, '0x4cbBd570C372847F0A1E1147bd8bD2bA7C558bf6', 18,  'SOFI', 'SOFI')

export const zkUSDC = new Token(ChainId.ZKSYNC, '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', 6,  'USDC', 'USDC')

export const AGLD = {
  [ChainId.LOOT]: new Token(ChainId.LOOT, '0x4fa214c9e33d481996bec77c443245fbaee85670', 18, 'AGLD', 'AGLD'),
}
export const PRED = {
  [ChainId.PZ]: new Token(ChainId.PZ, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.PZT]: new Token(ChainId.PZT, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.BASE_GOERLI]: new Token(ChainId.BASE_GOERLI, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.BASE]: new Token(ChainId.BASE, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.ZKSYNCTEST]: new Token(ChainId.ZKSYNCTEST, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.ZKSYNC]: new Token(ChainId.ZKSYNC, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
  [ChainId.LOOT]: new Token(ChainId.LOOT, '0x567E3dfdD1bd5A57525b2b82dEA8FB219f3A3FBc', 18, 'PRED', 'PRED'),
}


export const WETH = {
  ...UWETH,
  [ChainId.ZKSYNC]: new Token(ChainId.ZKSYNC, '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', 18,  'WETH', 'Wrapped ETH'),
  [ChainId.ZKSYNCTEST]: new Token(ChainId.ZKSYNCTEST, "0x8a144308792a23AadB118286aC0dec646f638908", 18,  'WETH', 'Wrapped ETH'),
  [ChainId.LOOT]: new Token(ChainId.LOOT, "0x4fa214c9e33d481996bec77c443245fbaee85670", 18,  'AGLD', 'Wrapped AGLD'),
  [ChainId.BASE]: new Token(ChainId.BASE, "0x4200000000000000000000000000000000000006", 18,  'WETH', 'Wrapped ETH'),
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.PZ]: [WETH[ChainId.PZ]],
  [ChainId.PZT]:[WETH[ChainId.PZT]],
  [ChainId.BASE]: [WETH[ChainId.BASE]],
  [ChainId.BASE_GOERLI]: [WETH[ChainId.BASE_GOERLI]],
  [ChainId.POLYGON]: [WETH[ChainId.POLYGON]],
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.ZKSYNCTEST]: [WETH[ChainId.ZKSYNCTEST]],
  [ChainId.ZKSYNC]: [WETH[ChainId.ZKSYNC]],
  [ChainId.LOOT]: [WETH[ChainId.LOOT]]
}

export const TSOFI = {
  [ChainId.LOOT]: new Token(ChainId.LOOT, '0xB49fa25978abf9a248b8212Ab4b87277682301c0', 18, 'SOFI', 'SOFI SOFI'),
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.ZKSYNCTEST]: [...WETH_ONLY[ChainId.ZKSYNCTEST]],
  [ChainId.ZKSYNC]: [...WETH_ONLY[ChainId.ZKSYNC]],
  [ChainId.LOOT]: [...WETH_ONLY[ChainId.LOOT]],
  [ChainId.BASE]: []
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.ZKSYNCTEST]: [...WETH_ONLY[ChainId.ZKSYNCTEST], zkSOFI, zkDAI],
  [ChainId.ZKSYNC]: [...WETH_ONLY[ChainId.ZKSYNC], zkUSDC],
  [ChainId.LOOT]: [DAI[ChainId.LOOT]],
  [ChainId.BASE]: [...WETH_ONLY[ChainId.BASE], USDC[ChainId.BASE], USDbc[ChainId.BASE], Rebase[ChainId.BASE], SOFI[ChainId.BASE], DAI[ChainId.BASE]]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.ZKSYNCTEST]: [...WETH_ONLY[ChainId.ZKSYNCTEST], zkSOFI, zkDAI],
  [ChainId.ZKSYNC]: [...WETH_ONLY[ChainId.ZKSYNC], zkUSDC],
  [ChainId.BASE]: [...WETH_ONLY[ChainId.BASE], USDbc[ChainId.BASE]]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
}

export const DEFAULT_API_URL = process.env.REACT_APP_API_URL || 'https://api.rai.finance'

type ApiURLList = {
  readonly [chainId in ChainId]: string
}

export const APILIST: ApiURLList = {
  [ChainId.MAINNET]: DEFAULT_API_URL + '/eth',
  [ChainId.ROPSTEN]: DEFAULT_API_URL,
  [ChainId.RINKEBY]: DEFAULT_API_URL + '/rinkeby',
  [ChainId.GÖRLI]: DEFAULT_API_URL,
  [ChainId.KOVAN]: DEFAULT_API_URL,
  [ChainId.POLYGON]: DEFAULT_API_URL + '/matic',
  [ChainId.BASE]: DEFAULT_API_URL + '/base',
  [ChainId.BASE_GOERLI]: DEFAULT_API_URL + '/base-goerli',
  [ChainId.PZT]: DEFAULT_API_URL + '/pzt',
  [ChainId.PZ]: DEFAULT_API_URL + '/pz',
  [ChainId.ZKSYNC]:  DEFAULT_API_URL + '/zksync',
  [ChainId.ZKSYNCTEST]: DEFAULT_API_URL + '/zktest',
  [ChainId.LOOT]: DEFAULT_API_URL + '/agld',
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))


export const RAIProxy_contract_address: { [chainId in ChainId]?: string } = {
  [ChainId.BASE]: '0x53BAE026d9a503d46a58aF4b65FCcbb7B904A911',
}