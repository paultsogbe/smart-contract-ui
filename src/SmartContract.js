import { useState, useEffect } from "react";
import { Accounts } from "web3-eth-accounts";
import logo from "./logo.png";
import {
  loadContractBalance,
  loadTokenName,
  loadTokenSymbol,
  loadTokenDecimals,
  loadTokenTotalSupply,
  connectWallet,
  getAccountBalance,
  transferBalance,
  mintTokens,
} from "./util/interact";

function SmartContract() {
  // SMART CONGRACT INFORMATION
  const [contractBalance, setContractBalance] = useState(
    "No connection to the network."
  );
  const [tokenName, setTokenName] = useState("No connection to the network.");
  const [tokenSymbol, setTokenSymbol] = useState(
    "No connection to the network."
  );
  const [tokenDecimals, setTokenDecimals] = useState(
    "No connection to the network."
  );
  const [tokenTotalSupply, setTokenTotalSupply] = useState(
    "No connection to the network."
  );

  //   WALLET INFOMATION 🦊
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState("");
  const [walletBalance, setWalletBalance] = useState(" ");
  const [tokenWalletBalance, setTokenWalletBalance] = useState(" ");
  const [stakedWalletBalance, setStakedWalletBalance] = useState("");

  //   GET BALANCE OF ANY ADDRESS INFORMATION
  const [balanceAddress, setBalanceAddress] = useState("");
  const [balanceStatus, setBalanceStatus] = useState();

  //   TRANSFER TOKEN INFORMATION
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState();
  const [transferStatus, setTransferStatus] = useState();

  // Mint tokens information
  const [mintAddress, setMintAddress] = useState("");
  const [mintValue, setMintValue] = useState();
  const [mintStatus, SetMintStatus] = useState();

  //   Initializing all the functions
  useEffect(() => {
    async function setup() {
      const tokenName = await loadTokenName();
      setTokenName(tokenName);

      const tokenSymbol = await loadTokenSymbol();
      setTokenSymbol(tokenSymbol);

      const tokenDecimals = await loadTokenDecimals();
      setTokenDecimals(tokenDecimals);

      const tokenTotalSupply = await loadTokenTotalSupply();
      setTokenTotalSupply((tokenTotalSupply / Math.pow(10, 18)).toFixed(2));

      const contractBalance = await loadContractBalance();
      setContractBalance((contractBalance / Math.pow(10, 21)).toFixed(5));

      // INISSIALISATION WALLET INFORMATION
      const {
        status,
        address,
        currentWalletBalance,
        currentTokenBalance,
        stakedTokenBalance,
      } = await connectWallet();

      setWalletAddress(address);
      setWalletStatus(status);
      setWalletBalance((currentWalletBalance / Math.pow(10, 18)).toFixed(5));
      setTokenWalletBalance(
        (currentTokenBalance / Math.pow(10, 18)).toFixed(5)
      );
      setStakedWalletBalance(
        (stakedTokenBalance / Math.pow(10, 18)).toFixed(5)
      );
      addWalletListener();
      connectWalletPressed();
      //   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    }
    setup();
  }, []);
  // INFORMATION FOR WALLETLISTENER(écout)
  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletStatus("✅ Wallet is connected!");
          setWalletBalance((accounts[0] / Math.pow(10, 18)).toFixed(5));
          setTokenWalletBalance((accounts[0] / Math.pow(10, 18)).toFixed(5));
          setStakedWalletBalance((accounts[0] / Math.pow(10, 18)).toFixed(5));
        } else {
          setWalletStatus(
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
          );
        }
      });
    }
  }
  // CETTE FONCTION VA ALLER CHERCHÉE DES INFORMATIONS DANS L'OBJET DE L'AUTRE COTÉ( PARTIE WALLET)
  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();

    setWalletAddress(walletResponse.address);
    setWalletStatus(walletResponse.status);
    setWalletBalance(
      (walletResponse.currentWalletBalance / Math.pow(10, 18)).toFixed(5)
    );
    setTokenWalletBalance(
      (walletResponse.currentTokenBalance / Math.pow(10, 18)).toFixed(5)
    );
    setStakedWalletBalance(
      (walletResponse.stakedTokenBalance / Math.pow(10, 18)).toFixed(5)
    );
  };

  const onGetBalancePressed = async () => {
    const response = await getAccountBalance(balanceAddress);
    setBalanceStatus(response);
  };

  const onTransferBalancePressed = async () => {
    const { status } = await transferBalance(
      walletAddress,
      transferAddress,
      transferAmount
    );

    setTransferStatus(status);
  };

  const OnMintTokensPressed = async () => {
    const { mint } = await mintTokens(walletAddress, mintValue);
    SetMintStatus(mint);
  };

  return (
    <div className="container">
      <img src={logo} alt="logo" className="logo" />
      <button className="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected" +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <p style={{ paddingTop: "50px" }}>
        <b>Token Name:</b> {tokenName}&nbsp;&nbsp;
        <b>Token Symbol:</b> {tokenSymbol} &nbsp;&nbsp;
        <b>Token Decimals:</b>
        {tokenDecimals}
      </p>

      <p>
        <b> Total Supply:</b> {tokenTotalSupply} {tokenSymbol}&nbsp;&nbsp;
      </p>
      <p>
        <b>Smart Contract ETH Balance:</b> {contractBalance} ETH &nbsp;&nbsp;
        <p className="status">{walletStatus}</p>
      </p>
      <h2 style={{ padiingTop: "5px", fontWeight: "bold" }}>My Wallet </h2>
      <p className="address">
        <b>Wallet Address:</b> {walletAddress} {}&nbsp;&nbsp;
        <b>ETH Balance:</b> {walletBalance} ETH
      </p>
      <p>
        <b>Token Balance:</b> {tokenWalletBalance} {tokenSymbol}&nbsp;&nbsp;
        <b>Staked Tokens:</b> {stakedWalletBalance} {tokenSymbol}
      </p>
      <div>
        <h2 style={{ padiingTop: "5px", fontWeight: "bold" }}>
          Get balance of any address
        </h2>
        <input
          type="text"
          placeholder="Enter Wallet address 0x..."
          onChange={(e) => setBalanceAddress(e.target.value)}
          value={balanceAddress}
        />
        {balanceStatus ? (
          <p className="status">
            Token balance: {(balanceStatus / Math.pow(10, 18)).toFixed(5)}{" "}
            {tokenSymbol}
          </p>
        ) : (
          <p></p>
        )}

        <button className="publish" onClick={onGetBalancePressed}>
          Get Balance
        </button>
      </div>
      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>
        Transfer tokens to someone
      </h2>
      <div>
        <input
          type="text"
          placeholder="Enter Wallet address 0x..."
          onChange={(e) => setTransferAddress(e.target.value)}
          value={transferAddress}
        />
        <input
          type="text"
          placeholder="Enter Amount to be transferred"
          onChange={(e) => setTransferAmount(e.target.value)}
          value={transferAmount}
        />
        <p className="status">{transferStatus}</p>

        <button className="publish" onClick={onTransferBalancePressed}>
          Transfer Balance
        </button>
      </div>

      <div>
        <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>
          Mint new tokens
        </h2>
        <p>You will mint 1000x the ETH that you pay:</p>
        <input
          type="text"
          placeholder="How many new tokens would you like to mint?"
          onChange={(e) => setMintValue(e.target.value)}
          value={mintValue}
        />
        {mintValue ? (
          <p className="status">
            <p className="status">Status: {mintStatus}</p>
          </p>
        ) : (
          <p></p>
        )}

        <button className="publish" onClick={OnMintTokensPressed}>
          Mint Tokens
        </button>
      </div>
    </div>
  );
}

export default SmartContract;
