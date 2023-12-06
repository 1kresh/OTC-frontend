import React, { useState, useMemo } from 'react'
import { NextPage } from 'next'

import { Flex, Button } from 'antd'
import { LoadingOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'

import { useAccount, useNetwork, useContractRead } from 'wagmi'

import Header from '../components/Header'
import ImproperConnected from '../components/ImproperConnected'
import ExceptionLayout from '../components/ExceptionLayout'
import PositionCard from '../components/PositionCard'

import IOTC from '../common/contracts/IOTC.json'
import { OTCs } from '../constants'

const MyPositions: NextPage = () => {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const [cursor, setCursor] = useState(0)

  const { data }: any = useContractRead({
    address: OTCs[chain?.id ?? 11155111],
    abi: IOTC,
    functionName: 'getPositionsByCreator',
    args: [address, cursor, 200],
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
            <Flex
              justify='flex-end'
              style={{ padding: '2rem', height: '6rem' }}
            >
              <Link href='/create-position'>
                <Button type='primary' size='large' icon={<SendOutlined />}>
                  Create new position
                </Button>
              </Link>
            </Flex>
            {positions.length != 0 ? (
              <Flex vertical style={{ padding: '5rem 20rem' }} gap='3rem'>
                {positions.map((position: any, index: number) => (
                  <PositionCard key={index} position={position} />
                ))}
              </Flex>
            ) : (
              <ExceptionLayout child={<>You don&apos;t have positions.</>} />
            )}
          </Flex>
        )
      ) : (
        <ImproperConnected />
      )}
    </>
  )
}

export default MyPositions
