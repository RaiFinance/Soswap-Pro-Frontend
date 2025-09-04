import React, {useCallback, useState} from 'react'
import { Tabs, Table, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import moment from 'moment';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next'
import { TransactionResponse } from '@ethersproject/providers'
import { RouteComponentProps, Link, useHistory } from 'react-router-dom'
import { useActiveWeb3React } from '../../hooks'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme'
import useMarketModule from 'hooks/useMarketModule'
import { useMarketTransactionList, useMarketPositionList, useMarketBalances } from './hooks';
import BalancesChart from './BalancesChart';
import { useTransactionAdder } from 'state/transactions/hooks'
import { retry, RetryableError } from 'utils/retry'
import { PRED } from 'constants/index'
import { ChainId } from 'constants/chainId';
import './Transactions.less';

export type Tab = {
    name: string;
    index: number;
};
  
export const YES: Tab = {
    name: 'yes',
    index: 0,
};

export const NO: Tab = {
    name: 'no',
    index: 1,
};

export const LIQUIDITY: Tab = {
    name: 'liquidity',
    index: -1,
};

export const tabs: any = {
    '0': YES,
    '1': NO,
    '-1': LIQUIDITY,
}
  
const BUY = 'Buy';
const SELL = 'Sell';

const Redeem = ({market}: any) => {
  const { chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const [updatePrices, setUpdatePrices] = useState(false);
  const [updateShares, setUpdateShares] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const {
    marketContract,
  }:any = useMarketModule({
    marketAddress: market.market,
    updatePrices,
    updateShares,
    setUpdateShares,
  });

  const handleRedeem = useCallback(() => {
    const conditionId = market.conditionId
    const indexSets = [1, 2]
    if(marketContract && library){
      setLoading(true);
      marketContract.redeemPositions(PRED[chainId ?? ChainId.LOOT].address, conditionId, indexSets)
      .then((res: TransactionResponse) => {
        addTransaction(res, {
          summary: `Redeem Success`
        })
        retry(() => {
            return library
            .getTransactionReceipt(res.hash)
            .then((receipt: any) => {
                if (receipt === null) {
                    console.debug('Retrying for hash', res.hash)
                    throw new RetryableError()
                }
                if (receipt) {
                  setLoading(false);
                  setRedeemed(true);
                  console.log("trade receipt", receipt)
                }
            })
        }, {
            n: Infinity,
            minWait: 2500,
            maxWait: 3500
        })
    })
    .catch((error: any) => {
        alert(error.message)
        setLoading(false);
        console.log(error)
    })
    }
  },[marketContract])
  return <Button type='primary' onClick={handleRedeem} disabled={market.redeem || redeemed}>Redeem {loading && <LoadingOutlined />}</Button>
}

export default function Transactions(props: RouteComponentProps<{ id: string }>){
    const {
      match: {
        params: { id }
      }
    } = props
    const history = useHistory();
    const { chainId } = useActiveWeb3React()
    const [refreshPosition, setRefreshPosition] = useState<number>(1);
    const transaction = useMarketTransactionList();
    const marketPosition = useMarketPositionList(refreshPosition);
    const balances = useMarketBalances();
    const addTransaction = useTransactionAdder()
    const { t } = useTranslation()
    const transactionColumns = [
        {
          title: 'Total Transaction History',
          dataIndex: 'market_title',
          key: 'market_title',
        },
        {
          title: 'Action',
          dataIndex: 'action',
          key: 'action',
        },
        {
          title: 'Number of Shares',
          dataIndex: 'shares',
          key: 'shares',
        },
        {
          title: 'Volume',
          dataIndex: 'volume',
          key: 'volume',
        },
        {
          title: 'Detail',
          dataIndex: 'txid',
          key: 'txid',
          render: (txid: string) => {return chainId && <ExternalLink href={getEtherscanLink(chainId, txid, 'transaction')}>{t('view_on_explorer')}</ExternalLink>}
        }
    ];

    const marketPositionColumns = [
        {
          title: 'Total Transaction History',
          dataIndex: 'market_title',
          key: 'market_title',
        },
        {
          title: 'Outcome',
          dataIndex: 'outcome',
          key: 'outcome',
        },
        {
          title: 'Price : Avg. l Cur.',
          dataIndex: 'price_avg',
          key: 'price_avg',
          render: (price_avg: string, row: any) => `${price_avg} PRED | ${row.price_cur} PRED`
        },
        {
          title: "P/L : $ l %",
          dataIndex: 'profit_loss_percentage',
          key: 'profit_loss_percentage',
          render: (v: string) => v || '-'
        },
        {
          title: '#Shares',
          dataIndex: 'quantity',
          key: 'quantity',
        },
        {
          title: 'Value',
          dataIndex: 'value_cur',
          key: 'value_cur',
        },
        {
          title: 'Max Payout',
          dataIndex: 'max_payout',
          key: 'max_payout',
        },
        {
          title: '',
          dataIndex: 'status',
          render:(status: string, row: any) => {
            return status === 'resolved' ? <Redeem market={row} refreshPosition={() => {setRefreshPosition(refreshPosition + 1)}}/> : <Button type='primary' onClick={() => {history.push(`/predict/${row.market}`)}}>Trade</Button>
          }
        }
    ];

    return (
        <div className="transactions">
                <div>
                    <div className='chart'>
                        <div className='balance'>
                          <div>Portfolio Balance</div>
                          <div>{numeral(balances.balance).format('0,0.00')} PRED</div>
                        </div>
                        <BalancesChart data={balances.history}/>
                    </div>
                    <div className='history'>
                        <Tabs defaultActiveKey="1" type="card">
                            <Tabs.TabPane tab="Total Transaction History" key="1">
                                <Table dataSource={transaction} columns={transactionColumns} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Market Positions" key="2">
                                <Table dataSource={marketPosition.positions} columns={marketPositionColumns} />
                            </Tabs.TabPane>
                            {/* <Tabs.TabPane tab="Liquidity Positions" key="3">
                            Content of Tab Pane 3
                            </Tabs.TabPane> */}
                        </Tabs>
                    </div>
                </div>
            </div>
    )
}
