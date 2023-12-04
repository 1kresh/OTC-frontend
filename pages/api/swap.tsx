import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

const getEndpoint = (chainId: any) => {
  if (chainId === '11155111') {
    return 'sepolia.api.0x.org'
  }
  return ''
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ['GET'], // Allowable methods
    origin: '*', // Allow from any origin
  })

  // Destructure query parameters
  const { chainId, buyToken, sellToken, buyAmount } = req.query

  if (!buyToken || !sellToken || !buyAmount) {
    return res.status(400).json({ error: 'Missing required query parameters' })
  }

  try {
    // Construct the 0x API URL
    const apiUrl = `https://${getEndpoint(
      chainId
    )}/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&buyAmount=${buyAmount}`

    // Make the request to the 0x API
    const response = await axios.get(apiUrl, {
      headers: {
        '0x-api-key': process.env.ZEROX_API_KEY,
      },
    })

    // Return the data from the 0x API
    res.status(200).json({
      calldata: response.data.data,
      sellAmount: response.data.sellAmount,
    })
  } catch (error) {
    console.log(error)
    // Handle any errors
    res.status(500).json({ error: 'Error fetching data from 0x API' })
  }
}
