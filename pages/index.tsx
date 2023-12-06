import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Flex, Typography } from 'antd'

import { useAccount, useNetwork, useContractRead } from 'wagmi'

import Header from '../components/Header'
import ImproperConnected from '../components/ImproperConnected'
import ExceptionLayout from '../components/ExceptionLayout'
import PositionCard from '../components/PositionCard'

import IOTC from '../common/contracts/IOTC.json'
import { OTCs } from '../constants'
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
        type: 0,
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
          <Flex vertical>
            <Flex justify='center' style={{ height: '6rem' }}>
              <Typography.Title>OTC Market</Typography.Title>
            </Flex>
            {positions.length != 0 ? (
              <Flex vertical style={{ padding: '5rem 20rem' }} gap='3rem'>
                {positions.map((position: any, index: number) => (
                  <PositionCard key={index} position={position} />
                ))}
              </Flex>
            ) : (
              <ExceptionLayout child={<>There is no positions.</>} />
            )}
          </Flex>
        )
      ) : (
        <ImproperConnected />
      )}
    </>
  )
}

export default AllPositions
