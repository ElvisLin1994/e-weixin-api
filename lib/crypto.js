import {pseudoRandomBytes, createCipheriv, createDecipheriv, createHash} from 'crypto'

const pcks7 = {
  unpad: function (text) {
    let pad = text[text.length - 1]
    if (pad < 1 || pad > 32) {
      pad = 0
    }
    return text.slice(0, text.length - pad)
  },
  pad: function (text) {
    const k = 32
    const n = text.length
    const pads = k - n % k
    const buffer = new Buffer(pads)
    buffer.fill(pads)
    const tb = new Buffer(text)
    return Buffer.concat([tb, buffer])
  }
}

export function encrypt(plainText, app) {
  // Random Bytes Generation
  const randomBytes = pseudoRandomBytes(16)

  const textBuffer = new Buffer(plainText)

  // 4 Bytes Network Sequential Long buffr
  const fourBitSequence = new Buffer(4)
  fourBitSequence.writeUInt32BE(textBuffer.length, 0)

  const encBuffer = Buffer.concat([new Buffer(randomBytes), fourBitSequence, textBuffer, new Buffer(app.appID)])

  const padded = pcks7.pad(encBuffer)

  const key = new Buffer(app.encodingAESKey + '=', 'base64')
  if (key.length !== 32) {
    throw Error('encodingAESKey Length Error')
  }
  const iv = key.slice(0, 16)

  const cipher = createCipheriv('aes-256-cbc', key, iv)
  cipher.setAutoPadding(false)

  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()])
  return encrypted.toString('base64')
}

export function decrypt(encrypted, app) {
  const key = new Buffer(app.encodingAESKey + '=', 'base64')
  if (key.length !== 32) {
    throw Error('encodingAESKey Length Error')
  }
  const iv = key.slice(0, 16)

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  decipher.setAutoPadding(false)
  const decrypted = Buffer.concat([decipher.update(encrypted, 'base64'), decipher.final()])

  const unpadded = pcks7.unpad(decrypted)

  const wrapped = unpadded.slice(16)
  const length = wrapped.slice(0, 4).readUInt32BE(0)
  return wrapped.slice(4, length + 4).toString()
}

export function sign(text, app, timestamp, nonce) {
  const encrypted = this.encrypt(text, app)
  const sha1 = crypto.createHash('sha1')
  const sortable = [app.token, timestamp, nonce, encrypted].sort()
  sha1.update(sortable.join(''))
  return sha1.digest('hex')
}