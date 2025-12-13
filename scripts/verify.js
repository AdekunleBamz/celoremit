const hre = require("hardhat");

async function main() {
  // Get contract address from command line or use default
  const contractAddress = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CELOREMIT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please provide CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.js --network celo");
    process.exit(1);
  }

  console.log(`🔍 Verifying contract at: ${contractAddress}`);
  console.log(`📍 Network: ${hre.network.name}\n`);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

