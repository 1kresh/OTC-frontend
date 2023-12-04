import React, { useState, useEffect, useMemo } from 'react'
import { NextPage } from 'next'

import { Menu, Card, Flex, Layout, Space, Tag } from 'antd'
import Link from 'next/link'

import ReactMarkdown from 'react-markdown'
import { useAccount, useNetwork, useContractRead } from 'wagmi'

import Header from 'components/Header.tsx'
import ImproperConnected from 'components/ImproperConnected.tsx'
import ExceptionLayout from 'components/ExceptionLayout'

import IOTC from 'common/contracts/IOTC.json'
import { OTCs, processStatuses } from 'constants/index.tsx'
import { LoadingOutlined } from '@ant-design/icons'

const MyProcesses: NextPage = () => {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const [cursor, setCursor] = useState(0)

  const { data, isError, isLoading } = useContractRead({
    address: OTCs[chain?.id],
    abi: IOTC,
    functionName: 'getProcessesByPaticipant',
    args: [address, cursor, 200],
    watch: true,
  })
  const positions = useMemo(() => {
    if (!data) {
      return null
    }

    return data[0].map((position, index) => {
      return {
        ...position,
        token: data[1][index],
      }
    })
  }, [data])
  const processes = useMemo(() => {
    if (!data) {
      return null
    }

    return data[2].map((process, index) => {
      return {
        ...process,
        token: data[3][index],
      }
    })
  }, [data])

  return (
    <>
      <Header />
      {isConnected && !chain?.unsupported ? (
        !positions || !processes ? (
          <ExceptionLayout child={<LoadingOutlined />} />
        ) : (
          <>
            {processes.length != 0 ? (
              <Flex vertical style={{ padding: '5rem 20rem' }} gap='3rem'>
                {processes.map((process, index) => (
                  <Link
                    key={index}
                    href={`/process/${process.processPointer.positionIndex}/${process.processPointer.processIndex}`}
                  >
                    <div
                      style={{
                        height: '16rem',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Card
                        key={index}
                        title={
                          <>
                            <Tag
                              color={
                                process.status === 0 || process.status === 1
                                  ? 'processing'
                                  : process.status === 2
                                  ? 'error'
                                  : 'success'
                              }
                            >
                              Status: {processStatuses[process.status]}
                            </Tag>
                          </>
                        }
                        extra={
                          <>
                            <Tag color='processing'>
                              You are{' '}
                              <span style={{ fontWeight: '700' }}>
                                {process.customer === address
                                  ? 'a customer'
                                  : 'an arbiter'}
                              </span>
                            </Tag>
                          </>
                        }
                        style={{
                          zIndex: '1',
                          height: '100%',
                          borderWidth: '3px',
                        }}
                        bodyStyle={{ padding: '0 24px' }}
                        className='card'
                      >
                        <div className='markdown-container'>
                          <ReactMarkdown>{positions[index].text}</ReactMarkdown>
                        </div>
                      </Card>
                      <div className='ghosting'></div>
                    </div>
                  </Link>
                ))}
              </Flex>
            ) : (
              <ExceptionLayout child={<>You don't have processes.</>} />
            )}
          </>
        )
      ) : (
        <ImproperConnected />
      )}
    </>
  )
}

export default MyProcesses
