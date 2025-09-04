import { handleIsSignExpired } from './txSign'

export const request = (url: string, config: any) => {
  let headers = handleIsSignExpired()
  return fetch(url, {...config, headers}).then((res: any) => {
    if (!res.ok) {
      // 服务器异常返回
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return res.json();
  }).then((resJson: any) => {
      return resJson;
  }).catch((error: any) => {
    // 公共错误处理
    console.error('内部错误');
  });
};

// GET请求
export const get = (url: string) => {
  return request(url, {method: 'GET'});
};

// POST请求
export const post = (url: string, data: any) => {
  return request(url, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'mode': 'no-cors'
    },
    method: 'POST'
  });
};

// PUT请求
export  const put = (url: string, data: any) => {
  return request(url, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'mode': 'no-cors'
    },
    method: 'PUT'
  });
};