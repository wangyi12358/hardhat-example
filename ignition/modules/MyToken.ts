import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  // 部署 ERC-20 代币
  // 注意：MyToken 构造函数不需要参数，代币信息已在合约中硬编码
  // - 代币名称：MikaToken
  // - 代币符号：MIKA
  // - 总供应量：1,000,000 MIKA（在合约中定义为 TOTAL_SUPPLY）
  const myToken = m.contract("MyToken");

  return { myToken };
});
