import React, { useState, useMemo, useEffect } from 'react'
import { NextPage } from 'next'

import {
  Card,
  Flex,
  Tag,
  Input,
  Button,
  message,
  Popconfirm,
  Typography,
  Switch,
  Modal,
} from 'antd'
import { LoadingOutlined, SendOutlined } from '@ant-design/icons'

import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useSignMessage,
  useWaitForTransaction,
  usePrepareContractWrite,
} from 'wagmi'

import Header from '../../../components/Header'
import ImproperConnected from '../../../components/ImproperConnected'
import ExceptionLayout from '../../../components/ExceptionLayout'
import ChatCard from '../../../components/ChatCard'
import PositionMiniCard from '../../../components/PositionMiniCard'
import ProcessMiniCard from '../../../components/ProcessMiniCard'

import IOTC from '../../../common/contracts/IOTC.json'
import IPublicKeysRegistry from '../../../common/contracts/IPublicKeysRegistry.json'

import {
  OTCs,
  PUBLIC_KEY_MESSAGE,
  ZERO_ADDRESS,
  ZERO_BYTES64,
  registries,
} from '../../../constants'

import blockies from 'ethereum-blockies'
import { hashMessage, recoverPublicKey, toBytes } from 'viem'
import EthCrypto from 'eth-crypto'

