const ShardManagement = require("../../models/ShardManagement");
class WestShard extends ShardManagement {
  constructor() {
    super("West");
    this.regionPolicies = ["Policy Z", "Policy W", "Policy P"];
    this.regionSpecificSettings = {
      maxTransactionLimit: 50000,
      regionName: "West",
      transactionFee: 0.03,
    };
  }
  applyRegionSpecificPolicy(policyName) {
    if (this.regionPolicies.includes(policyName)) {
      console.log("Applying " + policyName + " to West region");
    } else {
      throw new Error(
        "Policy " + policyName + " is not defined for West region"
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
        " passed the limit check for West region"
    );
  }
  calculateTransactionFee(transactionAmount) {
    const fee = transactionAmount * this.regionSpecificSettings.transactionFee;
    console.log(
      "Transaction fee for amount " +
        transactionAmount +
        " is " +
        fee +
        " in West region"
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
module.exports = new WestShard();
