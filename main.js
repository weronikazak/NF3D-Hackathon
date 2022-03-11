const serverUrl = "https://iq57h9s8xwbr.usemoralis.com:2053/server";
const appId = "Ncue0wGVF2LAIjbM8bLNNFBQ761S9lOaLVGq3z3b";
Moralis.start({ serverUrl, appId });

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