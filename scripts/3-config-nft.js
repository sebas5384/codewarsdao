import sdk from "./1-initialize-sdk.js"
import { readFileSync } from "fs"

// BundleDrop module ERC-1155 contract
const bundleDrop = sdk.getBundleDropModule("0xb08332B95CbaB67fA31f0D5FCfF6d6624D4A957F");

(async () => {
  try {
    // Set the NFT on our ERC-1155 and because it's an ERC-1155,
    //all our members will mint the same NFT.
    await bundleDrop.createBatch([
      {
        name: "Membership",
        description: "This NFT will give you access to CodewarsDAO",
        image: readFileSync("scripts/assets/codewars-nft-gm.png")
      }
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  }
  catch(error) {
    console.error("failed to create the new NFT", error)
  }
})()