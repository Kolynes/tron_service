import TronWeb from 'tronweb';
import TronGrid from 'trongrid';

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io', // mainnet
  eventServer: 'https://api.trongrid.io',
  privateKey: process.env.FEES_ADDRESS_PRIVATE_KEY
});

const tronGrid = new TronGrid(tronWeb);

const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const usdtContract = tronWeb.contract().at(usdtContractAddress); // the usdt address

export default {
  tronWeb,
  usdtContract,
  usdtContractAddress,
  tronGrid
};
