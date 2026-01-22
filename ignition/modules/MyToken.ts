import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  const myToken = m.contract("MyToken");

  return { myToken };
});
