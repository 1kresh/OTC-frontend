import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, Card, Flex, Layout } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Header = () => {
  const router = useRouter()

  const [current, setCurrent] = useState('all')

  const menuItems = [
    { label: <Link href='/'>All Positions</Link>, key: '/' },
    {
      label: <Link href='/my-positions'>My Positions</Link>,
      key: '/my-positions',
    },
    {
      label: <Link href='/my-processes'>My Processes</Link>,
      key: '/my-processes',
    },
  ]

  return (
    <Flex
      style={{
        border: '0',
        borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
        lineHeight: '46px',
        padding: '0 1rem',
      }}
      justify='space-between'
      align='center'
    >
      <Menu
        selectedKeys={[router.pathname]}
        mode='horizontal'
        items={menuItems}
      />
      <ConnectButton />
    </Flex>
  )
}

export default Header
