import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import dayjs from 'dayjs'
import Numeral from 'numeral'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IUniswapV2FactoryABI } from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import { ROUTER_ADDRESS, FACTORY_ADDRESS, zkUSDC, zkDAI, WETH, zkSOFI } from '../constants'
import { ChainId } from '../constants/chainId';
import { JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from 'zksdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { timeframeOptions } from '../constants'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: 'etherscan.io',
  3: 'ropsten.etherscan.io',
  4: 'rinkeby.etherscan.io',
  5: 'goerli.etherscan.io',
  42: 'kovan.etherscan.io',
  137: 'polygonscan.com',
  8453: 'basescan.org',
  84531: 'base goerli.',
  1442: 'pzt',
  1101: 'pz',
  280: 'zksync2-testnet.zkscan.io',
  324: 'explorer.zksync.io',
  5151706: 'explorer.lootchain.com'
}

export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address'): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string | undefined, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!address || !isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(chainId: ChainId | undefined, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS[chainId || ChainId.ZKSYNC], IUniswapV2Router02ABI, library, account)
}
function compareAddress(tokenA: Token, tokenB: Token, compareA: Token, compareB: Token) {
  return (tokenA.address.toLowerCase() === compareA.address.toLowerCase() && tokenB.address.toLowerCase() === compareB.address.toLowerCase()) || (tokenA.address.toLowerCase() === compareB.address.toLowerCase() && tokenB.address.toLowerCase() === compareA.address.toLowerCase())
}
// export function getPairAddress (tokenA: Token, tokenB: Token): string {
//   //WETH-DAI
//   if(compareAddress(tokenA, tokenB, WETH[ChainId.ZKSYNCTEST], zkDAI)){
//     return '0x0B179F98f2b51F76a5e109903CB325f5BF6F1948';
//   }
//   //WETH-USDC
//   if(compareAddress(tokenA, tokenB, WETH[ChainId.ZKSYNCTEST], zkUSDC)){
//     return '0x71A234f103bdCFD5A793A7c1618902feCe15B5D2';
//   }
//   //WETH-SOFI
//   if(compareAddress(tokenA, tokenB, WETH[ChainId.ZKSYNCTEST], zkSOFI)){
//     return '0xACa70a56Fa3cf6E2E097b8d444534119A96818B1';
//   }

//   return Pair.getAddress(tokenA, tokenB)
// }
export function getPairAddress (library: Web3Provider | undefined, tokenA: Token, tokenB: Token, chainId: ChainId | undefined) {
  if (!library || !chainId) return
  return  getContract(FACTORY_ADDRESS[chainId || ChainId.ZKSYNC], IUniswapV2FactoryABI, library).getPair(tokenA.address, tokenB.address)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function changeSymbol(chainId: ChainId | undefined, symbol: string | undefined):string|undefined{
  if(symbol === 'ETH' && chainId === ChainId.LOOT){
    return 'AGLD'
  }
  return symbol
}

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a')
}

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number, digits: number) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}

export const formattedNum = (number: any, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(parseFloat(num.toString()).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  return Number(parseFloat(num.toString()).toFixed(4)).toString()
}

export function getTimeframe(timeWindow: string) {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
      break
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
      break
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
      break
  }
  return utcStartTime
}
