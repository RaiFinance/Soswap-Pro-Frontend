import { currencyEquals, Trade } from 'zksdk'
import React, { useCallback, useMemo, useContext } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../TransactionConfirmationModal'
import { AutoColumn, ColumnCenter } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import { ButtonError } from 'components/Button'
import { CloseIcon, CustomLightSpinner } from 'theme/components'
import { TruncatedText, SwapShowAcceptChanges } from 'components/swap/styleds'
import CurrencyLogo from 'components/CurrencyLogo'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { useActiveWeb3React } from 'hooks'
import { changeSymbol } from 'utils/index'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function AggregatorConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash
}: {
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const modalHeader = useCallback(() => {
    return trade ? (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <RowFixed gap={'0px'}>
            <CurrencyLogo currency={trade.inputAmount?.currency} size={'24px'} style={{ marginRight: '12px' }} />
            <TruncatedText
              fontSize={24}
              fontWeight={500}
              color={theme.text1}
            >
              {trade.inputAmount.toSignificant(6)}
            </TruncatedText>
          </RowFixed>
          <RowFixed gap={'0px'}>
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {changeSymbol(chainId, trade.inputAmount.currency.symbol)}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
        </RowFixed>
        <RowBetween align="flex-end">
          <RowFixed gap={'0px'}>
            <CurrencyLogo currency={trade.outputAmount.currency} size={'24px'} style={{ marginRight: '12px' }} />
            <TruncatedText
              fontSize={24}
              fontWeight={500}
              color={theme.text1}
            >
              {trade.outputAmount.toSignificant(6)}
            </TruncatedText>
          </RowFixed>
          <RowFixed gap={'0px'}>
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {changeSymbol(chainId, trade.outputAmount.currency.symbol)}
            </Text>
          </RowFixed>
        </RowBetween>
    </AutoColumn> 
    ) : null
  }, [onAcceptChanges, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <ButtonError
        onClick={onConfirm}
        disabled={showAcceptChanges}
        style={{ margin: '10px 0 0 0' }}
        id="confirm-swap-or-send"
      >
        <Text fontSize={20} fontWeight={500}>
          {'Confirm Swap'}
        </Text>
      </ButtonError>
    ) : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade])

  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
    changeSymbol(chainId, trade?.inputAmount?.currency?.symbol)
  } for ${trade?.outputAmount?.toSignificant(6)} ${changeSymbol(chainId, trade?.outputAmount?.currency?.symbol)}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Swap"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount?.currency}
    />
  )
}
