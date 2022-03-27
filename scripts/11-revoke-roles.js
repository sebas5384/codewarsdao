import sdk from './1-initialize-sdk.js'

const tokenModule = sdk.getTokenModule(process.env.TOKEN_THOR_ADDR);

// Avoid some admin to take over the DAO.

(async () => {
  try {
    const allRoles = tokenModule.getAllRoleMembers();

    console.log("👀 Roles that exist right now: ", allRoles);

    // revoke all of them.
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS)
    console.log("🎉 Roles after revoking ourselves", await tokenModule.getAllRoleMembers());
    console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");
  }
  catch(error) {
    console.error("Failed to revoke ourselves from the DAO trasury", error);
  }
})();