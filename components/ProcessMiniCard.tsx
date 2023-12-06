import React from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { Card, Flex, Tag } from 'antd'
import { useAccount } from 'wagmi'
import { ZERO_ADDRESS, processStatuses } from '../constants'

const ProcessMiniCard = ({ process }: any) => {
  const { address } = useAccount()

  return (
    <Card
      className='card'
      title={
        <Tag color='processing'>
          Process #{process.processPointer.processIndex.toString()}
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
          <Tag color={'processing'}>Token: {process.token.symbol}</Tag>
        </div>
      </Flex>
    </Card>
  )
}

export default ProcessMiniCard
