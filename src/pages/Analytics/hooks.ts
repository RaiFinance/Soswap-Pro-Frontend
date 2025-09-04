import { useCallback, useEffect, useState,useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { APILIST } from '../../constants'
import { ChainId  } from 'constants/chainId';
import { get, request } from '../../utils/request';

export function useGlobalData(): any {
    const [liquidity, setLiquidity] = useState<any>([]);
    const [volume, setVolume] = useState<any>([]);
    const [pairs, setPairs] = useState<any>([]);
    const [tokens, setTokens] = useState<any>([]);
    const [liquidityChange, setLiquidityChange] = useState<any>('')
    const [volumeChange, setVolumeChange] = useState<any>('')
    const { chainId } = useActiveWeb3React()
    const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
    const fetchData = useCallback(async () => {
      get(`${api_url}/soswap/analytics`).then(async (res: any) => {
          if (res) {
            setLiquidity(res.liquidity_history)
            setVolume(res.volume_history)
            setPairs(res.pairs)
            setTokens(res.tokens)
            setLiquidityChange(Number(res.liquidity_change.replace('%', '')))
            setVolumeChange(Number(res.volume_change.replace('%', '')))
          }
      });
    }, [])
  
    useEffect(() => {
      if(chainId === ChainId.BASE){
        fetchData()
      }
    }, [chainId])
    return {liquidity, volume, tokens, pairs, liquidityChange, volumeChange}
}
