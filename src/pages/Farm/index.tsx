import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { TokenAmount } from 'zksdk';
import { Table, Space, Switch, Radio } from 'antd'
import type { RadioChangeEvent } from 'antd';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next'
import { ColumnsType } from 'antd/es/table'
import { useStakingInfo, useAPR } from 'state/stake/hooks'
import CurrencyLogo from '../../components/CurrencyLogo'
import Modal from './Modal'
import { useActiveWeb3React } from '../../hooks'
import { ButtonPrimary, ButtonLight, ButtonGray } from '../../components/Button'
import { Rebase, USDbc } from 'constants/index'

export default function Farm() {
  const stakingInfos = useStakingInfo()
  const APRs = useAPR();
  const { chainId } = useActiveWeb3React()
  console.log("stakingInfos", stakingInfos)
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnStakingModal, setShowUnStakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [sortedData, setSortedData] = useState([])
  const [stakingInfo, setStakingInfo] = useState<any>()
  const [staked, setStaked] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const { t } = useTranslation()
  const history = useHistory();
  const FarmColumn: ColumnsType<any> = [
    {
      title: t('pool'),
      dataIndex: 'tokens',
      key: 'tokens',
      align: 'center',
      width: '20%',
      fixed: 'left',
      render: (text: any, record: any) => {
        return (
          <StyleTokenName onClick={() => {
            history.push(`/add/${record.tokens[1]?.address}/${record.tokens[0]?.address}`)
          }}>
            <CurrencyLogo currency={text[0]} size={'24px'} />
            <CurrencyLogo currency={text[1]} size={'24px'} />
            {/* <DoubleCurrencyLogo currency0={text[0].symbol} currency1={text[1].symbol} /> */}
            &nbsp;
            {`${text[0].symbol}-${text[1].symbol} SLP`} 
          </StyleTokenName>
        )
      }
    },
    {
      title: t('APR'),
      dataIndex: 'tokens',
      key: 'tokens',
      align: 'center',
      width: '10%',
      render: (tokens: any) => APRs[`${tokens[0].symbol}-${tokens[1].symbol}`]?.apr || '-'
    },
    {
      title: t('Liquidity'),
      dataIndex: 'tokens',
      key: 'tokens',
      align: 'center',
      width: '10%',
      render: (tokens: any, record: any) => `${record.tokens[0].symbol}-${record.tokens[1].symbol}` === 'Rebase-USDbC' ? '0.00' : numeral(APRs[`${tokens[0].symbol}-${tokens[1].symbol}`]?.staked_lp_usd).format('$0,0.00') || '-'
    },
    {
      title: `${t('staked')}`,
      dataIndex: 'stakedAmount',
      key: 'stakedAmount',
      align: 'center',
      width: '10%',
      render: (stakedAmount: TokenAmount, record: any) => {
        return `${record.tokens[0].symbol}-${record.tokens[1].symbol}` === 'Rebase-USDbC' ? numeral(APRs[`${record.tokens[0].symbol}-${record.tokens[1].symbol}`]?.staked_lp_usd).format('$0,0.00') : numeral(stakedAmount?.toFixed(6)).format("0,0.000000")
      }
    },
    {
      title: t('rewards'),
      dataIndex: 'earnedAmount',
      key: 'earnedAmount',
      align: 'center',
      width: '10%',
      render: (earnedAmount: TokenAmount, record: any) => {
        return (
          <>
          {numeral(earnedAmount?.toFixed(6)).format("0,0.000000")}
          {Number(earnedAmount?.toFixed(6)) > 0 && <ButtonLight height={'30px'} width="auto" padding={'0px 20px'} onClick={() => {setStakingInfo(record); setShowClaimRewardModal(true)}}>{t('claim')}</ButtonLight>}    
          </>
        )
      }
    },
    {
      title: `${t('Balance')}`,
      dataIndex: 'lpBalanceAmount',
      key: 'lpBalanceAmount',
      align: 'center',
      width: '10%',
      render: (lpBalanceAmount: TokenAmount, record: any) => {
        return (
          <>
          {numeral(lpBalanceAmount?.toFixed(6)).format("0,0.000000")}
          </>
        )
      }
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      key: 'operations',
      align: 'center',
      width: '20%',
      render: (_: any, record: any) => {
        const now = new Date().getTime()
        return (
          <>{
            `${record.tokens[0].symbol}-${record.tokens[1].symbol}` === 'Rebase-USDbC' ?
            <ButtonPrimary height={'30px'} width="auto" padding={'0px 20px'} onClick={() => {window.open('https://www.rebasebase.com/')}}>{t('Stake')}</ButtonPrimary> :
            (record?.periodFinish?.getTime() > now) ?
            <ButtonContainer>
              {record.stakedAmount?.toSignificant(4) > 0 && <ButtonLight height={'30px'} width="auto" padding={'0px 20px'}onClick={() => { setStakingInfo(record); setShowUnStakingModal(true); }}>{t('Unstake')}</ButtonLight>}
              <ButtonPrimary height={'30px'} width="auto" padding={'0px 20px'} onClick={() => {
                setStakingInfo(record)
                setShowStakingModal(true)
              }}>{t('Stake')}</ButtonPrimary>
            </ButtonContainer>
            :
            <ButtonGray height={'30px'} width="auto" padding={'0px 20px'} disabled>Finished</ButtonGray>
          }</>
        )
      }
    },
  ]

  const handleLiveChange = ({ target: { value } }: RadioChangeEvent) => {
    setIsLive(value)
  }

  useEffect(() => {
    if(chainId){
      let arr: any = [
        {
          tokens: [Rebase[chainId], USDbc[chainId]]
        }
      ];
      if(stakingInfos.length > 0){
        const now = new Date().getTime()
        if(isLive){
          const arr1 = stakingInfos.filter((v: any) => v.periodFinish.getTime() > now)
          arr = arr.concat(arr1)
        }else {
          const arr2 = stakingInfos.filter((v: any) => v.periodFinish.getTime() <= now)
          arr = arr2
        }
        if(staked){
          arr = sortedData.filter((v: any) => v?.stakedAmount?.toExact() > 0)
        }
      }
      setSortedData(arr)
    }
  }, [isLive, staked, stakingInfos, chainId])

  return (
      <UserFarm>
        <FarmContent>
          <FarmWraper>
            <FarmTitle>Farm</FarmTitle>
            <Space align="center" size={20} style={{ marginBottom: 16 }}>
              <Space align="center">
                Staked only: <Switch checked={staked} onChange={setStaked} />
              </Space>
              <Radio.Group style={{display: 'flex'}} value={isLive} onChange={handleLiveChange}>
                <Radio.Button value={true}>Live</Radio.Button>
                <Radio.Button value={false}>Finished</Radio.Button>
              </Radio.Group>
            </Space>
            <Table
              dataSource={sortedData}
              columns={FarmColumn}
              pagination={false}
              rowKey="stakingRewardAddress"
              scroll={{x: 700}}
            />
          </FarmWraper>
        </FarmContent>
        <Modal 
          showStakingModal={showStakingModal}
          setShowStakingModal={setShowStakingModal} 
          showUnstakingModal={showUnStakingModal} 
          setShowUnstakingModal={setShowUnStakingModal}
          showClaimRewardModal={showClaimRewardModal} 
          setShowClaimRewardModal={setShowClaimRewardModal}
          stakingInfo={stakingInfo}
        />
      </UserFarm>
  ) 
}

