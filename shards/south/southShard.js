const ShardManagement = require("../../models/ShardManagement");
class SouthShard extends ShardManagement {
  constructor() {
    super("South");
    this.regionPolicies = ["Policy X", "Policy Y", "Policy Z"];
    this.regionSpecificSettings = {
      maxTransactionLimit: 20000,
      regionName: "South",
      transactionFee: 0.02,
    };
  }
  applyRegionSpecificPolicy(policyName) {
    if (this.regionPolicies.includes(policyName)) {
      console.log("Applying " + policyName + " to South region");
    } else {
      throw new Error(
        "Policy " + policyName + " is not defined for South region"
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
        " passed the limit check for South region"
    );
  }
  calculateTransactionFee(transactionAmount) {
    const fee = transactionAmount * this.regionSpecificSettings.transactionFee;
    console.log(
      "Transaction fee for amount " +
        transactionAmount +
        " is " +
        fee +
        " in South region"
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
module.exports = new SouthShard();
