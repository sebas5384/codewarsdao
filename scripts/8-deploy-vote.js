import sdk from './1-initialize-sdk.js'

const appModule = sdk.getAppModule(process.env.APP_MODULE);

(async () => {
  try{
    const voteModule = await appModule.deployVoteModule({
      name: "CodeWarsDAO Governance proposals",
      // Address to our ERC-20 contract of $THOR.
      votingTokenAddress: process.env.TOKEN_THOR_ADDR,
      // When the members can vote after the proposal is created? imediately.
      proposalStartWaitTimeInSeconds: 0,
      // How much time members have to vote when it's created? 24 hours.
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      // What's the minimum quorum? at least the creator of the proposal.
      votingQuorumFraction: 0,
      // What's the minimum number of tokens the member requires to create a proposal? None.
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log("✅ Successfully deployed vote module, address:", voteModule.address);
  }
  catch(error) {
    console.error("Failed to deploy vote module", error)
  }
})();