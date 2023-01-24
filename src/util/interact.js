import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";

require("dotenv").config();

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const config = {
  apiKey: "uWYD-1cTpGQPGKCRCdU-X_lkHEgfC_FU",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(config);

const contractABI = require("../contract-abi.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const ownerAddress = "0x37c6fEdF826d1B96b50f67C62f2b2587367c44D0";

console.log("Alchemy Key - " + alchemyKey);
console.log("Contract Address - " + contractAddress);

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
export const loadTokenTotalSupply = async () => {
  const response = await smartContract.methods.totalSupply().call();
  return response;
};
export const loadContractBalance = async () => {
  const response = await smartContract.methods.balanceOf(ownerAddress).call();
  return response;
};

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

      const stakedTokenBalance = await smartContract.methods
        .balanceOf(addressArray[0])
        .call();

      console.log(stakedTokenBalance);
      console.log(currentTokenBalance);

      const obj = {
        status: "✅ Wallet is connected!",
        address: addressArray[0],
        currentWalletBalance: currentWalletBalance,
        currentTokenBalance: currentTokenBalance,
        stakedTokenBalance: stakedTokenBalance,
      };

      return obj;
    } catch (error) {
      return {
        address: "",
        status: "😢" + error.message,
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
    gas: "",
    gasprice: "",
    value: "",
    data: smartContract.methods.transfer(transferAddress, amount).encodeABI(),

    // .Math.pow(10, 18),
  };

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

    value: amount.substring(0, amount.length - 3),
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
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to burn tokens on the blockchain.",
    };
  }

  //SET UP TRANSACTION PARAMETERS
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.burnTokens(amount).encodeABI(),
    to: contractAddress,

    value: amount.substring(0, amount.length - 3),
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

export const stakeTokens = async (address, amount) => {
  // const [value, setValue] = useState(0);
  //input error handling
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  //set up transaction parameters
  const transactionParameters = {
    from: address, // must match user's active address.
    data: smartContract.methods.stake(amount).encodeABI(),
    to: contractAddress,
    value: amount.substring(0, amount.length - 3),
  };

  console.log(amount, amount.substring(0, amount.length - 3));

  try {
    const tx = await smartContract.stake(ethers.utils.parseEther(amount), {
      gasLimit: 1_000_000,
    });
    await tx.wait();

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
