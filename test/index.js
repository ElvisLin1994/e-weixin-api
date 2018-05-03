import Weixin from '../lib'

const wx = new Weixin()
wx.setConfig = function (originalID) {
  console.log('[originalID]', originalID)
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve({
        isEncrypted: true,
        appID: '',
        encodingAESKey: ''
      })
    }, 1000);
  })
}

wx.test()