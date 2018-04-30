import sha1 from 'sha1'

class Weixin {
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
  this.type = this.data.MsgType[0] ? this.data.MsgType[0] : 'text'
  switch(this.type) {
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
    'to': this.data.ToUserName[0],
    'from': this.data.FromUserName[0],
    'createTime': this.data.CreateTime[0],
    'msgType': this.data.MsgType[0],
    'content': this.data.Content[0],
    'msgId': this.data.MsgId[0]
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
  // body...
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