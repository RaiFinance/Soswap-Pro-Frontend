import React from 'react'
import { Card, Empty, Divider, Button } from 'antd';
import { FallOutlined, RiseOutlined, ArrowRightOutlined, InfoCircleFilled } from '@ant-design/icons';
import moment from 'moment'
import numeral from 'numeral';
import { Link, useHistory } from 'react-router-dom'
import Slider from "react-slick";
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from '../../hooks'
import { useMarketList, useMarketBalances, useMarketPositionList } from './hooks';
import {ReactComponent as BennetIcon} from 'assets/images/predict/bennet.svg'
import {ReactComponent as UpIcon} from 'assets/images/predict/up.svg'
import {ReactComponent as DownIcon} from 'assets/svg/down.svg'
import {ReactComponent as NotificationIcon} from 'assets/images/predict/notifications.svg'
import {ReactComponent as LikeIcon} from 'assets/images/predict/like.svg'
import {ReactComponent as ClosingIcon} from 'assets/images/predict/closing.svg'
import {ReactComponent as PausedIcon} from 'assets/images/predict/paused.svg'
import {ReactComponent as LeftArrow} from 'assets/images/predict/leftArrow.svg'
import {ReactComponent as RightArrow} from 'assets/images/predict/rightArrow.svg'
import NoBalance from 'assets/images/predict/noBalance.png'
import './index.less';

const CoinPrice = ({price} : any) => {
    const arr = price.split(' ');
    return <div className={`comment-price ${arr[2].includes('-') ? 'down' : ''}`}>{price}</div>
}

