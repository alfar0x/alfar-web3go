export const getLoginMessage = (params: { address: string; nonce: number }) => {
  const { address, nonce } = params;
  const date = new Date().toISOString();

  const msg = [
    `reiki.web3go.xyz wants you to sign in with your Ethereum account:`,
    `${address}`,
    ``,
    `Welcome to Web3Go! Click to sign in and accept the Web3Go Terms of Service. This request will not trigger any blockchain transaction or cost any gas fees. Your authentication status will reset after 7 days. Wallet address: ${address} Nonce: ${nonce}`,
    ``,
    `URI: https://reiki.web3go.xyz`,
    `Version: 1`,
    `Chain ID: 56`,
    `Nonce: ${nonce}`,
    `Issued At: ${date}`,
  ];

  return msg.join("\n");
};
