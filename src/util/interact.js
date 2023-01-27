import Web3 from "web3";
// require("dotenv").config();
import { Alchemy, Network } from "alchemy-sdk";
import bigInt from "big-integer";
import { Chart } from "react-google-charts";

let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

const contractABI = require("../contract-abi.json");
const contractAddress = "0xdd18e9E3d20a53FcefD5864d9563128A34EB4Dbd";
const tokenHolder = "0x37c6fEdF826d1B96b50f67C62f2b2587367c44D0";

export const smartContract = new web3.eth.Contract(
  contractABI,
  contractAddress
);

// TOKEN CONTRACT INFORMATION
export const loadTokenName = async () => {
  const response = await smartContract.methods.name().call();
  return response;
};

export const loadTokenSymbol = async () => {
  const response = await smartContract.methods.symbol().call();
  return response;
};

export const loadTokenDecimals = async () => {
  const response = await smartContract.methods.decimals().call();
  return response;
};

// export const loadTokenTotalSupply = async () => {
//   const response = await smartContract.methods.totalSupply().call();
//   return response;
// };

export const loadContractBalance = async () => {
  const response = await smartContract.methods
    .balanceOf(tokenHolder)

    .call();
  return response;
};
// DEVOIR DE JEUDI(JSON OBTENU)
export async function loadTotals() {
  // 1. Requete HTTP à Alchemy

  const config = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY,
    network: Network.ETH_GOERLI,
  };
  const alchemy = new Alchemy(config);

  // Address we want get NFT mints from
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  const res = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    contractAddresses: [contractAddress],
    excludeZeroValue: true,
    category: ["erc20"],
    withMetadata: false,
  });

  // 2. On récupère la liste des holders(BOUCLE SUR LES TRANSFERS POUR OBTENIR LES LISTES DES DESTINATAIRES)

  let holders = res.transfers.map((transfer) => transfer.to);

  // je dédouble indentificat(DÉDOUBLE)
  function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  holders = removeDuplicates(holders);

  // recuperation des stakeBalances(RECUPERATION DES STAKEBALANCES)
  const stakedBalances = await Promise.all(
    holders.map((holder) => smartContract.methods.stakedTokens(holder).call())
  );

  function sum(a) {
    return a.reduce(
      (previous, current) => previous.add(bigInt(current)),
      bigInt(0)
    );
  }
  // des stakebalances
  const totalStakedSupply = sum(stakedBalances);
  const totalSupply = bigInt(await smartContract.methods.totalSupply().call());
  const totalFreeSupply = totalSupply.minus(totalStakedSupply);

  return {
    totalFreeSupply: totalFreeSupply.toString(),
    totalSupply: totalSupply.toString(),
    totalStakedSupply: totalStakedSupply.toString(),
  };
}

// WALLET INFORMATION
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(addressArray);

      const currentWalletBalance = await web3.eth.getBalance(addressArray[0]);

      const currentTokenBalance = await smartContract.methods
        .balanceOf(addressArray[0])
        .call();

      console.log(currentTokenBalance);

      const stakedTokenBalance = await smartContract.methods
        .stakedTokens(addressArray[0])
        .call();

      console.log(stakedTokenBalance);

      // const currentWalletStakeBalances = await smartContract
      //   .getStakeBalances(addressArray[0])
      //   .call();

      const obj = {
        status: "✅ Wallet is connected!",
        address: addressArray[0],
        currentWalletBalance: currentWalletBalance,
        currentTokenBalance: currentTokenBalance,
        stakedTokenBalance: stakedTokenBalance,
        tokenHolder: tokenHolder,
        // currentWalletStakeBalances: currentWalletStakeBalances,
      };

      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://metamask.io/download.html`}
            >
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

// GET TOKEN ACCOUNT BALANCE FOR ANY ADDRESS
export const getAccountBalance = async (address) => {
  //input error handling
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  const message = await smartContract.methods.balanceOf(address).call();

  return message;
};

