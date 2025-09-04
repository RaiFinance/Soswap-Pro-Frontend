import { CurrencyAmount, JSBI, Token, Trade } from 'zksdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { BigNumber } from '@ethersproject/bignumber'
import styled, { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import AggregatorConfirmSwapModal from '../../components/swap/AggregatorConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'
import { useRAIProxyContract } from '../../hooks/useContract'
import { ChainId } from 'constants/chainId';
import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE, RAIProxy_contract_address } from '../../constants'
import { getTradeVersion, isTradeBetter } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { usePairIsInAggregator } from 'state/lists/hooks'
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import Settings from '../../components/Settings'

const SwapTitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`
const SwapTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryText1};
`

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const addTransaction = useTransactionAdder()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const [useRouter, setUseRouter] = useState<string>("")
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const { account, chainId } = useActiveWeb3React()
  const RAIProxy = useRAIProxyContract(RAIProxy_contract_address[chainId || ChainId.BASE])
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    aggregatorTrade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const trade = showWrap
    ? undefined
    : {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade
      }[toggledVersion]

  const betterTradeLinkVersion: Version | undefined =
    toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
      ? Version.v1
      : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
      ? Version.v2
      :  undefined

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : (aggregatorTrade?.inputAmount || trade?.inputAmount),
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : (aggregatorTrade?.outputAmount || trade?.outputAmount)
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  // const [showAggregatorConfirm, setShowAggregatorConfirm] = useState<boolean>(false)

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const [{ showAggregatorConfirm, aggregatorTradeToConfirm, swapAggregatorErrorMessage, attemptingAggregatorTxn, aggregatorTxHash }, setAggregatorSwapState] = useState<{
    showAggregatorConfirm: boolean
    aggregatorTradeToConfirm: any
    attemptingAggregatorTxn: boolean
    swapAggregatorErrorMessage: string | undefined
    aggregatorTxHash: string | undefined
  }>({
    showAggregatorConfirm: false,
    aggregatorTradeToConfirm: undefined,
    attemptingAggregatorTxn: false,
    swapAggregatorErrorMessage: undefined,
    aggregatorTxHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  const [aggregatorApproval, aggregatorApprovalCallback] = useApproveCallback(parsedAmounts[independentField], RAIProxy_contract_address[chainId || ChainId.BASE])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const [aggregatorApprovalSubmitted, setAggregatorApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (aggregatorApproval === ApprovalState.PENDING) {
      setAggregatorApprovalSubmitted(true)
    }
  }, [aggregatorApproval, aggregatorApprovalSubmitted])

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  const aggregatorSwapCallback = useCallback(async() => {
    let resTrade = new Promise((reject) => {
      reject({ message: 'RAIProxy is required.' });
    });
    if (RAIProxy) {
      if (currencies[Field.INPUT]?.symbol === "ETH" || currencies[Field.INPUT]?.symbol === "MATIC") {
        resTrade = await RAIProxy.tradeTokenByExactETH(
          aggregatorTrade.route,
          //@ts-ignore
          currencies[Field.OUTPUT]?.address,
          0,
          account,
          {"value": `0x${parsedAmounts[independentField]?.raw.toString(16)}`}
        )
      } else if (currencies[Field.OUTPUT]?.symbol === "ETH" || currencies[Field.OUTPUT]?.symbol === "MATIC") {
        resTrade = await RAIProxy.tradeETHByExactToken(
          aggregatorTrade.route,
          //@ts-ignore
          currencies[Field.INPUT]?.address,
          `0x${parsedAmounts[independentField]?.raw.toString(16)}`,
          0,
          account
        )
      } else {
        resTrade = await RAIProxy.tradeTokenByExactToken(
          aggregatorTrade.route,
          //@ts-ignore
          currencies[Field.INPUT]?.address,
          //@ts-ignore
          currencies[Field.OUTPUT]?.address,
          `0x${parsedAmounts[independentField]?.raw.toString(16)}`,
          0,
          account
        )
      }
    }
    return resTrade
  },[aggregatorTrade, currencies, parsedAmounts, account])

  const handleAggregatorSwap = useCallback(async() => {
    if (!aggregatorSwapCallback) {
      return
    }
    setAggregatorSwapState({ attemptingAggregatorTxn: true, aggregatorTradeToConfirm, showAggregatorConfirm, swapAggregatorErrorMessage: undefined, aggregatorTxHash: undefined })
    aggregatorSwapCallback()
    .then((res:any)  => {
      // const hash = "0x8977f11e0db2b90570fc74593f41d773792d9f8858668cca4e003bd299d36626"
      setAggregatorSwapState({ attemptingAggregatorTxn: false, aggregatorTradeToConfirm, showAggregatorConfirm, swapAggregatorErrorMessage: undefined, aggregatorTxHash: res.hash })
      const inputSymbol = currencies[Field.INPUT]?.symbol
      const outputSymbol = currencies[Field.OUTPUT]?.symbol
      const inputAmount = aggregatorTrade.inputAmount.toSignificant(3)
      const outputAmount = aggregatorTrade.outputAmount.toSignificant(3)

      const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

      addTransaction(res, {
        summary: base
      })
    })
    .catch(error => {
      setAggregatorSwapState({
        attemptingAggregatorTxn: false,
        aggregatorTradeToConfirm,
        showAggregatorConfirm,
        swapAggregatorErrorMessage: error.message,
        aggregatorTxHash: undefined
      })
    })
  }, [
    currencies, aggregatorTrade, aggregatorTradeToConfirm, aggregatorSwapCallback, aggregatorTradeToConfirm, 
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const showAggregatorApproveFlow =  
    !swapInputError &&
    (aggregatorApproval === ApprovalState.NOT_APPROVED ||
      aggregatorApproval === ApprovalState.PENDING ||
      (aggregatorApprovalSubmitted && aggregatorApproval === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAggregatorConfirmDismiss = useCallback(() => {
    setAggregatorSwapState({ showAggregatorConfirm: false, aggregatorTradeToConfirm, attemptingAggregatorTxn, swapAggregatorErrorMessage, aggregatorTxHash })
    // if there was a tx hash, we want to clear the input
    if (aggregatorTxHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingAggregatorTxn, onUserInput, swapAggregatorErrorMessage, aggregatorTradeToConfirm, aggregatorTxHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleAggregatorAcceptChanges = useCallback(() => {
    setAggregatorSwapState({ aggregatorTradeToConfirm: aggregatorTrade, swapAggregatorErrorMessage, aggregatorTxHash, attemptingAggregatorTxn, showAggregatorConfirm })
  }, [attemptingAggregatorTxn, showAggregatorConfirm, swapAggregatorErrorMessage, aggregatorTrade, aggregatorTxHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      setAggregatorApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const handleClear = () => {
    window.localStorage.clear();
    window.location.reload();
  }

  return (
    <>
      {/* <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      /> */}
      <AppBody>
        {/* <SwapPoolTabs active={'swap'} /> */}
        <SwapTitleBox>
          <SwapTitle>SWAP</SwapTitle>
          <Settings />
        </SwapTitleBox>
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AggregatorConfirmSwapModal
            isOpen={showAggregatorConfirm}
            trade={aggregatorTrade}
            originalTrade={aggregatorTradeToConfirm}
            onAcceptChanges={handleAggregatorAcceptChanges}
            attemptingTxn={attemptingAggregatorTxn}
            txHash={aggregatorTxHash}
            onConfirm={handleAggregatorSwap}
            swapErrorMessage={swapAggregatorErrorMessage}
            onDismiss={handleAggregatorConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.text1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14} color={theme.text2}>
                        Price
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        Slippage Tolerance
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )}
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : !aggregatorTrade?.route && noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
              </GreyCard>
            ) : aggregatorTrade ? 
            (showAggregatorApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={aggregatorApprovalCallback}
                  disabled={aggregatorApproval !== ApprovalState.NOT_APPROVED || aggregatorApprovalSubmitted}
                  width="48%"
                  altDisabledStyle={aggregatorApproval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={aggregatorApproval === ApprovalState.APPROVED}
                >
                  {aggregatorApproval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : aggregatorApprovalSubmitted && aggregatorApproval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleAggregatorSwap()
                    } else {
                      setAggregatorSwapState({
                        aggregatorTradeToConfirm: aggregatorTrade,
                        attemptingAggregatorTxn: false,
                        swapAggregatorErrorMessage: undefined,
                        showAggregatorConfirm: true,
                        aggregatorTxHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || aggregatorApproval !== ApprovalState.APPROVED
                  }
                  // error={isValid}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {`Swap`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleAggregatorSwap()
                  } else {
                    setAggregatorSwapState({
                      aggregatorTradeToConfirm: aggregatorTrade,
                      attemptingAggregatorTxn: false,
                      swapAggregatorErrorMessage: undefined,
                      showAggregatorConfirm: true,
                      aggregatorTxHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid}
                // error={isValid}
              >
                <Text fontSize={20} fontWeight={500}>
                  {swapInputError
                    ? swapInputError
                    : `Swap`}
                </Text>
              </ButtonError>
            ))
            :(showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text fontSize={20} fontWeight={500}>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact Too High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </Text>
              </ButtonError>
            ))}
            {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
            {showAggregatorApproveFlow && <ProgressSteps steps={[aggregatorApproval === ApprovalState.APPROVED]} />}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      <AdvancedSwapDetailsDropdown trade={trade} />
    </>
  )
}
