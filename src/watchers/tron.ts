import trongridConfig from '../config/trongrid';
import fetch from "node-fetch";

const {
  tronWeb,
  usdtContractAddress,
  tronGrid
} = trongridConfig;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function call(): Promise<void> {
  var block: number;
  var currentBlock = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number;
  var sleepTime = 2550;
  if(block == null)
    block = currentBlock - 20;
  while(true) {
    try {
      var temp = await tronGrid.contract.getEvents(usdtContractAddress, {
        event_name: 'Transfer',
        only_confirmed: true,
        order_by: 'timestamp,asc',
        limit: 200,
        block_number: block,
      });
      await sleep(sleepTime)
      if(temp.data && temp.data.length > 0)
        searchForTransactions(temp.data);
      currentBlock = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number
      if(block < currentBlock)
        block++;
      sleepTime = 2550 - 50 * (currentBlock - block - 20)
      console.log(currentBlock, block)
      console.log("next sleep time: ", sleepTime)
    } catch(error) {
      console.log(error, "Failed to get Events")
    }
  }
}  

async function searchForTransactions(events: any[]) {
  const eventsData = [];
  const threads = [];
  for(const tx of events) {
    threads.push(new Promise(async (resolve, reject) => {
      try {
        const address = global.addressTree.search(tronWeb.address.fromHex(tx.result.to));
        if (address != null)
          eventsData.push({
            txHash: tx.transaction_id,
            address: tronWeb.address.fromHex(tx.result.to),
            amount: tx.result.value / 1000000,
            block: tx.block_number
          });
      } catch(e) {

      }
      resolve(true);
    }));
  }
  await Promise.all(threads);  
  if (eventsData.length > 0) {
    await fetch(process.env.LARAVEL_TRX_API, {
      method: 'post',
      body: JSON.stringify({ eventsData }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

}

export default async function tronWatcher() {
  console.log("starting watcher")
  return call();
}