// TRANSFER TOKENS TO SOMEONE
export const transferBalance = async (address, transferAddress, amount) => {
  //input error handling
  if (!window.ethereum || address === null || transferAddress === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  //SET UP TRANSACTION PARAMETERS
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: smartContract.methods.transfer(transferAddress, amount).encodeABI(),
  };
  console.log(address);
  console.log(transactionParameters);

  //SIGN THE TRANSACTION
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: (
        <span>
          ✅{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/tx/${txHash}`}
          >
            View the status of your transaction on Etherscan!
          </a>
        </span>
      ),
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};

//  MINT TOKENS INFORMATION
export const mintTokens = async (address, amount) => {
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  //SET UP TRANSACTION PARAMETERS
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.mint(amount).encodeABI(),
    to: contractAddress,

    value: web3.utils.toHex(amount.substring(0, amount.length - 3)),
  };

  console.log(amount, amount.substring(0, amount.length - 3));

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: (
        <span>
          ✅{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/tx/${txHash}`}
          >
            View the status of your transaction on Etherscan!
          </a>
        </span>
      ),
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};

//  BURN TOKENS INFORMATION
export const burnTokens = async (address, amount) => {
  //input error handling
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  //SET UP TRANSACTION PARAMETERS
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.burn(amount).encodeABI(),
    to: contractAddress,
    // value: amount.substring(0, amount.length - 3),
  };

  console.log(amount, amount.substring(0, amount.length - 3));

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: (
        <span>
          ✅{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/tx/${txHash}`}
          >
            View the status of your transaction on Etherscan!
          </a>
        </span>
      ),
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};

// STAKE  TOKENS
export const stakeTokens = async (address, amount) => {
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to stakeTokens on the blockchain.",
    };
  }

  //set up transaction parameters
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.stake(amount).encodeABI(),
    to: contractAddress,
    // value: amount.substring(0, amount.length),
  };

  console.log(amount, amount.substring(0, amount.length));

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: (
        <span>
          ✅{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/tx/${txHash}`}
          >
            View the status of your transaction on Etherscan!
          </a>
        </span>
      ),
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};

// UNSTAKE  TOKENS

export const unstakeTokens = async (address) => {
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to unstake tokens  on the blockchain.",
    };
  }

  //set up transaction parameters
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.unstakeAll().encodeABI(),
    to: contractAddress,
    // value: amount.substring(0, amount.length - 3),
  };

  // console.log(amount, amount.substring(0, amount.length - 3));

  try {
    // const tx = await smartContract.stake(ethers.utils.parseEther(amount), {
    //   gasLimit: 1_000_000,
    // });
    // await tx.wait();

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    // méthode alternative pour faire la même chose :
    // const txHash = await smartContract.methods.unstakeAll().send({
    //   from: address,
    //   to: contractAddress,
    // })

    return {
      status: (
        <span>
          ✅{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://goerli.etherscan.io/tx/${txHash}`}
          >
            View the status of your transaction on Etherscan!
          </a>
        </span>
      ),
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};

export const data = [
  ["Supply", "TPR"],
  ["totalStakedSupply", 2102000000000000000],
  ["totalFreeSupply", 1303922709217349632000],
  ["totalSupply", 1306024709217349632000],
];

export const options = {
  title: "My Daily camembert!",
  is3D: true,
};

export function Inter() {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />
  );
}

// / STAKE BALANCE
// export const stakeBalances = async (address, amount) => {
//   if (!window.ethereum || address === null) {
//     return {
//       status:
//         "💡 Connect your Metamask wallet to   get stakebalance on the blockchain.",
//     };
//   }

//   //set up transaction parameters
//   const transactionParameters = {
//     from: address, // must match user's active address.
//     data: Promise.all(
//       holders.map((holder) => smartContract.methods.stakedTokens(holder).call())
//     ),
//     to: contractAddress,
//   };

//   console.log(amount, amount.substring(0, amount.length));

//   try {
//     const txHash = await window.ethereum.request({
//       method: "eth_sendTransaction",
//       params: [transactionParameters],
//     });
//     return {
//       status: (
//         <span>
//           ✅{" "}
//           <a
//             target="_blank"
//             rel="noreferrer"
//             href={`https://goerli.etherscan.io/tx/${txHash}`}
//           >
//             View the status of your transaction on Etherscan!
//           </a>
//         </span>
//       ),
//     };
//   } catch (error) {
//     return {
//       status: "😥 " + error.message,
//     };
//   }
// };
