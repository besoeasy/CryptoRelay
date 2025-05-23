import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';
import { uploadIMG } from '../utils/imgup.js';

const getBTCData = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/bitcoin/ohlc',
      { params: { vs_currency: 'usd', days: '1' } }
    );

    const data = response.data;

    const highs = data.map((d) => d[2]);
    const lows = data.map((d) => d[3]);
    const closes = data.map((d) => d[4]);

    const minPrice = parseInt(Math.min(...lows));
    const maxPrice = parseInt(Math.max(...highs));
    const avgPrice = parseInt(
      closes.reduce((sum, price) => sum + price, 0) / closes.length
    );
    return {
      data,
      minPrice,
      maxPrice,
      avgPrice,
    };
  } catch (error) {
    console.error('Error fetching BTC data:', error);
    return { data: [], minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }
};

const plotData = async () => {
  const { data, minPrice, maxPrice, avgPrice } = await getBTCData();
  if (!data.length) return;

  const canvasWidth = 4000;
  const canvasHeight = 2000;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Define chart area
  const chartPadding = 150;
  const chartWidth = canvasWidth - chartPadding * 2;
  const chartHeight = canvasHeight - chartPadding * 2;

  const priceRange = maxPrice - minPrice;
  const xScale = chartWidth / data.length;
  const yScale = chartHeight / priceRange;

  // Draw grid
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;

  for (let i = 0; i <= 5; i++) {
    const y = chartPadding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(chartPadding, y);
    ctx.lineTo(canvasWidth - chartPadding, y);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let i = 0; i <= 10; i++) {
    const x = chartPadding + (chartWidth / 10) * i;
    ctx.beginPath();
    ctx.moveTo(x, chartPadding);
    ctx.lineTo(x, canvasHeight - chartPadding);
    ctx.stroke();
  }

  // Draw candlesticks
  data.forEach(([timestamp, open, high, low, close], index) => {
    const x = chartPadding + index * xScale;
    const candleWidth = xScale * 0.6;

    const openY = canvasHeight - chartPadding - (open - minPrice) * yScale;
    const closeY = canvasHeight - chartPadding - (close - minPrice) * yScale;
    const highY = canvasHeight - chartPadding - (high - minPrice) * yScale;
    const lowY = canvasHeight - chartPadding - (low - minPrice) * yScale;

    const isBullish = close > open;
    ctx.fillStyle = isBullish ? '#4caf50' : '#f44336';
    ctx.strokeStyle = ctx.fillStyle;

    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    const bodyTop = isBullish ? closeY : openY;
    const bodyBottom = isBullish ? openY : closeY;
    ctx.fillRect(
      x - candleWidth / 2,
      bodyTop,
      candleWidth,
      bodyBottom - bodyTop
    );
  });

  // Annotations: High, Low, and Average Prices
  ctx.fillStyle = 'white';
  ctx.font = '80px Arial';

  // High
  ctx.fillText(`High: $${maxPrice}`, chartPadding, chartPadding - 50);

  // Low
  ctx.fillText(
    `Low: $${minPrice}`,
    chartPadding,
    canvasHeight - chartPadding + 100
  );

  // Average Price Line
  const avgY = canvasHeight - chartPadding - (avgPrice - minPrice) * yScale;
  ctx.strokeStyle = '#ffd700'; // Bright yellow for visibility
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(chartPadding, avgY);
  ctx.lineTo(canvasWidth - chartPadding, avgY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffd700';
  ctx.fillText(
    `Avg: $${avgPrice}`,
    canvasWidth - chartPadding - 300,
    avgY - 50
  );

  return {
    buffer: canvas.toBuffer('image/png'),
    minPrice,
    maxPrice,
    avgPrice,
  };
};

async function hndl_btcchart() {
  const { buffer, minPrice, maxPrice, avgPrice } = await plotData();

  const msgurl = await uploadIMG(buffer);

  let msg = '';

  if (msgurl) {
    msg =
      `Bitcoin Price Action In Last 24 Hours:\n\n` +
      `Avg: ${avgPrice} USD\n` +
      `Min: ${minPrice} USD\n` +
      `Max: ${maxPrice} USD\n` +
      `\n#bitcoin #trade\n` +
      `${msgurl}`;
  }

  return msg;
}

export { hndl_btcchart };