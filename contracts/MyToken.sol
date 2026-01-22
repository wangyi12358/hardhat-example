// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
  string public name = "MikaToken";
  uint256 public totalSupply = 1000000;

  function hello() external pure returns (string memory) {
    return "hello sepolia";
  }
}
