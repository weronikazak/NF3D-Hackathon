const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

const nft_contract_address = "0xb0Fd53DaE73DD0EDfE5E28ED29a472918eD60931" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
const ADDRESS_TOKEN = {
    "Bored Apes": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "CyberPunks": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    "Cool Cats": "0x1A92f7381B9F03921564a437210bB9396471050C"
};

TEST_MODE = true;

const dummyApes = [8658, 6848, 5000, 2531];

const web3 = new Web3(window.ethereum);
getNFTs();
attributes = [];


function getNFTData(token_address, token_id) {
    const KEY = "ckey_773ccb8db17c4884a9ff935d884";
    var metadata = "https://api.covalenthq.com/v1/1/tokens/"+ token_address +"/nft_metadata/" + token_id + "/?quote-currency=USD&format=JSON&key=" + KEY;
    attributes = [];
    
    fetch(metadata)
        .then(res => res.json())
            .then((out) => {
                var attributes_array = out["data"]["items"][0]["nft_data"][0]["external_data"]["attributes"];
                detail_list = `<ul class="list-unstyled text-left">
                <li id="nft-collection-name"><b>Collection:</b> Bored Apes Club</li>
                <li id="nft-id"><b>Token ID:</b> ` + token_id +`</li>`;

                for (var i = 0; i < attributes_array.length; i++) {
                    a = attributes_array[i];
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
    } else {
        location.href = "main.html";
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    location.href = "index.html";
}

async function upload(){
    var gltfExporter = new THREE.GLTFExporter();
    gltfExporter.parse( scene, async function( result ) {

        output = JSON.stringify( result, null, 2 );
        const name = document.getElementById("nft-id").value + " " + document.getElementById("nft-collection-name").value
    
        const modelFile = new Moralis.File(name + "-model.json",  {base64 : btoa(output)});
        document.getElementById('mint').setAttribute("disabled", null);

        await modelFile.saveIPFS();
        const modelURI = modelFile.ipfs();
        
        console.log(attributes);
        const metadata = {
            "name": name,
            "attributes" : attributes,
            "model": modelURI
        }
        const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
        await metadataFile.saveIPFS();
        const metadataURI = metadataFile.ipfs();
        const txt = await mintToken(metadataURI).then(notify)
    });


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
    `<div class="alert alert-info mt-2" role="alert"> Your NFT was minted in transaction ${_txt}"</div>`;
} 

async function getNFTs() {
    var testnetNFTs;

    if (TEST_MODE) {
        testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby', address: '0x1632e60D1c9723cbA5DCD8009A8F25d6e8c00196' });
    } else {
        testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'eth' });
    }
    
    var tokenIds = [];
    var tokenAddresses = [];
    for (var i = 0; i < testnetNFTs["result"].length; i++) {
        var token_uri = testnetNFTs["result"][i]["token_uri"];
        tokenIds.push(testnetNFTs["result"][i]["token_id"]);
        tokenAddresses.push(testnetNFTs["result"[i]["token_address"]]);
        var j = 0;
        fetch(token_uri)
        .then(res => res.json())
            .then((out) => {
                var token_id, token_address;
                if (TEST_MODE) {
                    token_id = dummyApes[j];
                    token_address = ADDRESS_TOKEN["Bored Apes"];
                } else {
                    token_id = tokenIds[j];
                    token_address = tokenAddresses[j];
                }

                document.getElementById("nft-gallery").innerHTML += `
                <div class="btn nft-image">
                    <img src='` + out["image"] + `' class="img-rounded" 
                                                    width="160px"
                                                    height="160px"
                                                    onclick="getNFTData('`+ token_address + "', " + token_id +`)">
                    <label style="color:white">` + out["name"] + `</label> 
                    <br>
                <div>`;
                j++;
        }).catch(err => console.error(err));
    }
    document.getElementById("nft-button").style.display = "none";
}