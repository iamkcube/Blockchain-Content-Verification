const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Creator = require('./models/contentcreatormodel'); // content creator model
const mongoose = require('./conn'); 
const { Web3 } = require('web3');
const app = express();
// const exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/public", express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const PORT = process.env.PORT || 3000;

// app.set('views', path.join(__dirname, 'views'));
// // Use exphbs.engine instead of exphbs()
// app.engine('handlebars', exphbs.engine);
// app.set('view engine', 'handlebars');

// app.use(express.json());

const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/RuE83N5-YIkfrP_hDuYLKb6IDBNmJE-s'; 
const web3 = new Web3(providerUrl);


const ContentRegistryArtifact = require('./artifacts/contracts/ContentVerifier.sol/ContentRegistry.json');
const contractAddress = '0xD68fBc0959ab0Ac5EE31b57a01747611Ffc8D9f0'; 
const contractInstance = new web3.eth.Contract(ContentRegistryArtifact.abi, contractAddress);

// Function to generate hash key
function generateHash(data) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

async function getExistingContentHashKeys() {
    try {
        const result = await contractInstance.methods.getExistingContentHashKeys().call();
        return result;
    } catch (error) {
        console.error('Error retrieving existing content hash keys:', error);
        return [];
    }
}


app.get("/", (req, res) => {
    res.render('Home');
});

app.get("/register", (req, res) => {
    res.render('Register');
});

app.get("/login", (req, res) => {
    res.render('CreatorLogin');
});

app.get("/dashboard", (req, res) => {
    res.render('dashboard');
}); 

app.get("/upload_content", (req, res) => {
    res.render('ContentUpload');
});

app.get("/modify", async (req, res) => {
    try {
        const contentHashKeys = await getExistingContentHashKeys();
        res.render('modify', { contentHashKeys });
    } catch (error) {
        console.error('Error rendering modify form:', error);
        res.status(500).send('Internal server error');
    }
});

app.get("/verify_content", (req, res) => {
    res.render('verifyContent'); 
});

app.get("/content_upload_receipt", (req, res) => {
    res.render('content_upload_receipt');
});

app.get("/content_verify_recipt", (req, res) => {
    res.render('content_verify_recipt');
});

app.get("/logout", (req, res) => {
    res.render('Home'); 
});

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const existingUser = await Creator.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        } else {
            const NewCreator = new Creator({ email, username, password });
            await NewCreator.save();
            console.log("User registered successfully")
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Creator.findOne({ username });
        if (existingUser) {
            if (existingUser.password === password) { 
                console.log('User logged in successfully!');
                res.redirect("/dashboard");
            } else {
                return res.status(400).json({ message: 'Invalid password' }); 
            }
        } else {
            return res.status(400).json({ message: 'User not found' }); 
        }
    } catch (error) {
        console.error('Error during Login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload content route
app.post('/upload_content', async (req, res) => {
    try {
        const { content, username } = req.body;

        // Generate hash key and content hash for the uploaded content
        const hashKey = generateHash(content);
        const contentHash = generateHash(content);
        const timestamp = Date.now();
        
        // Get the account private key
        const privateKey = 'affcc5ece628e36a8da67a47a159e994e6faad5032fc78f3a6e4e17a61bdbe3f'; // private key
        const gasPrice = await web3.eth.getGasPrice();
        console.log("🚀 ~ app.post ~ gasPrice:", gasPrice)
        
        // Create a new transaction object
        const txObject = {
            to: contractAddress,
            data: contractInstance.methods.registerContent(hashKey, username, contentHash, timestamp).encodeABI(),
            gasLimit: web3.utils.toHex(400000), // Specify gas limit
            gasPrice: web3.utils.toHex(gasPrice), // Specify gas price
            nonce: await web3.eth.getTransactionCount('0x7094C617E0fBf221AAe6115d447486168AD783Bf') // Get the nonce
        };
        console.log("🚀 ~ app.post ~ txObject:", txObject)
        
        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
        console.log("🚀 ~ app.post ~ signedTx:", signedTx)
        
        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("🚀 ~ app.post ~ receipt:", receipt)

        console.log("Transaction receipt:", receipt);
        
        console.log('Content registered successfully!');
        console.log('Hash Key:', hashKey); // Print hash key to console
        res.status(200).render('content_upload_receipt', { hashKey, username, timestamp });

    } catch (error) {
        console.error('Error uploading content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/modify', async (req, res) => {
    try {
        const { hashKey, newContent, username } = req.body;
        if (!newContent) {
            return res.status(400).json({ message: 'New content is required' });
        }
        const newHashKey = generateHash(newContent);
        const timestamp = Date.now();

        // Get the account private key
        const privateKey = 'affcc5ece628e36a8da67a47a159e994e6faad5032fc78f3a6e4e17a61bdbe3f'; 
        const gasPrice = await web3.eth.getGasPrice();

        // Calculate hash for new content
        const newContentHash = generateHash(newContent);

        // Create a new transaction object
        const txObject = {
            to: contractAddress,
            data: contractInstance.methods.modifyContent(hashKey, newContentHash, username, timestamp).encodeABI(),
            gasLimit: web3.utils.toHex(200000), // Specify gas limit
            gasPrice: web3.utils.toHex(gasPrice), // Specify gas price
            nonce: await web3.eth.getTransactionCount('0x7094C617E0fBf221AAe6115d447486168AD783Bf') // Get the nonce
        };
        

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        contractInstance.once('DebugModifyContent', (error, event) => {
            if (error) {
                console.error('Error emitting DebugModifyContent event:', error);
            } else {
                console.log('DebugModifyContent event emitted:', event.returnValues);
            }
        });
        
        console.log("Transaction receipt:", receipt);

        console.log('Content modified successfully!');
        console.log('New Hash Key:', newHashKey); // Print new hash key to console
        res.status(200).json({ message: 'Content modified successfully!', newHashKey, username, timestamp });
    } catch (error) {
        console.error('Error modifying content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/verify_content', async (req, res) => {
    try {
        const { content } = req.body;

        // Generate hash key for the provided content
        const hashKey = generateHash(content);
        console.log('Hash Key:', hashKey);
        
        // Call the contract method to verify the content
        const result = await contractInstance.methods.verifyContent(hashKey).call();
        console.log("🚀 ~ app.post ~ result:", result)

        if (result[0] !== 'Invalid content') {
            console.log('Content verified successfully!');
            const timestampString = result[2].toString();
                res.status(200).render('content_verify_recipt', { 
                    username: result[1], 
                    timestamp: timestampString,
                    contentHash: result[3]
                });

        } else {
            res.status(400).json({ message: 'Invalid content' });
        }
    } catch (error) {
        console.error('Error verifying content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
