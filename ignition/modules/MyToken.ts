import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  // 部署 ERC-20 代币
  // 参数：代币名称、代币符号、总供应量
  const myToken = m.contract("MyToken", [
    "MikaToken", // name
    "MIKA", // symbol
    1000000n, // totalSupply (100万)
  ]);

  return { myToken };
});
