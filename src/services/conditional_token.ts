/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers, BigNumber } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

class ConditionalTokenService {
  provider: any;
  contract: Contract;

  constructor(provider: any, contract: Contract) {
    this.provider = provider;
    this.contract = contract;
  }

  get address(): string {
    return this.contract.address;
  }

  prepareCondition = async (
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount = 2,
  ): Promise<string> => {
    const transactionObject = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      BigNumber.from(outcomeSlotCount),
      {
        value: '0x0',
        gasLimit: 750000,
      },
    );
    console.log(`Prepare condition transaction hash: ${transactionObject.hash}`);
    await this.provider.waitForTransaction(transactionObject.hash);

    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    );

    return conditionId;
  };

  getCollectionIdForOutcome = async (conditionId: string, outcomeIndex: number): Promise<any> => {
    return this.contract.getCollectionId(ethers.constants.HashZero, conditionId, outcomeIndex);
  };

  getPositionId = async (collateralAddress: string, collectionId: string): Promise<any> => {
    return this.contract.getPositionId(collateralAddress, collectionId);
  };

  getBalanceOf = async (ownerAddress: string, positionId: BigNumber): Promise<BigNumber> => {
    return this.contract.balanceOf(ownerAddress, positionId);
  };

  getBalanceOfByBlock = async (
    ownerAddress: string,
    positionId: BigNumber,
    block: number,
  ): Promise<BigNumber> => {
    return this.contract.balanceOf(ownerAddress, positionId, {
      blockTag: block,
    });
  };

  setApprovalForAll = async (spender: string): Promise<TransactionReceipt> => {
    const transactionObject = await this.contract.setApprovalForAll(spender, true);
    return this.provider.waitForTransaction(transactionObject.hash);
  };

  isApprovedForAll = async (owner: string, spender: string): Promise<boolean> => {
    return this.contract.isApprovedForAll(owner, spender);
  };

  isConditionResolved = async (conditionId: string): Promise<boolean> => {
    const payoutDenominator: BigNumber = await this.contract.payoutDenominator(conditionId);

    return !payoutDenominator.isZero();
  };

  // redeemPositions = async (
  //   collateralToken: string,
  //   conditionId: string,
  //   outcomesCount: number,
  // ): Promise<TransactionReceipt> => {
  //   const indexSets = getIndexSets(outcomesCount);

  //   const transactionObject = await this.contract.redeemPositions(
  //     collateralToken,
  //     ethers.constants.HashZero,
  //     conditionId,
  //     indexSets,
  //   );

  //   return this.provider.waitForTransaction(transactionObject.hash);
  // };

  getOutcomeSlotCount = async (conditionId: string): Promise<BigNumber> => {
    return this.contract.getOutcomeSlotCount(conditionId);
  };

  getConditionId = (
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number,
  ): string => {
    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    );

    return conditionId;
  };

  doesConditionExist = async (conditionId: string): Promise<boolean> => {
    const outcomeSlotCount = await this.getOutcomeSlotCount(conditionId);
    return !outcomeSlotCount.isZero();
  };
}

export default ConditionalTokenService;
