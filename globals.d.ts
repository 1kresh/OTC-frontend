interface Ethereum {
  request: (...args: any[]) => Promise<any>
}

interface Window {
  ethereum?: Ethereum
}
