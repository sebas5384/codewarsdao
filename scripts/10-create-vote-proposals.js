import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js'

const voteModule = sdk.getVoteModule(process.env.VOTING_MODULE);
const tokenModule = sdk.getTokenModule(process.env.TOKEN_THOR_ADDR);

(async () => {
  try {
    // Amount of tokens to mint for the proposal.
    const amount = 420_000
    await voteModule.propose(
      `Should we mint an additional ${amount} $THOR into the treasury? 2`,
      [
        {
          // This proposal doesn't need to transfer any ETH to the tresoury,
          // since if approved will mint more $THOR tokens.
          nativeTokenValue: 0,
          // Minting the amount of tokens in this proposal.
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18)
            ]
          ),
          toAddress: tokenModule.address
        }
      ]
    );

    console.log("✅ Successfully created proposal to mint tokens")
  }
  catch(error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900
    // Proposal to transfer ourselves 6,900 tokens for being awesome.
    await voteModule.propose(
      `Should we transfer ${amount} $THOR from our tresoury to ${process.env.APP_MODULE} for being awesome? 2`,
      [
        {
          // Just sending our own $THOR token.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            'transfer',
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18)
            ]
          ),
          toAddress: tokenModule.address
        }
      ]
    );
    
    console.log("✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!");
  }
  catch (error) {
    console.error("failed to create second proposal", error);
  }
})();