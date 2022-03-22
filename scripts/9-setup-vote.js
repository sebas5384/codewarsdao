import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js'

const voteModule = sdk.getVoteModule(process.env.VOTING_MODULE);
const tokenModule = sdk.getTokenModule(process.env.TOKEN_THOR_ADDR);

(async () => {
  try {
    // Grant the power of minting tokens if needed by the voting module.
    await tokenModule.grantRole("minter", tokenModule.address);

    console.log(
      "Successfully gave vote module permissions to act on token module"
    );
  }
  catch(error) {
    console.error("failed to grant vote module permissions on token module", error);
    process.exit(1)
  }

  try {
    // Get our wallet's token balance since we are the major holder.
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

    // Grab 90% of the tokens supply.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of the supply to our voting contract.
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("✅ Successfully transferred tokens to vote module");
  }
  catch(error) {
    console.error("failed to transfer tokens to vote module", error);
  }
})();