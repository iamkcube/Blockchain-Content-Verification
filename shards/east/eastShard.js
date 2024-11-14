const ShardManagement = require("../../models/ShardManagement");
class EastShard extends ShardManagement {
  constructor() {
    super("East");
    this.regionPolicies = ["Policy M", "Policy N", "Policy O"];
    this.regionSpecificSettings = {
      maxTransactionLimit: 15000,
      regionName: "East",
      transactionFee: 0.015,
    };
  }
  applyRegionSpecificPolicy(policyName) {
    if (this.regionPolicies.includes(policyName)) {
      console.log("Applying " + policyName + " to East region");
    } else {
      throw new Error(
        "Policy " + policyName + " is not defined for East region"
      );
    }
  }
  applyTransactionLimits(transactionAmount) {
    if (transactionAmount) {
      throw new Error(
        "Transaction exceeds the limit of " +
          this.regionSpecificSettings.maxTransactionLimit
      );
    }
    console.log(
      "Transaction of " +
        transactionAmount +
        " passed the limit check for East region"
    );
  }
  calculateTransactionFee(transactionAmount) {
    const fee = transactionAmount * this.regionSpecificSettings.transactionFee;
    console.log(
      "Transaction fee for amount " +
        transactionAmount +
        " is " +
        fee +
        " in East region"
    );
    return fee;
  }
  updateRegionSettings(setting, value) {
    if (this.regionSpecificSettings.hasOwnProperty(setting)) {
      this.regionSpecificSettings[setting] = value;
      console.log("Region setting " + setting + " updated to " + value);
    } else {
      throw new Error("Invalid setting: " + setting);
    }
  }
}
module.exports = new EastShard();
