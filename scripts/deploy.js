const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require("fs");

const COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
const KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
const SUBSCRIPTION_ID = "103919831159859424000633677964629536302375779887303165208300361186565141641676";
const BET_TOKEN_ADDRESS = "0xad3757CeB2Bf16f6E15aAC6F0ff33f70B1D45Bd5";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Check deployer's balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.1")) {
    console.error("Insufficient funds. Please ensure the deployer has at least 0.1 ETH");
    process.exit(1);
  }

  // Deploy CoinFlip contract
  const CoinFlip = await ethers.getContractFactory("CoinFlip");
  console.log("Deploying CoinFlip...");
  const coinFlip = await CoinFlip.deploy(COORDINATOR, KEY_HASH, SUBSCRIPTION_ID, BET_TOKEN_ADDRESS);
  await coinFlip.waitForDeployment();
  const coinFlipAddress = await coinFlip.getAddress();

  console.log("\nCoinFlip deployed to: ", coinFlipAddress);

  // Wait for deployment to be confirmed
  console.log("Waiting for deployment confirmation...");
  await coinFlip.deploymentTransaction()?.wait(2);

  // Send 0.025 Sepolia ETH to the deployed contract for operational purposes
  const tx = {
    to: coinFlipAddress,
    value: ethers.parseEther("0.025")
  };

  console.log("\nSending 0.025 Sepolia ETH to the deployed contract for operational purposes...");
  try {
    const txResponse = await deployer.sendTransaction(tx);
    await txResponse.wait();
    console.log("0.025 Sepolia ETH has been sent to the contract.");
  } catch (error) {
    console.error("Error sending ETH to the contract:", error.message);
    process.exit(1);
  }

  // Get and log CoinFlip ABI
  const coinFlipABI = JSON.parse(fs.readFileSync("./artifacts/contracts/CoinFlip.sol/CoinFlip.json", "utf8"));
  const abi = JSON.stringify(coinFlipABI.abi);
  console.log("\nCoinFlip ABI:");
  console.log(abi);

  console.log("\nNote: All betting transactions will be done using the ERC20 token at address:", BET_TOKEN_ADDRESS);
}

main().catch((error) => {
  console.error("Deployment failed:", error.message);
  process.exitCode = 1;
});
