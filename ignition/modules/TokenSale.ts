import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Sepolia Chainlink ETH/USD 价格预言机地址
// https://docs.chain.link/data-feeds/price-feeds/addresses#Sepolia%20Testnet
const SEPOLIA_ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

export default buildModule("TokenSaleModule", (m) => {
  // 1. 部署 MyToken（若已部署过可注释掉，并改用已部署地址）
  const myToken = m.contract("MyToken");

  // 2. 部署 TokenMarket（合约文件里名为 TokenMarket）
  // 参数：代币地址、Chainlink 价格预言机地址、代币单价(18位小数，如 1e18 = 1 USD)
  const initialPriceUSD = m.getParameter("initialPriceUSD", 1n * 10n ** 18n);
  const tokenMarket = m.contract("TokenMarket", [
    myToken,
    SEPOLIA_ETH_USD_PRICE_FEED,
    initialPriceUSD,
  ]);

  // 3. 给 TokenMarket 转一批代币，用于出售（例如 100_000 MIKA）
  const amountToFund = m.getParameter("amountToFund", 100_000n * 10n ** 18n);
  m.call(myToken, "transfer", [tokenMarket, amountToFund]);

  return { myToken, tokenMarket };
});
