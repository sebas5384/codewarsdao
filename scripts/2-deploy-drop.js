import {ethers} from 'ethers'
import { readFileSync } from 'fs'

import sdk from './1-initialize-sdk.js'

const app = sdk.getAppModule('0x385DcDC2C7b0C432fB65c4943f4C047e44BCB9f0');

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // Collection name
      name: 'CodeWarsDAO Membership',
      description: 'A DAO for warriors from CodeWars\'s competition',
      image: readFileSync('./assets/codewars.png'),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // you can set this to your own wallet address if you want to charge for the drop.
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    })
    
    console.log(`✅ Successfully deployed bundleDrop module, address:`, bundleDropModule.address);
    console.log(`✅ bundleDrop metadata:`, await bundleDropModule.getMetadata());
  }
  catch (error) {
    console.error(`failed to deploy bundleDrop`, error);
  }
})()
