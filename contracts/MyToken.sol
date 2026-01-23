// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MikaToken - ERC20 Standard Token
 * @dev 基于 OpenZeppelin ERC20 实现的代币合约
 */
contract MyToken is ERC20 {
    // 总供应量常量
    uint256 public constant TOTAL_SUPPLY = 1000000 ether;

    /**
     * @dev 构造函数
     * @notice 部署时创建 1,000,000 MIKA 代币并分配给部署者
     */
    constructor() ERC20("MikaToken", "MIKA") {
        // 将所有代币铸造给部署者
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
