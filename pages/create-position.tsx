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
  Typography,
  Badge,
  Tooltip,
} from 'antd'
import {
  InfoCircleOutlined,
  LoadingOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import ReactMarkdown from 'react-markdown'
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from 'wagmi'

import Header from '../components/Header'
import ImproperConnected from '../components/ImproperConnected'
import ExceptionLayout from '../components/ExceptionLayout'

import IOTC from '../common/contracts/IOTC.json'
import { OTCs, MAX_UINT256 } from '../constants'
import { parseUnits } from 'viem'

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
})

const CreatePosition: NextPage = () => {
  const [messageApi, contextHolder] = message.useMessage()

  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const { data }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'whitelistedTokens',
  })
  const whitelistedTokens = useMemo(() => {
    if (!data) {
      return {}
    }

    const whitelistedTokens_: any = {}

    data.map((token: any) => {
      whitelistedTokens_[token.addr] = {
        value: token.addr,
        label: token.symbol,
        decimals: token.decimals,
        name: token.name,
      }
    })

    return whitelistedTokens_
  }, [data])

  const [positionType, setPositionType] = useState(0)
  const [markdown, setMarkdown] = useState('')
  const [isPrivateChat, setIsPrivateChat] = useState(false)
  const [limit, setLimit] = useState(1)
  const [amount, setAmount] = useState(100)
  const [token, setToken] = useState('')
  const [isUnlimited, setIsUnlimited] = useState(false)

  const limitParsed = useMemo(() => {
    if (!limit) {
      return MAX_UINT256
    }
    return limit
  }, [limit])

  const amountParsed = useMemo(() => {
    return parseUnits(
      amount.toString(),
      Number(whitelistedTokens[token]?.decimals)
    )
  }, [amount, whitelistedTokens, token])

  const { config: createPositionConfig } = usePrepareContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'createPosition',
    args: [
      positionType,
      markdown,
      limitParsed,
      token,
      amountParsed,
      isPrivateChat,
    ],
  })

  const {
    isLoading: isLoadingOnCreatePosition,
    write: createPosition,
    data: createPositionData,
  } = useContractWrite({
    ...createPositionConfig,
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnCreatePositionTransaction } =
    useWaitForTransaction({
      hash: createPositionData?.hash,
      onSuccess: () => {
        messageApi.open({
          type: 'success',
          content: 'Success!',
        })
      },
      onError: () => {
        messageApi.open({
          type: 'error',
          content: 'Something went wrong!',
        })
      },
    })

  return (
    <>
      <Header />
      {contextHolder}
      {isConnected && !chain?.unsupported ? (
        false ? (
          <ExceptionLayout child={<LoadingOutlined />} />
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <Card style={{ width: '90%', borderColor: '#bdbfbe' }}>
              <Flex justify='center'>
                <Typography.Title level={4}>
                  Position description
                </Typography.Title>
              </Flex>
              <Flex gap={'10px'}>
                <Card
                  style={{
                    width: '50%',
                    overflow: 'auto',
                    minHeight: '50vh',
                    maxHeight: '40rem',
                  }}
                >
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </Card>
                <div
                  style={{
                    width: '50%',
                  }}
                >
                  <MdEditor
                    renderHTML={(text) => <></>}
                    value={markdown}
                    onChange={(content) => setMarkdown(content.text)}
                    view={{ menu: true, md: true, html: false }}
                    canView={{
                      menu: true,
                      md: true,
                      html: false,
                      both: false,
                      fullScreen: true,
                      hideMenu: true,
                    }}
                    style={{ height: '100%', minHeight: '50vh' }}
                  />
                </div>
              </Flex>
              <Flex
                style={{ marginTop: '20px', padding: '0 2rem' }}
                gap={'5rem'}
                align='start'
                justify='center'
              >
                <Flex justify='center' align='center' vertical gap='0.5rem'>
                  <div style={{ fontWeight: '500' }}>Limit</div>
                  <Flex vertical align='center' justify='center'>
                    <Input
                      type='number'
                      min={1}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      disabled={isUnlimited}
                    />
                    <Checkbox
                      checked={isUnlimited}
                      onChange={(e) => {
                        setIsUnlimited(e.target.checked)
                        if (e.target.checked) setLimit(0)
                      }}
                    >
                      Unlimited
                    </Checkbox>
                  </Flex>
                </Flex>

                <Flex justify='center' align='center' vertical gap='0.5rem'>
                  <div style={{ fontWeight: '500' }}>Price</div>
                  <Flex gap='0.5rem'>
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      style={{ width: '8rem' }}
                    />
                    <Select
                      value={token}
                      onChange={(value) => setToken(value)}
                      options={Object.values(whitelistedTokens) as []}
                      style={{ width: '5rem' }}
                    />
                  </Flex>
                </Flex>

                <Flex justify='center' align='center' vertical gap='0.5rem'>
                  {isPrivateChat ? (
                    <div style={{ fontWeight: '500' }}>
                      Private Chat{' '}
                      <Tooltip
                        title={
                          <Flex vertical>
                            <Flex>Use it with caution!</Flex>
                            <Flex>
                              You will need to submit your private key to
                              decrypt messages.
                            </Flex>
                          </Flex>
                        }
                        color={'gold'}
                      >
                        <InfoCircleOutlined style={{ color: 'orange' }} />
                      </Tooltip>
                    </div>
                  ) : (
                    <div style={{ fontWeight: '500' }}>Private Chat</div>
                  )}
                  <Checkbox
                    checked={isPrivateChat}
                    onChange={(e) => setIsPrivateChat(e.target.checked)}
                  ></Checkbox>
                </Flex>
              </Flex>
              <Flex
                justify='center'
                align='center'
                style={{ marginTop: '4rem' }}
              >
                <Button
                  type='primary'
                  size='large'
                  onClick={() => createPosition?.()}
                  loading={
                    isLoadingOnCreatePosition ||
                    isLoadingOnCreatePositionTransaction
                  }
                  icon={<SendOutlined />}
                >
                  Create new position
                </Button>
              </Flex>
            </Card>
          </div>
        )
      ) : (
        <ImproperConnected />
      )}
    </>
  )
}

export default CreatePosition
