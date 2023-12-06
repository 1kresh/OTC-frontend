import React from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import ReactMarkdown from 'react-markdown'
import { Card, Tag } from 'antd'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { MAX_UINT256 } from '../constants'
import { formatUnits } from 'viem'

const PositionCard = ({ position }: any) => {
  const { address } = useAccount()

  return (
    <Link href={`/position/${position.positionIndex}`}>
      <div
        style={{
          height: '16rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Card
          title={
            <>
              <Tag
                bordered={false}
                color={position.type === 0 ? 'error' : 'success'}
              >
                #{position.type === 0 ? 'Sell' : 'Buy'}
              </Tag>
              <Tag bordered={false} color='processing'>
                Creator:{' '}
                {position.creator === address ? 'You' : position.creator}
              </Tag>
            </>
          }
          extra={
            <>
              <Tag bordered={false} color='processing'>
                Price:{' '}
                {formatUnits(position.amount, Number(position.token.decimals))}{' '}
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
  )
}

export default PositionCard
