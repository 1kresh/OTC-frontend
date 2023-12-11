import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Card, Flex, Tag, Input, Checkbox, Select, Button, message } from 'antd'
import { LoadingOutlined, SendOutlined } from '@ant-design/icons'

import Link from 'next/link'
import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  erc20ABI,
  useWaitForTransaction,
  usePrepareContractWrite,
} from 'wagmi'

import Header from '../../components/Header'
import ImproperConnected from '../../components/ImproperConnected'
import ExceptionLayout from '../../components/ExceptionLayout'
import PositionMiniCard from '../../components/PositionMiniCard'
import ProcessMiniCard from '../../components/ProcessMiniCard'

import IOTC from '../../common/contracts/IOTC.json'
import IPermit2 from '../../common/contracts/IPermit2.json'

import { OTCs, MAX_UINT256, ZERO_ADDRESS, permit2s } from '../../constants'
import { MAX_UINT160, MAX_UINT48, MAX_UINT96 } from '../../constants'

const Position: NextPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const router = useRouter()

  const { isConnected, address }: any = useAccount()
  const { chain } = useNetwork()

  const [cursor, setCursor] = useState(0)

  const { data: positionData }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'getProcesses',
    args: [router.query.positionIndex, cursor, 200],
    watch: true,
  })
  const position = useMemo(() => {
    if (!positionData) {
      return null
    }

    return {
      ...positionData[0],
      token: positionData[1],
      type: 0,
    }
  }, [positionData])

  const processes = useMemo(() => {
    if (!positionData) {
      return []
    }

    return positionData[2].map((process: any, index: number) => {
      return {
        ...process,
        token: positionData[3][index],
      }
    })
  }, [positionData])

  const { data: whitelistedTokensData }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'whitelistedTokens',
  })
  const whitelistedTokens = useMemo(() => {
    if (!whitelistedTokensData) {
      return {}
    }

    const whitelistedTokens_: any = {}

    whitelistedTokensData.map((token: any) => {
      whitelistedTokens_[token.addr] = {
        value: token.addr,
        label: token.symbol,
        decimals: token.decimals,
        name: token.name,
      }
    })

    return whitelistedTokens_
  }, [whitelistedTokensData])

  const [arbiter, setArbiter] = useState('')
  const [noArbiter, setNoArbiter] = useState(false)
  const [token, setToken] = useState('')

  const { data: tokenAllowanceData } = useContractRead({
    address: token as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, permit2s[chain?.id ?? 11155111]],
    watch: true,
  })
  const tokenAllowance = useMemo(() => {
    if (!tokenAllowanceData) {
      return 0
    }

    return tokenAllowanceData
  }, [tokenAllowanceData])

  const { data: permit2AllowanceData }: any = useContractRead({
    address: permit2s[chain?.id ?? 11155111],
    abi: IPermit2,
    functionName: 'allowance',
    args: [address, token, OTCs[chain?.id ?? 11155111]],
    watch: true,
  })
  const permit2Allowance = useMemo(() => {
    if (!permit2AllowanceData) {
      return 0
    }

    return permit2AllowanceData[0]
  }, [permit2AllowanceData])

  const { config: approveConfig } = usePrepareContractWrite({
    address: token as `0x${string}`,
    abi: erc20ABI,
    functionName: 'approve',
    args: [permit2s[chain?.id ?? 11155111], MAX_UINT256],
  })

  const {
    isLoading: isLoadingOnApprove,
    write: approve,
    data: approveData,
  } = useContractWrite({
    ...approveConfig,
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnApproveTransaction } = useWaitForTransaction({
    hash: approveData?.hash,
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

  const { config: permit2ApproveConfig } = usePrepareContractWrite({
    address: permit2s[chain?.id ?? 11155111],
    abi: IPermit2,
    functionName: 'approve',
    args: [token, OTCs[chain?.id ?? 11155111], MAX_UINT160, MAX_UINT48],
  })

  const {
    isLoading: isLoadingOnPermit2Approve,
    write: permit2Approve,
    data: permit2ApproveData,
  } = useContractWrite({
    ...permit2ApproveConfig,
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnPermit2ApproveTransaction } =
    useWaitForTransaction({
      hash: permit2ApproveData?.hash,
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

  const { config: createProcessConfig } = usePrepareContractWrite({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'createProcess',
    args: [router.query.positionIndex, arbiter, token],
  })

  const {
    isLoading: isLoadingOnCreateProcess,
    write: createProcess,
    data: createProcessData,
  } = useContractWrite({
    ...createProcessConfig,
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Something went wrong!',
      })
    },
  })

  const { isLoading: isLoadingOnCreateProcessTransaction } =
    useWaitForTransaction({
      hash: createProcessData?.hash,
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

  const isEnoughApproval = useMemo(
    () => tokenAllowance >= MAX_UINT96,
    [tokenAllowance]
  )

  const isEnoughPermit2Approval = useMemo(
    () => permit2Allowance >= MAX_UINT96,
    [permit2Allowance]
  )

  return (
    <>
      <Header />
      {contextHolder}
      {isConnected && !chain?.unsupported ? (
        !position ? (
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
                  {position.creator !== address && (
                    <Card className='card'>
                      <Flex align='center' gap='2rem' vertical>
                        <Flex gap={'5rem'} align='start' justify='center'>
                          <Flex
                            justify='center'
                            align='center'
                            vertical
                            gap='0.5rem'
                          >
                            <div style={{ fontWeight: '500' }}>Arbiter</div>
                            <Flex vertical align='center' justify='center'>
                              <Input
                                placeholder='0x...'
                                value={arbiter}
                                onChange={(e) => setArbiter(e.target.value)}
                                style={{ width: '25rem' }}
                                disabled={noArbiter}
                              />

                              <Checkbox
                                checked={noArbiter}
                                onChange={(e) => {
                                  setNoArbiter(e.target.checked)
                                  if (e.target.checked) setArbiter(ZERO_ADDRESS)
                                }}
                              >
                                No Arbiter
                              </Checkbox>
                            </Flex>
                          </Flex>
                          <Flex
                            justify='center'
                            align='center'
                            vertical
                            gap='0.5rem'
                          >
                            <div style={{ fontWeight: '500' }}>
                              Payment token
                            </div>
                            <Flex gap='0.5rem'>
                              <Select
                                value={token}
                                onChange={(value) => setToken(value)}
                                options={Object.values(whitelistedTokens) as []}
                                style={{ width: '5rem' }}
                              />
                            </Flex>
                          </Flex>
                        </Flex>
                        <Flex>
                          {!isEnoughApproval ? (
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => approve?.()}
                              loading={
                                isLoadingOnApprove ||
                                isLoadingOnApproveTransaction
                              }
                              icon={<SendOutlined />}
                            >
                              Approve to Permit2
                            </Button>
                          ) : !isEnoughPermit2Approval ? (
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => permit2Approve?.()}
                              loading={
                                isLoadingOnPermit2Approve ||
                                isLoadingOnPermit2ApproveTransaction
                              }
                              icon={<SendOutlined />}
                            >
                              Approve with Permit2
                            </Button>
                          ) : (
                            <Button
                              type='primary'
                              size='large'
                              onClick={() => createProcess?.()}
                              loading={
                                isLoadingOnCreateProcess ||
                                isLoadingOnCreateProcessTransaction
                              }
                              icon={<SendOutlined />}
                            >
                              Create process
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    </Card>
                  )}
                  <Card>
                    <Flex gap='1rem' align='center' vertical>
                      {processes.length === 0 ? (
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>
                          There is no processes.
                        </div>
                      ) : (
                        processes.map((process: any, index: number) => (
                          <Link
                            key={index}
                            href={`/process/${process.processPointer.positionIndex}/${process.processPointer.processIndex}`}
                            style={{ width: '100%' }}
                          >
                            <ProcessMiniCard process={process} />
                          </Link>
                        ))
                      )}
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
