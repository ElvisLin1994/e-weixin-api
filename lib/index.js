import sha1 from 'sha1'
import moment from 'moment'
import {encrypt, decrypt} from './crypto'
import {parseString} from 'xml2js'

export default class Weixin {
  constructor() {
    this.data = ''
  }

  // Loop
  loop(req, res) {
    // 保存res
    this.res = res

    const self = this

    // 获取XML内容
    const buf = ''
    req.setEncoding('utf8')
    req.on('data', function(chunk) {
      buf += chunk
    })

    // 内容接收完毕
    req.on('end', function() {
    xml2js.parseString(buf, function(err, json) {
      if (err) {
        err.status = 400
      } else {
        req.body = json
      }
    })

    self.data = req.body.xml

    self.parse()
    })
  }

  // 签名校验
  verifySignature(req) {
    const {signature, timestamp, nonce, echostr} = req.query

    // 获取校验参数
    this.signature = signature
    this.timestamp = timestamp
    this.nonce = nonce
    this.echostr = echostr

    // 按照字典排序
    const array = [this.token, this.timestamp, this.nonce]
    array.sort()

    // 连接
    const str = sha1(array.join(""))

    // 对比签名
    if(str == this.signature) {
      return true
    } else {
      return false
    }
  }
}

// 解析
Weixin.prototype.parse = function() {
  const ToUserName = this.data.ToUserName
  if (this.data.Encrypt) {
    const app = {
      appID: '',
      encodingAESKey: ''
    }
    let decrypted = decrypt(this.data.Encrypt[0], app)
    parseString(decrypted, function(e, json) {
      if (e) {
        e.status = 400
      } else {
        decrypted = json.xml
      }
    })
    this.data = decrypted
    this.data.ToUserName = ToUserName
  }

  this.MsgType = this.data.MsgType[0] ? this.data.MsgType[0] : 'text'
  switch(this.MsgType) {
    case 'text':
      this.parseText()
      break
    case 'image':
      this.parseImage()
      break
    case 'voice':
      this.parseVoice()
      break
    case 'shortvideo':
      this.parseShortVideo()
      break
    case 'location':
      this.parseLocation()
      break
    case 'link':
      this.parseLink()
      break
    case 'event':
      this.parseEvent()
      break
  }
}

Weixin.prototype.parseText = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'Content': this.data.Content[0],
    'MsgId': this.data.MsgId[0]
  }
  return this
}

Weixin.prototype.parseImage = function() {
  // body...
}

Weixin.prototype.parseVoice = function() {
  // body...
}

Weixin.prototype.parseShortVideo = function() {
  // body...
}

Weixin.prototype.parseLocation = function() {
  // body...
}

Weixin.prototype.parseLink = function() {
  // body...
}

Weixin.prototype.parseEvent = function() {
  // body...
}

// 发送信息
Weixin.prototype.sendMsg = function(msg) {
  switch(msg.type) {
    case 'text':
      this.sendText(msg)
      break
    case 'image':
      this.sendImage(msg)
      break
    case 'music':
      this.sendMusic(msg)
      break
    case 'news':
      this.sendNews(msg)
      break
  }
}

Weixin.prototype.sendText = function(msg) {
  const CreateTime = moment().unix()
  const FuncFlag = msg.FuncFlag ? msg.FuncFlag : this.FuncFlag
  const xml = `
    <xml>
      <ToUserName><![CDATA[${msg.ToUserName}]]></ToUserName>
      <FromUserName><![CDATA[${msg.FromUserName}]]></FromUserName>
      <CreateTime>${CreateTime}</CreateTime>
      <MsgType><![CDATA[${msg.MsgType}]]></MsgType>
      <Content><![CDATA[${msg.Content}]]></Content>
      <FuncFlag>${FuncFlag}</FuncFlag>
    </xml>
  `
  if (msg.Content.length == 0) {
    this.res.send('success')
  } else {
    this.res.type('xml')
    this.res.send(xml)
  }
}

Weixin.prototype.sendImage = function(msg) {
  // body...
}

Weixin.prototype.sendMusic = function(msg) {
  // body...
}

Weixin.prototype.sendNews = function(msg) {
  // body...
}