// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CeloRemit
 * @notice AI-powered intent-based remittance router using Mento stablecoins
 * @dev Routes cross-currency transfers through Mento's exchange infrastructure
 */
contract CeloRemit is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Mento Stablecoin Addresses (Celo Mainnet) ============
    address public constant cUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant cEUR = 0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73;
    address public constant cREAL = 0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787;
    address public constant cKES = 0x456a3D042C0DbD3db53D5489e98dFb038553B0d0;
    address public constant PUSO = 0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B;
    address public constant cCOP = 0x8A567e2aE79CA692Bd748aB832081C45de4EF982;
    address public constant eXOF = 0x73F93dcc49cB8A239e2032663e9475dd5ef29A08;

    // Mento Broker for swaps
    address public constant MENTO_BROKER = 0x777dB7F9a33eE7dA8f26c5B40e5E7d0C7bD0Bb30;

    struct RemittanceIntent {
        address sender;
        address recipient;
        address sourceToken;
        address targetToken;
        uint256 sourceAmount;
        uint256 targetAmount;
        string memo;
        uint256 timestamp;
        RemittanceStatus status;
    }

    enum RemittanceStatus { Pending, Completed, Failed, Refunded }

    struct Currency {
        string symbol;
        string name;
        string country;
        address tokenAddress;
        bool isActive;
    }

    mapping(bytes32 => RemittanceIntent) public remittances;
    mapping(address => bytes32[]) public userRemittances;
    mapping(string => Currency) public currencies;
    string[] public currencySymbols;

    uint256 public totalRemittances;
    uint256 public totalVolume;
    uint256 public platformFee = 50; // 0.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeCollector;

    event RemittanceCreated(bytes32 indexed id, address indexed sender, address indexed recipient, address sourceToken, address targetToken, uint256 sourceAmount, string memo);
    event RemittanceCompleted(bytes32 indexed id, uint256 targetAmount, uint256 fee);
    event RemittanceFailed(bytes32 indexed id, string reason);
    event CurrencyAdded(string symbol, address tokenAddress);

    constructor() Ownable(msg.sender) {
        feeCollector = msg.sender;
        _initializeCurrencies();
    }

    function executeRemittance(
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 minTargetAmount,
        string calldata memo
    ) external nonReentrant returns (bytes32 remittanceId) {
        require(recipient != address(0), "Invalid recipient");
        require(sourceAmount > 0, "Amount must be positive");
        require(_isValidToken(sourceToken), "Invalid source token");
        require(_isValidToken(targetToken), "Invalid target token");

        remittanceId = keccak256(abi.encodePacked(msg.sender, recipient, sourceToken, targetToken, sourceAmount, block.timestamp, totalRemittances));

        IERC20(sourceToken).safeTransferFrom(msg.sender, address(this), sourceAmount);

        uint256 fee = (sourceAmount * platformFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = sourceAmount - fee;

        if (fee > 0) {
            IERC20(sourceToken).safeTransfer(feeCollector, fee);
        }

        uint256 targetAmount;
        if (sourceToken == targetToken) {
            targetAmount = amountAfterFee;
        } else {
            targetAmount = _swapViaMento(sourceToken, targetToken, amountAfterFee);
            require(targetAmount >= minTargetAmount, "Slippage exceeded");
        }

        IERC20(targetToken).safeTransfer(recipient, targetAmount);

        remittances[remittanceId] = RemittanceIntent({
            sender: msg.sender,
            recipient: recipient,
            sourceToken: sourceToken,
            targetToken: targetToken,
            sourceAmount: sourceAmount,
            targetAmount: targetAmount,
            memo: memo,
            timestamp: block.timestamp,
            status: RemittanceStatus.Completed
        });

        userRemittances[msg.sender].push(remittanceId);
        userRemittances[recipient].push(remittanceId);
        totalRemittances++;

        emit RemittanceCreated(remittanceId, msg.sender, recipient, sourceToken, targetToken, sourceAmount, memo);
        emit RemittanceCompleted(remittanceId, targetAmount, fee);

        return remittanceId;
    }

    function getQuote(address sourceToken, address targetToken, uint256 sourceAmount) external view returns (uint256 targetAmount, uint256 fee, uint256 exchangeRate) {
        fee = (sourceAmount * platformFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = sourceAmount - fee;

        if (sourceToken == targetToken) {
            targetAmount = amountAfterFee;
            exchangeRate = 1e18;
        } else {
            targetAmount = _estimateMentoSwap(sourceToken, targetToken, amountAfterFee);
            if (amountAfterFee > 0) {
                exchangeRate = (targetAmount * 1e18) / amountAfterFee;
            }
        }
    }

    function getUserRemittances(address user) external view returns (bytes32[] memory) {
        return userRemittances[user];
    }

    function getRemittance(bytes32 id) external view returns (RemittanceIntent memory) {
        return remittances[id];
    }

    function getSupportedCurrencies() external view returns (Currency[] memory) {
        Currency[] memory result = new Currency[](currencySymbols.length);
        for (uint256 i = 0; i < currencySymbols.length; i++) {
            result[i] = currencies[currencySymbols[i]];
        }
        return result;
    }

    function setFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high");
        platformFee = _fee;
    }

    function setFeeCollector(address _collector) external onlyOwner {
        require(_collector != address(0), "Invalid address");
        feeCollector = _collector;
    }

    function _initializeCurrencies() internal {
        _addCurrency("cUSD", "Celo Dollar", "United States", cUSD);
        _addCurrency("cEUR", "Celo Euro", "European Union", cEUR);
        _addCurrency("cREAL", "Celo Brazilian Real", "Brazil", cREAL);
        _addCurrency("cKES", "Celo Kenyan Shilling", "Kenya", cKES);
        _addCurrency("PUSO", "Philippine Peso", "Philippines", PUSO);
        _addCurrency("cCOP", "Celo Colombian Peso", "Colombia", cCOP);
        _addCurrency("eXOF", "CFA Franc", "West Africa", eXOF);
    }

    function _addCurrency(string memory symbol, string memory name, string memory country, address tokenAddress) internal {
        currencies[symbol] = Currency({ symbol: symbol, name: name, country: country, tokenAddress: tokenAddress, isActive: tokenAddress != address(0) });
        currencySymbols.push(symbol);
    }

    function _isValidToken(address token) internal view returns (bool) {
        for (uint256 i = 0; i < currencySymbols.length; i++) {
            if (currencies[currencySymbols[i]].tokenAddress == token && currencies[currencySymbols[i]].isActive) {
                return true;
            }
        }
        return false;
    }

    function _swapViaMento(address sourceToken, address targetToken, uint256 amount) internal returns (uint256) {
        IERC20(sourceToken).approve(MENTO_BROKER, amount);
        // In production: call Mento Broker's swap function
        return _estimateMentoSwap(sourceToken, targetToken, amount);
    }

    function _estimateMentoSwap(address, address, uint256 amount) internal pure returns (uint256) {
        // Placeholder - in production query Mento oracle
        return amount;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
