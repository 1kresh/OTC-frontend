import React from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { Card, Avatar, Typography } from 'antd'

const ChatCard = ({ sender, avatar, message }: any) => {
  return (
    <Card style={{ width: 300, marginTop: 16 }} bordered={false}>
      <Card.Meta
        avatar={<Avatar src={avatar} />}
        title={sender}
        description={<Typography.Text>{message}</Typography.Text>}
      />
    </Card>
  )
}

export default ChatCard
