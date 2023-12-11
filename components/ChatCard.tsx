import React, { useEffect, useMemo, useState } from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { Card, Avatar, Typography, Button } from 'antd'
import EthCrypto from 'eth-crypto'
import { useAccount } from 'wagmi'

const ChatCard = ({
  position,
  process,
  sender,
  avatar,
  message,
  privateMessage,
  privateKey,
  setIsPrivateKeyModalOpen,
}: any) => {
  const { address } = useAccount()

  const ableToDecrypt = useMemo(
    () =>
      privateMessage &&
      (address == position.creator || address == process.customer) &&
      sender !== address,
    [address]
  )

  const [text, setText] = useState(
    ableToDecrypt ? 'Click to decrypt!' : message
  )

  useEffect(() => {
    if (ableToDecrypt) {
      setText('Click to decrypt!')
    } else {
      setText(message)
    }
  }, [ableToDecrypt])

  useEffect(() => {
    ;(async () => {
      try {
        const identity = EthCrypto.cipher.parse(message)
        const decrypted = await EthCrypto.decryptWithPrivateKey(
          privateKey,
          identity
        )
        setText(decrypted)
      } catch {}
    })()
  }, [privateKey])

  return (
    <Card
      style={{
        width: '300px',
        cursor: ableToDecrypt ? 'pointer' : 'unset',
      }}
      bordered={false}
      onClick={ableToDecrypt ? () => setIsPrivateKeyModalOpen(true) : undefined}
    >
      <Card.Meta
        avatar={<Avatar src={avatar} />}
        title={sender}
        description={<Typography.Text>{text}</Typography.Text>}
      />
    </Card>
  )
}

export default ChatCard
