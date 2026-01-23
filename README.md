# Hardhat ERC-20 Token Project

一个基于 Hardhat 3 的 ERC-20 标准代币项目，包含完整的代币合约、部署脚本和交互工具。

## 📋 项目简介

本项目实现了一个完整的 ERC-20 标准代币（MikaToken），提供了从部署到交互的完整工具链，包括：

- ✅ 完整的 ERC-20 标准代币合约
- ✅ 部署到 Sepolia 测试网
- ✅ 代币转账功能
- ✅ 代币授权功能
- ✅ 余额查询功能
- ✅ ABI 提取工具

## 🚀 功能特性

### 合约功能

- **ERC-20 标准实现**：完整的 ERC-20 接口
- **代币信息**：名称（MikaToken）、符号（MIKA）、小数位（18）
- **转账功能**：`transfer` - 直接转账代币
- **授权功能**：`approve` - 授权其他地址使用你的代币
- **授权转账**：`transferFrom` - 从授权额度中转账
- **余额查询**：`balanceOf` - 查询账户余额
- **授权查询**：`allowance` - 查询授权额度

### 工具脚本

- `transfer.ts` - 代币转账脚本
- `approve.ts` - 代币授权脚本
- `check-balance.ts` - 余额查询脚本
- `extract-abi.ts` - ABI 提取工具
- `get-deployed-contract.ts` - 获取部署的合约地址

## 📦 项目结构

```
hardhat-example/
├── contracts/              # Solidity 合约源码
│   ├── MyToken.sol        # ERC-20 代币合约
│   ├── Counter.sol        # 示例计数器合约
│   └── Counter.t.sol      # Foundry 测试合约
├── scripts/               # 交互脚本
│   ├── transfer.ts        # 转账脚本
│   ├── approve.ts         # 授权脚本
│   ├── check-balance.ts   # 余额查询脚本
│   ├── extract-abi.ts     # ABI 提取工具
│   └── get-deployed-contract.ts
├── ignition/              # Hardhat Ignition 部署配置
│   ├── modules/           # 部署模块
│   │   ├── MyToken.ts    # MyToken 部署配置
│   │   └── Counter.ts    # Counter 部署配置
│   └── deployments/       # 部署记录
│       └── chain-11155111/ # Sepolia 部署记录
├── abi/                   # 提取的 ABI 文件
│   └── MyToken.json
├── test/                  # 测试文件
├── hardhat.config.ts      # Hardhat 配置
└── package.json
```

## 🛠️ 环境配置

### 前置要求

- Node.js >= 18
- pnpm (推荐) 或 npm/yarn
- Sepolia 测试网 ETH（用于支付 gas 费）

### 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 环境变量配置

复制 `.env.example` 并创建 `.env` 文件：

```bash
cp .env.example .env
```

在 `.env` 文件中配置以下变量：

```env
# Sepolia 测试网 RPC URL
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
# 或使用 Alchemy
# SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

# 部署账户私钥（不要包含 0x 前缀）
PRIVATE_KEY="your_private_key_here"
```

**⚠️ 安全提示**：
- 不要将 `.env` 文件提交到 Git
- 不要使用主网私钥，仅使用测试账户
- 确保账户有足够的 Sepolia ETH

## 📝 使用指南

### 1. 编译合约

```bash
pnpm hardhat compile
```

### 2. 部署代币到 Sepolia

```bash
pnpm hardhat ignition deploy ignition/modules/MyToken.ts --network sepolia
```

部署成功后，会显示合约地址。合约地址也会保存在 `ignition/deployments/chain-11155111/deployed_addresses.json` 中。

**部署参数**：
- 代币名称：MikaToken
- 代币符号：MIKA
- 总供应量：1,000,000 MIKA
- 所有代币会分配给部署者

### 3. 查询代币余额

```bash
# 使用部署记录中的合约地址
pnpm hardhat run scripts/check-balance.ts --network sepolia [钱包地址]

# 或指定合约地址
pnpm hardhat run scripts/check-balance.ts --network sepolia [合约地址] [钱包地址]
```

**示例**：
```bash
pnpm hardhat run scripts/check-balance.ts --network sepolia \
  0x5c7f8646d37c136b70bfb670bf8af8d82ab994c6
```

### 4. 转账代币

```bash
# 使用部署记录中的合约地址
pnpm hardhat run scripts/transfer.ts --network sepolia [接收地址] [金额]

# 或指定合约地址
pnpm hardhat run scripts/transfer.ts --network sepolia [合约地址] [接收地址] [金额]
```

**示例**：
```bash
# 转账 100 MIKA 代币
pnpm hardhat run scripts/transfer.ts --network sepolia \
  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 100
```

### 5. 授权代币

授权其他地址（如 DEX、DeFi 协议）使用你的代币：

```bash
# 使用部署记录中的合约地址
pnpm hardhat run scripts/approve.ts --network sepolia [被授权地址] [授权金额]

# 或指定合约地址
pnpm hardhat run scripts/approve.ts --network sepolia [合约地址] [被授权地址] [授权金额]
```

**示例**：
```bash
# 授权 1000 MIKA 给某个地址
pnpm hardhat run scripts/approve.ts --network sepolia \
  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000

# 撤销授权（授权金额设为 0）
pnpm hardhat run scripts/approve.ts --network sepolia \
  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 0
```

### 6. 提取 ABI

将合约的 ABI 提取到单独的文件：

```bash
pnpm extract-abi MyToken
```

提取的 ABI 文件保存在 `abi/MyToken.json`，可用于前端应用或其他工具。

## 🧪 运行测试

```bash
# 运行所有测试
pnpm hardhat test

# 只运行 Solidity 测试
pnpm hardhat test solidity

# 只运行 TypeScript 测试
pnpm hardhat test nodejs
```

## 📚 合约说明

### MyToken 合约

实现了完整的 ERC-20 标准，包括：

**标准函数**：
- `name()` - 返回代币名称
- `symbol()` - 返回代币符号
- `decimals()` - 返回小数位数（18）
- `totalSupply()` - 返回总供应量
- `balanceOf(address)` - 查询账户余额
- `transfer(address, uint256)` - 转账代币
- `approve(address, uint256)` - 授权代币
- `allowance(address, address)` - 查询授权额度
- `transferFrom(address, address, uint256)` - 从授权额度转账

**事件**：
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `Approval(address indexed owner, address indexed spender, uint256 value)`

## 🔗 查看链上合约

部署后，可以在 Etherscan 上查看合约：

```
https://sepolia.etherscan.io/address/[合约地址]
```

合约地址可以从以下位置获取：
- 部署时的输出
- `ignition/deployments/chain-11155111/deployed_addresses.json`

## 🛡️ 安全提示

1. **私钥安全**：
   - 永远不要将私钥提交到 Git
   - 使用测试账户，不要使用主网账户
   - 定期检查 `.gitignore` 确保 `.env` 被忽略

2. **授权安全**：
   - 只授权你信任的合约地址
   - 不要授权过大的额度
   - 交易完成后及时撤销授权

3. **Gas 费用**：
   - 确保账户有足够的 Sepolia ETH 支付 gas 费
   - 可以通过 [Sepolia Faucet](https://sepoliafaucet.com/) 获取测试 ETH

## 📖 相关资源

- [Hardhat 文档](https://hardhat.org/docs)
- [ERC-20 标准](https://eips.ethereum.org/EIPS/eip-20)
- [Viem 文档](https://viem.sh/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v1.0.0
- ✅ 实现完整的 ERC-20 标准代币
- ✅ 部署到 Sepolia 测试网
- ✅ 转账、授权、余额查询脚本
- ✅ ABI 提取工具
