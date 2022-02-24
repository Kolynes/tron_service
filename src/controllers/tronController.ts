import fetch from 'node-fetch';
import response from '../utils/response';
import messages from '../utils/messages';
import models from '../models';
import DbServices from '../services/dbServices';
import trongridConfig from '../config/trongrid';

const {
  tronWeb,
  usdtContractAddress,
  usdtContract
} = trongridConfig;

const {
  Address
} = models;

const {
  create, getByOptions
} = DbServices;


const transferToken = async (req, res) => {
  try {
    const { to, from } = req.body;
    let { amount } = req.body;
    console.log(to, from, amount)
    const contract = await usdtContract;
    const verifyFromAddress = await getByOptions(Address, {
      where: {
        base58: from
      }
    });

    if (to == null || from == null || amount == null) {
      return response(res, 409, 'error', { message: messages.missingParam });
    }

    if (!verifyFromAddress) return response(res, 409, 'error', { message: messages.AddressNotFound });

    const decimals = await contract.decimals().call();

    amount *= (10 ** decimals);

    const balance = tronWeb.toDecimal((await contract.balanceOf(from).call())._hex);

    if (balance < amount) {
      return response(res, 409, 'error', { message: messages.insufficientFunds });
    }

    await tronWeb.setPrivateKey(verifyFromAddress.privateKey);
    const transferData = await contract.transfer(to, amount).send();
    await tronWeb.setPrivateKey(process.env.FEES_ADDRESS_PRIVATE_KEY);

    return response(res, 201, 'success', { message: 'Transaction in process', transferData });
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};

const fundAddressTrx = async (req, res) => {
  try {
    const { address } = req.body;
    let { amount } = req.body;
    amount = tronWeb.toSun(amount);

    const verifyAddress = await getByOptions(Address, {
      where: {
        base58: address
      }
    });

    if (!verifyAddress) return response(res, 409, 'error', { message: messages.AddressNotFound });

    if (address == null || amount == null) {
      return response(res, 409, 'error', { message: messages.missingParam });
    }
    const transferData = await tronWeb.trx
      .sendTransaction(address, amount, process.env.FEES_ADDRESS_PRIVATE_KEY);

    return response(res, 201, 'success', { message: 'Transaction in process', transferData });
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};


const transferTrx = async (req, res) => {
  try {
    const { from, to } = req.body;
    let { amount } = req.body;
    amount = tronWeb.toSun(amount);

    const verifyAddress = await getByOptions(Address, {
      where: {
        base58: from
      }
    });

    if (!verifyAddress) return response(res, 409, 'error', { message: messages.AddressNotFound });

    if (from == null || amount == null || to == null) {
      return response(res, 409, 'error', { message: messages.missingParam });
    }

    const transferData = await tronWeb.trx
      .sendTransaction(to, amount, verifyAddress.privateKey);

    return response(res, 201, 'success', { message: 'Transaction in process', transferData });
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};


const getAddressBalance = async (req, res) => {
  const { address } = req.params;
  const contract = await usdtContract;
  const decimals = await contract.decimals().call();

  const resp = {
    trx: await tronWeb.trx.getBalance(address) / 1000000,
    usdt: (await contract.balanceOf(address).call()) / Math.pow(10, decimals)
  };

  return response(res, 201, 'success', resp);
};


const getTransactionsbyHash = async (req, res) => {
  try {
    const { trxId } = req.params;
    if (!trxId) return response(res, 403, 'error', { message: messages.missingParam });

    const { blockNumber, log } = await tronWeb.trx.getTransactionInfo(trxId);
    const transaction = await tronWeb.trx.getTransaction(trxId);
    const contract = await usdtContract;

    const decimals = await contract.decimals().call();

    const confirmations = (await tronWeb.trx.getCurrentBlock())
      .block_header.raw_data.number - blockNumber + 1;

    const dataLength = transaction.raw_data.contract[0].parameter.value.data.length;
    const address = tronWeb.address.fromHex(`41${transaction.raw_data.contract[0]
      .parameter.value.data.substring(dataLength - 64 * 2 + (24), dataLength - 64)}`);

    const resp = {
      txHash: trxId,
      type: 'TOKEN',
      currency: 'TRX',
      network: 'mainnet',
      token_symbol: 'USDT',
      token_name: 'Tether USD',
      contract: usdtContractAddress,
      token_type: 'TRC-20',
      address,
      value: (tronWeb.toDecimal(`0x${log[0].data}`) / 10 ** decimals).toFixed(2),
      confirmations
    };
    return response(res, 201, 'success', resp);
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};

const getTokenTransactions = async (req, res) => {
  try {
    const url = `https://api.trongrid.io/v1/accounts/${process.env.FEES_ADDRESS}/transactions/trc20?`;

    const resp = await fetch(url + new URLSearchParams({
      limit: 20,
      contract_address: usdtContractAddress,
      only_confirmed: true
    } as Record<string, any>), {});
    const transactionsData = [];
    let transactions = await resp.json();
    transactions = transactions.data;

    // eslint-disable-next-line array-callback-return
    transactions.map((transaction) => {
      const obj: any = {};
      if (transaction.token_info.symbol === 'USDT') {
        obj.txHash = transaction.transaction_id;
        obj.address = transaction.to;
        obj.amount = transaction.value / 1000000;
        transactionsData.push(obj);
      }
    });

    return response(res, 201, 'success', transactionsData);
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    const { privateKey, publicKey, address } = await tronWeb.createAccount();

    await create(Address, {
      privateKey,
      publicKey,
      hex: address.hex,
      base58: address.base58,
    });

    global.addressTree.insert(address.base58);
    fetch('https://api.trongrid.io/wallet/createaccount', {
      method: 'post',
      body: JSON.stringify({
        owner_address: process.env.FEES_ADDRESS,
        account_address: address.base58,
        visible: true
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    return response(res, 201, 'success', { address: address.base58 });
  } catch (error) {
    return response(res, 500, 'error', { message: error.message });
  }
};

const findAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const node = global.addressTree.search(address);
    console.log(node)
    if(node != null)
      return response(res, 200, "success", "address found");
    return response(res, 404, "error", "address not found");
  } catch(error) {
    return response(res, 500, 'error', { message: error.message });
  }
}

export {
  createAddress,
  getTransactionsbyHash,
  getAddressBalance,
  transferToken,
  transferTrx,
  fundAddressTrx,
  getTokenTransactions,
  findAddress
};
