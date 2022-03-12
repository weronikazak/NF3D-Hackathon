const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

const nft_contract_address = "0xb0Fd53DaE73DD0EDfE5E28ED29a472918eD60931" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.

const web3 = new Web3(window.ethereum);
getNFTs();


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
    
    for (var i = 0; i < testnetNFTs["result"].length; i++) {
        var token_uri = testnetNFTs["result"][i]["token_uri"]

        var j = 0;
        fetch(token_uri)
        .then(res => res.json())
            .then((out) => {
                document.getElementById("nft-gallery").innerHTML += `
                <div class="btn nft-image">
                    <img src='` + out["image"] + `' class="img-rounded" 
                                                    width="160px"
                                                    height="160px"
                                                    onclick="loadModel(`+ hardcodedModels[j] +`)">
                    <label style="color:white">` + out["name"] + `</label> 
                    <br>
                <div>`;
                j++;
        }).catch(err => console.error(err));
    }
    document.getElementById("nft-button").style.display = "none";
    // console.log("HTTTTML" + html)
    // document.getElementById("nft-gallery").innerHTML =  html;
}
  

// async function getNFTs(chain, address) {
//     // get polygon NFTs for address
//     const options = { chain: chain, address: address };

//     var maxnr = 5;
//     const nftCount = await Moralis.Web3.getNFTsCount(options);
//     $("#content").html("<p>Items count: " + nftCount + " (max " + maxnr + " listed)</p>");

//     if (nftCount > 0) {
//       const allNFTs = await Moralis.Web3.getNFTs(options);
//       //console.log(allNFTs);

//       allNFTs.forEach( (nft) => {
//         if (maxnr > 0) {
//           fetch(fixURL(nft.token_uri))
//             .then(response => response.json())
//             .then(data => {
//               $("#content").html($("#content").html() 
//                 + "<div><img width='100' align='left' src='" + fixURL(data.image) + "' />"
//                 + "<h2>" + data.name + "</h2>"
//                 + "<p>" + data.description + "</p></div><br clear='all' />");
//             });
//         }
//         maxnr--;
//       });
//     }
//   }

//   fixURL = (url) => {
//     if (url.startsWith("ipfs")) {
//       return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://ipfs/")[1];
//     } else {
//       return url + "?format=json";
//     }
//   }

//   document.getElementById("btnUpdate").onclick = () => {
//     console.log("Update!");
//     let chain = $("#chain").val();
//     let address = $("#address").val();
//     console.log("Update! chain="+chain+" address="+address);
//     if (typeof chain !== 'undefined' && typeof address != 'undefined') {
//       getNFTs(chain, address);
//     }
//   }