const Position: NextPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const router = useRouter()

  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const [privateChatting, setPrivateChatting] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false)

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

    setPrivateChatting(processData[0].privateChat)

    return {
      ...processData[0],
      token: processData[1],
      type: 0,
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

  const {
    isLoading: isLoadingOnSendMessage,
    write: sendMessage,
    data: sendMessageData,
  } = useContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'sendMessage',
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnSendMessageTransaction } =
    useWaitForTransaction({
      hash: sendMessageData?.hash,
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

  async function encryptMessage(publicKey: any, message: any) {
    console.log(publicKey, 'publicKey')
    const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, message)
    const encryptedString = EthCrypto.cipher.stringify(encrypted)
    return encryptedString
  }

  const sendMessageInit = async () => {
    if (privateChatting) {
      const encryptedText = await encryptMessage(
        receiverPublicKey.slice(2),
        text
      )
      sendMessage({
        args: [
          [router.query.positionIndex, router.query.processIndex],
          encryptedText,
          privateChatting,
        ],
      })
    } else {
      sendMessage({
        args: [
          [router.query.positionIndex, router.query.processIndex],
          text,
          false,
        ],
      })
    }
  }

  const {
    isLoading: isLoadingOnStartProcess,
    write: startProcess,
    data: startProcessData,
  } = useContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'startProcess',
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnStartProcessTransaction } =
    useWaitForTransaction({
      hash: startProcessData?.hash,
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

  const { config: finishProcessConfig } = usePrepareContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'finishProcess',
    args: [[router.query.positionIndex, router.query.processIndex], approved],
  })

  const {
    isLoading: isLoadingOnFinishProcess,
    write: finishProcess,
    data: finishProcessData,
  } = useContractWrite({
    ...finishProcessConfig,
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnFinishProcessTransaction } =
    useWaitForTransaction({
      hash: finishProcessData?.hash,
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

  const { data: myPublicKey }: any = useContractRead({
    address: registries[chain?.id ?? 11155111],
    abi: IPublicKeysRegistry,
    functionName: 'getPublicKey',
    args: [address],
    watch: true,
  })

  const { data: receiverPublicKey }: any = useContractRead({
    address: registries[chain?.id ?? 11155111],
    abi: IPublicKeysRegistry,
    functionName: 'getPublicKey',
    args: [
      address === position?.creator ? process?.customer : position?.creator,
    ],
    watch: true,
  })

  const {
    data: publicKeySignature,
    isLoading: isLoadingOnSignPublicKey,
    signMessage: signPublicKey,
  } = useSignMessage({
    message: PUBLIC_KEY_MESSAGE,
    onSuccess: (publicKeySignature_) => {
      submitPublicKeyInit(publicKeySignature_)
    },
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const {
    isLoading: isLoadingOnSubmitPublicKey,
    write: submitPublicKey,
    data: submitPublicKeyData,
  } = useContractWrite({
    address: registries[chain?.id ?? 11155111],
    abi: IPublicKeysRegistry,
    functionName: 'submitPublicKey',
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnSubmitPublicKeyTransaction } =
    useWaitForTransaction({
      hash: submitPublicKeyData?.hash,
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

  const submitPublicKeyInit = async (publicKeySignature_: string) => {
    let publicKey = await recoverPublicKey({
      hash: hashMessage(PUBLIC_KEY_MESSAGE),
      signature: publicKeySignature_ as `0x${string}`,
    })
    publicKey = `0x${publicKey.slice(4)}`

    submitPublicKey({ args: [publicKey] })
  }

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
                    maxHeight: '45rem',
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
                  <PositionMiniCard position={position} />
                  <ProcessMiniCard process={process} />

                  {position.creator === address && process.status === 0 && (
                    <Card className='card'>
                      <Flex justify='center'>
                        <Button
                          type='primary'
                          size='large'
                          onClick={() => startProcessInit()}
                          loading={
                            isLoadingOnStartProcess ||
                            isLoadingOnStartProcessTransaction
                          }
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
                            onConfirm={() => finishProcess?.()}
                            okText='Yes'
                            cancelText='No'
                          >
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => setApproved(false)}
                              loading={
                                isLoadingOnFinishProcess ||
                                isLoadingOnFinishProcessTransaction
                              }
                              icon={<SendOutlined />}
                              danger
                            >
                              Reject process
                            </Button>
                          </Popconfirm>
                          <Popconfirm
                            title='Approve the process'
                            description='Are you sure to approve this process?'
                            onConfirm={() => finishProcess?.()}
                            okText='Yes'
                            cancelText='No'
                          >
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => setApproved(true)}
                              loading={
                                isLoadingOnFinishProcess ||
                                isLoadingOnFinishProcessTransaction
                              }
                              icon={<SendOutlined />}
                            >
                              Approve process
                            </Button>
                          </Popconfirm>
                        </Flex>
                      </Card>
                    )}

                  {position.privateChat &&
                  (address == position.creator ||
                    address == process.customer) &&
                  myPublicKey === ZERO_BYTES64 ? (
                    <Card className='card'>
                      <Flex vertical justify='center' align='center'>
                        <Typography.Title level={5}>
                          Submit your public key to access the chat!
                        </Typography.Title>
                        <Button
                          type='primary'
                          size='large'
                          onClick={() => signPublicKey()}
                          loading={
                            isLoadingOnSignPublicKey ||
                            isLoadingOnSubmitPublicKey ||
                            isLoadingOnSubmitPublicKeyTransaction
                          }
                          icon={<SendOutlined />}
                        >
                          Submit public key
                        </Button>
                      </Flex>
                    </Card>
                  ) : (
                    <Card
                      className='card'
                      style={{ height: '40rem' }}
                      bodyStyle={{ height: '100%' }}
                    >
                      <Flex vertical style={{ height: '100%' }}>
                        {position.privateChat &&
                          (address == position.creator ||
                            address == process.customer) && (
                            <Flex
                              justify='center'
                              style={{
                                marginBottom: '1rem',
                                height: 'fit-content',
                              }}
                            >
                              <Switch
                                checkedChildren='Private chatting'
                                unCheckedChildren='Public chatting'
                                onChange={(checked) =>
                                  setPrivateChatting(checked)
                                }
                                checked={privateChatting}
                              />
                            </Flex>
                          )}
                        <Flex
                          vertical
                          style={{
                            overflowY: 'auto',
                            height: '100%',
                          }}
                          gap='16px'
                        >
                          <div></div>
                          {process.messages.map(
                            (message: any, index: number) => (
                              <Flex
                                key={index}
                                justify={
                                  message.sender === address ? 'end' : 'start'
                                }
                              >
                                <ChatCard
                                  position={position}
                                  process={process}
                                  sender={message.sender}
                                  avatar={createBlockie(message.sender)}
                                  message={message.text}
                                  privateMessage={message.isPrivate}
                                  privateKey={privateKey}
                                  setIsPrivateKeyModalOpen={
                                    setIsPrivateKeyModalOpen
                                  }
                                />
                              </Flex>
                            )
                          )}
                          <div></div>
                        </Flex>
                        {(address === process.arbiter ||
                          address == position.creator ||
                          address == process.customer) && (
                          <Flex style={{ height: 'fit-content' }}>
                            <Input.Search
                              placeholder='Write something...'
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              loading={
                                isLoadingOnSendMessage ||
                                isLoadingOnSendMessageTransaction
                              }
                              onSearch={() => sendMessageInit()}
                              enterButton={<SendOutlined />}
                              disabled={
                                privateChatting &&
                                receiverPublicKey === ZERO_BYTES64
                              }
                            />
                          </Flex>
                        )}
                      </Flex>
                      {privateChatting && (
                        <Modal
                          title='Use with caution!'
                          open={isPrivateKeyModalOpen}
                          footer={[
                            <Button
                              key='submit'
                              type='primary'
                              onClick={() => setIsPrivateKeyModalOpen(false)}
                            >
                              Submit
                            </Button>,
                          ]}
                          onCancel={() => setIsPrivateKeyModalOpen(false)}
                          width={'40rem'}
                        >
                          <Flex vertical align='center' justify='center'>
                            <Flex justify='start' style={{ width: '100%' }}>
                              <Typography.Title
                                level={5}
                                style={{ fontWeight: '400' }}
                              >
                                Submit your private key to decrypt the messages.
                              </Typography.Title>
                            </Flex>
                            <Input
                              placeholder='Your private key'
                              value={privateKey}
                              onChange={(e) => setPrivateKey(e.target.value)}
                              style={{ width: '36rem' }}
                            />
                          </Flex>
                        </Modal>
                      )}
                    </Card>
                  )}
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
