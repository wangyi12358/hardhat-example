import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // 从部署记录中获取的交易哈希
  const txHash =
    "0x01538155325c2c8d4f84bfa9c4e831ff78a5678e094d30709bd07a59d64bd162";

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  console.log("正在查询交易信息...");
  console.log(`交易哈希: ${txHash}`);

  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.contractAddress) {
      console.log("\n✅ 合约部署成功！");
      console.log(`合约地址: ${receipt.contractAddress}`);
      console.log(`\n在 Etherscan 上查看:`);
      console.log(
        `https://sepolia.etherscan.io/address/${receipt.contractAddress}`
      );
      console.log(`\n交易详情:`);
      console.log(`https://sepolia.etherscan.io/tx/${txHash}`);
    } else {
      console.log("⚠️  未找到合约地址，这可能不是合约部署交易");
    }
  } catch (error) {
    console.error("❌ 查询失败:", error);
    console.log("\n你也可以直接在 Etherscan 上查看交易:");
    console.log(`https://sepolia.etherscan.io/tx/${txHash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
