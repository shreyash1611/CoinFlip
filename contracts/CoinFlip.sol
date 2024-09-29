pragma solidity 0.8.20;

import "./Errors.sol";

import { VRFConsumerBaseV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { IVRFCoordinatorV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import { ReentrancyGuard } from "solady/src/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CoinFlip is VRFConsumerBaseV2Plus, ReentrancyGuard {
    IVRFCoordinatorV2Plus internal immutable COORDINATOR;
    bytes32 internal immutable KEY_HASH;
    uint256 private immutable SUBSCRIPTION_ID;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant CALLBACK_GAS_LIMIT = 1e5;
    uint32 private constant NUM_WORDS = 1;

    IERC20 public immutable betToken;
    uint256 public constant MIN_BET = 1 * 10**18;
    uint256 public constant MAX_BET = 100 * 10**18;
    uint256 private contractBalance;

    struct PlayerByAddress {
        uint256 balance;
        uint256 betAmount;
        uint256 betChoice;
        address playerAddress;
        bool betOngoing;
    }

    struct Temp {
        uint256 id;
        uint256 result;
        address playerAddress;
    }

    mapping(address => PlayerByAddress) public playersByAddress;

    mapping(uint256 => Temp) public temps;

    event DepositToContract(address indexed user, uint256 indexed depositAmount, uint256 newBalance);
    event Withdrawal(address player, uint256 amount);
    event NewIdRequest(address indexed player, uint256 requestId);
    event GeneratedRandomNumber(uint256 requestId, uint256 randomNumber);
    event BetResult(address indexed player, bool victory, uint256 amount);
    event ContractBalanceWithdrawn(address indexed owner, uint256 amount);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _betTokenAddress
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
        KEY_HASH = _keyHash;
        SUBSCRIPTION_ID = _subscriptionId;
        betToken = IERC20(_betTokenAddress);
    }

    function bet(uint256 _betChoice, uint256 _betAmount) public nonReentrant {
        if (_betChoice != 0 && _betChoice != 1) revert CoinFlip__InvalidBetChoice();

        address player = msg.sender;
        PlayerByAddress memory _player = playersByAddress[player];

        if (_player.betOngoing) revert CoinFlip__BetAlreadyOngoing();

        if (_betAmount < MIN_BET) revert CoinFlip__InsufficientAmount();
        if (_betAmount > MAX_BET) revert CoinFlip__AmountTooBig();
        if (_betAmount > getContractBalance() / 2) revert CoinFlip__AmountTooBig();

        bool success = betToken.transferFrom(player, address(this), _betAmount);
        if (!success) revert CoinFlip__TokenTransferFailed();

        _player.playerAddress = player;
        _player.betChoice = _betChoice;
        _player.betOngoing = true;
        _player.betAmount = _betAmount;

        playersByAddress[player] = _player;
        contractBalance += _betAmount;

        uint256 requestId = requestRandomWords();
        temps[requestId].playerAddress = player;
        temps[requestId].id = requestId;

        emit NewIdRequest(player, requestId);
    }

    function withdrawPlayerBalance() public nonReentrant {
        address player = msg.sender;
        if (playersByAddress[player].betOngoing) revert CoinFlip__BetOngoing();
        if (playersByAddress[player].balance == 0) revert CoinFlip__NoFundsToWithdraw();

        uint256 amount = playersByAddress[player].balance;
        delete (playersByAddress[player]);

        bool success = betToken.transfer(player, amount);
        if (!success) revert CoinFlip__WithdrawFailed();

        emit Withdrawal(player, amount);
    }

    function deposit(uint256 _amount) public {
        if (_amount == 0) revert CoinFlip__InsufficientAmount();
        bool success = betToken.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert CoinFlip__DepositFailed();
        contractBalance += _amount;
        emit DepositToContract(msg.sender, _amount, contractBalance);
    }

    function getPlayerBalance() public view returns (uint256) {
        return playersByAddress[msg.sender].balance;
    }

    function getContractBalance() public view returns (uint256) {
        return betToken.balanceOf(address(this));
    }

    function getMinBet() public pure returns (uint256) {
        return MIN_BET;
    }

    function getMaxBet() public pure returns (uint256) {
        return MAX_BET;
    }

    function requestRandomWords() private returns (uint256) {
        return
            COORDINATOR.requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                    keyHash: KEY_HASH,
                    subId: SUBSCRIPTION_ID,
                    requestConfirmations: REQUEST_CONFIRMATIONS,
                    callbackGasLimit: CALLBACK_GAS_LIMIT,
                    numWords: NUM_WORDS,
                    extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({ nativePayment: false }))
                })
            );
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        uint256 randomResult = _randomWords[0] % 2;
        temps[_requestId].result = randomResult;

        bool result = checkResult(randomResult, _requestId);
        emit GeneratedRandomNumber(_requestId, randomResult);
        emit BetResult(temps[_requestId].playerAddress, result, result ? playersByAddress[temps[_requestId].playerAddress].betAmount * 2 : 0);
    }

    function checkResult(uint256 _randomResult, uint256 _requestId) private returns (bool) {
        address player = temps[_requestId].playerAddress;
        bool win = false;
        uint256 amountWon = 0;

        PlayerByAddress memory _player = playersByAddress[player];

        if (_player.betChoice == _randomResult) {
            win = true;
            amountWon = _player.betAmount;
            
            bool success = betToken.transfer(player, amountWon * 2);
            if (!success) revert CoinFlip__TokenTransferFailed();
            
            contractBalance -= amountWon;
        } else {
            contractBalance += _player.betAmount;
        }

        _player.betAmount = 0;
        _player.betOngoing = false;
        playersByAddress[player] = _player;

        emit BetResult(player, win, win ? amountWon * 2 : 0);

        delete (temps[_requestId]);
        return win;
    }

    function withdrawContractBalance() public onlyOwner {
        if (contractBalance == 0) revert CoinFlip__NoFundsToWithdraw();

        uint256 toTransfer = contractBalance;
        contractBalance = 0;
        bool success = betToken.transfer(owner(), toTransfer);
        if (!success) revert CoinFlip__WithdrawFailed();

        emit ContractBalanceWithdrawn(owner(), toTransfer);
    }

    receive() external payable {
    }
}