import React from 'react'

import { Flex } from 'antd'

const ExceptionLayout = ({ child }: any) => {
  return (
    <Flex
      style={{
        position: 'absolute',
        width: '100vw',
        height: '80vh',
        zIndex: '-1',
      }}
      justify='center'
      align='center'
    >
      <Flex
        vertical
        gap='1rem'
        justify='center'
        align='center'
        style={{ fontWeight: '700', fontSize: '20px' }}
      >
        {child}
      </Flex>
    </Flex>
  )
}

export default ExceptionLayout
