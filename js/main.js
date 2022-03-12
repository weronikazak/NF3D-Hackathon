const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

const nft_contract_address = "0xb0Fd53DaE73DD0EDfE5E28ED29a472918eD60931" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.

const web3 = new Web3(window.ethereum);

/** Add from here down */
async function login() {
    let user = Moralis.User.current();
    if (!user) {
        try {
            user = await Moralis.authenticate({ signingMessage: "Sign in to  NF3D" })
            console.log(user)
            console.log(user.get('ethAddress'))
            location.href = "main.html";
        } catch(error) {
            console.log(error)
        }
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    location.href = "index.html";
}

async function upload(){
    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];
    const imageFile = new Moralis.File(data.name, data);
    document.getElementById('upload').setAttribute("disabled", null);
    document.getElementById('file').setAttribute("disabled", null);
    document.getElementById('name').setAttribute("disabled", null);
    document.getElementById('description').setAttribute("disabled", null);
    await imageFile.saveIPFS();
    const imageURI = imageFile.ipfs();
    const metadata = {
      "name":document.getElementById("name").value,
      "description":document.getElementById("description").value,
      "image":imageURI
    }
    const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    const txt = await mintToken(metadataURI).then(notify)
}

async function mintToken(_uri){
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
        name: "mintToken",
        type: "function",
        inputs: [{
        type: 'string',
        name: 'tokenURI'
        }]
    }, [_uri]);

    const transactionParameters = {
        to: nft_contract_address,
        from: ethereum.selectedAddress,
        data: encodedFunction
    };
    const txt = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    });
    return txt
}
  
async function notify(_txt){
    document.getElementById("resultSpace").innerHTML =  
    `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Your NFT was minted in transaction ${_txt}">`;
} 
  