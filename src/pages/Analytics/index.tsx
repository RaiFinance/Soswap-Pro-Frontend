import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Tabs, Table } from 'antd';
import { Currency } from 'zksdk';
import { LinkOutlined } from '@ant-design/icons';
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import numeral from 'numeral';
import type { ColumnsType } from 'antd/es/table';
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { AutoRow, RowBetween } from 'components/Row'
import GlobalChart from './GlobalChart'
import { useGlobalData } from './hooks'
import { formattedNum } from '../../utils'
import './index.less'

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  align-items: start;
  justify-content: space-between;
`

export const formattedPercent = (percent: number, useBrackets = false) => {
  percent = parseFloat(percent.toString())
  if (!percent || percent === 0) {
    return <Text fontWeight={500}>0%</Text>
  }

  if (percent < 0.0001 && percent > 0) {
    return (
      <Text fontWeight={500} color="green">
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent < 0 && percent > -0.0001) {
    return (
      <Text fontWeight={500} color="red">
        {'< 0.0001%'}
      </Text>
    )
  }

  let fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return '0%'
  }
  if (percent > 0) {
    if (percent > 100) {
      return <Text fontWeight={500} color="green">{`+${percent?.toFixed(0).toLocaleString()}%`}</Text>
    } else {
      return <Text fontWeight={500} color="green">{`+${fixedPercent}%`}</Text>
    }
  } else {
    return <Text fontWeight={500} color="red">{`${fixedPercent}%`}</Text>
  }
}

export default function Analytics() {
  const {liquidity, volume, tokens, pairs, liquidityChange, volumeChange} = useGlobalData();
  // breakpoints
  const below800 = useMedia('(max-width: 800px)')
  const tokenColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      fixed: 'left',
      render: (name: string) =>  <AutoRow gap="5px">
      <img style={{width: '24px', height: '24px'}} src={`https://rai-static.s3.ap-northeast-1.amazonaws.com/sts/token/${name?.toLocaleLowerCase()}.png`} alt="" />
      <div>{name}</div>
    </AutoRow>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => `$${v}`,
      width: '20%',
    },
    {
      title: '24H%',
      dataIndex: 'price_change',
      key: 'price_change',
      width: '20%',
    },
    {
      title: '24H Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (v: number) => `$${numeral(v).format('0,0.00')}`,
      width: '20%',
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      render: (v: number) => `$${numeral(v).format('0,0.00')}`,
      width: '20%',
      sorter: (a, b) => a.liquidity - b.liquidity,
    }
  ]

  const pairsColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      fixed: 'left',
      render: (name: string) =>  {
        const [token0, token1] = name.split('-');
        return (<AutoRow gap="5px">
          <div>
            <img style={{width: '24px', height: '24px'}} src={`https://rai-static.s3.ap-northeast-1.amazonaws.com/sts/token/${token0?.toLocaleLowerCase()}.png`} alt="" />
            <img style={{width: '24px', height: '24px', marginLeft: '-4px'}} src={`https://rai-static.s3.ap-northeast-1.amazonaws.com/sts/token/${token1?.toLocaleLowerCase()}.png`} alt="" />  
          </div>
          <div>{name}</div>
        </AutoRow>)
        }
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      render: (v: number) => `$${numeral(v).format('0,0.00')}`,
      width: '30%',
      sorter: (a, b) => a.liquidity - b.liquidity,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (v: number) => `$${numeral(v).format('0,0.00')}`,
      width: '30%'
    },
    {
      title: 'APR',
      dataIndex: 'apr',
      key: 'apr',
      width: '20%',
      render: (apr: string,record: any) => { return record.name == 'Rebase-USDbC' ? <a href='https://www.rebasebase.com/' target='_blank'>{apr}&nbsp;<LinkOutlined /></a> : apr}
    },
  ]

  return(
    <div className='analytics'>
      <h1>Overview</h1>
      {below800 && ( // mobile card
            <AutoColumn gap="36px">
              <AutoColumn gap="20px">
                <RowBetween>
                    Volume (24hr)
                  <div />
                </RowBetween>
                <RowBetween align="flex-start">
                  <div>{volume.length > 0 ? formattedNum(volume[volume.length -1].value, true) : '-'}</div>
                  <div>{formattedPercent(volumeChange) || '-'}</div>
                </RowBetween>
              </AutoColumn>
              <AutoColumn gap="20px">
                <RowBetween>
                    Total Liquidity
                  <div />
                </RowBetween>
                <RowBetween align="flex-start">
                    <div>{liquidity.length > 0 ? formattedNum(liquidity[liquidity.length -1].value, true) : '-'}</div>
                    <div>{formattedPercent(liquidityChange) || '-'}</div>
                </RowBetween>
              </AutoColumn>
            </AutoColumn>
      )}
      {below800 && (
          <AutoColumn style={{ marginTop: '6px' }} gap="24px">
            <div className='chart' style={{ height: '100%', minHeight: '300px' }}>
              <GlobalChart display="liquidity" data={liquidity} change={liquidityChange}/>
            </div>
          </AutoColumn>
      )}
      {!below800 &&<GridRow>
        <div className='chart'>
          <GlobalChart display="liquidity" data={liquidity} change={liquidityChange}/>
        </div>
        <div className='chart'>
          <GlobalChart display="volume" data={volume} change={volumeChange}/>
        </div>
      </GridRow>
      }
      <div className='tokens'>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Top Tokens" key="1">
            <Table columns={tokenColumns} dataSource={tokens} scroll={{ x: 400 }}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Top Pairs" key="2">
            <Table 
              columns={pairsColumns}
              dataSource={pairs}
              scroll={{ x: 400 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  )
}