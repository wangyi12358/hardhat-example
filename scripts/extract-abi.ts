import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractABI(contractName: string) { 
  // 读取编译后的合约文件
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ 找不到合约文件: ${artifactPath}`);
    console.log("\n请先运行编译命令:");
    console.log("  pnpm hardhat compile");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const abi = artifact.abi;

  // 创建 abi 目录
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // 保存 ABI 到单独的文件
  const abiPath = path.join(abiDir, `${contractName}.json`);
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2), "utf-8");

  console.log(`✅ ABI 已提取到: ${abiPath}`);
  console.log(`\nABI 包含 ${abi.length} 个接口:`);
  abi.forEach((item: any) => {
    if (item.type === "function") {
      console.log(`  - ${item.name}()`);
    } else if (item.type === "event") {
      console.log(`  - event ${item.name}`);
    }
  });
}

// 主函数
async function main() {
  // 从命令行参数获取合约名称，如果没有则使用默认值
  // 注意：hardhat run 会把脚本路径作为第一个参数，所以合约名是第二个参数
  const args = process.argv.slice(2);
  const contractName = args[0] || "MyToken";
  
  await extractABI(contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
