// test/ContentVerifier.test.js

const { expect } = require('chai');

describe('ContentVerifier', function () {
  let ContentVerifier;
  let contentVerifier;
  let owner;
  
  beforeEach(async function () {
    ContentVerifier = await ethers.getContractFactory('ContentVerifier');
    contentVerifier = await ContentVerifier.deploy();
    await contentVerifier.deployed();
    [owner] = await ethers.getSigners();
  });

  it('Should upload content and emit event', async function () {
    const content = 'This is some content';
    const username = 'user123';
    await expect(contentVerifier.uploadContent(content, username))
      .to.emit(contentVerifier, 'ContentUploaded')
      .withArgs(username, ethers.utils.keccak256(ethers.utils.toUtf8Bytes(content)), ethers.BigNumber.from(await ethers.provider.getBlock('latest')).timestamp);
  });

  it('Should verify content', async function () {
    const content = 'This is another content';
    const username = 'user456';
    await contentVerifier.uploadContent(content, username);
    const [returnedUsername, timestamp] = await contentVerifier.verifyContent(content);
    expect(returnedUsername).to.equal(username);
    expect(timestamp).to.be.gt(0);
  });

  it('Should not upload duplicate content', async function () {
    const content = 'Duplicate content';
    const username = 'user789';
    await contentVerifier.uploadContent(content, username);
    // Attempt to upload the same content again
    await expect(contentVerifier.uploadContent(content, username)).to.be.revertedWith('Content already exists');
  });

  it('Should not verify non-existent content', async function () {
    const content = 'Non-existent content';
    await expect(contentVerifier.verifyContent(content)).to.be.revertedWith('Content does not exist');
  });
});
