
const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

import { deployContractsWithSDK, initializeClients, 
  getOperatorClient,
  getOperatorAccount,
  getOperatorPrivateKey,
getOperatorPublicKey,
getNonOperatorClient,
getNonOperatorAccount,
getNonOperatorPrivateKey,
getNonOperatorPublicKey
 } from "../scripts/deploy";
 import {name, 
  symbol, 
  decimals, 
  initialize, 
  associateToken, 
  dissociateToken, 
  Mint, 
  Wipe,
  getTotalSupply, 
  getBalanceOf,
  getTokenAddress,
  upgradeTo,
  admin,
  changeAdmin,
  owner,
  upgrade,
  changeProxyAdmin,
  transferOwnership,
  getProxyAdmin,
  getProxyImplementation
} from "../scripts/contractsMethods";

let proxyAddress:any;
let proxyAdminAddress:any;
let stableCoinAddress:any;

const clientId = 2;

let operatorClient: any;
let nonOperatorClient: any;
let operatorAccount: string;
let nonOperatorAccount: string;
let operatorPriKey: string;
let nonOperatorPriKey: string;
let operatorPubKey: string;
let nonOperatorPubKey: string;


let client1:any;
let client1account: string;
let client1privatekey: string;
let client1publickey: string;

let client2:any;
let client2account: string;
let client2privatekey: string;
let client2publickey: string;

const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const TokenFactor = BigNumber.from(10).pow(TokenDecimals);
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("HederaERC20 Tests", function() {
  before(async function  () {         
    // Generate Client 1 and Client 2
    [client1,
      client1account, 
      client1privatekey,
      client1publickey,
      client2,
      client2account,
      client2privatekey,
      client2publickey] = initializeClients();

      operatorClient = getOperatorClient(client1, client2, clientId);
      nonOperatorClient = getNonOperatorClient(client1, client2, clientId);
      operatorAccount = getOperatorAccount(client1account, client2account, clientId);
      nonOperatorAccount = getNonOperatorAccount(client1account, client2account, clientId);
      operatorPriKey = getOperatorPrivateKey(client1privatekey, client2privatekey, clientId);
      operatorPubKey = getOperatorPublicKey(client1publickey, client2publickey, clientId);

      // Deploy Token using Client
      let result = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        operatorAccount, 
        operatorPriKey, 
        operatorPubKey
        ); 
        
      proxyAddress = result[0];
    });   
  
  it("input parmeters check", async function() {
    // We retreive the Token basic params
    const retrievedTokenName = await name(ContractId, proxyAddress, operatorClient);
    const retrievedTokenSymbol = await symbol(ContractId, proxyAddress, operatorClient);
    const retrievedTokenDecimals = await decimals(ContractId, proxyAddress, operatorClient);
    const retrievedTokenTotalSupply = await getTotalSupply(ContractId, proxyAddress, operatorClient);

    // We check their values : success
    expect(retrievedTokenName).to.equals(TokenName);
    expect(retrievedTokenSymbol).to.equals(TokenSymbol);
    expect(retrievedTokenDecimals).to.equals(TokenDecimals);  
    expect(retrievedTokenTotalSupply.toString()).to.equals(INIT_SUPPLY.toString());   
 
  });

  it("Only Account can associate and dissociate itself when balance is 0", async function() {
    const amount = BigNumber.from(1);

    // associate a token to an account : success
    await associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);

    // We mint tokens to that account and check supply and balance: success
    await Mint(ContractId, proxyAddress, amount, operatorClient, nonOperatorAccount);

    // dissociate the token from the account when balance is not 0 : fail
    await expect(dissociateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

    // We wipe amount in account to be able to dissociate
    const Balance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    await Wipe(ContractId, proxyAddress, Balance, operatorClient, nonOperatorAccount);

    // dissociate the token from the account : success
    await dissociateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);

    // associate a token to an account using another account : fail
    await expect(associateToken(ContractId, proxyAddress, operatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

    // associate a token to an account again : success
    await associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);

    // dissociate the token from the account using another account : fail
    await expect(dissociateToken(ContractId, proxyAddress, operatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

    // reset
    await dissociateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);
  });

  it("Associate and Dissociate Token", async function() {
    const amountToMint = BigNumber.from(1);

    // First we associate a token to an account
    const initialSupply =  await getTotalSupply(ContractId, proxyAddress, operatorClient);
    const initialBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    await associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);

    // We mint tokens to that account and check supply and balance: success
    await Mint(ContractId, proxyAddress, amountToMint, operatorClient, nonOperatorAccount);
    let newSupply =  await getTotalSupply(ContractId, proxyAddress, operatorClient);
    let newBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);

    let expectedNewSupply = initialSupply.add(amountToMint);
    let expectedNewBalance = initialBalance.add(amountToMint);

    expect(expectedNewSupply.toString()).to.equals(newSupply.toString());  
    expect(expectedNewBalance.toString()).to.equals(newBalance.toString());  

    // We wipe amount in account to be able to dissociate
    await Wipe(ContractId, proxyAddress, newBalance, operatorClient, nonOperatorAccount);

    // We dissociate the token from the account
    await dissociateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);

    // We mint tokens to that account : fail
    await expect(Mint(ContractId, proxyAddress, amountToMint, operatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

    newSupply =  await getTotalSupply(ContractId, proxyAddress, operatorClient);
    newBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    expect(initialSupply.toString()).to.equals(newSupply.toString());  
    expect("0").to.equals(newBalance.toString());  

  });

  it("Check initialize can only be run once", async function(){
    // Retrieve current Token address
    const TokenAddress = await getTokenAddress(ContractId, proxyAddress, operatorClient);

    // Initiliaze : fail
    await expect(initialize(ContractId, proxyAddress, operatorClient, TokenAddress)).to.eventually.be.rejectedWith(Error);
  });

});

