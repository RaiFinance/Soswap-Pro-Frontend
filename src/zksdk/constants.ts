import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  
  GÖRLI = 5,
  KOVAN = 42,

  RINKEBY = 4,
  POLYGON = 137,
  BASE_GOERLI = 84531,
  BASE = 8453,
  PZT = 1442,
  PZ = 1101,
  ZKSYNC = 324,
  ZKSYNCTEST = 280,
  LOOT = 5151706,
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

// staging
// export const FACTORY_ADDRESS = '0x71B5Fef83c4FdC19736F2F8e4c5Ac92B2CD56667'
// production
export const FACTORY_ADDRESS = '0x2e5cd8fB90ECc8C227feCE339F7027bB7d8c4424'

export const INIT_CODE_HASH = '0x61d9d7e3b481b4f22339e6529035270e2b9e9d14fa58ff8cebe525ea002fbe2e'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}
