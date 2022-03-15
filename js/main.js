const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

const nft_contract_address = "0x097c1193AF21c3Ce60ECf1D57DA5b440Bca5D402" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
const ADDRESS_TOKEN = {
    "Bored Apes": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "CyberPunks": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    "Cool Cats": "0x1A92f7381B9F03921564a437210bB9396471050C"
};

TEST_MODE = true;
CURRENT_CHAIN = "eth";

const dummyApes = [8658, 6848, 5000, 2531];

const web3 = new Web3(window.ethereum);
getNFTs();
attributes = [];
NFTName = "";

function getNFTData(token_address, token_id) {
    const KEY = "ckey_773ccb8db17c4884a9ff935d884";
    var metadata = "https://api.covalenthq.com/v1/1/tokens/"+ token_address +"/nft_metadata/" + token_id + "/?quote-currency=USD&format=JSON&key=" + KEY;
    attributes = [];
    NFTName = "BoredApe" + token_id;
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

        const modelFile = new Moralis.File(NFTName + "-model.json",  {base64 : btoa(output)});
        document.getElementById('mint').setAttribute("disabled", null);

        await modelFile.saveIPFS();
        const modelURI = modelFile.ipfs();
        
        // console.log("Attributes: " + attributes);
        const metadata = {
            "name": NFTName,
            // "attributes" : attributes,
            "model": modelURI
        }

        console.log(modelURI)
        const metadataFile = new Moralis.File(NFTName + "-metadata.json", {base64 : btoa(JSON.stringify(metadata))});
        await metadataFile.saveIPFS();
        const metadataURI = metadataFile.ipfs();
        console.log("Metadata URI" + metadataURI)

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

    console.log(encodedFunction)

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
    `<div class="alert alert-info mt-2" style="word-wrap: break-word" role="alert"> Your NFT was minted in transaction ${_txt}</div>`;
} 



function exportModel() {
    // TODO
    return;
}

function changeBackground(id) {
    
    var images = document.getElementsByClassName("nft-image");
    for (var i = 0; i < images.length; i++) {
        images.item(i).style.backgroundColor="#333";
    }

    $("." + id).css("background","#282828")
    document.getElementById("mint").style.display = "block";
    document.getElementById("export").style.display = "block";
}

async function getNFTs() {
    var testnetNFTs;

    if (TEST_MODE) {
        testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby', address: '0x1632e60D1c9723cbA5DCD8009A8F25d6e8c00196' });
    } else {
        testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: CURRENT_CHAIN });
    }

    if (testnetNFTs["result"].length < 1) {
        document.getElementById("nft-gallery").innerHTML = "There are no NFTs in your " + CURRENT_CHAIN.toUpperCase() + " wallet!";
        return;
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
                <div class="btn nft-image rounded token-`+ token_id + `" onclick="changeBackground('token-`+ token_id + `')">
                    <img src='` + out["image"] + `' class="img-rounded " 
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