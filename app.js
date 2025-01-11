require("dotenv").config();

const {
  getBitcoinPrice,
  getBitcoinFees,
  btcLightning,
} = require("./modules/pag.js");

const { analyzeTransactions } = require("./modules/txns.js");

const {
  plotData,
  getBTCData,
  paintPrice,
  paintFees,
} = require("./modules/chaw.js");

const { fetchAllFeeds } = require("./modules/news.js");

const { uploadIMG } = require("./modules/imgup.js");

const { commitMsg } = require("./nostr.js");

async function pushIt(text) {
  await commitMsg(process.env.NSEC, text);
}

async function imgChart() {
  const buffer = await plotData();
  return uploadIMG(buffer) || null;
}

async function imgPrice(msg) {
  const buffer = await paintPrice(msg);
  return uploadIMG(buffer) || null;
}

async function imgFees(msg) {
  const buffer = await paintFees(msg);
  return uploadIMG(buffer) || null;
}

async function handleBitcoinPriceChart() {
  const { data, minPrice, maxPrice, avgPrice } = await getBTCData();

  if (!data.length) return;
  const msgurl = await imgChart();

  if (msgurl) {
    await pushIt(
      `Bitcoin Price Action :\n\n` +
        `Avg: ${avgPrice} USD\n\n` +
        `Min: ${minPrice} USD\n` +
        `Max: ${maxPrice} USD\n` +
        `#bitcoin #crypto #trade\n\n` +
        `${msgurl}`
    );
  }
}

async function handleNewsPost() {
  const { title, contentSnippet, link } = await fetchAllFeeds();

  await pushIt(
    `📰 ${title}\n\n${contentSnippet}\n\n#bitcoin #crypto #news\n\n View : ${link}`
  );
}

async function handleBitcoinPricePost() {
  const btcprice = await getBitcoinPrice();
  const sattousd = parseFloat(btcprice / 100000000).toFixed(6);
  const msgurl = await imgPrice(`${btcprice}`);

  if (msgurl) {
    await pushIt(
      `Bitcoin: ${btcprice} USD\n\n1 Satoshi = ${sattousd} USD\n\n#bitcoin #crypto\n${msgurl}`
    );
  }
}

async function handleBiggestTransactionPost() {
  const biggestTx = await analyzeTransactions();

  if (biggestTx) {
    await pushIt(`${biggestTx} \n\n#bitcoin #crypto #wallet`);
  }
}

async function handleLightningNetworkPost() {
  const { node_count, channel_count, avg_capacity, total_capacity } =
    await btcLightning();

  await pushIt(
    `Bitcoin Lightning Network:\n\n` +
      `${node_count} Nodes\n` +
      `${channel_count} Channels\n` +
      `Avg capacity ${(avg_capacity / 100000000).toFixed(4)} BTC\n` +
      `Total capacity ${(total_capacity / 100000000).toFixed(4)} BTC\n\n` +
      `#bitcoin #lightning`
  );
}

async function handleBitcoinFeesPost() {
  const { fee } = await getBitcoinFees();

  const msgurl = await imgFees(`${fee} Satoshi`);

  if (msgurl) {
    await pushIt(`Bitcoin Fee: ${fee} sat/vB \n\n#bitcoin #fees\n${msgurl}`);
  }
}

async function main() {
  const tasks = [
    handleBitcoinPriceChart,
    handleBitcoinPricePost,
    handleBiggestTransactionPost,
    handleLightningNetworkPost,
    handleBitcoinFeesPost,
  ];

  const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

  try {
    await randomTask();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  }
}

main();
