import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(process.env.TOKEN_THOR_ADDR);

const decimals = 18
const convertToDecimals = amount => ethers.utils.parseUnits(`${amount}`, decimals)

(async () => {
  try {
    // Setting the max supply, scarcity.
    const amount = 1_000_000
    // Convert the amount to 18 decimals in a string for better precision.
    const amountWithDecimals = convertToDecimals(amount)
    
    // Lets MINT!!!11
    await tokenModule.mint(amountWithDecimals)
    const totalSupply = await tokenModule.totalSupply();

    console.log("✅ There now is", convertToDecimals(totalSupply), "$THORS in circulation")
  }
  catch(error) {
    console.error("Failed to print money", error)
  }

})()
