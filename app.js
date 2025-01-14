require("dotenv").config();

const { hndl_btclight } = require("./modules/btc_light.js");

const { hndl_btcfee } = require("./modules/btc_fee.js");

const { hndl_btcprice } = require("./modules/btc_price.js");

const { hndl_whale } = require("./modules/txn_whale.js");

const { hndl_btcchart } = require("./modules/btc_chart.js");

const { hndl_news } = require("./modules/news.js");

const { commitMsg } = require("./utils/nostr.js");

async function pushIt(text) {
  await commitMsg(text, process.env.NSEC);
}

async function main() {
  const func = [
    hndl_news,
    hndl_btcchart,
    hndl_btcprice,
    hndl_btcfee,
    hndl_whale,
    hndl_btclight,
  ];


  const rafn =
    func[Math.floor(Math.random() * func.length)];

  try {

    await pushIt(await rafn());
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  }
}

main();
