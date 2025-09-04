import { useCallback, useEffect, useState,useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { APILIST } from '../../constants'
import { ChainId  } from 'constants/chainId';
import { get, request } from '../../utils/request';

export function useMarketList(): any {
    const [list, setList] = useState<any>([]);
    const [unavailable, setUnavailable] = useState<boolean>(false);
    const { chainId } = useActiveWeb3React()
    const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
    const fetchData = useCallback(async () => {
      get(`${api_url}/sofi/markets`).then(async (res: any) => {
          if (res) {
            setList(res)
          }else {
            setUnavailable(true);
          }
      });
    }, [])
  
    useEffect(() => {
      if(chainId === ChainId.LOOT){
        fetchData()
      }
    }, [chainId])
    return {list, unavailable}
}

export function useMarketDetail(id: string, chartRange: string, refresh: number): any{
  const [data, setData] = useState<any>({});
  const { account, chainId } = useActiveWeb3React()
  const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
  const fetchData = useCallback(async () => {
    get(`${api_url}/sofi/markets/${id}?type=${chartRange}`).then((response: any) => {
      if (response) {
        setData(response)
      }
    });
  }, [account, chartRange])

  useEffect(() => {
    if(id && (chainId === ChainId.LOOT)){
      fetchData()
    }
  }, [id, account, chartRange])
  return data
}

export function useMarketTransactionList(): any {
  const [list, setList] = useState<any>([]);
  const { chainId, account } = useActiveWeb3React()
  const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
  const fetchData = useCallback(async () => {
    get(`${api_url}/sofi/markets_txs?sender=${account}`).then(async (res: any) => {
        if (res) {
            setList(res)
        }
    });
  }, [account])

  useEffect(() => {
    if(account && (chainId === ChainId.LOOT)){
      fetchData()
    }
  }, [chainId, account])
  return list
}

export function useMarketPositionList(refresh?: number): any {
  const [list, setList] = useState<any>([]);
  const { chainId, account } = useActiveWeb3React()
  const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
  const fetchData = useCallback(async () => {
    get(`${api_url}/sofi/markets_positions?sender=${account}`).then(async (res: any) => {
        if (res) {
            setList(res)
        }
    });
  }, [account])

  useEffect(() => {
    if(account && (chainId === ChainId.LOOT)){
      fetchData()
    }
  }, [chainId, account, refresh])
  return list
}


export function useMarketBalances(): any{
  const [data, setData] = useState<any>({});
  const { account, chainId } = useActiveWeb3React()
  const api_url = chainId ? APILIST[chainId] : APILIST[ChainId.LOOT];
  const fetchData = useCallback(async () => {
    get(`${api_url}/sofi/markets_balances?sender=${account}`).then((response: any) => {
      if (response) {
        setData(response)
      }
    });
  }, [account])

  useEffect(() => {
    if(account && (chainId === ChainId.LOOT)){
      fetchData()
    }
  }, [account])
  return data
}
