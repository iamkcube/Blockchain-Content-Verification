const ShardManagement = require("../../models/ShardManagement");
class NorthShard extends ShardManagement {
  constructor() {
    super("North");
    this.regionPolicies = ["Policy A", "Policy B", "Policy C"];
    this.regionSpecificSettings = {
      maxTransactionLimit: 10000,
      regionName: "North",
      transactionFee: 0.01,
    };
  }
  applyRegionSpecificPolicy(policyName) {
    if (this.regionPolicies.includes(policyName)) {
      console.log("Applying " + policyName + " to North region");
    } else {
      throw new Error(
        "Policy " + policyName + " is not defined for North region"
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
        " passed the limit check for North region"
    );
  }
  calculateTransactionFee(transactionAmount) {
    const fee = transactionAmount * this.regionSpecificSettings.transactionFee;
    console.log(
      "Transaction fee for amount " +
        transactionAmount +
        " is " +
        fee +
        " in North region"
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
module.exports = new NorthShard();
