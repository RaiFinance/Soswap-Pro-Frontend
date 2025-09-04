import { ethers, Contract, constants, utils } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units'
import CT_ABI from 'constants/abis/FpmmConditionalTokens.json';
import ERC20_ABI from 'constants/abis/erc20.json'
import { getProviderOrSigner } from 'utils/index';

const BN = BigNumber.from;

class FixedProductMarketMakerService {
  contract: Contract;
  busdAddress: string;
  account: string;
  library: Web3Provider;
  erc20Contract: Contract;
  conditionalTokensContract: Contract;

  constructor(contract: Contract, busdAddress: string, library: Web3Provider, account = '') {
    this.contract = contract;
    this.busdAddress = busdAddress;
    this.account = account;
    this.library = library;

    this.erc20Contract = new Contract(
      busdAddress,
      ERC20_ABI,
      getProviderOrSigner(library, account) as any,
    );

    this.conditionalTokensContract = new Contract(
      this.contract.conditionalTokens(),
      CT_ABI,
      getProviderOrSigner(library, account) as any,
    );
  }

  get address(): string {
    return this.contract.address;
  }

  getPositionId = async (collateralAddress: string, collectionId: string): Promise<BigNumber> => {
    return this.conditionalTokensContract.getPositionId(collateralAddress, collectionId);
  };

  getBalanceOf = async (positionId: BigNumber): Promise<BigNumber> => {
    return this.conditionalTokensContract.balanceOf(this.account, positionId.toString());
  };

  getTestPool = async () => {
    console.log(await this.contract.conditionIds(0));
    const pool = await this.contract.getPoolBalances();
    console.log(utils.formatEther(pool));
    console.log(pool.toString());
    return pool;
  };

  getPoolBalances = async (numberOfOutcomes: number): Promise<BigNumber[]> => {
    const collateralTokenAddress = await this.contract.collateralToken();
    const balances = [];

    for (let outcome = 0; outcome < numberOfOutcomes; outcome++) {
      const conditionId = await this.contract.conditionIds(0);
      const collectionId = await this.conditionalTokensContract.getCollectionId(
        ethers.constants.HashZero,
        conditionId,
        1 << outcome,
      );

      const positionIdForCollectionId = await this.getPositionId(
        collateralTokenAddress,
        collectionId,
      );

      const balance = await this.conditionalTokensContract.balanceOf(
        this.account,
        positionIdForCollectionId,
      );
      balances.push(balance);
    }

    return balances;
  };

  getConditionalTokenAddress = async (): Promise<string> => {
    return this.contract.conditionalTokens();
  };

  getCollateralToken = async (): Promise<string> => {
    return this.contract.collateralToken();
  };

  getFee = async (): Promise<BigNumber> => {
    return this.contract.fee();
  };

  // Note: Stage is running by default.
  /* eslint-disable class-methods-use-this */
  getStage = async (): Promise<number> => {
    return new Promise((resolve) => {
      resolve(0);
    });
  };

  getConditionId = async () => {
    return await this.contract.conditionIds(0);
  };

  getTotalSupply = async (): Promise<BigNumber> => {
    return this.contract.totalSupply();
  };

  getFeesWithdrawableBy = async (account: string): Promise<number> => {
    return this.contract.feesWithdrawableBy(account);
  };

  calcBuyAmount = async (
    investmentAmount: string | number | BigNumber,
    outcomeIndex: number,
  ): Promise<BigNumber> => {
    return this.contract.calcBuyAmount(investmentAmount, outcomeIndex);
  };

  calcSellAmount = async (
    returnAmount: number | BigNumber,
    outcomeIndex: number,
  ): Promise<BigNumber> => {
    return this.contract.calcSellAmount(returnAmount, outcomeIndex);
  };

  calcTokenPrice = async (outcomeIndex: number, action = 'buy'): Promise<string> => {
    const amount =
      action === 'buy'
        ? await this.calcBuyAmount(utils.parseEther('1'), outcomeIndex)
        : await this.calcSellAmount(utils.parseEther('1'), outcomeIndex);
    return (1 / parseFloat(utils.formatEther(amount))).toFixed(5);
  };

  buy = async (investmentAmount: BigNumber, outcomeIndex: number) => {
    if (!this.account)
      return new Promise((reject) => {
        reject({ message: 'Account is required.' });
      });

    try {
      // const tradeAmountInWei = investmentAmount.mul(1e18).toFixed(0);
      // Note: There is a withdrawFees method.
      const fee: BigNumber = await this.getFee();
      const buyAmount: BigNumber = await this.calcBuyAmount(investmentAmount, outcomeIndex);
      const neededAmount: BigNumber = buyAmount.add(fee);

      const allowance: BigNumber = await this.erc20Contract.allowance(
        this.account,
        this.contract.address,
      );
      const hasEnoughAllowance = allowance.gte(neededAmount);

      if (!hasEnoughAllowance) {
        const transaction = await this.erc20Contract.approve(
          this.contract.address,
          constants.MaxUint256,
          {
            value: '0x0',
          },
        );

        await this.library?.waitForTransaction(transaction.hash);
      }
      return await this.contract.buy(investmentAmount, outcomeIndex, buyAmount);
    } catch (err) {
      console.error(
        `There was an error buying '${formatUnits(investmentAmount, 18)}' for outcome '${outcomeIndex}'`,
      );
      throw err;
    }
  };

  sell = async (returnAmount: BigNumber, outcomeIndex: number, maxSellAmount: BigNumber) => {
    if (!this.account)
      return new Promise((reject) => {
        reject({ message: 'Account is required.' });
      });

    try {
      // const convertedTradeAmount = utils.parseEther(returnAmount.toString());
      const amount: BigNumber = await this.calcSellAmount(returnAmount, outcomeIndex);
      const isApproved = await this.conditionalTokensContract.isApprovedForAll(this.account, this.contract.address)
      if(!isApproved){
        await this.conditionalTokensContract.setApprovalForAll(this.contract.address, true);
      }
      return await this.contract.sell(returnAmount, outcomeIndex, maxSellAmount);
    } catch (err) {
      console.error(
        `There was an error selling '${formatUnits(returnAmount, 18)}' for outcome '${outcomeIndex}'`,
      );
      throw err;
    }
  };

  addFunding = async (addedFunds: BigNumber) => {
    try {
      return await this.contract.addFunding(addedFunds, []);
    } catch (err) {
      console.error(`There was an error adding '${formatUnits(addedFunds, 18)}' to funds.'`);
      throw err;
    }
  };

  removeFunding = async (sharesToBurn: BigNumber) => {
    try {
      return await this.contract.removeFunding(sharesToBurn);
    } catch (err) {
      console.error(`There was an error removing '${formatUnits(sharesToBurn, 18)}' from funds.`);
      throw err;
    }
  };

  redeemPositions = async (
    collateralToken: string,
    conditionId: string,
    indexSets: number[]
  ): Promise<TransactionReceipt> => {

    const transactionObject = await this.conditionalTokensContract.redeemPositions(
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      indexSets,
    );

    return transactionObject;
  };
}

export default FixedProductMarketMakerService;
