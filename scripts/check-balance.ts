import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createPublicClient, formatUnits, http } from "viem";
import { sepolia } from "viem/chains";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ERC-20 标准 ABI（只需要 balanceOf 函数）
const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function checkBalance(contractAddress: string, walletAddress: string) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  try {
    // 查询代币信息
    const [name, symbol, decimals, balance] = await Promise.all([
      publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "name",
      }),
      publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "symbol",
      }),
      publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
      publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      }),
    ]);

    // 格式化余额（考虑小数位）
    const formattedBalance = formatUnits(balance, decimals);

    console.log("\n📊 代币余额查询结果");
    console.log("=".repeat(50));
    console.log(`代币名称: ${name}`);
    console.log(`代币符号: ${symbol}`);
    console.log(`合约地址: ${contractAddress}`);
    console.log(`钱包地址: ${walletAddress}`);
    console.log(`小数位数: ${decimals}`);
    console.log("\n💰 余额信息:");
    console.log(`  原始值: ${balance.toString()}`);
    console.log(`  格式化: ${formattedBalance} ${symbol}`);
    console.log("=".repeat(50));
    console.log("\n在 Etherscan 上查看:");
    console.log(
      `https://sepolia.etherscan.io/address/${contractAddress}#readContract`
    );
  } catch (error: any) {
    console.error("❌ 查询失败:", error.message);
    if (error.message.includes("Contract")) {
      console.log("\n提示: 请确认合约地址是否正确");
    } else if (error.message.includes("address")) {
      console.log("\n提示: 请确认钱包地址格式是否正确（0x开头）");
    }
  }
}

async function main() {
  // 从命令行参数获取地址，或使用部署记录中的地址
  const args = process.argv.slice(2);

  // 尝试从部署记录读取合约地址
  const deployedAddressesPath = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    "chain-11155111",
    "deployed_addresses.json"
  );

  let contractAddress = args[0];
  let walletAddress = args[1];

  // 如果没有提供合约地址，尝试从部署记录读取
  if (!contractAddress && fs.existsSync(deployedAddressesPath)) {
    const deployedAddresses = JSON.parse(
      fs.readFileSync(deployedAddressesPath, "utf-8")
    );
    contractAddress = deployedAddresses["MyTokenModule#MyToken"];
    if (contractAddress) {
      console.log(`📝 使用部署记录中的合约地址: ${contractAddress}`);
    }
  }

  // 如果没有提供钱包地址，使用部署者地址（从 .env 或默认）
  if (!walletAddress) {
    // 可以从 .env 读取，或者提示用户输入
    console.log("⚠️  未提供钱包地址，使用示例地址");
    walletAddress = "0x5c7f8646d37c136b70bfb670bf8af8d82ab994c6"; // 从之前的部署记录中看到的地址
  }

  if (!contractAddress) {
    console.error("❌ 错误: 请提供合约地址");
    console.log("\n使用方法:");
    console.log(
      "  pnpm hardhat run scripts/check-balance.ts --network sepolia [合约地址] [钱包地址]"
    );
    console.log("\n示例:");
    console.log(
      "  pnpm hardhat run scripts/check-balance.ts --network sepolia 0x2A82d3eB8b608F0CE885C75ac96C045e90c80d95 0x5c7f8646d37c136b70bfb670bf8af8d82ab994c6"
    );
    process.exit(1);
  }

  await checkBalance(contractAddress, walletAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
