import React, {useCallback, useEffect, useState} from 'react'
import { BigNumber } from 'ethers';
import { JSBI, TokenAmount } from 'zksdk'
import { Avatar, Segmented, Form, Card, Button, Input, Slider, message } from 'antd';
import { UserOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import moment from 'moment';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { useActiveWeb3React } from '../../hooks'
import { useMarketDetail } from './hooks';
import Chart from './Chart';
import YesNoChart from './YesNoChart';
import { retry, RetryableError } from 'utils/retry'
import useMarketModule from 'hooks/useMarketModule'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { PRED } from 'constants/index'
import { ChainId } from 'constants/chainId';
import ConfirmModal from './ConfirmModal'
import { PriceChartRangeOption } from 'constants/priceChartEnums'
import { useTransactionAdder } from 'state/transactions/hooks'
import {ReactComponent as BackIcon} from 'assets/images/predict/back.svg'
import {ReactComponent as ShareIcon} from 'assets/images/predict/share.svg'
import {ReactComponent as BookmarkIcon} from 'assets/images/predict/bookmark.svg'
import {ReactComponent as CalendarIcon} from 'assets/images/predict/calendar.svg'
import './PredictDetail.less';

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
  
export const BUY = 'Buy';
export const SELL = 'Sell';

const DEFAULT_AMOUNT = {buy: 0, sell: 0};
const inputRegex = /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/
const sellInputRegex = /^[1-9]\d*$/

export default function PredictDetail(props: RouteComponentProps<{ id: string }>){
    const {
      match: {
        params: { id }
      }
    } = props
    const history = useHistory();
    const toggleWalletModal = useWalletModalToggle()
    const [chartRange, setChartRange] = useState<string>(PriceChartRangeOption.WEEKLY_PRICE_RANGE)
    const [refresh, setRefresh] = useState<number>(1)
    const market = useMarketDetail(id, chartRange, refresh);
    const [activeTab, setActiveTab] = useState<number>(YES.index);
    const [activeAction, setActiveAction] = useState(BUY);
    const { chainId, library, account } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const [loading, setLoding] = useState(false)
    const [updatePrices, setUpdatePrices] = useState(false);
    const [updateShares, setUpdateShares] = useState(false);
    const [updateBalance, setUpdateBalance] = useState(false);
    const [showConfirmModal,  setShowConfirmModal] = useState(false)
    const [agree,  setAgree] = useState(false)
    const [form] = Form.useForm();
    const [otherAmount, setOtherAmount] = useState<string>('0');
    const [avgPrice, setAvgPrice] = useState<number>(0);
    const [maxBuyAmount, setMaxBuyAmount] = useState<number>(0);
    const [maxSellAmount, setMaxSellAmount] = useState<number>(0);
    const [potentialReturns, setPotentialReturns] = useState<number>(0);
    const [roi, setROI] = useState<any>({ yes: 0, no: 0 });
    const  amount = Form.useWatch('amount', form);
    const preadBalance = useCurrencyBalance(account ?? undefined, PRED[chainId ?? ChainId.LOOT])
    const { t } = useTranslation()
    const {
        prices = { yes: '0', no: '0' },
        shareBalances,
        fee,
        marketLiquidity,
        marketContract,
      }:any = useMarketModule({
        marketAddress: market.market,
        updatePrices,
        updateShares,
        setUpdateShares,
      });


    const [approval, approveCallback] = useApproveCallback(new TokenAmount(PRED[chainId ?? ChainId.LOOT], JSBI.BigInt(100000000000000000000)), market.market)
    const chartData = market.outcomeHistory && market.outcomeHistory.map((v: any) => {return {ts: v[0], yes: v[1], no: v[2], liquidity: v[3]}});

    const onFinish = (values: any) => {
        if (approval !== ApprovalState.APPROVED) {
            console.log("not approve:", approval);
            approveCallback()
            return;
        }
        if(!agree){
            setShowConfirmModal(true);
            return;
        }
    };

    const handleUpdateShares = () => {
        if (!updateShares) setUpdateShares(true);
    };

    useEffect(() => {
        if (updatePrices) setUpdatePrices(false);
    }, [market.market]);

    const handleBuySell = useCallback(async(values: any) => {
        if(marketContract && library){
            console.log('values:', values)
            if(activeAction === SELL){
                if(await getMaxSellAmount(values.amount)){
                    return;
                }
            }
            setLoding(true);
            const action =
            activeAction === BUY
                ? activeTab === LIQUIDITY.index
                ? marketContract.addFunding(parseUnits(values.amount, 18))
                : marketContract.buy(parseUnits(values.amount, 18), activeTab)
                : activeTab === LIQUIDITY.index
                ? marketContract.removeFunding(parseUnits(values.amount, 18))
                : marketContract.sell(
                    parseUnits((values.amount * prices[activeTab === 0 ? 'yes':'no']).toString(), 18),
                    activeTab,
                    shareBalances[tabs[activeTab].name]
                );

            action
            .then((res: any) => {
                addTransaction(res, {
                    summary: `${activeAction} Success`
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
                            console.log("trade receipt", receipt)
                            setRefresh(refresh + 1)
                            setUpdateBalance(true);
                            handleUpdateShares()
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
                setLoding(false);
                console.log(error)
            })
        }
        
    }, [marketContract, library, approval, activeAction, activeTab, maxSellAmount])
    
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const getBuyAmount = useCallback(async () => {
        if(marketContract){
            const buyAmount: any = await marketContract.calcBuyAmount(parseUnits(form.getFieldValue('amount'), 18), activeTab);
            setPotentialReturns(Number(formatUnits(buyAmount, 18)) * (1 -  prices[activeTab === 0 ? 'yes':'no']))
        }
    }, [marketContract, form, activeAction, activeTab, prices, shareBalances])

    const getAvgPrice = useCallback(async() => {
        if(marketContract){
            const avgPrice = await marketContract.calcTokenPrice(activeTab, activeAction.toLowerCase())
            setAvgPrice(avgPrice);
            console.log('avgPrice:', avgPrice)
        }
    },[marketContract, activeTab, activeAction])

    const onCheck = async () => {
        const touched = form.isFieldTouched('amount');
        if(touched){
            try {
                const values = await form.validateFields();
                console.log('Success:', values);
            } catch (errorInfo) {
                console.log('Failed:', errorInfo);
            }
        }
    };

    const getMaxSellAmount = useCallback(async (amount: any) => {
        const maxSellAmount: any = await marketContract.calcSellAmount(parseUnits((amount * prices[activeTab === 0 ? 'yes':'no']).toString(), 18), activeTab);
        console.log('maxSellAmount', formatUnits(maxSellAmount, 18))
        console.log('shareBlance', formatUnits(shareBalances[activeTab === 0 ? 'yes':'no'], 18))
        if(maxSellAmount.gt(shareBalances[activeTab === 0 ? 'yes':'no'])){
            message.error(`Due to insufficient liquidity, please reduce the selling shares`)
            return true
        }
        return false
    },[marketContract, shareBalances, activeTab, prices])

    useEffect(() => {
        if(preadBalance?.toSignificant(6)){
            setMaxBuyAmount(Number(formatUnits(marketLiquidity, 18)) > Number(preadBalance?.toSignificant(6)) ? Number(preadBalance?.toSignificant(6)) : Number(formatUnits(marketLiquidity, 18)))
        }
    }, [marketLiquidity, preadBalance])

    useEffect(() => {
        if(amount > 0 && activeAction === BUY){
            getBuyAmount()
        }
    }, [amount, activeTab, marketContract, activeAction])

    useEffect(() => {
        getAvgPrice()
    }, [activeTab, activeAction, marketContract])

    useEffect(() => {
        let _roi = roi
        if(prices.yes !== '0'){
            _roi.yes = (1 - Number(prices.yes))/Number(prices.yes) * 100
        }
        if(prices.no !== '0'){
            _roi.no = (1 - Number(prices.no))/Number(prices.no) * 100
        }
        if(prices.yes !== '0' || prices.no !== '0'){
            setROI(_roi);
        }
    }, [prices.yes, prices.no])


    return (
        <div className='content'>
        <div className="predictDetail">
            <ConfirmModal activeAction={activeAction} amount={form.getFieldValue('amount')} outcome={activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'} avgPrice={avgPrice} isOpen={showConfirmModal} handleConfirm={() => {handleBuySell(form.getFieldsValue()); setShowConfirmModal(false)}} handleCancel={() => {setShowConfirmModal(false)}} agree={agree} setAgree={setAgree}/>
            <div>
                <div className='head'>
                    <div>
                        <BackIcon onClick={() => {history.push('/predict')}}/>
                    </div>
                    {/* <div>
                        <ShareIcon/>
                        <BookmarkIcon/>
                    </div> */}
                </div>
                {/* <div className='subTitle'>AVATAR-22MAY17</div> */}
                <Card>
                    <div className='cardHead'>
                        {/* <Avatar size={88} icon={<UserOutlined />} /> */}
                        <h2>{market.title}</h2>
                    </div>
                    <p>{market.description}</p>
                    <div className='precent' style={{gridTemplateColumns: `${market.outcomePrice && market.outcomePrice[0] * 100}% ${market.outcomePrice && market.outcomePrice[1] * 100}%`}}>
                        <div className='yes'></div>
                        <div className='no'></div>
                        <div className='text'>
                            <div>{market.outcomeNames && market.outcomeNames[0]}: {market.outcomePrice && market.outcomePrice[0]} PRED</div>
                            <div>{market.outcomeNames && market.outcomeNames[1]}: {market.outcomePrice && market.outcomePrice[1]} PRED</div>
                        </div>
                    </div>
                    <p>
                        <span>EXPIRATION: {moment(market.expiration*1000).format('YYYY-MM-DD HH:mm:ss')}</span>
                        <span>VOLUME: {market.volume}</span>
                        <span>LIQUIDITY: {market.liquidity} PRED</span>
                    </p>
                </Card>
                <div className='chart'>
                    <Chart data={chartData} chartRange={chartRange} setChartRange={setChartRange}/>
                </div>
                {/* <div className='history'>
                    {
                        market.outcomeHistory && market.outcomeHistory.map((data: any) => 
                        <div>
                            <div><CalendarIcon/></div>
                            <div>
                                <h4>{moment(data[0]*1000).format("MMMM Do YYYY, h:mm:ss")}</h4>
                            </div>
                        </div>
                        )
                    }
                </div> */}
            </div>
            <div>
                {(activeTab === YES.index || activeTab === NO.index) && 
                    <Segmented
                        className={`yesNoSegmented ${activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : t('liquidity')}`}
                        onChange={(val: any) => {setActiveTab(val); onCheck()}}
                        value={activeTab}
                        options={[
                            {
                                label: `Buy ${market.outcomeNames && market.outcomeNames[0]} ${market.outcomeNames && market.outcomePrice[0]} PRED`,
                                value: YES.index,
                            },
                            {
                                label: `Buy ${market.outcomeNames && market.outcomeNames[1]} ${market.outcomeNames && market.outcomePrice[1]} PRED`,
                                value: NO.index,
                            },
                        ]}
                    />
                }
                {
                    activeTab === LIQUIDITY.index && <div className='liquidity'>
                    <div>{t('liquidity')}</div>
                    <div><MinusOutlined onClick={() => {setActiveTab(YES.index)}}/></div>
                </div>
                }
                {/* {(activeTab === YES.index || activeTab === NO.index) && <div className='liquidityBtn' onClick={() => {setActiveTab(LIQUIDITY.index)}}>
                    <PlusOutlined style={{fontSize: '20px'}}/>
                </div>} */}
                <div className={`title ${activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'}`}>
                    {/* {market.title} */}
                </div>
                <div className='content'>
                    <div className='yesNoChart'>
                        <YesNoChart data={chartData} chartRange={chartRange} setChartRange={setChartRange}/>
                    </div>
                    <div className='buySellTab'>
                        <Segmented
                            className={`buySellSegmented ${activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'}`}
                            onChange={(val: any) => {setActiveAction(val); setUpdatePrices(true); onCheck()}}
                            value={activeAction}
                            block
                            options={[
                                {
                                    label: `Buy ${market.outcomeNames && market.outcomeNames[activeTab]}`,
                                    value: BUY,
                                },
                                {
                                    label: `Sell ${market.outcomeNames && market.outcomeNames[activeTab]}`,
                                    value: SELL,
                                },
                            ]}
                        />
                    </div>
                    <div className='shares'>
                        <div>
                            <div>Share Amount</div>
                            <div>{shareBalances[tabs[activeTab].name] ? numeral(Math.floor(Number(formatUnits(shareBalances[tabs[activeTab].name], 18)))).format('0,0') : ''}</div>
                        </div>
                        {/* <div>
                            <div>Shares Already Owned</div>
                            <div></div>
                        </div> */}
                    </div>
                    <Form
                        name="amount"
                        form={form}
                        labelCol={{ span: 12 }}
                        wrapperCol={{ span: 12 }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        hideRequiredMark
                    >
                        <Form.Item
                            label={activeAction === BUY ? 'PRED Amount' : 'Share Amount'}
                            name="amount"
                            className='amountInput'
                            rules={[
                                { required: true, message: `Please input ${activeAction === BUY ? 'PRED Amount' : 'Share Amount'}!`},
                                { pattern: activeAction === SELL ? sellInputRegex : inputRegex, message: `Please input right ${activeAction === BUY ? 'PRED Amount' : 'Share Amount'}`},
                                {
                                    validator: (_, value) =>
                                    activeAction === SELL ? (value > Math.floor(Number(formatUnits(shareBalances[tabs[activeTab].name], 18))) ?
                                    Promise.reject(new Error(`Share Amount must less than ${numeral(Math.floor(Number(formatUnits(shareBalances[tabs[activeTab].name], 18)))).format('0,0')}`)) : Promise.resolve()) : 
                                        (preadBalance?.toSignificant(6) && Number(value) > maxBuyAmount ? Promise.reject(new Error(`PRED Amount must less than ${numeral(maxBuyAmount).format('0,0.00')}`)) : Promise.resolve()),
                                    },
                        
                            ]}
                        >
                            <Input disabled={activeAction === SELL? Math.floor(Number(formatUnits(shareBalances[tabs[activeTab].name], 18))) === 0 : maxBuyAmount === 0}/>
                        </Form.Item>
                        {/* <Form.Item name="slider" wrapperCol={{ offset: 0, span: 24 }}>
                            <Slider
                                marks={{
                                    0: '0%',
                                    25: '25%',
                                    50: '50%',
                                    75: '75%',
                                    100: '100%',
                                }}
                            />
                        </Form.Item> */}
                        <div className='balance'>
                            My PRED Balance: {preadBalance?.toSignificant(6) || '-'} PRED
                        </div>
                        <div className='cost'>
                            <div>
                                <div>Cost per share</div>
                                <div>{numeral(avgPrice).format('0,0.0000')} PRED</div>
                            </div>
                            {/* <div>
                                <div>Total Cost</div>
                                <div>{numeral(amount ? avgPrice * amount : 0).format('0,0.0000')} SOFI</div>
                            </div> */}
                            {/* <div>
                                <div>Potential Profit</div>
                                <div>$14.8</div>
                            </div> */}
                        </div>
                        <div className='info'>
                            {/* <div>
                                <div>Est. Shares Bought</div>
                                <div>{numeral(buyAmount).format('0,0.0000')}</div>
                            </div>
                            <div>
                                <div>Fee (2%)</div>
                                <div>{fee ? Number(formatUnits(fee, 18))*100 : 'N/A'}%</div>
                            </div> */}
                            <div>
                                <div>Total {activeAction} share</div>
                                <div>{shareBalances[tabs[activeTab].name] ? numeral(Math.floor(Number(formatUnits(shareBalances[tabs[activeTab].name], 18)))).format('0,0') : ''}</div>
                            </div>
                            <div>
                                <div>Max ROI</div>
                                <div>{numeral(roi[activeTab === 0 ? 'yes': 'no']).format('0,0.00')}%</div>
                            </div>
                            <div>
                                <div>Potential Returns</div>
                                <div>{numeral(potentialReturns).format('0,0.00')} PRED</div>
                            </div>
                        </div>
                        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        {!account ? 
                            <Button block={true} className={activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'}  type="primary" onClick={toggleWalletModal}>
                                Connect Wallet
                            </Button> :
                            market.status === 'active' || market.expiration < new Date().getTime()/10000 ? 
                                (approval !== ApprovalState.APPROVED ? <Button className={activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'} type="primary" htmlType="submit" block>
                                   Approve
                                </Button>
                                :    
                                <Button disabled={activeAction === BUY ? (Number(preadBalance?.toSignificant(6)) === 0) : (Number(formatUnits(shareBalances[tabs[activeTab].name], 18)) < 1)} className={activeTab === 0 ? 'Yes' : activeTab === 1 ? 'No' : 'Liquidity'} type="primary" htmlType="submit" block>
                                    {activeAction === BUY ? (Number(preadBalance?.toSignificant(6)) > 0 ? 'Place Order' : 'Insufficient balance') :
                                    (Number(formatUnits(shareBalances[tabs[activeTab].name], 18)) > 0 ? 'Place Order' : 'Insufficient balance')}
                                </Button>
                                )
                                :<Button className="ended" block disabled>{t('ended')}</Button>
                        }
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
        </div>
    )
}
