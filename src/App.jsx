import { useEffect, useMemo, useState } from "react";

import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  const {connectWallet, address, disconnectWallet} = useWeb3()

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
  
  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>
  );
};

export default App;
