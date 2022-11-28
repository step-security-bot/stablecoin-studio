const {
    ContractId,
    AccountId,
    TokenSupplyType,
} = require('@hashgraph/sdk')

const factoryAddress = "0.0.48974149" //"0.0.48968373";
const address_0 = "0x0000000000000000000000000000000000000000";

import {
    StableCoinFactory__factory,
    HederaERC20__factory
} from '../typechain-types'

import {getClient, 
    deployContractSDK,
    contractCall}
 from './utils'

const hre = require('hardhat')
const hreConfig = hre.network.config

export function initializeClients(){
    const client1 = getClient();    
    const client1account = hreConfig.accounts[0].account;  
    const client1privatekey = hreConfig.accounts[0].privateKey
    const client1publickey = hreConfig.accounts[0].publicKey
    client1.setOperator(client1account, client1privatekey);

    const client2 = getClient();
    const client2account = hreConfig.accounts[1].account;  
    const client2privatekey = hreConfig.accounts[1].privateKey
    const client2publickey = hreConfig.accounts[1].publicKey
    client2.setOperator(client2account, client2privatekey);  

    return [client1,
    client1account,
    client1privatekey,
    client1publickey,
    client2,
    client2account,
    client2privatekey,
    client2publickey]
}

export function getOperatorClient(client1 : any, client2 : any, clientId : number): any{
    return (clientId == 1) ? client1 : client2;
}

export function getOperatorAccount(client1account : any, client2account : any, clientId : number): any{
    return (clientId == 1) ? client1account : client2account;
}

export function getOperatorPrivateKey(client1privatekey : any, client2privatekey : any, clientId : number): any{
    return (clientId == 1) ? client1privatekey : client2privatekey;
}

export function getOperatorPublicKey(client1publickey : any, client2publickey : any, clientId : number): any{
    return (clientId == 1) ? client1publickey : client2publickey;
}

export function getNonOperatorClient(client1 : any, client2 : any, clientId : number): any{
    return (clientId == 2) ? client1 : client2;
}

export function getNonOperatorAccount(client1account : any, client2account : any, clientId : number): any{
    return (clientId == 2) ? client1account : client2account;
}

export function getNonOperatorPrivateKey(client1privatekey : any, client2privatekey : any, clientId : number): any{
    return (clientId == 2) ? client1privatekey : client2privatekey;
}

export function getNonOperatorPublicKey(client1publickey : any, client2publickey : any, clientId : number): any{
    return (clientId == 2) ? client1publickey : client2publickey;
}

export async function deployFactory(
    clientOperator: any,
    privateKey: string
){
    // Deploying Factory logic
    console.log(`Deploying Contract Factory. please wait...`);

    const factory = await deployContractSDK(
        StableCoinFactory__factory,
        privateKey,
        clientOperator,
    )

    console.log(`Contract Factory deployed ${factory.toSolidityAddress()}`);

    return factory;
}

export async function deployContractsWithSDK(
    name: string,
    symbol: string,
    decimals = 6,
    initialSupply: string,
    maxSupply: string | null,
    memo: string,
    account: string,
    privateKey: string,
    publicKey: string,
    freeze = false
) {
    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

    console.log(
        `With user account  (${account}, ${AccountId.fromString(account).toSolidityAddress()})`
    )

    const clientSdk = getClient()
    clientSdk.setOperator(account, privateKey)

    let f_address = ""

    if(!factoryAddress) f_address = await deployFactory(clientSdk, privateKey);
    else f_address = ContractId.fromString(factoryAddress);

    console.log(`Invoking Factory at ${f_address}... please wait.`)

    let tokenObject = {
        "tokenName": name,
        "tokenSymbol": symbol,
        "freeze": freeze,
        "supplyType": (maxSupply !== null)? TokenSupplyType.Finite: TokenSupplyType.Infinite,
        "tokenMaxSupply": maxSupply,
        "tokenInitialSupply": initialSupply,
        "tokenDecimals": decimals,
        "autoRenewAccountAddress": AccountId.fromString(account).toSolidityAddress(),
        "treasuryAddress": address_0,
        "keys": [
            {
                "keyType": 1, // admin
                "PublicKey": "0x", // PublicKey.fromString(publicKey).toBytes(),
            },
            {
                "keyType": 4, // freeze
                "PublicKey": "0x", // PublicKey.fromString(publicKey).toBytes(),
            },
            {
                "keyType": 8, // wipe
                "PublicKey": "0x",
            },
            {
                "keyType": 16, // supply
                "PublicKey": "0x",
            },
            {
                "keyType": 64, // pause
                "PublicKey": "0x",
            }
        ]
    };

    console.log(`Token Object: ${JSON.stringify(tokenObject)}`)

    let parametersContractCall = [tokenObject]

    console.log(`deploying stableCoin... please wait.`)

    let proxyContract = await contractCall(
        f_address,
        'deployStableCoin',
        parametersContractCall,
        clientSdk,
        15000000,
        StableCoinFactory__factory.abi,
        25
    )

    console.log(`Proxy created: ${proxyContract[0]} , ${ContractId.fromSolidityAddress(proxyContract[0]).toString()}`)
    console.log(`Proxy Admin created: ${proxyContract[1]} , ${ContractId.fromSolidityAddress(proxyContract[1]).toString()}`)
    console.log(`Implementation created: ${proxyContract[2]} , ${ContractId.fromSolidityAddress(proxyContract[2]).toString()}`)
    console.log(`Underlying token created: ${proxyContract[3]}, ${ContractId.fromSolidityAddress(proxyContract[3]).toString()}`)

    return [ContractId.fromSolidityAddress(proxyContract[0]),
        ContractId.fromSolidityAddress(proxyContract[1]),
        ContractId.fromSolidityAddress(proxyContract[2])]
}
