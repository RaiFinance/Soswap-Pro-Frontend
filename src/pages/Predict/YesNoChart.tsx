import React, { useEffect, useState } from 'react'
import { Button, Radio } from 'antd';
import numeral from 'numeral'
import moment from 'moment';
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, YAxis, Tooltip, XAxis } from 'recharts'

interface ChartProps {
  data?: {
    ts: string
    value: number
  }[]
  chartRange?: string
  setChartRange?: (range: string) => void
}

const TooltipBox = styled.div`
  border: 1px solid #14B8A6;
  padding: 5px;
  border-radius: 12px;
  p{
    margin: 0
  }
`

const YesNoChart: React.FC<ChartProps> = ({data, chartRange, setChartRange}: any) => {
    const { t } = useTranslation()
    const handleRangeChange = (e:any) => {
        setChartRange && setChartRange(e.target.value)
    }

    const formatToolTip = (chartData: any) => {
      if (!chartData) return ['--', 'No Data Available']
      const {
        payload: { yes, no, ts },
      } = chartData
      const timeString = moment(ts*1000).format('YYYY-MM-DD HH:mm:ss');
      return [timeString, `Yes: ${numeral(yes).format('0,0.00')} SOFI`, `No: ${numeral(no).format('0,0.00')} SOFI`]
    }

    const renderTooltip = (props: any) => {
      const tooltipData = props.payload?.[0]
      const [label, yes, no] = formatToolTip(tooltipData)
  
      return <TooltipBox>
        <p>{label}</p>
        <p>{yes}</p>
        <p>{no}</p>
      </TooltipBox>
    }

    // const data = [
    //     {
    //     "name": "Page A",
    //     "yes": 4000,
    //     "no": 2400,
    //     },
    //     {
    //     "name": "Page B",
    //     "yes": 3000,
    //     "no": 1398,
    //     },
    //     {
    //     "name": "Page C",
    //     "yes": 2000,
    //     "no": 9800,
    //     },
    //     {
    //     "name": "Page D",
    //     "yes": 2780,
    //     "no": 3908,
    //     },
    //     {
    //     "name": "Page E",
    //     "yes": 1890,
    //     "no": 4800,
    //     },
    //     {
    //     "name": "Page F",
    //     "yes": 2390,
    //     "no": 3800,
    //     },
    //     {
    //     "name": "Page G",
    //     "yes": 3490,
    //     "no": 4300,
    //     }
    // ]

  return (
    <Container>
        <ChartContainer>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="ts"
              tickFormatter={(v: any) => moment(v*1000).format('YYYY-MM-DD')}
            />
            <YAxis 
              tickFormatter={(v: any) => `${numeral(v).format('0,0.00')}`}
            />
            <Tooltip
            content={renderTooltip}
            />
            {/* <Legend /> */}
            <Line type="monotone" dataKey="yes" stroke="#8884d8" dot={false}/>
            <Line type="monotone" dataKey="no" stroke="#82ca9d" dot={false}/>
        </LineChart>
        </ChartContainer>
        <DurationWrapper>
            <ButtonWrapper>
            <Radio.Group onChange={handleRangeChange} value={chartRange}>
              <Radio.Button value="24hr">1D</Radio.Button>
                <Radio.Button value="1w">1W</Radio.Button>
                <Radio.Button value="1m">1M</Radio.Button>
                <Radio.Button value="1y">1Y</Radio.Button>
                <Radio.Button value="all">ALL</Radio.Button>
              </Radio.Group>
            </ButtonWrapper>
        </DurationWrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const ChartContainer = styled(ResponsiveContainer)`
  min-height: 50px;
`

const ChartTitle = styled.h2`
  font-size: 42px;
`

const DurationWrapper = styled.div`
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
`

const ButtonWrapper = styled.div`
  display: flex;
  z-index: 10;
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within{
    box-shadow: none;
  }
  .ant-radio-button-wrapper{
    padding: 4px 8px;
    color: #84818A;
    font-size: 10px;
    border: none!important;
    &:before{
      display: none!important;
    }
  }
`

export default YesNoChart
