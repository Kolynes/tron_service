import {
  createAddress, getTransactionsbyHash, getAddressBalance, getTokenTransactions, fundAddressTrx, transferToken, findAddress, transferTrx
} from '../../controllers/tronController';

const tronRoute = (router) => {
  router.route('/create_address')
    .post(createAddress);

  router.route('/transaction/:trxId')
    .get(getTransactionsbyHash);

  router.route('/address_balance/:address')
    .get(getAddressBalance);

  router.route('/fund_address')
    .post(fundAddressTrx);

  router.route('/transfer_token')
    .post(transferToken);

  router.route('/transfer_trx')
    .post(transferTrx);

  router.route('/transactions')
    .get(getTokenTransactions);
  
  router.route("/find_address/:address")
    .get(findAddress)
};

export {
  tronRoute
};
