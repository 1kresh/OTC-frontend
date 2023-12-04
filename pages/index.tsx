import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Card, Flex, Tag } from 'antd'
import Link from 'next/link'

import ReactMarkdown from 'react-markdown'
import { useAccount, useNetwork, useContractRead } from 'wagmi'

import Header from '../components/Header'
import ImproperConnected from '../components/ImproperConnected'
import ExceptionLayout from '../components/ExceptionLayout'

import IOTC from '../common/contracts/IOTC.json'
import { OTCs, MAX_UINT256 } from '../constants'
import { formatUnits } from 'viem'
import { LoadingOutlined } from '@ant-design/icons'

const AllPositions: NextPage = () => {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const [cursor, setCursor] = useState(0)

  const { data }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'getPositions',
    args: [cursor, 200],
    watch: true,
  })
  const positions = useMemo(() => {
    if (!data) {
      return null
    }

    return data[0].map((position: any, i: any) => {
      return {
        ...position,
        token: data[1][i],
      }
    })
  }, [data])

  return (
    <>
      <Header />
      {isConnected && !chain?.unsupported ? (
        !positions ? (
          <ExceptionLayout child={<LoadingOutlined />} />
        ) : (
          <>
            {positions.length != 0 ? (
              <Flex vertical style={{ padding: '5rem 20rem' }} gap='3rem'>
                {positions.map((position: any, index: number) => (
                  <Link
                    key={index}
                    href={`/position/${position.positionIndex}`}
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
                            <Tag bordered={false} color='processing'>
                              Creator:{' '}
                              {position.creator === address
                                ? 'You'
                                : position.creator}
                            </Tag>
                          </>
                        }
                        extra={
                          <>
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
                          <ReactMarkdown>{position.text}</ReactMarkdown>
                        </div>
                      </Card>
                      <div className='ghosting'></div>
                    </div>
                  </Link>
                ))}
              </Flex>
            ) : (
              <ExceptionLayout child={<>There is no positions.</>} />
            )}
          </>
        )
      ) : (
        <ImproperConnected />
      )}
    </>
  )
}

export default AllPositions
