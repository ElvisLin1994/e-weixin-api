// import {Server} from 'http'
// import express, {json, urlencoded} from 'express'
// import Weixin from '../lib'

// const wx = new Weixin()
// wx.serConfig = (originalID) => {
//   console.log('[originalID]', originalID)
//   return new Promise((resolve, reject) => {
//     setTimeout(function() {
//       resolve({
//         isEncrypted: true,
//         appID: '',
//         encodingAESKey: '',
//         token: ''
//       })
//     }, 1000);
//   })
// }

// const app = express()

// app.use(json({limit: '5mb'}))
// app.use(urlencoded({limit: '5mb'}))

// app.get('/', (req, res, next) => {
//   if (wx.verifySignature(req)) {
//     res.send(req.query.echostr)
//   } else {
//     res.send('Fail: Signature')
//   }
// })

// wx.onText((msg) => {
//   console.log(msg)
// })

// wx.onEvent((msg) => {
//   console.log(msg.CopyrightCheckResult.ResultList)
// })

// app.post('/', (req, res, next) => {
//   wx.loop(req, res)
//   res.sendStatus(200)
// })

// const server = Server(app)

// server.listen(3000, () => {
//   console.log('http service is listening on port 3000')
// })

const xml = `
  <xml>
    <ToUserName><![CDATA[]]></ToUserName>
    <FromUserName><![CDATA[]]></FromUserName>
    <CreateTime></CreateTime>
    <MsgType><![CDATA[transfer_customer_service]]></MsgType>
  </xml>
`
console.log(xml.replace(/ /g, '').replace(/\n/g, ''))