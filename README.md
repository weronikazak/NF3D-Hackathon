<p align="center">
  <a href="https://github.com/weronikazak/NF3D-Hackathon">
    <img src="images/logo.PNG" alt="Logo" height="280">
  </a>

  <p align="center">
    NFT 2D to 3D generator. Make your own 3D models to be used as game avatars.
    <br />
    <br />
    <strong>Developed by
    <a href="https://www.linkedin.com/in/weronikawzak/">Weronika Zak</a> 
    for the 
    <a href="https://buildquest.ethglobal.com/">ETH BuildQuest Hakathon 2022</a>.
      </strong> 
  </p>
</p>

## About the App:

Built using Moralis Vanilla JS boilerplate. The project is based heavily on **Bootstrap**, **Javascript**, and foremost 3D manipulating library **Three.js**. The models were modelled by me in **Blender**. 

After logging in with **Metamask**, the user  will be able to view a gallery of all of their NFTs.
The user can see their selected 2D NFT formed into a 3D model after clicking on it (*for now only available for some Bored Apes*).

The **Covalent** along with **NFTPort APIs** handle the data about each NFT, as well as their metadata with unique traits.


After clicking the minting button, the hot wallet message pops up. After accepting the transaction, the model is being converted to **JSON** format and NFT metadata is saved to **IPFS** storage.



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

Before I thought of using Covalent API to retrieve traits, I trained a neural network in PyTorch to recognise Apes and retrieve their traits based just on their image. 

The data was scrapped using Covalent API and NFTPort API. 

orks with 99.99% accuracy, and all of the (not-so-clean) code is kept in the `AI` folder.

<p align="center">
  <img src="images/Figure_1.png" alt="AI" width="650">
</p>
