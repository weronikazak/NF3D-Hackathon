const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

const nft_contract_address = "0xb0Fd53DaE73DD0EDfE5E28ED29a472918eD60931" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
const ADDRESS_TOKEN = {
    "Bored Apes": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "CyberPunks": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    "Cool Cats": "0x1A92f7381B9F03921564a437210bB9396471050C"
};

const dummyApes = [8658, 6848, 5000, 2531];

const web3 = new Web3(window.ethereum);
getNFTs();

function getNFTData(token_address, token_id) {
    const KEY = "ckey_773ccb8db17c4884a9ff935d884";
    var metadata = "https://api.covalenthq.com/v1/1/tokens/"+ token_address +"/nft_metadata/" + token_id + "/?quote-currency=USD&format=JSON&key=" + KEY;
    
    attributes = [];
    fetch(metadata)
        .then(res => res.json())
            .then((out) => {
                var attributes_array = out["data"]["items"][0]["nft_data"][0]["external_data"]["attributes"];
                detail_list = '<ul class="list-unstyled text-left"><li><a href="#"><b>Collection:</b> Bored Apes Club</a></li>';

                for (var i = 0; i < attributes_array.length; i++) {
                    a = attributes_array[i];
                    // attributes.push([a["trait_type"], a["value"]]);
                    attributes[a["trait_type"]] = a["value"];

                    detail_list += '<li><b>'+ a["trait_type"] + ':</b> ' + a["value"] +'</li>'
                }

                detail_list += '</ul>';
                
                document.getElementById("nft-details").innerHTML = detail_list;
                loadModel("Bored Apes", attributes);

        }).catch(err => console.error(err));
}


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
    const fileInput = document.getElementById("model");
    const data = fileInput.files[0];
    const imageFile = new Moralis.File(data.name, data);
    document.getElementById('upload').setAttribute("disabled", null);
    // document.getElementById('file').setAttribute("disabled", null);
    // document.getElementById('name').setAttribute("disabled", null);
    // document.getElementById('description').setAttribute("disabled", null);
    await imageFile.saveIPFS();
    const imageURI = imageFile.ipfs();
    const metadata = {
      "name":document.getElementById("name").value,
    //   "description":document.getElementById("description").value,
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

async function getNFTs() {
    const testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby' });

    const hardcodedModels = [
        "'rebel_ape'",
        "'white_ape'",
        "'dress_ape'",
        "'pink_ape'"
    ];
    
    var tokenIds = [];
    var tokenAddresses = [];
    for (var i = 0; i < testnetNFTs["result"].length; i++) {
        var token_uri = testnetNFTs["result"][i]["token_uri"];
        // console.log(testnetNFTs["result"][i]);
        tokenIds.push(testnetNFTs["result"][i]["token_id"]);
        tokenAddresses.push(testnetNFTs["result"[i]["token_address"]]);
        var j = 0;
        fetch(token_uri)
        .then(res => res.json())
            .then((out) => {
                // var token_id = tokenIds[j]; <- should be used on a mainnet. For now we'll use dummy data
                // var token_address = tokenAddresses[j]; <- should be used on a mainnet. For now we'll use dummy data
                var token_id = dummyApes[j];
                var token_address = ADDRESS_TOKEN["Bored Apes"];

                document.getElementById("nft-gallery").innerHTML += `
                <div class="btn nft-image">
                    <img src='` + out["image"] + `' class="img-rounded" 
                                                    width="160px"
                                                    height="160px"
                                                    onclick="getNFTData('`+ token_address + "', " + token_id +`)">
                    <label style="color:white">` + out["name"] + `</label> 
                    <br>
                <div>`;

                // Should be available on the mainnet
                // For testing we will do a simulation
                // if (tokenAddresses[j] == ADDRESS_TOKEN["Bored Apes"]) {

                // }
                j++;
        }).catch(err => console.error(err));
    }
    document.getElementById("nft-button").style.display = "none";
}
  
