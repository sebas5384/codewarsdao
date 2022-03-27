import { useEffect, useMemo, useState } from "react";
import { ethers, VoidSigner } from "ethers";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

const sdk = new ThirdwebSDK("rinkeby")
const bundleDropModule = sdk.getBundleDropModule("0xb08332B95CbaB67fA31f0D5FCfF6d6624D4A957F")
const tokenModule = sdk.getTokenModule("0x3DF608219Df0815d5b0E6E30b42dd7B4D326922A");
const voteModule = sdk.getVoteModule("0x6d5A86cEBea4b1E102810E4d2C1451f432574367");
const collectionId = "0"

const App = () => {
  const {connectWallet, address, provider, error} = useWeb3()
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({})
  const [memberAddressess, setMemberAddresses] = useState([])
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Get proposals
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    voteModule.getAll()
      .then(proposals => {
        const archived = item => item.state !== 3
        setProposals(proposals.filter(archived))
      })
      .catch((error) => {
        console.error("failed to get proposals", error)
      })
  }, [hasClaimedNFT])

  // Check if the users has voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    if (!proposals.length) {
      return;
    }

    voteModule.hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        }
        else {
          console.log("🙂 User has not voted yet");
        }
      })
      .catch((e) => {
        console.error("failed to check if user has voted", e)
      });
  }, [hasClaimedNFT, proposals, address])

  useEffect(() => {
    async function doHasClaimedNFT () {
      if (!address) {
        return;
      }
  
      try {
        // Verify if the user has the NFT already
        const balance = await bundleDropModule.balanceOf(address, "0");
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log("🌟 this user has a membership NFT!");
        }
        else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
        }
      }
      catch (error) {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      } 
    }
    doHasClaimedNFT()
  }, [address])

  // Get all the member's addresses of the DAO.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    async function fetchAddresses() {
      try {
        // get the addresses (members) which claimed the membership token.
        const memberAddresses = await bundleDropModule.getAllClaimerAddresses(collectionId)
        setMemberAddresses(memberAddresses)
      }
      catch (error) {
        console.error("failed to get member list", error)
      }
    }
    fetchAddresses()
  }, [hasClaimedNFT])

  // Get the amount of tokens from each member.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    async function fetchAmounts() {
      try {
        const amounts = await tokenModule.getAllHolderBalances();
        setMemberTokenAmounts(amounts)
        console.log("👜 Amounts", amounts)
      }
      catch (error) {
        console.error("failed to get token amounts", error);
      }
    }
    fetchAmounts()
  }, [hasClaimedNFT])

  // Combines members with their amounts.
  const membersList = useMemo(() => {
    return memberAddressess.map((address) => ({
      address,
      // Format the 18 decimals amount or 0 when member doesn't hold any coins(tokens) yet.
      tokenAmount: ethers.utils.formatUnits(memberTokenAmounts[address] || 0, 18)
    }))
  }, [memberAddressess, memberTokenAmounts])

  const unsupportedChain = error && error.name === "UnsupportedChainIdError"
  if (unsupportedChain) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>This dApp only works on the Rinkeby network, please switch networks in your connected wallet</p>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to CodeWarsDAO</h1>
        <button onClick={() => connectWallet("injected")}
          className="fadein btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }
  
  const mintNFT = async () => {
    setIsClaiming(true)
    try {
      // In order to sign transactions into the blockchain we need a signer,
      // instead we can only read data, not write.
      const signer = provider ? provider.getSigner() : undefined;
      sdk.setProviderOrSigner(signer)
      
      await bundleDropModule.claim("0", 1);
      setHasClaimedNFT(true)
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    }
    catch(error) {
      console.error("Failed to claim", error)
    }
    finally {
      setIsClaiming(false)
    }
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>CodewarsDAO 🤘 member dashboard</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member list</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {membersList.map(member => (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              e.stopPropagation()

              // In order to sign transactions into the blockchain we need a signer,
              // instead we can only read data, not write.
              const signer = provider ? provider.getSigner() : undefined;
              sdk.setProviderOrSigner(signer)

              // prevent double clicks/submits.
              setIsVoting(true)

              const ABSTAIN = 2
              const votes = proposals.map((proposal) => {
                let voteResult = {
                  proposalId: proposal.proposalId,
                  // Abstaing by default.
                  vote: ABSTAIN,
                }

                proposal.votes.forEach((vote) => {
                  const element = document.getElementById(proposal.proposalId + "-" + vote.type)
                  if (element.checked) {
                    voteResult.vote = vote.type
                    return;
                  }
                })
                return voteResult
              })

              
              try {
                // First we need to make sure the user delegates their token to vote.
                const delegation = await tokenModule.getDelegationOf(address)
                // if the delegation is 0x0 it means they have not delgated their governance token yet.
                if (delegation === ethers.constants.AddressZero) {
                  // let's delegate the governance token before voting.
                  await tokenModule.delegateTo(address)
                }

                // Lets try to vote on the proposals.
                await Promise.all(votes.map(async (vote) => {
                  // before voting we need to check if the proposal is still active.
                  const proposal = await voteModule.get(vote.proposalId)
                  const hasVoted = await voteModule.hasVoted(vote.proposalId, address)
                  const isActive = proposal.state === 1
                  if (!isActive || hasVoted) {
                    return;
                  }
                  // LETS VOTEEEE!!!11
                  await voteModule.vote(vote.proposalId, vote.vote);

                  return vote
                }))
                .catch((error) => {
                  console.error("failed to vote", error)
                })
                .then(() => Promise.all(votes.map(async vote => {
                  const proposal = await voteModule.get(vote.proposalId)
                  const isReadyToBeExecuted = proposal.state === 4
                  if (!isReadyToBeExecuted) {
                    return;
                  }
                  // LETS EXECUTE THE PROPOSAL!!!11
                  await voteModule.execute(vote.proposalId)

                  return vote
                })))
                .catch((error) => {
                  console.error("failed to execute the proposal", error)
                })
                .then(() => {
                  setHasVoted(true)
                  console.log("Successfully voted!")
                })
              }
              catch(error) {
                console.error("failed to delegate", error)
              }
              finally {
                setIsVoting(false)
              }
            }}>
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You already voted"
                    : "Submit votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="mint-nft">
      <h1>Mint your free Codewars DAO membership NFT!</h1>
      <button disabled={isClaiming} onClick={() => mintNFT()}>
        {isClaiming ? "Minting..." : "Mint your NFT for free!"}
      </button>
    </div>
  );
};

export default App;

// No need to show the whole address.
function shortenAddress(addr="") {
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4)
}