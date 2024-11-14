const express = require('express');
const { ethers } = require('ethers');
const sdnController = require('./controllers/sdnController'); // SDN controller
const ContentRegistryArtifact = require('./artifacts/contracts/ContentVerifier.sol/ContentRegistry.json'); // Contract artifact
const { Web3 } = require('web3');
const Creator = require('./models/contentcreatormodel');
const mongoose = require('./conn');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Dummy authorized signers for deployment
const authorizedSigners = ['0xc478b22E3656Fa027614620C9d18fC358fDe05a9'];
let contentVerifier; // Contract instance
// Initialize contract instance
async function init() {
    const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/RuE83N5-YIkfrP_hDuYLKb6IDBNmJE-s');
    const wallet = new ethers.Wallet('affcc5ece628e36a8da67a47a159e994e6faad5032fc78f3a6e4e17a61bdbe3f', provider);
    // const ContentVerifier = new ethers.ContractFactory(ContentRegistryArtifact.abi, ContentRegistryArtifact.bytecode, wallet);
    // contentVerifier = await ContentVerifier.deploy(authorizedSigners);
    // await contentVerifier.deployed();
    // console.log("ContentVerifier deployed at:", contentVerifier.address);
    const ContentVerifier = new ethers.ContractFactory(
        ContentRegistryArtifact.abi,
        ContentRegistryArtifact.bytecode,
        wallet
    );    
    // Await the deploy method
    contentVerifier = await ContentVerifier.deploy(authorizedSigners);    
    // Then call deployed()
    await contentVerifier.waitForDeployment();
    console.log("ContentVerifier deployed at:", contentVerifier.target);
    
}

init(); // Initialize on server start

// Route to add a land record
app.post('/addLandRecord', async (req, res) => {
    const { userRole, action, regionID, ownerName, areaSize, location } = req.body;

    // Authenticate user action with SDN
    if (!sdnController.authenticate(userRole, action)) {
        return res.status(403).send('Access Denied');
    }

    try {
        await contentVerifier.addLandRecord(regionID, ownerName, areaSize, location);
        res.status(200).send("Land record added successfully.");
    } catch (error) {
        res.status(500).send("Failed to add land record: " + error.message);
    }
});

app.get('/',(req,res)=>{
    res.render('Home');
})

// Route to approve a land record
app.post('/approveLandRecord', async (req, res) => {
    const { userRole, action, regionID, recordIndex } = req.body;

    if (!sdnController.authenticate(userRole, action)) {
        return res.status(403).send('Access Denied');
    }

    try {
        await contentVerifier.approveLandRecord(regionID, recordIndex);
        res.status(200).send("Land record approved successfully.");
    } catch (error) {
        res.status(500).send("Approval failed: " + error.message);
    }
});

// Route to retrieve land records for a specific region
app.get('/getLandRecords/:regionID', async (req, res) => {
    const { regionID } = req.params;

    try {
        const records = await contentVerifier.getLandRecords(regionID);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).send("Failed to retrieve records: " + error.message);
    }
});


// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});