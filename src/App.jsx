import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

const sdk = new ThirdwebSDK("rinkeby")
const bundleDropModule = sdk.getBundleDropModule("0xb08332B95CbaB67fA31f0D5FCfF6d6624D4A957F")
const tokenModule = sdk.getTokenModule("0x3DF608219Df0815d5b0E6E30b42dd7B4D326922A");
const collectionId = "0"

const App = () => {
  const {connectWallet, address, provider} = useWeb3()
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({})
  const [memberAddressess, setMemberAddresses] = useState([])
  
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

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to CodewarDAO</h1>
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