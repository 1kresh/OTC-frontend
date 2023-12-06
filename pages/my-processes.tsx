import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Card, Flex, Tag } from 'antd'
import Link from 'next/link'

import ReactMarkdown from 'react-markdown'
import { useAccount, useNetwork, useContractRead } from 'wagmi'

import Header from '../components/Header'
import ImproperConnected from '../components/ImproperConnected'
import ExceptionLayout from '../components/ExceptionLayout'
import ProcessCard from '../components/ProcessCard'

import IOTC from '../common/contracts/IOTC.json'
import { OTCs, processStatuses } from '../constants'
import { LoadingOutlined } from '@ant-design/icons'

const MyProcesses: NextPage = () => {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const [cursor, setCursor] = useState(0)

  const { data }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'getProcessesByPaticipant',
    args: [address, cursor, 200],
    watch: true,
  })
  const positions = useMemo(() => {
    if (!data) {
      return null
    }

    return data[0].map((position: any, index: number) => {
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

    return data[2].map((process: any, index: number) => {
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
                {processes.map((process: any, index: number) => (
                  <ProcessCard
                    key={index}
                    position={positions[index]}
                    process={process}
                  />
                ))}
              </Flex>
            ) : (
              <ExceptionLayout child={<>You don&apos;t have processes.</>} />
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
