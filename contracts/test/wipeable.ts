const { ContractId, AccountId } = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
require("@hashgraph/sdk");
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
 import {grantRole, revokeRole, hasRole, Mint, Wipe, getBalanceOf, getTotalSupply} from "../scripts/contractsMethods";
import {WIPE_ROLE} from "../scripts/constants";


let proxyAddress:any;

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
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(6000).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Wipe Tests", function() {

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

  it("Admin account can grant and revoke wipe role to an account", async function() {     
    // Admin grants wipe role : success 
    let result = await hasRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    expect(result).to.equals(false);

    await grantRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

    result = await hasRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    expect(result).to.equals(true);

    // Admin revokes wipe role : success
    await revokeRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    result = await hasRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    expect(result).to.equals(false);

  }); 

  it("Non Admin account can not grant wipe role to an account", async function() {   
    // Non Admin grants wipe role : fail       
    await expect(grantRole(WIPE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

  });

  it("Non Admin account can not revoke wipe role to an account", async function() {
    // Non Admin revokes wipe role : fail       
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
    await expect(revokeRole(WIPE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

    //Reset status
    await revokeRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
  });

  it("wipe 10 tokens from an account with 20 tokens", async function() {  
    const TokensToMint = BigNumber.from(20).mul(TokenFactor);
    const TokensToWipe = BigNumber.from(10).mul(TokenFactor);

    // Mint 20 tokens
    await Mint(ContractId, proxyAddress, TokensToMint, operatorClient, operatorAccount)

    // Get the initial total supply and account's balanceOf
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, operatorClient);
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);  

    // Wipe 10 tokens
    await Wipe(ContractId, proxyAddress, TokensToWipe, operatorClient, operatorAccount)

    // Check balance of account and total supply : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, operatorClient);
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);  
    const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe);
    const expectedBalanceOf = initialBalanceOf.sub(TokensToWipe);
    
    expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString());
    expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString());
  });

  it("Wiping more than account's balance", async function() {
    const TokensToMint = BigNumber.from(20).mul(TokenFactor);

    // Mint 20 tokens
    await Mint(ContractId, proxyAddress, TokensToMint, operatorClient, operatorAccount)

    // Get the current balance for account
    const result = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);  

    // Wipe more than account's balance : fail
    await expect(Wipe(ContractId, proxyAddress, result.add(1), operatorClient, operatorAccount)).to.eventually.be.rejectedWith(Error);
   
  });  

  it("Wiping from account without the wipe role", async function() {
    const TokensToMint = BigNumber.from(20).mul(TokenFactor);

    // Mint 20 tokens   
    await Mint(ContractId, proxyAddress, TokensToMint, operatorClient, operatorAccount)

    // Wipe with account that does not have the wipe role: fail
    await expect(Wipe(ContractId, proxyAddress, BigNumber.from(1), nonOperatorClient, operatorAccount)).to.eventually.be.rejectedWith(Error);

  });

  it("User with granted wipe role can wipe tokens", async function() {
    const TokensToMint = BigNumber.from(20).mul(TokenFactor);
    const TokensToWipe = BigNumber.from(1);

    // Mint 20 tokens   
    await Mint(ContractId, proxyAddress, TokensToMint, operatorClient, operatorAccount)

    // Retrieve original total supply
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);  
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, operatorClient);

    // Grant wipe role to account
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

    // Wipe tokens with newly granted account
    await Wipe(ContractId, proxyAddress, TokensToWipe, nonOperatorClient, operatorAccount);

    // Check final total supply and treasury account's balanceOf : success
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);  
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, operatorClient);
    const expectedFinalBalanceOf = initialBalanceOf.sub(TokensToWipe);
    const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe);

    expect(finalBalanceOf.toString()).to.equals(expectedFinalBalanceOf.toString()); 
    expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString()); 
  }); 

});

