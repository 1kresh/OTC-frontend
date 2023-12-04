import React, { useState, useEffect, useMemo } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import 'react-markdown-editor-lite/lib/index.css'

import {
  Menu,
  Card,
  Flex,
  Layout,
  Space,
  Tag,
  Input,
  Checkbox,
  Select,
  Button,
  message,
  Avatar,
  Typography,
} from 'antd'

const ChatCard = ({ sender, avatar, message }) => {
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
