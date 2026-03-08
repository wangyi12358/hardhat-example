import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Sepolia Chainlink ETH/USD 价格预言机
const SEPOLIA_ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

/**
 * 仅部署 TokenMarket，使用已有的代币地址。
 * 适用：已部署过 MyToken，只想部署销售合约。
 *
 * 部署时传入参数示例：
 *   --parameters '{"TokenSaleOnlyModule": {"projectTokenAddress": "0x9190037E43a2aC44FF1261F1Bd25cC45DA5C766e", "initialPriceUSD": "1000000000000000000"}}'
 */
export default buildModule("TokenSaleOnlyModule", (m) => {
  const projectTokenAddress = m.getParameter<string>(
    "projectTokenAddress",
    "0x9190037E43a2aC44FF1261F1Bd25cC45DA5C766e"
  );
  const initialPriceUSD = m.getParameter("initialPriceUSD", 1n * 10n ** 18n);

  const tokenMarket = m.contract("TokenMarket", [
    projectTokenAddress,
    SEPOLIA_ETH_USD_PRICE_FEED,
    initialPriceUSD,
  ]);

  return { tokenMarket };
});
