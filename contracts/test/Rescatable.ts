import { ContractFunctionParameters, ContractId, AccountId } from "@hashgraph/sdk";
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect } from "chai";

import { deployContractsWithSDK, contractCall, getClient, createECDSAAccount } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

import dotenv from "dotenv";

const hre = require("hardhat"); 

const hreConfig = hre.network.config;

describe("Rescatable", function() {
  let proxyAddress:any;
  let client:any = getClient();;
  let contractProxy: { name: (arg0: { gasLimit: number; }) => any; symbol: (arg0: { gasLimit: number; }) => any; decimals: (arg0: { gasLimit: number; }) => any; };
  let account:string;
  let privateKey:string;

  before(async function  () {
         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client.setOperator(account, privateKey);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 1000, 5000, "Hedera Accelerator Stable Coin");    
  });
  it("Should rescue 10000 token", async function() {
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, HederaERC20__factory.abi) 
    const tokenOwnerAddress = response[0] 
   
    params = [tokenOwnerAddress];  
    //await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi)  
    //params = [tokenOwnerAddress, 1010];  
   // await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)  
    params = [tokenOwnerAddress];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    console.log(result);
   /* expect(parseInt(result[0])).to.equals(1000);
    const tokenAddress = await contractCall(ContractId.fromString(proxyAddress), 'getTokenAddress', params, client, 60000, HederaERC20__factory.abi)  
    await contractCall(ContractId.fromString(proxyAddress), 'rescue', params, client, 60000, HederaERC20__factory.abi)  */
  });

  /*it("Should fail rescue 10000 from contract token", async function() {
    let params: any[] = [AccountId.fromString(account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(account!).toSolidityAddress(), 1000];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(account!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(result[0])).to.equals(1000);
    const tokenAddress = await contractCall(ContractId.fromString(proxyAddress), 'getTokenAddress', params, client, 60000, HederaERC20__factory.abi)  
    await contractCall(ContractId.fromString(proxyAddress), 'rescue', params, client, 60000, HederaERC20__factory.abi)  
    });*/
});
