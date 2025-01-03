require("dotenv").config();

const {
  uploadToImgbb,
  getBitcoinPrice,
  getBitcoinFees,
  btcLightning,
  getbigTxn,
  getmaxTxn,
} = require("./modules/pag.js");

const { plotData, getBTCData, paintPrice } = require("./modules/chaw.js");
const { fetchAllFeeds } = require("./modules/news.js");
const { commitMsg } = require("./modules/nostr.js");

async function pushIt(text) {
  await commitMsg(process.env.NSEC, text);
}

async function imgPrice(msg) {
  const buffer = await paintPrice(msg);
  return uploadToImgbb(process.env.IMGBB_API_KEY, buffer) || null;
}

async function imgChart() {
  const buffer = await plotData();
  return uploadToImgbb(process.env.IMGBB_API_KEY, buffer) || null;
}

async function handleBitcoinPriceChart() {
  const { data, minPrice, maxPrice, avgPrice } = await getBTCData();

  if (!data.length) return;
  const msgurl = await imgChart();

  if (msgurl) {
    await pushIt(
      `Bitcoin Price Action :\n\n` +
        `Min: ${minPrice} USD\n` +
        `Max: ${maxPrice} USD\n` +
        `Avg: ${avgPrice} USD\n` +
        `\n\n#bitcoin #crypto #trade\n\n` +
        `${msgurl}`
    );
  }
}

async function handleNewsPost() {
  const post = await fetchAllFeeds();

  await pushIt(
    `${post.title} ✍️ ${post.contentSnippet} \n\n🔗 Read : ${post.link} \n #bitcoin #news`
  );
}

async function handleBitcoinPricePost() {
  const btcprice = await getBitcoinPrice();

  if (Math.random() > 0.7) {
    const sattousd = parseFloat(btcprice / 100000000).toFixed(6);
    await pushIt(
      `1 Bitcoin = ${btcprice} USD\n` +
        `1 Satoshi = ${sattousd} USD\n` +
        `\n\n#bitcoin #crypto #trade`
    );
  } else {
    const msgurl = await imgPrice(`${btcprice}`);

    if (msgurl) {
      await pushIt(`Bitcoin: ${btcprice} USD\n\n#bitcoin #crypto\n${msgurl}`);
    }
  }
}

async function handleBiggestTransactionPost() {
  const biggestTx = Math.random() > 0.5 ? await getmaxTxn() : await getbigTxn();

  if (biggestTx) {
    await pushIt(`${biggestTx} #bitcoin #crypto #wallet`);
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

  await pushIt(`Current Bitcoin Fee: ${fee} sat/vB \n\n#bitcoin #fees`);
}

async function main() {
  const tasks = [
    handleNewsPost,
    handleNewsPost,
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

if (Math.random() > 0.2) {
  main();
}
