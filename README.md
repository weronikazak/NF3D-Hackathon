<p align="center">
  <a href="https://github.com/weronikazak/NF3D-Hackathon">
    <img src="images/log.PNG" alt="Logo" height="100">
  </a>

  <p align="center">
    2D to 3D generator for NFTs. Create your own 3D models to use as a game avatar.
    <br />
    <br />
    <strong>Developed by</strong> 
    <a href="https://www.linkedin.com/in/weronikawzak/">Weronika Zak</a> 
    for the 
    <a href="https://buildquest.ethglobal.com/">ETH BuildQuest Hakathon 2022</a>.
  </p>
</p>

## About the App:

Built on using Moralis boilerplate. The project is based heavily on Bootstrap, Javascript, and foremost 3D manipulating library Three.js. 
The models were modeled by me in Blender. After logging in using Moralis' authentication services, the user can see a gallery of their all NFTs.
After clicking on an NFT, the user can see their selected 2D NFT formed into a 3D model (for now only available for some Bored Apes).
The data about each NFT along with their metadata with unique traits is handled by the Covalent API. 
After clicking the minting button, the hot wallet message pops up (Metamask). After accepting the transaction, the model's JSON and NFT metadata is being saved to IPFS storage. 



<p align="center">
  <img src="images/thumbnail.PNG" alt="Thumbnail" width="650">
</p>

<p align="center">
  <a href="https://showcase.ethglobal.com/buildquest/nf3d-jhwmp">Click here to see the official showcase </a>
</p>




## Examples:

### Authenticate with MetaMask
<p align="center">
  <img src="images/clip1.gif" alt="Login"  width="650">
</p>

### Convert your NFTs to 3D models
<p align="center">
  <img src="images/clip2.gif" alt="Campaign"  width="650">
</p>

### Mint the NFT model
<p align="center">
  <img src="images/clip3.gif" alt="NFT" width="650">
</p>

## Neural Network

As a fun fact, before I came up with an idea to use Covalent API to retrieve traits, I trained a neural network using PyTorch to recognize Apes and get their traits based on just their image. The data was scrapped using Covalent API (for Bored Apes) and NFTPort API (for cryptopunks). 
It works with 99,99% accuracy and all the (not s clean) code is located in the AI folder.

<p align="center">
  <img src="images/Figure_1.png" alt="AI" width="650">
</p>
