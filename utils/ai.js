const Together = require("together-ai");

const { getBitcoinPrice } = require("../modules/btc_price.js");

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

async function aigen(inputx) {
  const { price, sat } = await getBitcoinPrice();

  const prompt = `${inputx}

Your job is to read and understand the content above, then rework it into informative report.
Do not over explain if its about price, bitcoin avg price, bitcoin fees, etc. Keep it simple and to the point.

Ensure the response follows this format:

Title

Content split into multiple lines.

Images/ Links (if any)

Hashtags (minimum 3, maximum 8, relevant to the content)

For Your Information: 1 BTC is priced at $${price} USD. use this information wherever bitcoin value is mentioned, if needed.
Keep everything in plain text format—no special formatting. seprate each section with 2 new lines
`;

  try {
    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: null,
    });

    return {
      success: true,
      prompt: prompt,
      response: response.choices[0]?.message?.content || null,
    };
  } catch (error) {
    console.error("Error in aigen:", error);
    return {
      success: false,
      prompt: null,
      response: null,
    };
  }
}

module.exports = { aigen };