describe("HederaERC20Proxy and HederaERC20ProxyAdmin Tests", function() {
  before(async function  () {         
    // Generate Client 1 and Client 2
    [client1,
      client1account, 
      client1privatekey,
      client1publickey,
      client2,
      client2account,
      client2privatekey,
      client2publickey] = initializeClients();

      operatorClient = getOperatorClient(client1, client2, clientId);
      nonOperatorClient = getNonOperatorClient(client1, client2, clientId);
      operatorAccount = getOperatorAccount(client1account, client2account, clientId);
      nonOperatorAccount = getNonOperatorAccount(client1account, client2account, clientId);
      operatorPriKey = getOperatorPrivateKey(client1privatekey, client2privatekey, clientId);
      operatorPubKey = getOperatorPublicKey(client1publickey, client2publickey, clientId);

      // Deploy Token using Client
      let result = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        operatorAccount, 
        operatorPriKey, 
        operatorPubKey
        );  
        
      proxyAddress = result[0];
      proxyAdminAddress = result[1];
      stableCoinAddress = result[2];
    });   

  it("Retrieve admin and implementation addresses for the Proxy", async function() {
     // We retreive the HederaERC20Proxy admin and implementation
     const implementation = await getProxyImplementation(ContractId, proxyAdminAddress, operatorClient, proxyAddress.toSolidityAddress());
     const admin = await getProxyAdmin(ContractId, proxyAdminAddress, operatorClient, proxyAddress.toSolidityAddress());

     // We check their values : success
     expect(implementation.toUpperCase()).to.equals("0X" + stableCoinAddress.toSolidityAddress().toUpperCase());
     expect(admin.toUpperCase()).to.equals("0X" + proxyAdminAddress.toSolidityAddress().toUpperCase());
  });

  it("Retrieve proxy admin owner", async function() {
    // We retreive the HederaERC20Proxy admin and implementation
    const ownerAccount = await owner(ContractId, proxyAdminAddress, operatorClient);

    // We check their values : success
    expect(ownerAccount.toUpperCase()).to.equals("0X" + AccountId.fromString(operatorAccount).toSolidityAddress().toUpperCase());
 });
  
  it("Upgrade Proxy implementation without the proxy admin", async function() {
    // Deploy a new contract
    let result = await deployContractsWithSDK(
      TokenName, 
      TokenSymbol, 
      TokenDecimals, 
      INIT_SUPPLY.toString(), 
      MAX_SUPPLY.toString(), 
      TokenMemo, 
      operatorAccount, 
      operatorPriKey, 
      operatorPubKey
      );  

    const newImplementationContract = result[2];

    // Non Admin upgrades implementation : fail       
    await expect(upgradeTo(ContractId, proxyAddress, operatorClient, newImplementationContract.toSolidityAddress())).to.eventually.be.rejectedWith(Error);
  });

  it("Change Proxy admin without the proxy admin", async function() {
    // Non Admin changes admin : fail       
    await expect(changeAdmin(ContractId, proxyAddress, operatorClient, AccountId.fromString(nonOperatorAccount).toSolidityAddress())).to.eventually.be.rejectedWith(Error);
  });

  it("Upgrade Proxy implementation with the proxy admin but without the owner account", async function() {
    // Deploy a new contract
    let result = await deployContractsWithSDK(
      TokenName, 
      TokenSymbol, 
      TokenDecimals, 
      INIT_SUPPLY.toString(), 
      MAX_SUPPLY.toString(), 
      TokenMemo, 
      operatorAccount, 
      operatorPriKey, 
      operatorPubKey
      );  

    const newImplementationContract = result[2];

    // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
    await expect(upgrade(ContractId, proxyAdminAddress, nonOperatorClient, newImplementationContract.toSolidityAddress(), proxyAddress.toSolidityAddress())).to.eventually.be.rejectedWith(Error);
  });

  it("Change Proxy admin with the proxy admin but without the owner account", async function() {
    // Non Owner changes admin : fail       
    await expect(changeProxyAdmin(ContractId, proxyAdminAddress, nonOperatorClient, nonOperatorAccount, proxyAddress.toSolidityAddress())).to.eventually.be.rejectedWith(Error);
  });

  it("Upgrade Proxy implementation with the proxy admin and the owner account", async function() {
    // Deploy a new contract
    let result = await deployContractsWithSDK(
      TokenName, 
      TokenSymbol, 
      TokenDecimals, 
      INIT_SUPPLY.toString(), 
      MAX_SUPPLY.toString(), 
      TokenMemo, 
      operatorAccount, 
      operatorPriKey, 
      operatorPubKey
      );  

    const newImplementationContract = result[2];

    // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
    await upgrade(ContractId, proxyAdminAddress, operatorClient, newImplementationContract.toSolidityAddress(), proxyAddress.toSolidityAddress())

    // Check new implementation address
    const implementation = await getProxyImplementation(ContractId, proxyAdminAddress, operatorClient, proxyAddress.toSolidityAddress());
    expect(implementation.toUpperCase()).to.equals("0X" + newImplementationContract.toSolidityAddress().toUpperCase());

    // reset
    await upgrade(ContractId, proxyAdminAddress, operatorClient, stableCoinAddress.toSolidityAddress(), proxyAddress.toSolidityAddress())
  });

  it("Change Proxy admin with the proxy admin and the owner account", async function() {
    // Owner changes admin : success     
    await changeProxyAdmin(ContractId, proxyAdminAddress, operatorClient, operatorAccount, proxyAddress.toSolidityAddress());

    // Now we cannot get the admin using the Proxy admin contract.
    await expect(getProxyAdmin(ContractId, proxyAdminAddress, operatorClient, proxyAddress.toSolidityAddress())).to.eventually.be.rejectedWith(Error);

    // Check that proxy admin has been changed
    const _admin = await admin(ContractId, proxyAddress, operatorClient);
    expect(_admin.toUpperCase()).to.equals("0X" + AccountId.fromString(operatorAccount).toSolidityAddress().toUpperCase());

    // reset
    await changeAdmin(ContractId, proxyAddress, operatorClient, AccountId.fromString(nonOperatorAccount).toSolidityAddress());
    await changeAdmin(ContractId, proxyAddress, nonOperatorClient, proxyAdminAddress.toSolidityAddress());
  });

  it("Transfers Proxy admin owner without the owner account", async function() {
   // Non Owner transfers owner : fail       
   await expect(transferOwnership(ContractId, proxyAdminAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
  });

  it("Transfers Proxy admin owner with the owner account", async function() {
   // Owner transfers owner : success       
   await transferOwnership(ContractId, proxyAdminAddress, operatorClient, nonOperatorAccount);

   // Check
   const ownerAccount = await owner(ContractId, proxyAdminAddress, operatorClient);
   expect(ownerAccount.toUpperCase()).to.equals("0X" + AccountId.fromString(nonOperatorAccount).toSolidityAddress().toUpperCase());

   // reset      
   await transferOwnership(ContractId, proxyAdminAddress, nonOperatorClient, operatorAccount);
  });


});