const UserFarm = styled.div`
  /* padding-top: 68px; */
  width: 100%;
  padding: 1rem 8rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0;
  `};
`

const FarmContent = styled.div`
  /* padding-top: 70px; */
  margin: 0 auto;
`

const FarmTitle = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
`
const FarmBanner = styled.div`
  width: 100%;
  margin-bottom: 30px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
  }
`

const CommonWraper = styled.div`
  padding-bottom: 50px;
`
const FarmWraper = styled(CommonWraper)`
  .ant-table-thead > tr > th {
    background: #FFFFFF;
    color: ${({ theme }) => theme.text1};
  }
  .ant-switch-checked{
    background: var(--primary-color);
  }
  .ant-radio-group{
    .ant-radio-button-wrapper{
      overflow: hidden;
      &:first-child{
        border-radius: 8px 0 0 8px;
      }
      &:last-child{
        border-radius: 0 8px 8px 0;
      }
    }
    .ant-radio-button-wrapper-checked{
      border-color: var(--primary-color)!important;
      background: var(--primary-color);
      color: #fff;
      &:hover,&:focus{
        border-color: var(--primary-color)!important;
        background: var(--primary-color);
        color: #fff;
        box-shadow: none;
        outline: 0;
      }
    }
  }
`

const StyleTokenName = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover{
    color: var(--primary-color);
  }
  img, svg {
    margin-right: 8px;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  button{
    &:first-of-type{
      margin-right: 10px;
    }
  }
`