const Predict: React.FC = () =>  {
    const history = useHistory();
    const { list: marketList, unavailable }  = useMarketList();
    const reverseMarketList = [...marketList].reverse();
    const marketPosition = useMarketPositionList();
    const { t } = useTranslation();
    const { chainId } = useActiveWeb3React()

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: 0,
        responsive: [
            {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
            },
            {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2
            }
            },
            {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
            }
        ],
        nextArrow: <RightArrow />,
        prevArrow: <LeftArrow />,
      };
    return (
        <>
        {
            unavailable ? <div className='unaviable'>The service is not available in your region</div> :  
            <div className='predict'>
                        <div className='balance'>
                            <div>
                                <p>Balance and Open Positions</p>
                                <div className='price'>{numeral(marketPosition.balance).format('0,0.00')} PRED</div>
                                <div className='type'><span className={Number(marketPosition?.balance_changed && marketPosition?.balance_changed.replace('%', '')) >= 0 ? 'up' : 'down'}>{Number(marketPosition?.balance_changed && marketPosition.balance_changed.replace('%', '')) >= 0 ? <RiseOutlined /> : <FallOutlined/>}&nbsp;{marketPosition.balance_changed} </span>All Time <Link to="/predict/transactions">More <ArrowRightOutlined /></Link></div>
                            </div>
                            <div>
                                {marketPosition.positions && marketPosition.positions.length > 0 ? marketPosition.positions.slice(0, 3).map((data: any) => 
                                    <Card>
                                        <BennetIcon/>
                                        <div>{data.market_title}</div>
                                        <div className={data.outcome_index === 0 ? 'Yes' : 'No'}>{data.outcome} {numeral(data.value_cur).format('0,0.00')} PRED
                                            <span>{Number(data?.profit_loss_percentage && data.profit_loss_percentage.replace('%', '')) >= 0 ? <RiseOutlined style={{fontSize: '14px'}}/> : <FallOutlined style={{fontSize: '14px'}}/>}{data.profit_loss_percentage}</span></div>
                                        <div><Link to="/predict/transactions">{t('more')} <ArrowRightOutlined /></Link></div>
                                    </Card>
                                ): 
                                    <Card className='noBalance' bordered={false}>
                                        <div>
                                            <img src={NoBalance} alt="" />
                                        </div>
                                        <div>You don’t have any position yet.</div>
                                    </Card>
                                }
                            </div>
                        </div>
                        <div className='section'>
                            <div className='subTitle newly'>Newly Added</div>
                            {
                              marketList && marketList.length > 0 &&
                                <Slider {...settings} className="news">
                                    {reverseMarketList.map((data: any) => 
                                        <div key={data.market} onClick={() => {history.push(`/predict/${data.market}`)}}>
                                            <img src={data.photo} alt="" />
                                            <div className='info'>
                                                <h3>{data.title}</h3>
                                                <p className='time'>On {moment(data.resolutionTime*1000).format("D, MMM YY")}</p>
                                                <div className='btns'><Button className='yesBtn'>{data.outcomeNames[0]} ${numeral(data.outcomePrice[0]).format('0,0.00')}</Button><Button className='noBtn'>{data.outcomeNames[1]} ${numeral(data.outcomePrice[1]).format('0,0.00')}</Button></div>
                                                {/* <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div> */}
                                            </div>
                                        </div>
                                    )}
                                </Slider>
                            }
                            {
                                marketList && marketList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                            } 
                        </div>
                        <div className='section'>
                            <div className='subTitle'>All Events</div>
                            <div className='popular'>
                                {marketList.map((data: any) => 
                                    <div key={data.market} onClick={() => {history.push(`/predict/${data.market}`)}}>
                                        <img src={data.photo} alt="" />
                                        {/* <div className='icons'>
                                            <NotificationIcon/>
                                            <LikeIcon/>
                                        </div> */}
                                        <h3>{data.title}</h3>
                                        <p>In {moment(data.resolutionTime*1000).format("YYYY")}</p>
                                        <div className='btns'><Button className='yesBtn'>{data.outcomeNames[0]} ${numeral(data.outcomePrice[0]).format('0,0.00')}</Button><Button className='noBtn'>{data.outcomeNames[1]} ${numeral(data.outcomePrice[1]).format('0,0.00')}</Button></div>
                                        {/* <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div> */}
                                    </div>
                                )}                   
                            </div>
                            {
                                marketList && marketList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                            }  
                        </div> 
                        {/* <div className='popular'>
                            <div>
                                <img src={Popular1} alt="" />
                                <div className='icons'>
                                    <NotificationIcon/>
                                    <LikeIcon/>
                                </div>
                                <h3>Avatar wins best Emmy</h3>
                                <p>In 2022</p>
                                <div><Button className='yesBtn'>Yes for 76¢</Button><Button className='noBtn'>No for 34¢</Button></div>
                                <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div>
                            </div>
                            <div>
                                <img src={Popular2} alt="" />
                                <div className='icons'>
                                    <NotificationIcon/>
                                    <LikeIcon/>
                                </div>
                                <h3>Will Elizabeth Holmes be found guilty?</h3>
                                <p>Before final 2022 hearing</p>
                                <div><Button className='yesBtn'>Yes for 76¢</Button><Button className='noBtn'>No for 34¢</Button></div>
                                <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div>
                            </div>
                            <div>
                                <img src={Popular3} alt="" />
                                <div className='icons'>
                                    <NotificationIcon/>
                                    <LikeIcon/>
                                </div>
                                <h3>Bitcoin reaches 70,000</h3>
                                <p>By last day in November</p>
                                <div><Button className='yesBtn'>Yes for 76¢</Button><Button className='noBtn'>No for 34¢</Button></div>
                                <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div>
                            </div>
                            <div>
                                <img src={Popular4} alt="" />
                                <div className='icons'>
                                    <NotificationIcon/>
                                    <LikeIcon/>
                                </div>
                                <h3>San Francisco high temp</h3>
                                <p>On July 01-2022</p>
                                <div><Button className='yesBtn'>Yes for 76¢</Button><Button className='noBtn'>No for 34¢</Button></div>
                                <div className='vl'>Vl: 3.27 MOVR  LQ: 3.27 MOVR</div>
                            </div>                     
                        </div> */}
           </div>
        }   
        </>
    )
}

export default Predict;
