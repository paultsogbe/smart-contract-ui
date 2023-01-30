import { useEffect, useState } from "react";
import web3 from "web3";
import logo from "./logo.png";
// import { PieChart } from "react-minimal-pie-chart";
import { Chart } from "react-google-charts";

import {
  loadTokenName,
  loadTokenSymbol,
  loadTokenDecimals,
  loadTokenTotalSupply,
  loadContractBalance,
  connectWallet,
  getAccountBalance,
  transferBalance,
  mintTokens,
  burnTokens,
  stakeTokens,
  unstakeTokens,
  loadTotals,
  Inter,
} from "./util/interact";

const SmartContract = () => {
  // SMART CONGRACT INFORMATION
  const [tokenName, setTokenName] = useState("No connection to the network."); //default message
  const [tokenSymbol, setTokenSymbol] = useState(
    "No connection to the network."
  ); //default message
  const [tokenDecimals, setTokenDecimals] = useState(
    "No connection to the network."
  ); //default message
  const [tokenSupply, setTokenSupply] = useState(
    "No connection to the network."
  ); //default message
  const [contractBalance, setContractBalanace] = useState(
    "No connection to the network."
  ); //default message

  //   WALLET INFOMATION 🦊
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [stakedBalance, setStakedBalance] = useState("");
  const [freeTokens, setFreeTokens] = useState("");
  const [freeTokensAfterUnstaking, setFreeTokensAfterUnstaking] = useState("");
  const [admin, setAdmin] = useState("");

  //   GET BALANCE OF ANY ADDRESS INFORMATION
  const [balanceAddress, setBalanceAddress] = useState();
  const [balanceStatus, setBalanceStatus] = useState();

  //   TRANSFER TOKEN INFORMATION
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState();

  // Mint tokens information

  const [mintValue, setMintValue] = useState("");
  const [mintStatus, SetMintStatus] = useState("");

  // BURN TOKENS INFORMATION

  const [burnValue, setBurnValue] = useState("");
  const [burnStatus, SetBurnStatus] = useState("");

  // Stake tokens information
  const [stakeValue, setStakeValue] = useState("");
  const [stakeStatus, SetStakeStatus] = useState("");

  //  UNSTOKENS INFORMATION

  const [unstakeStatus, SetUnstakeStatus] = useState("");

  // Pie chart data
  // const [freeSupply, setFreeSupply] = useState(Number());
  // const [stakedSupply, setStakedSupply] = useState(Number());
  const [chartData, setChartData] = useState(null);

  //   Initializing all the functions
  // called only once
  useEffect(() => {
    async function setup() {
      const tokenName = await loadTokenName();
      setTokenName(tokenName);

      const tokenSymbol = await loadTokenSymbol();
      setTokenSymbol(tokenSymbol);

      const tokenDecimals = await loadTokenDecimals();
      setTokenDecimals(tokenDecimals);
      // AFFICHAGE DES STAKEBALANCES
      const { totalFreeSupply, totalSupply, totalStakedSupply } =
        await loadTotals();
      console.log({
        totalFreeSupply,
        totalSupply,
        totalStakedSupply,
      });
      setChartData({ totalFreeSupply, totalSupply, totalStakedSupply });

      // console.log(totalFreeSupply);
      // setFreeSupply(totalFreeSupply);
      // setStakedSupply(totalStakedSupply);

      // const tokenSupply = await loadTokenTotalSupply();
      setTokenSupply((totalSupply / Math.pow(10, 18)).toFixed(2));

      const contractBalance = await loadContractBalance();
      setContractBalanace((contractBalance / Math.pow(10, 18)).toFixed(5));

      // INITIALIZING WALLET INFORMATION
      const {
        status,
        address,
        currentWalletBalance,
        currentTokenBalance,
        stakedTokenBalance,
        tokenHolder,
      } = await connectWallet();

      setWalletAddress(address);

      setStatus(status);

      setWalletBalance((currentWalletBalance / Math.pow(10, 18)).toFixed(5));
      setTokenBalance((currentTokenBalance / Math.pow(10, 18)).toFixed(5));
      setStakedBalance(
        Number(stakedTokenBalance / Math.pow(10, 18)).toFixed(5)
      );

      // FREE TOKENS LIBRE =  ( setTokenBalance - setStakedTokenBalance) NJL = NJ - NJS
      setFreeTokens(
        Number(
          (currentTokenBalance / Math.pow(10, 18)).toFixed(5) -
            (stakedTokenBalance / Math.pow(10, 18)).toFixed(5)
        )
      );

      setFreeTokensAfterUnstaking(
        (parseInt(currentTokenBalance) + 2 * stakedTokenBalance) /
          Math.pow(10, 18).toFixed(5)
      );
      setAdmin(tokenHolder);

      addWalletListener();

      connectWalletPressed();
    }

    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    setup();
  }, []);

  // INFORMATION FOR WALLETLISTENER(écoutés)
  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletBalance((accounts[0] / Math.pow(10, 18)).toFixed(5));
          setTokenBalance((accounts[0] / Math.pow(10, 18)).toFixed(5));
          setStakedBalance(Number((accounts[0] / Math.pow(10, 18)).toFixed(5)));
          setStatus("👆🏽 Populate the Data and Click on Button to execute...");
          console.log(stakedBalance);
        } else {
          setWalletAddress("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
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
      );
    }
  }

  // CETTE FONCTION VA ALLER CHERCHÉE DES INFORMATIONS DANS L'OBJET DE L'AUTRE COTÉ( PARTIE WALLET)

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWalletAddress(walletResponse.address);
    setWalletBalance(
      (walletResponse.currentWalletBalance / Math.pow(10, 18)).toFixed(5)
    );
    setTokenBalance(
      (walletResponse.currentTokenBalance / Math.pow(10, 18)).toFixed(5)
    );
    setStakedBalance(
      (walletResponse.stakedTokenBalance / Math.pow(10, 18)).toFixed(5)
    );
    setAdmin(walletResponse.tokenHolder);
  };

  // GET ACCOUNT BALANCE

  const onGetBalancePressed = async () => {
    const status = await getAccountBalance(balanceAddress);
    setBalanceStatus(status);
  };

  // TRANSFER BALANCE
  const onTransferBalancePressed = async (event) => {
    event.preventDefault();
    const { status } = await transferBalance(
      walletAddress,
      transferAddress,
      web3.utils.toWei(transferAmount)
    );

    setTransferStatus(status);
  };

  // MINT TOKENS
  const onMintTokensPressed = async (event) => {
    event.preventDefault();
    const { status } = await mintTokens(
      walletAddress,
      web3.utils.toWei(mintValue)
    );
    SetMintStatus(status);
  };

  // BURN TOKENS
  const onBurnTokensPressed = async (event) => {
    event.preventDefault();
    const { status } = await burnTokens(
      walletAddress,
      web3.utils.toWei(burnValue)
    );
    SetBurnStatus(status);
  };

  // STAKE TOKENS
  const onStakeTokensPressed = async (event) => {
    event.preventDefault();
    const { status } = await stakeTokens(
      walletAddress,
      web3.utils.toWei(stakeValue)
    );
    SetStakeStatus(status);
  };

  // UNSTAKE TOKENS

  const onUnstakeTokensPressed = async (event) => {
    console.log("button unstake pressed");
    event.preventDefault();
    const { status } = await unstakeTokens(
      walletAddress
      // web3.utils.toWei(unstakeValue)
    );
    SetUnstakeStatus(status);
  };

  return (
    <div className="container">
      <img className="logo" src={logo} alt="logo"></img>
      <button className="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <p style={{ paddingTop: "50px" }}>
        <b>Token Name:</b> {tokenName} &nbsp; <b>Token Symbol:</b> {tokenSymbol}
        &nbsp; &nbsp;<b>Token Decimals:</b>
        {tokenDecimals}
      </p>
      <p>
        <b>Total Supply:</b> {tokenSupply} {tokenSymbol}
      </p>
      <p>
        <b>Smart Contract ETH Balance:</b> {contractBalance} ETH
      </p>
      <div>
        {walletAddress ? (
          <Chart
            chartType="PieChart"
            data={[
              ["Supply", "TPR"],
              [
                "Staked",
                parseInt(
                  chartData.totalStakedSupply.substring(
                    0,
                    chartData.totalStakedSupply.length - 18
                  )
                ),
              ],
              [
                "Free",
                parseInt(
                  chartData.totalFreeSupply.substring(
                    0,
                    chartData.totalFreeSupply.length - 18
                  )
                ),
              ],
            ]}
            options={{ title: "Total Supply", is3D: true }}
            width="100%"
            height="400px"
            legendToggle
          />
        ) : (
          // <Inter />
          <p>Loading...</p>
        )}
      </div>

      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>My wallet</h2>
      <p className="status">{status}</p>
      <div>
        <p className="address">
          <b>Wallet address: </b>
          {walletAddress} &nbsp;
        </p>
        <p>
          <b>ETH balance: </b>
          {walletBalance} ETH
        </p>
        <p className="address">
          <b>Token balance: </b> {tokenBalance} {tokenSymbol}
          &nbsp; &nbsp; <b>Staked balance: </b> {stakedBalance} {tokenSymbol}
        </p>
        <p className="freetoken">
          <b> My tokens free to transfer: </b> {freeTokens} {tokenSymbol}
        </p>
        {/* SIMILATION TOKENS */}
        <p className="freetoken">
          <b> My free tokens after unstaking: </b> {freeTokensAfterUnstaking}{" "}
          {tokenSymbol}
        </p>
      </div>

      {/* GET BALANCE OF ANY ADDRES */}
      <div>
        <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>
          Get Balance of any address
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

      {/* TRANSFER TOKENS TO SOMEONE */}
      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>
        Transfer tokens to someone
      </h2>
      <div>
        <form onSubmit={onTransferBalancePressed}>
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
            pattern="^[0-9]+(\.[0-9]{1,18})?$"
            required
          />
          <p className="status">{transferStatus}</p>

          <button className="publish">Transfer Balance</button>
        </form>
      </div>
      {/* MINT  TOKENS */}
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

        <button className="publish" onClick={onMintTokensPressed}>
          Mint Tokens
        </button>
      </div>
      {/* BURN TOKENS */}
      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>Burn tokens</h2>

      <div>
        <form onSubmit={onBurnTokensPressed}>
          <input
            type="text"
            placeholder="How many new tokens would you like to burn?"
            onChange={(e) => setBurnValue(e.target.value)}
            value={burnValue}
          />
          {burnValue ? (
            <p className="status">
              <p className="status">Status: {burnStatus}</p>
            </p>
          ) : (
            <p></p>
          )}

          <button className="publish">Burn Tokens</button>
        </form>
        {/* <p>You will burn 1000x the ETH that you pay:</p> */}
      </div>

      {/* STAKE TOKENS */}
      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>Stake tokens</h2>
      <div>
        {/* ... */}{" "}
        <form onSubmit={onStakeTokensPressed}>
          <label htmlFor="stake">Stake</label>{" "}
          <input
            id="stake"
            placeholder="How many new tokens PRT would you like to stake?"
            value={stakeValue}
            onChange={(e) => setStakeValue(e.target.value)}
          />
          {stakeValue ? (
            <p className="status">
              <p className="status">Status: {stakeStatus}</p>
            </p>
          ) : (
            <p></p>
          )}
          <button type="submit">Stake PRT</button>
        </form>
        {/* ... */}
      </div>

      {/* UNSTAKE TOKENS */}
      <h2 style={{ paddingTop: "5px", fontWeight: "bold" }}>Unstake tokens</h2>
      <div>
        <button
          type="button"
          disabled={admin !== walletAddress}
          onClick={onUnstakeTokensPressed}
          title={
            admin !== walletAddress
              ? "Only the admin can unstake all tokens"
              : null
          }
        >
          {" "}
          Unstake tokens
        </button>
        <p className="status">Status: {unstakeStatus} </p>
      </div>
    </div>
  );
};

export default SmartContract;
