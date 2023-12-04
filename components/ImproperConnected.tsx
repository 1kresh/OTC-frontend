import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useNetwork } from 'wagmi'

import ExceptionLayout from './ExceptionLayout'

const ImproperConnected = () => {
  const { chain } = useNetwork()

  return (
    <ExceptionLayout
      child={
        <>
          <>
            {chain?.unsupported ? (
              <>Switch the network to continue.</>
            ) : (
              <>Connect your wallet to continue.</>
            )}
          </>
          <div style={{ fontSize: '16px', zIndex: '0' }}>
            <ConnectButton />
          </div>
        </>
      }
    />
  )
}

export default ImproperConnected
