import React from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { Card, Flex, Tag } from 'antd'
import { useAccount } from 'wagmi'
import { MAX_UINT256 } from '../constants'
import { formatUnits } from 'viem'

const PositionMiniCard = ({ position }: any) => {
  const { address } = useAccount()

  return (
    <Card
      className='card'
      title={
        <Tag bordered={false} color='processing'>
          Position #{position.positionIndex.toString()}
        </Tag>
      }
    >
      <Flex>
        <Tag
          bordered={false}
          color={position.type_ === 0 ? 'error' : 'success'}
        >
          #{position.type_ === 0 ? 'Sell' : 'Buy'}
        </Tag>
        <Tag bordered={false} color='processing'>
          Creator: {position.creator === address ? 'You' : position.creator}
        </Tag>
        <Tag bordered={false} color='processing'>
          Price: {formatUnits(position.amount, Number(position.token.decimals))}{' '}
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
  )
}

export default PositionMiniCard
