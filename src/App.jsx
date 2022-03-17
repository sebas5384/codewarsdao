import { useEffect, useMemo, useState } from "react";

import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

const sdk = new ThirdwebSDK("rinkeby")
const bundleDropModule = sdk.getBundleDropModule("0xb08332B95CbaB67fA31f0D5FCfF6d6624D4A957F")

const App = () => {
  const {connectWallet, address, provider} = useWeb3()
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  
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
      <div className="landing">
        <h1>You are a member of Codewars DAO 🤘</h1>
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
