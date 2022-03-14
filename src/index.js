import React from "react";
import ReactDOM from "react-dom";
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';
import "./index.css";
import App from "./App.jsx";

const RINKEBY = 4
const supportedChainIds = [RINKEBY]

// Only suport injected wallets like metamask
const connectors = {
  injected: {}
}

// Render the App component to the DOM
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
    <App />
  </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
