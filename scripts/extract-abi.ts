import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractABI(contractName: string, sourceFileName?: string) {
  // 若未指定源文件名，默认与合约名一致（如 MyToken → MyToken.sol）
  const sourceFile = sourceFileName ?? `${contractName}.sol`;
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    sourceFile,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ 找不到合约文件: ${artifactPath}`);
    console.log("\n请先运行编译命令:");
    console.log("  pnpm hardhat compile");
    console.log("\n若合约名与文件名不同，请指定源文件，例如:");
    console.log(
      "  pnpm hardhat run scripts/extract-abi.ts TokenMarket TokenSale.sol"
    );
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const abi = artifact.abi;

  // 创建 abi 目录
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // 保存 ABI 到单独的文件（按合约名命名，便于区分同一文件中的多个合约）
  const abiPath = path.join(abiDir, `${contractName}.json`);
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2), "utf-8");

  console.log(`✅ ABI 已提取到: ${abiPath}`);
  console.log(`\nABI 包含 ${abi.length} 个接口:`);
  for (const item of abi) {
    if (item.type === "function") {
      console.log(`  - ${item.name}()`);
    } else if (item.type === "event") {
      console.log(`  - event ${item.name}`);
    }
  }
}

// 主函数
function main() {
  // 参数：合约名 [源文件名]
  // 例如：TokenMarket TokenSale.sol（TokenSale.sol 里定义的合约名为 TokenMarket）
  const args = process.argv.slice(2);
  const contractName = args[0] || "MyToken";
  const sourceFileName = args[1]; // 可选，若合约名与 .sol 文件名不一致则必填

  extractABI(contractName, sourceFileName);

  process.exit(0);
}

main();
