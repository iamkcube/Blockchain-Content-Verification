async function main() {
  const ContentRegistry = await ethers.getContractFactory("ContentRegistry");
  const contentRegistry = await ContentRegistry.deploy();

  await contentRegistry.waitForDeployment();

  console.log("ContentRegistry deployed to:", contentRegistry.address);
  console.log("ContentRegistry contract:", contentRegistry)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
