import React from 'react'
import { useTokenBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import StakingModal from 'components/earn/StakingModal'
import UnstakingModal from 'components/earn/UnstakingModal'
import ClaimRewardModal from 'components/earn/ClaimRewardModal'

export default function Modal({ stakingInfo, showStakingModal, setShowStakingModal, showUnstakingModal, setShowUnstakingModal, showClaimRewardModal, setShowClaimRewardModal }: any) {
    const { account, chainId } = useActiveWeb3React()
    const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
    return (
        <>
            {stakingInfo && (
                <>
                    <StakingModal
                        isOpen={showStakingModal}
                        onDismiss={() => setShowStakingModal(false)}
                        stakingInfo={stakingInfo}
                        userLiquidityUnstaked={userLiquidityUnstaked}
                    />
                    <UnstakingModal
                        isOpen={showUnstakingModal}
                        onDismiss={() => setShowUnstakingModal(false)}
                        stakingInfo={stakingInfo}
                    />
                    <ClaimRewardModal
                        isOpen={showClaimRewardModal}
                        onDismiss={() => setShowClaimRewardModal(false)}
                        stakingInfo={stakingInfo}
                    />
                </>
            )}
        </>
    )
}
