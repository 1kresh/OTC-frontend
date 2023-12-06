import React from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import ReactMarkdown from 'react-markdown'
import { Card, Tag } from 'antd'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { processStatuses } from '../constants'

const ProcessCard = ({ position, process }: any) => {
  const { address } = useAccount()

  return (
    <Link
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
                  {process.customer === address ? 'a customer' : 'an arbiter'}
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
            <ReactMarkdown>{position.text}</ReactMarkdown>
          </div>
        </Card>
        <div className='ghosting'></div>
      </div>
    </Link>
  )
}

export default ProcessCard
