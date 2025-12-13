const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CeloRemit contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CeloRemit
  const CeloRemit = await hre.ethers.getContractFactory("CeloRemit");
  const celoRemit = await CeloRemit.deploy();

  await celoRemit.waitForDeployment();
  
  const contractAddress = await celoRemit.getAddress();

  console.log("\n✅ CeloRemit deployed to:", contractAddress);
  console.log("\n📝 Update your .env.local file:");
  console.log(`NEXT_PUBLIC_CELOREMIT_ADDRESS=${contractAddress}`);

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Verify contract
  console.log("\n🔍 Verifying contract on Celoscan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    console.log("\n💡 You can manually verify using:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  }

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

