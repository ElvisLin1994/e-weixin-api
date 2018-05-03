import moment from 'moment'
import {createHash} from 'crypto'
import {parseString} from 'xml2js'
import {EventEmitter} from 'events'
import {encrypt, decrypt} from './crypto'
import {map} from 'lodash'

const sha1 = createHash('sha1')
const event = new EventEmitter()

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
    let buf = ''
    req.setEncoding('utf8')
    req.on('data', function(chunk) {
      buf += chunk
    })

    // 内容接收完毕
    req.on('end', function() {
    parseString(buf, function(err, json) {
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
    // const str = sha1(array.join(""))
    const str = sha1.update(array.join(""))

    // 对比签名
    if(str == this.signature) {
      return true
    } else {
      return false
    }
  }
  
  // Set Config
  setConfig(fn) {
    return fn
  }

  // Get Config
  getConfig(originalID) {
    return this.setConfig(originalID)
  }

  // Test
  async test() {
    const originalID = 'test'
    const config = await this.getConfig(originalID)
    console.log('[config]', config)
  }
}

// 监听
Weixin.prototype.onText = function(callback) {
  event.on('onText', callback)
  return this
}

Weixin.prototype.onImage = function(callback) {
  event.on('onImage', callback)
  return this
}

Weixin.prototype.onVoice = function(callback) {
  event.on('onVoice', callback)
  return this
}

Weixin.prototype.onShortVideo = function(callback) {
  event.on('onShortVideo', callback)
  return this
}

Weixin.prototype.onLocation = function(callback) {
  event.on('onLocation', callback)
  return this
}

Weixin.prototype.onLink = function(callback) {
  event.on('onLink', callback)
  return this
}

Weixin.prototype.onEvent = function(callback) {
  event.on('onEvent', callback)
  return this
}

// 解析
Weixin.prototype.parse = async function() {
  const ToUserName = this.data.ToUserName
  if (this.data.Encrypt) {
    const {isEncrypted, appID, encodingAESKey} = await this.getConfig(ToUserName)
    if (isEncrypted) {
      const app = {
        appID,
        encodingAESKey
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
    } else {
      return this
    }
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
    case 'video':
      this.parseVideo()
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
  event.emit('onText', msg)
  return this
}

Weixin.prototype.parseImage = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'PicUrl': this.data.PicUrl[0],
    'MediaId': this.data.MediaId[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onImage', msg)
  return this
}

Weixin.prototype.parseVoice = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'Format': this.data.Format[0],
    'MediaId': this.data.MediaId[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onVoice', msg)
  return this
}

Weixin.prototype.parseVideo = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'MediaId': this.data.MediaId[0],
    'ThumbMediaId': this.data.ThumbMediaId[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onVideo', msg)
  return this
}

Weixin.prototype.parseShortVideo = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'MediaId': this.data.MediaId[0],
    'ThumbMediaId': this.data.ThumbMediaId[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onShortVideo', msg)
  return this
}

Weixin.prototype.parseLocation = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'Location_X': this.data.Location_X[0],
    'Location_Y': this.data.Location_Y[0],
    'Scale': this.data.Scale[0],
    'Label': this.data.Label[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onLocation', msg)
  return this
}

Weixin.prototype.parseLink = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'Title': this.data.Title[0],
    'Description': this.data.Description[0],
    'Url': this.data.Url[0],
    'MsgId': this.data.MsgId[0]
  }
  event.emit('onLink', msg)
  return this
}

Weixin.prototype.parseEvent = function() {
  const msg = {
    'ToUserName': this.data.ToUserName[0],
    'FromUserName': this.data.FromUserName[0],
    'CreateTime': this.data.CreateTime[0],
    'MsgType': this.data.MsgType[0],
    'Event': this.data.Event[0]
  }
  // 关注/取消关注事件、扫描带参数二维码事件、上报地理位置事件、自定义菜单事件
  const {EventKey, Ticket, Latitude, Longitude, Precision} = this.data
  if (EventKey) {msg['EventKey'] = EventKey[0]}
  if (Ticket) {msg['Ticket'] = Ticket[0]}
  if (Latitude) {msg['Latitude'] = Latitude[0]}
  if (Longitude) {msg['Longitude'] = Longitude[0]}
  if (Precision) {msg['Precision'] = Precision[0]}
  // 群发结果事件推送
  const {TotalCount, FilterCount, SentCount, ErrorCount, CopyrightCheckResult} = this.data
  if (TotalCount) {msg['TotalCount'] = TotalCount[0]}
  if (FilterCount) {msg['FilterCount'] = FilterCount[0]}
  if (SentCount) {msg['SentCount'] = SentCount[0]}
  if (ErrorCount) {msg['ErrorCount'] = ErrorCount[0]}
  if (CopyrightCheckResult) {
    msg['CopyrightCheckResult'] = {
      'Count': CopyrightCheckResult[0].Count[0],
      'ResultList': map(CopyrightCheckResult[0].ResultList[0].item, (item) => {
        return {
          'ArticleIdx': item.ArticleIdx[0],
          'UserDeclareState': item.UserDeclareState[0],
          'AuditState': item.AuditState[0],
          'OriginalArticleUrl': item.OriginalArticleUrl[0],
          'OriginalArticleType': item.OriginalArticleType[0],
          'CanReprint': item.CanReprint[0],
          'NeedReplaceContent': item.NeedReplaceContent[0],
          'NeedShowReprintSource': item.NeedShowReprintSource[0]
        }
      }),
      'CheckState': CopyrightCheckResult[0].CheckState[0]
    }
  }
  // 模板消息发送结果事件推送
  const {MsgID, Status} = this.data
  if (MsgID) {msg['MsgID'] = MsgID[0]}
  if (Status) {msg['Status'] = Status[0]}
  // 微信认证事件推送
  const {ExpiredTime, FailTime, FailReason} = this.data
  if (ExpiredTime) {msg['ExpiredTime'] = ExpiredTime[0]}
  if (FailTime) {msg['FailTime'] = FailTime[0]}
  if (FailReason) {msg['FailReason'] = FailReason[0]}
  // 卡券事件推送
  const {CardId, RefuseReason, IsGiveByFriend, FriendUserName, UserCardCode, OldUserCardCode, OuterStr, IsRestoreMemberCard, IsReturnBack, IsChatRoom, ConsumeSource, LocationName, StaffOpenId, VerifyCode, RemarkAmount, TransId, LocationId, Fee, OriginalFee, ModifyBonus, ModifyBalance, Detail, OrderId, CreateOrderTime, PayFinishTime, Desc, FreeCoinCount, PayCoinCount, RefundFreeCoinCount, RefundPayCoinCount, OrderType, Memo, ReceiptInfo} = this.data
  if (CardId) {msg['CardId'] = CardId[0]}
  if (RefuseReason) {msg['RefuseReason'] = RefuseReason[0]}
  if (IsGiveByFriend) {msg['IsGiveByFriend'] = IsGiveByFriend[0]}
  if (FriendUserName) {msg['FriendUserName'] = FriendUserName[0]}
  if (UserCardCode) {msg['UserCardCode'] = UserCardCode[0]}
  if (OldUserCardCode) {msg['OldUserCardCode'] = OldUserCardCode[0]}
  if (OuterStr) {msg['OuterStr'] = OuterStr[0]}
  if (IsRestoreMemberCard) {msg['IsRestoreMemberCard'] = IsRestoreMemberCard[0]}
  if (IsReturnBack) {msg['IsReturnBack'] = IsReturnBack[0]}
  if (IsChatRoom) {msg['IsChatRoom'] = IsChatRoom[0]}
  if (ConsumeSource) {msg['ConsumeSource'] = ConsumeSource[0]}
  if (LocationName) {msg['LocationName'] = LocationName[0]}
  if (StaffOpenId) {msg['StaffOpenId'] = StaffOpenId[0]}
  if (VerifyCode) {msg['VerifyCode'] = VerifyCode[0]}
  if (RemarkAmount) {msg['RemarkAmount'] = RemarkAmount[0]}
  if (TransId) {msg['TransId'] = TransId[0]}
  if (LocationId) {msg['LocationId'] = LocationId[0]}
  if (Fee) {msg['Fee'] = Fee[0]}
  if (OriginalFee) {msg['OriginalFee'] = OriginalFee[0]}
  if (ModifyBonus) {msg['ModifyBonus'] = ModifyBonus[0]}
  if (ModifyBalance) {msg['ModifyBalance'] = ModifyBalance[0]}
  if (Detail) {msg['Detail'] = Detail[0]}
  if (OrderId) {msg['OrderId'] = OrderId[0]}
  if (CreateOrderTime) {msg['CreateOrderTime'] = CreateOrderTime[0]}
  if (PayFinishTime) {msg['PayFinishTime'] = PayFinishTime[0]}
  if (Desc) {msg['Desc'] = Desc[0]}
  if (FreeCoinCount) {msg['FreeCoinCount'] = FreeCoinCount[0]}
  if (PayCoinCount) {msg['PayCoinCount'] = PayCoinCount[0]}
  if (RefundFreeCoinCount) {msg['RefundFreeCoinCount'] = RefundFreeCoinCount[0]}
  if (RefundPayCoinCount) {msg['RefundPayCoinCount'] = RefundPayCoinCount[0]}
  if (OrderType) {msg['OrderType'] = OrderType[0]}
  if (Memo) {msg['Memo'] = Memo[0]}
  if (ReceiptInfo) {msg['ReceiptInfo'] = ReceiptInfo[0]}
  // 微信门店审核事件推送
  const {UniqId, PoiId, Result} = this.data
  if (UniqId) {msg['UniqId'] = UniqId[0]}
  if (PoiId) {msg['PoiId'] = PoiId[0]}
  if (Result) {msg['Result'] = Result[0]}
  if (this.data.msg) {msg['msg'] = this.data.msg[0]}
  // 摇一摇事件通知
  const {ChosenBeacon, AroundBeacons} = this.data
  if (ChosenBeacon) {
    msg['ChosenBeacon'] = {
      'Uuid': ChosenBeacon[0].Uuid[0],
      'Major': ChosenBeacon[0].Major[0],
      'Minor': ChosenBeacon[0].Minor[0],
      'Distance': ChosenBeacon[0].Distance[0],
    }
  }
  if (AroundBeacons) {
    msg['AroundBeacons'] = map(AroundBeacons[0].AroundBeacon, (AroundBeacon) => {
      return {
        Uuid: AroundBeacon.Uuid[0],
        Major: AroundBeacon.Major[0],
        Minor: AroundBeacon.Minor[0],
        Distance: AroundBeacon.Distance[0]
      }
    })
  }
  // 微信连WI-FI
  const {ConnectTime, VendorId, ShopId, DeviceNo} = this.data
  if (ConnectTime) {msg['ConnectTime'] = ConnectTime[0]}
  if (VendorId) {msg['VendorId'] = VendorId[0]}
  if (ShopId) {msg['ShopId'] = ShopId[0]}
  if (DeviceNo) {msg['DeviceNo'] = DeviceNo[0]}
  // 扫一扫事件推送
  const {KeyStandard, KeyStr, Country, Province, City, Sex, Scene, ExtInfo, RegionCode, ReasonMsg} = this.data
  if (KeyStandard) {msg['KeyStandard'] = KeyStandard[0]}
  if (KeyStr) {msg['KeyStr'] = KeyStr[0]}
  if (Country) {msg['Country'] = Country[0]}
  if (Province) {msg['Province'] = Province[0]}
  if (City) {msg['City'] = City[0]}
  if (Sex) {msg['Sex'] = Sex[0]}
  if (Scene) {msg['Scene'] = Scene[0]}
  if (ExtInfo) {msg['ExtInfo'] = ExtInfo[0]}
  if (RegionCode) {msg['RegionCode'] = RegionCode[0]}
  if (ReasonMsg) {msg['ReasonMsg'] = ReasonMsg[0]}
  event.emit('onEvent', msg)
  return this
}

// 发送信息
Weixin.prototype.send = function(msg) {
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
    case 'xml':
      this.sendXML(msg)
      break
    case 'forward':
      this.forward(msg)
      break
  }
}

function generateOutput(ToUserName, output) {
  const {isEncrypted, appID, encodingAESKey, token} = await this.getConfig(ToUserName)
  if (isEncrypted) {
    const app = {
      appID,
      encodingAESKey,
      token
    }
    const Encrypt = nodeWeixinCrypto.encrypt(output, app)
    const Nonce = this.nonce || parseInt((Math.random() * 100000000000), 10)
    const TimeStamp = this.timestamp || new Date().getTime()
    const MsgSignature = getSignature(app.token, TimeStamp, Nonce, Encrypt)
    const xml = `
      <xml>
        <Encrypt><![CDATA[${Encrypt}]]></Encrypt>
        <MsgSignature><![CDATA[${MsgSignature}]]></MsgSignature>
        <TimeStamp>${TimeStamp}</TimeStamp>
        <Nonce><![CDATA[${Nonce}]]></Nonce>
      </xml>
    `
    return xml
  } else {
    return output
  }
}

Weixin.prototype.sendText = function(msg) {
  const CreateTime = Math.round(new Date().getTime() / 1000)
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
  const output = generateOutput(msg.ToUserName, xml)
  if (msg.Content.length == 0) {
    this.res.send('success')
  } else {
    this.res.type('xml')
    this.res.send(output.replace(/ /g, '').replace(/\n/g, ''))
  }
  return this
}

Weixin.prototype.sendImage = function(msg) {
  const CreateTime = Math.round(new Date().getTime() / 1000)
  const FuncFlag = msg.FuncFlag ? msg.FuncFlag : this.FuncFlag
  const xml = `
    <xml>
      <ToUserName><![CDATA[${msg.ToUserName}]]></ToUserName>
      <FromUserName><![CDATA[${msg.FromUserName}]]></FromUserName>
      <CreateTime>${CreateTime}</CreateTime>
      <MsgType><![CDATA[${msg.MsgType}]]></MsgType>
      <Image>
        <MediaId><![CDATA[${msg.MediaId}]]></MediaId>
      </Image>
      <FuncFlag>${FuncFlag}</FuncFlag>
    </xml>
  `
  const output = generateOutput(msg.ToUserName, xml)
  this.res.type('xml')
  this.res.send(output.replace(/ /g, '').replace(/\n/g, ''))
  return this
}

Weixin.prototype.sendMusic = function(msg) {
  const CreateTime = Math.round(new Date().getTime() / 1000)
  const FuncFlag = msg.FuncFlag ? msg.FuncFlag : this.FuncFlag
  const xml = `
    <xml>
      <ToUserName><![CDATA[${msg.ToUserName}]]></ToUserName>
      <FromUserName><![CDATA[${msg.FromUserName}]]></FromUserName>
      <CreateTime>${CreateTime}</CreateTime>
      <MsgType><![CDATA[${msg.MsgType}]]></MsgType>
      <Music>
        <Title><![CDATA[${msg.Title}]]></Title>
        <Description><![CDATA[${msg.Description}]]></Description>
        <MusicUrl><![CDATA[${msg.MusicUrl}]]></MusicUrl>
        <HQMusicUrl><![CDATA[${msg.HQMusicUrl}]]></HQMusicUrl>
      </Music>
      <FuncFlag>${FuncFlag}</FuncFlag>
    </xml>
  `
  const output = generateOutput(msg.ToUserName, xml)
  this.res.type('xml')
  this.res.send(output.replace(/ /g, '').replace(/\n/g, ''))
  return this
}

Weixin.prototype.sendNews = function(msg) {
  const CreateTime = Math.round(new Date().getTime() / 1000)
  let Articles = ''
  map(msg.Articles, (Article) => {
    Articles += `
      <item>
        <Title><![CDATA[${Article.Title}]]></Title>
        <Description><![CDATA[${Article.Description}]]></Description>
        <PicUrl><![CDATA[${Article.PicUrl}]]></PicUrl>
        <Url><![CDATA[${Article.Url}]]></Url>
      </item>
    `
  })

  const FuncFlag = msg.FuncFlag ? msg.FuncFlag : this.FuncFlag
  const xml = `
    <xml>
      <ToUserName><![CDATA[${msg.ToUserName}]]></ToUserName>
      <FromUserName><![CDATA[${msg.FromUserName}]]></FromUserName>
      <CreateTime>${CreateTime}</CreateTime>
      <MsgType><![CDATA[${msg.MsgType}]]></MsgType>
      <ArticleCount>${msg.Articles.length}</ArticleCount>
      <Articles>${Articles}</Articles>
      <FuncFlag>${FuncFlag}</FuncFlag>
    </xml>
  `
  const output = generateOutput(msg.ToUserName, xml)
  this.res.type('xml')
  this.res.send(output.replace(/ /g, '').replace(/\n/g, ''))
  return this
}

Weixin.prototype.sendXML = function(msg) {
  const {xml} = msg
  this.res.type('xml')
  this.res.send(xml.replace(/ /g, '').replace(/\n/g, ''))
}

// 将消息转发到客服
Weixin.prototype.forward = function(msg) {
  const CreateTime = Math.round(new Date().getTime() / 1000)
  let xml = `
    <xml>
      <ToUserName><![CDATA[${msg.ToUserName}]]></ToUserName>
      <FromUserName><![CDATA[${msg.FromUserName}]]></FromUserName>
      <CreateTime>${CreateTime}</CreateTime>
      <MsgType><![CDATA[transfer_customer_service]]></MsgType>
    </xml>
  `
  if (msg.KfAccount) {
    xml = xml.replace('</xml>', `
        <TransInfo>
          <KfAccount><![CDATA[${msg.KfAccount}]]></KfAccount>
        </TransInfo>
      </xml>
    `)
  }
  this.res.type('xml')
  this.res.send(xml.replace(/ /g, '').replace(/\n/g, ''))
}