import sdk, {convertToDecimals} from "./1-initialize-sdk.js";

// Get our ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule(process.env.TOKEN_MEMBERSHIP);

// Get token module ERC-20 token contract.
const tokenModule = sdk.getTokenModule(process.env.TOKEN_THOR_ADDR);

const collectionID = "0";

(async () => {
  try {
    // Get all the addresses of people who owns our membership token.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses(collectionID);

    if (walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!");
      process.exit(0);
    }

    // Airdrop some tokens to our members.
    const airdropTargets = walletAddresses.map(address => {
      const amount = 1000
      console.log("✅ Going to airdrop", amount, "tokens to", address);
      const airdropTarget = {
        address,
        amount: convertToDecimals(amount)
      }
      return airdropTarget
    })

    // Call transferBatch on all our airdrop targets.
    console.log(`🌈 Starting airdrop to ${airdropTargets.length} wallets...`)
    await tokenModule.transferBatch(airdropTargets)
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  }
  catch (error) {
    console.error("Failed to airdrop tokens", error);
  }
})()