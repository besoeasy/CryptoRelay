require("dotenv").config();

const { hndl_btclight } = require("./modules/btc_light.js");

const { hndl_btcfee } = require("./modules/btc_fee.js");

const { hndl_btcprice } = require("./modules/btc_price.js");

const { hndl_whale } = require("./modules/txn_whale.js");

const { hndl_btcchart } = require("./modules/btc_chart.js");

const { hndl_news } = require("./modules/news.js");

const { commitMsg } = require("./utils/nostr.js");

async function pushIt(text) {
  await commitMsg(text, process.env.NSEC, 111, 4);
}

async function main() {
  const funcx = [hndl_news, hndl_btcchart, hndl_btcprice, hndl_btcfee, hndl_whale, hndl_btclight];

  try {
    const indices = [];
    while (indices.length < 3) {
      const index = Math.floor(Math.random() * funcx.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }

    for (const index of indices) {
      await pushIt(await funcx[index]());
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
