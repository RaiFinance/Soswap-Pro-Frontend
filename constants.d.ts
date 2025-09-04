import JSBI from 'jsbi';
export declare type BigintIsh = JSBI | bigint | string;
export declare enum ChainId {
    MAINNET = 1,
    ROPSTEN = 3,

    GÖRLI = 5,
    KOVAN = 42,

    RINKEBY = 4,
    POLYGON = 137,
    BASE = 8453,
    BASE_GOERLI = 84531,
    PZT = 1442,
    PZ = 1101,
    ZKSYNC = 324,
    ZKSYNCTEST = 280,
    LOOT = 5151706,
}
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}

// staging
// export declare const FACTORY_ADDRESS = "0x71B5Fef83c4FdC19736F2F8e4c5Ac92B2CD56667";
// production
export declare const FACTORY_ADDRESS = "0x2e5cd8fB90ECc8C227feCE339F7027bB7d8c4424";
export declare const INIT_CODE_HASH = "0x63ee939074041f1d4ab151bce9c888969f0f4f6c46198e37e463cfe1aea7104b";

export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const TWO: JSBI;
export declare const THREE: JSBI;
export declare const FIVE: JSBI;
export declare const TEN: JSBI;
export declare const _100: JSBI;
export declare const _997: JSBI;
export declare const _1000: JSBI;
export declare enum SolidityType {
    uint8 = "uint8",
    uint256 = "uint256"
}
export declare const SOLIDITY_TYPE_MAXIMA: {
    uint8: JSBI;
    uint256: JSBI;
};