import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ERC-20 标准 ABI
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
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
] as const;

async function approve(
  contractAddress: string,
  spenderAddress: string,
  amount: string
) {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY 未设置，请在 .env 文件中配置");
  }

  // 确保私钥有 0x 前缀
  const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
    ? process.env.PRIVATE_KEY
    : `0x${process.env.PRIVATE_KEY}`;

  // 创建账户
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // 创建客户端
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  try {
    // 查询代币信息
    const [symbol, decimals, ownerBalance] = await Promise.all([
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
        args: [account.address],
      }),
    ]);

    // 查询当前授权额度
    const currentAllowance = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [account.address, spenderAddress as `0x${string}`],
    });

    // 将金额转换为带小数位的格式
    const amountInWei = parseUnits(amount, decimals);

    // 检查余额（如果要授权的金额大于余额，给出警告）
    if (ownerBalance < amountInWei) {
      const formattedBalance = formatUnits(ownerBalance, decimals);
      console.log(
        `⚠️  警告: 授权金额 (${amount} ${symbol}) 大于你的余额 (${formattedBalance} ${symbol})`
      );
      console.log("授权仍然可以执行，但被授权方无法使用超过你余额的代币");
    }

    console.log("\n🔐 准备授权");
    console.log("=".repeat(50));
    console.log(`代币符号: ${symbol}`);
    console.log(`合约地址: ${contractAddress}`);
    console.log(`授权方地址: ${account.address}`);
    console.log(`被授权方地址: ${spenderAddress}`);
    console.log(`授权金额: ${amount} ${symbol}`);
    console.log(`原始值: ${amountInWei.toString()}`);
    console.log(
      `当前授权额度: ${formatUnits(currentAllowance, decimals)} ${symbol}`
    );
    console.log("=".repeat(50));

    // 发送授权交易
    console.log("\n⏳ 正在发送授权交易...");
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, amountInWei],
    });

    console.log("\n✅ 授权交易已发送！");
    console.log(`交易哈希: ${hash}`);
    console.log("\n在 Etherscan 上查看:");
    console.log(`https://sepolia.etherscan.io/tx/${hash}`);

    // 等待交易确认
    console.log("\n⏳ 等待交易确认...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      console.log("\n🎉 授权成功！");

      // 查询授权后的额度
      const newAllowance = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account.address, spenderAddress as `0x${string}`],
      });

      console.log("\n📊 授权信息:");
      console.log(
        `授权前额度: ${formatUnits(currentAllowance, decimals)} ${symbol}`
      );
      console.log(
        `授权后额度: ${formatUnits(newAllowance, decimals)} ${symbol}`
      );
      console.log("\n💡 提示:");
      console.log(
        `现在 ${spenderAddress} 可以使用你的 ${formatUnits(newAllowance, decimals)} ${symbol} 代币`
      );
      console.log("被授权方可以通过 transferFrom 函数使用这些代币");
    } else {
      console.log("\n❌ 授权失败");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n❌ 授权失败:", errorMessage);
    if (errorMessage.includes("insufficient funds")) {
      console.log("\n提示: ETH 余额不足，无法支付 gas 费");
    } else if (errorMessage.includes("address")) {
      console.log("\n提示: 请确认被授权地址格式正确（0x开头）");
    }
    process.exit(1);
  }
}

async function main() {
  // 从命令行参数获取信息
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
  const spenderAddress = args[1];
  const amount = args[2];

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

  // 参数验证
  if (!(contractAddress && spenderAddress && amount)) {
    console.error("❌ 错误: 参数不完整");
    console.log("\n使用方法:");
    console.log(
      "  pnpm hardhat run scripts/approve.ts --network sepolia [合约地址] [被授权地址] [授权金额]"
    );
    console.log("\n示例:");
    console.log(
      "  pnpm hardhat run scripts/approve.ts --network sepolia 0x2A82d3eB8b608F0CE885C75ac96C045e90c80d95 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000"
    );
    console.log("\n如果合约地址省略，将使用部署记录中的地址");
    console.log("\n💡 使用场景:");
    console.log("  - 授权 DEX（如 Uniswap）使用你的代币进行交易");
    console.log("  - 授权 DeFi 协议使用你的代币进行质押");
    console.log("  - 授权智能合约使用你的代币");
    process.exit(1);
  }

  // 验证地址格式
  if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
    console.error("❌ 错误: 合约地址格式不正确");
    process.exit(1);
  }

  if (!spenderAddress.startsWith("0x") || spenderAddress.length !== 42) {
    console.error("❌ 错误: 被授权地址格式不正确");
    process.exit(1);
  }

  // 验证金额
  const amountNum = Number.parseFloat(amount);
  if (Number.isNaN(amountNum) || amountNum < 0) {
    console.error("❌ 错误: 授权金额必须是大于等于 0 的数字");
    console.log("提示: 使用 0 可以撤销授权");
    process.exit(1);
  }

  await approve(contractAddress, spenderAddress, amount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
