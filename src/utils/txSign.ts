import Web3 from "web3";

let isLogging = false

export const clearLocalStorage = () => {
  window.localStorage.removeItem('address')
  window.localStorage.removeItem('signatureResult')
  window.localStorage.removeItem('signatureMessage')
  window.localStorage.removeItem('wallet_type')
}

const personalSign = (provider: any, msg: any, fromAddress: any, pwd: any) => {
  isLogging = true
  const web3 = new Web3(provider);
  return new Promise((resolve, reject) => {
    web3.eth.personal.sign(msg, fromAddress, pwd).then((res: any) => {
      localStorage.setItem('address', fromAddress)
      localStorage.setItem('signature', res)
      localStorage.setItem('signatureMsg', msg)
      isLogging = false
      resolve(res)
    })
  })
}

export const handleIsSignExpired = () => {
  let nowTime = (new Date()).getTime()
  let storedSig: any, storedMsg: any, storedAddress: any
  if (!localStorage.getItem('signature') || !localStorage.getItem('signatureMsg')) {
    return
  }
  storedAddress = localStorage.getItem('address')
  storedSig = localStorage.getItem('signature')
  storedMsg = localStorage.getItem('signatureMsg')
  
  if (nowTime - storedMsg > 28800000) {
    return
  }

  return {
    address: storedAddress,
    signature: storedSig,
    signatureMsg: storedMsg
  }
}

export const getTimestamp = () => {
  return (new Date()).valueOf()
}

export const getSign = async (library: any, account: any) => {
  let sig, timestamp, address
  let storedSignature = handleIsSignExpired()
  if (!storedSignature || (account !== storedSignature.address)) {
    if (!isLogging) {
      timestamp = getTimestamp()
      sig = await personalSign(library.provider, timestamp.toString(), account, '')
    }
  } else {
    sig = storedSignature.signature
    timestamp = storedSignature.signatureMsg
    address = storedSignature.address
  }

  return {
    sig: sig,
    timestamp: timestamp
  }
}