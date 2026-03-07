// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract TokenMarket is Ownable {
    IERC20 public projectToken;
    AggregatorV3Interface internal ethUsdPriceFeed;

    // 1个代币对应的美元单价 (18位精度，例如 1.2 USD = 1.2 * 1e18)
    uint256 public tokenPriceInUSD;

    event Bought(address buyer, uint256 amount, uint256 ethSpent);
    event Redeemed(address seller, uint256 amount, uint256 ethReceived);

    constructor(
        address _projectToken,
        address _priceFeed,
        uint256 _initialPrice
    ) Ownable(msg.sender) {
        projectToken = IERC20(_projectToken);
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeed);
        tokenPriceInUSD = _initialPrice;
    }

    // --- 获取实时 ETH 价格 (18位) ---
    function getLatestETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        return uint256(price) * 1e10; // 8位转18位
    }

    // --- 购买逻辑 (ETH -> Token) ---
    function buyWithETH() external payable {
        uint256 ethPrice = getLatestETHPrice();
        uint256 usdValueSent = (msg.value * ethPrice) / 1e18;
        uint256 tokenAmount = (usdValueSent * 1e18) / tokenPriceInUSD;

        require(
            projectToken.balanceOf(address(this)) >= tokenAmount,
            "Low token stock"
        );
        projectToken.transfer(msg.sender, tokenAmount);

        emit Bought(msg.sender, tokenAmount, msg.value);
    }

    // --- 赎回逻辑 (Token -> ETH) ---
    /**
     * @dev 用户需要先调用 ProjectToken 的 approve 授权给本合约
     * @param _tokenAmount 用户想要退回的代币数量
     */
    function redeemToETH(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Amount must be > 0");

        // 1. 计算这些代币值多少美元
        uint256 totalUsdValue = (_tokenAmount * tokenPriceInUSD) / 1e18;

        // 2. 计算对应的 ETH 数量
        uint256 ethPrice = getLatestETHPrice();
        uint256 ethToReturn = (totalUsdValue * 1e18) / ethPrice;

        // 3. 检查合约里的 ETH 够不够
        require(
            address(this).balance >= ethToReturn,
            "Contract low on ETH liquidity"
        );

        // 4. 先扣除用户的 Token (用户必须先 approve)
        projectToken.transferFrom(msg.sender, address(this), _tokenAmount);

        // 5. 将 ETH 发还给用户
        payable(msg.sender).transfer(ethToReturn);

        emit Redeemed(msg.sender, _tokenAmount, ethToReturn);
    }

    // --- 紧急管理 ---

    // 允许管理员存入 ETH 以供用户赎回
    receive() external payable {}

    // 管理员提取 ETH (获利或调拨)
    function withdrawETH(uint256 _amount) external onlyOwner {
        payable(owner()).transfer(_amount);
    }
}
