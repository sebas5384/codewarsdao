import sdk from './1-initialize-sdk.js'

const app = sdk.getAppModule(process.env.APP_MODULE);

(async () => {
  try {
    // Deploy a standard ERC-20 contract for our governence token.
    const tokenModule = await app.deployTokenModule({
      name: 'CodeWarsDAO Governance Token',
      symbol: 'THOR'
    });

    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  }
  catch (error) {
    console.error("failed to deploy token module", error);
  }
})();