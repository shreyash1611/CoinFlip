export const contractABI =[
    {
      "inputs": [
        { "internalType": "address", "name": "_vrfCoordinator", "type": "address" },
        { "internalType": "bytes32", "name": "_keyHash", "type": "bytes32" },
        { "internalType": "uint256", "name": "_subscriptionId", "type": "uint256" },
        { "internalType": "address", "name": "_betTokenAddress", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    { "inputs": [], "name": "CoinFlip__AmountTooBig", "type": "error" },
    { "inputs": [], "name": "CoinFlip__BetAlreadyOngoing", "type": "error" },
    { "inputs": [], "name": "CoinFlip__BetOngoing", "type": "error" },
    { "inputs": [], "name": "CoinFlip__DepositFailed", "type": "error" },
    { "inputs": [], "name": "CoinFlip__InsufficientAmount", "type": "error" },
    { "inputs": [], "name": "CoinFlip__InvalidBetChoice", "type": "error" },
    { "inputs": [], "name": "CoinFlip__NoFundsToWithdraw", "type": "error" },
    { "inputs": [], "name": "CoinFlip__TokenTransferFailed", "type": "error" },
    { "inputs": [], "name": "CoinFlip__WithdrawFailed", "type": "error" },
    {
      "inputs": [
        { "internalType": "address", "name": "have", "type": "address" },
        { "internalType": "address", "name": "want", "type": "address" }
      ],
      "name": "OnlyCoordinatorCanFulfill",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "have", "type": "address" },
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "coordinator", "type": "address" }
      ],
      "name": "OnlyOwnerOrCoordinator",
      "type": "error"
    },
    { "inputs": [], "name": "Reentrancy", "type": "error" },
    { "inputs": [], "name": "ZeroAddress", "type": "error" },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
        { "indexed": false, "internalType": "bool", "name": "victory", "type": "bool" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "BetResult",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "ContractBalanceWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "address", "name": "vrfCoordinator", "type": "address" }
      ],
      "name": "CoordinatorSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": true, "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }
      ],
      "name": "DepositToContract",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "randomNumber", "type": "uint256" }
      ],
      "name": "GeneratedRandomNumber",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }
      ],
      "name": "NewIdRequest",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "OwnershipTransferRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "address", "name": "player", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "Withdrawal",
      "type": "event"
    },
    { "inputs": [], "name": "MAX_BET", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "MIN_BET", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_betChoice", "type": "uint256" },
        { "internalType": "uint256", "name": "_betAmount", "type": "uint256" }
      ],
      "name": "bet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    { "inputs": [], "name": "betToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    {
      "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    { "inputs": [], "name": "getContractBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getMaxBet", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" },
    { "inputs": [], "name": "getMinBet", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" },
    { "inputs": [], "name": "getPlayerBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "playersByAddress",
      "outputs": [
        { "internalType": "uint256", "name": "balance", "type": "uint256" },
        { "internalType": "uint256", "name": "betAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "betChoice", "type": "uint256" },
        { "internalType": "address", "name": "playerAddress", "type": "address" },
        { "internalType": "bool", "name": "betOngoing", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "requestId", "type": "uint256" },
        { "internalType": "uint256[]", "name": "randomWords", "type": "uint256[]" }
      ],
      "name": "rawFulfillRandomWords",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    { "inputs": [], "name": "s_vrfCoordinator", "outputs": [{ "internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    {
      "inputs": [{ "internalType": "address", "name": "_vrfCoordinator", "type": "address" }],
      "name": "setCoordinator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "temps",
      "outputs": [
        { "internalType": "uint256", "name": "id", "type": "uint256" },
        { "internalType": "uint256", "name": "result", "type": "uint256" },
        { "internalType": "address", "name": "playerAddress", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "withdrawContractBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "withdrawPlayerBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "stateMutability": "payable", "type": "receive" }
  ]
  