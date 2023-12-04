import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Card, Flex, Tag, Input, Button, message, Popconfirm } from 'antd'
import { LoadingOutlined, SendOutlined } from '@ant-design/icons'

import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
} from 'wagmi'

import Header from '../../../components/Header'
import ImproperConnected from '../../../components/ImproperConnected'
import ExceptionLayout from '../../../components/ExceptionLayout'
import ChatCard from '../../../components/ChatCard'

import IOTC from '../../../common/contracts/IOTC.json'
import { formatUnits } from 'viem'
import {
  OTCs,
  MAX_UINT256,
  ZERO_ADDRESS,
  processStatuses,
} from '../../../constants'

import blockies from 'ethereum-blockies'

const Position: NextPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const router = useRouter()

  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const { data: processData }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'getProcess',
    args: [[router.query.positionIndex, router.query.processIndex]],
    watch: true,
  })
  const position = useMemo(() => {
    if (!processData) {
      return null
    }

    return {
      ...processData[0],
      token: processData[1],
    }
  }, [processData])

  const process = useMemo(() => {
    if (!processData) {
      return null
    }

    return {
      ...processData[2],
      token: processData[3],
    }
  }, [processData])

  const [text, setText] = useState('')
  const [approved, setApproved] = useState(true)

  const { isLoading: isLoadingOnSend, write: sendMessage } = useContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'sendMessage',
    args: [[router.query.positionIndex, router.query.processIndex], text],
    onSuccess: () => {
      messageApi.open({
        type: 'success',
        content: 'Success!',
      })
      setText('')
    },
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const {
    isLoading: isLoadingOnStart,
    write: startProcess,
    writeAsync,
  } = useContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'startProcess',
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

  const { isLoading: isLoadingOnFinish, write: finishProcess } =
    useContractWrite({
      address: OTCs[chain?.id ?? 11155111],
      abi: IOTC,
      functionName: 'finishProcess',
      args: [[router.query.positionIndex, router.query.processIndex], approved],
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

  const createBlockie = (address: any) => {
    return blockies.create({ seed: address, size: 8, scale: 16 }).toDataURL()
  }

  const getSwapQuote = async (
    chainId: any,
    buyToken: any,
    sellToken: any,
    buyAmount: any
  ) => {
    try {
      const apiUrl = `/api/swap?chainId=${encodeURIComponent(
        chainId
      )}&buyToken=${encodeURIComponent(
        buyToken
      )}&sellToken=${encodeURIComponent(
        sellToken
      )}&buyAmount=${encodeURIComponent(buyAmount)}`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      return data
    } catch (error) {
      console.error('Failed to fetch swap quote:', error)
      throw error
    }
  }

  const startProcessInit = async () => {
    let amount = 0n
    let calldata = ''
    if (position.amount !== 0n) {
      amount = position.amount + (position.amount * 100n) / 10000n
      if (process.arbiter !== ZERO_ADDRESS) {
        amount += (position.amount * 500n) / 10000n
      }

      if (position.token.addr !== process.token.addr) {
        const data = await getSwapQuote(
          chain?.id,
          position.token.addr,
          process.token.addr,
          amount
        )
        calldata = data.calldata
        amount = ((BigInt(data.sellAmount) + 10000n - 1n) * 10100n) / 10000n
      }
    }

    startProcess({
      args: [
        [router.query.positionIndex, router.query.processIndex],
        amount,
        calldata,
      ],
    })
  }

  return (
    <>
      <Header />
      {contextHolder}
      {isConnected && !chain?.unsupported ? (
        !position || !process ? (
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
              <Flex gap={'10px'}>
                <Card
                  className='card'
                  style={{
                    width: '50%',
                    overflow: 'auto',
                    minHeight: '50vh',
                    maxHeight: '40rem',
                  }}
                >
                  <ReactMarkdown>{position.text}</ReactMarkdown>
                </Card>
                <Flex
                  style={{
                    width: '50%',
                    minWidth: 'fit-content',
                  }}
                  gap='10px'
                  vertical
                >
                  <Card
                    className='card'
                    title={
                      <Tag bordered={false} color='processing'>
                        Position #{position.positionIndex.toString()}
                      </Tag>
                    }
                  >
                    <Flex>
                      <Tag bordered={false} color='processing'>
                        Creator:{' '}
                        {position.creator === address
                          ? 'You'
                          : position.creator}
                      </Tag>
                      <Tag bordered={false} color='processing'>
                        Price:{' '}
                        {formatUnits(
                          position.amount,
                          Number(position.token.decimals)
                        )}{' '}
                        {position.token.symbol}
                      </Tag>

                      <Tag bordered={false} color='processing'>
                        {position.limit === MAX_UINT256 ? (
                          <>Unlimited</>
                        ) : (
                          <>
                            Sold: {position.startedCounter.toString()}/
                            {position.limit.toString()}
                          </>
                        )}
                      </Tag>
                      <Tag bordered={false} color='processing'>
                        {position.privateChat ? 'Private Chat' : 'Public Chat'}
                      </Tag>
                    </Flex>
                  </Card>
                  <Card
                    className='card'
                    title={
                      <Tag color='processing'>
                        Process #
                        {process.processPointer.processIndex.toString()}
                      </Tag>
                    }
                  >
                    <Flex justify='space-between'>
                      <div>
                        <Tag
                          color={
                            process.status === 0 || process.status === 1
                              ? 'processing'
                              : process.status === 2
                              ? 'error'
                              : 'success'
                          }
                        >
                          Status: {processStatuses[Number(process.status)]}
                        </Tag>
                      </div>
                      <div>
                        <Tag color={'processing'}>
                          {process.arbiter === ZERO_ADDRESS
                            ? 'No Arbiter'
                            : process.arbiter === address
                            ? 'Arbiter: You'
                            : `Arbiter: ${process.arbiter}`}
                        </Tag>
                        <Tag color={'processing'}>
                          Token: {process.token.symbol}
                        </Tag>
                      </div>
                    </Flex>
                  </Card>

                  {position.creator === address && process.status === 0 && (
                    <Card className='card'>
                      <Flex justify='center'>
                        <Button
                          type='primary'
                          size='large'
                          onClick={() => startProcessInit()}
                          loading={isLoadingOnStart}
                          icon={<SendOutlined />}
                        >
                          Start process
                        </Button>
                      </Flex>
                    </Card>
                  )}
                  {process.status === 1 &&
                    (process.arbiter !== ZERO_ADDRESS
                      ? process.arbiter === address
                      : process.customer === address) && (
                      <Card className='card'>
                        <Flex justify='center' gap='1rem'>
                          <Popconfirm
                            title='Reject the process'
                            description='Are you sure to reject this process?'
                            onConfirm={() => finishProcess()}
                            okText='Yes'
                            cancelText='No'
                          >
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => setApproved(false)}
                              loading={isLoadingOnFinish}
                              icon={<SendOutlined />}
                              danger
                            >
                              Reject process
                            </Button>
                          </Popconfirm>
                          <Popconfirm
                            title='Approve the process'
                            description='Are you sure to approve this process?'
                            onConfirm={() => finishProcess()}
                            okText='Yes'
                            cancelText='No'
                          >
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => setApproved(true)}
                              loading={isLoadingOnFinish}
                              icon={<SendOutlined />}
                            >
                              Approve process
                            </Button>
                          </Popconfirm>
                        </Flex>
                      </Card>
                    )}

                  <Card className='card' style={{ height: '40rem' }}>
                    <Flex vertical>
                      <Flex
                        vertical
                        style={{ overflowY: 'auto', height: '35rem' }}
                      >
                        {process.messages.map((message: any, index: number) => (
                          <Flex
                            key={index}
                            justify={
                              message.sender === address ? 'end' : 'start'
                            }
                          >
                            <ChatCard
                              sender={message.sender}
                              avatar={createBlockie(message.sender)}
                              message={message.text}
                            />
                          </Flex>
                        ))}
                      </Flex>
                      <Flex>
                        <Input.Search
                          placeholder='Write something...'
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          loading={isLoadingOnSend}
                          onSearch={() => sendMessage()}
                          enterButton={<SendOutlined />}
                        />
                      </Flex>
                    </Flex>
                  </Card>
                </Flex>
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

export default Position
