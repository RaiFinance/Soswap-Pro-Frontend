import React, { useEffect, useState } from 'react'
import { Button, Radio } from 'antd';
import { useTranslation } from 'react-i18next'
import numeral from 'numeral'
import moment from 'moment';
import styled from 'styled-components'

import { ResponsiveContainer, AreaChart, Area, LineChart, Line, YAxis, Tooltip, XAxis } from 'recharts'

interface BalancesChartProps {
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

const BalancesChart: React.FC<BalancesChartProps> = ({
  data,
  chartRange,
  setChartRange,
}) => {
  const { t } = useTranslation()

  const handleRangeChange = (e:any) => {
    setChartRange && setChartRange(e.target.value)
  }

  const formatToolTip = (chartData: any) => {
    if (!chartData) return ['--', 'No Data Available']
    const {
      payload: { value, ts },
    } = chartData
    const timeString = moment(ts*1000).format('YYYY-MM-DD HH:mm:ss');
    return [timeString, `$${numeral(value).format('0,0.00')}`]
  }

  const renderTooltip = (props: any) => {
    const tooltipData = props.payload?.[0]
    const [label, value] = formatToolTip(tooltipData)

    return <TooltipBox>
      <p>{label}</p>
      <p>Price: {value}</p>
    </TooltipBox>
  }


  const minY = Math.min(...(data || []).map<number>(({ value }) => value))
  const maxY = Math.max(...(data || []).map<number>(({ value }) => value))
  const minimumYAxisLabel = minY - 5 > 0 ? minY - 5 : 0

  return (
    <Container>
      <ChartContainer>
        <AreaChart
          data={data}
        >
          <Area
            type='monotone'
            dataKey='value'
            dot={false}
            stroke="#14B8A6" 
            fillOpacity={1} 
            fill="url(#colorUv)"
            animationEasing='ease'
            animationDuration={800}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            mirror={true}
            // ticks={[minimumYAxisLabel + 0.001, maxY + 5.001]}
            // domain={[minY - 15, maxY + 5]}
            tickFormatter={(v: any) => numeral(v).format('0,0.000')}
            orientation='right'
            dataKey="value"
            hide={true}
            dy={7}
            dx={1}
            domain={['dataMin', 'dataMax']}
          />
          <XAxis  
            axisLine={false}
            tickLine={false}
            dataKey="ts"
            hide={true}
          />
          <Tooltip
            content={renderTooltip}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(20, 184, 166, 0.5)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgba(20, 184, 166, 0)" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ChartContainer>
      <DurationWrapper>
        <ButtonWrapper>
          <Radio.Group onChange={handleRangeChange} defaultValue={chartRange}>
            <Radio.Button value="1d">1D</Radio.Button>
            <Radio.Button value="1w">1W</Radio.Button>
            <Radio.Button value="1m">1M</Radio.Button>
            <Radio.Button value="1y">1Y</Radio.Button>
            <Radio.Button value="1y">ALL</Radio.Button>
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
  min-height: 200px;
`

const ChartTitle = styled.h2`
  font-size: 42px;
`

const DurationWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 0;
  display: flex;
  justify-content: flex-end;
`

const ButtonWrapper = styled.div`
  display: flex;
  padding-bottom: 0;
  z-index: 10;
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within{
    box-shadow: none;
  }
  .ant-radio-button-wrapper{
    padding: 4px 8px;
    font-size: 14px;
    border: none!important;
    background: none!important;
    color: var(--text-primary);
    &:before{
      display: none!important;
    }
  }
`

export default BalancesChart
