import sdk from "./1-initialize-sdk.js"

const bundleDrop = sdk.getBundleDropModule("0xb08332B95CbaB67fA31f0D5FCfF6d6624D4A957F");

(async () => {
  try {
		const claimConditionFactory = bundleDrop.getClaimConditionFactory();
		// Specify conditions.
		claimConditionFactory.newClaimPhase({
			startTime: new Date(),
			maxQuantity: 50_000,
			maxQuantityPerTransaction: 1,
		});

		await bundleDrop.setClaimCondition(0, claimConditionFactory);
		console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address)
	}
	catch(error) {
		console.error("Failed to set claim condition", error);
	}
})()