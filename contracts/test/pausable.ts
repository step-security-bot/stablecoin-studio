const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;


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
import {grantRole, revokeRole, hasRole, pause, unpause, associateToken } from "../scripts/contractsMethods";
import {PAUSE_ROLE} from "../scripts/constants";

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
const MAX_SUPPLY = BigNumber.from(1).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"



describe("Pause Tests", function() {

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

    it("Admin account can grant and revoke pause role to an account", async function() {    
      // Admin grants pause role : success    
      let result = await hasRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
  
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
  
      result = await hasRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(true);
  
      // Admin revokes pause role : success    
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      result = await hasRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
  
    });
  
    it("Non Admin account can not grant pause role to an account", async function() {   
      // Non Admin grants pause role : fail       
      await expect(grantRole(PAUSE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
    });
  
    it("Non Admin account can not revoke pause role to an account", async function() {
      // Non Admin revokes pause role : fail       
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      await expect(revokeRole(PAUSE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
  
      //Reset status
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });

    it("An account without pause role can't pause a token", async function() {
      await expect(pause(ContractId, proxyAddress, nonOperatorClient)).to.eventually.be.rejectedWith(Error);
    });  

    it("An account without pause role can't unpause a token", async function() {
      await expect(unpause(ContractId, proxyAddress, nonOperatorClient)).to.eventually.be.rejectedWith(Error);
    });  

    it("An account with pause role can pause a token", async function() {
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, client2account);

      await expect(pause(ContractId, proxyAddress, client2)).not.to.eventually.be.rejectedWith(Error);

      //Reset status
      await unpause(ContractId, proxyAddress, client2);
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });  

    it("An account with pause role can unpause a token", async function() {
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      await expect(unpause(ContractId, proxyAddress, client2)).not.to.eventually.be.rejectedWith(Error);;

      //Reset status
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });  

    it("A paused token can not be used for any other operation, like associating", async function() {
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, client2account);

      await pause(ContractId, proxyAddress, client2);
      await expect(associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);

      //Reset status
      await unpause(ContractId, proxyAddress, client2);
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });  

    it("An unpaused token can be used for any other operation, like associating", async function() {
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      await pause(ContractId, proxyAddress, client2);
      await unpause(ContractId, proxyAddress, client2);
      await expect(associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).not.to.eventually.be.rejectedWith(Error);

      //Reset status
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });  
  });
