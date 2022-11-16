const {
    AccountId,
    ContractFunctionParameters,
    TokenId
} = require('@hashgraph/sdk')

import {
    HederaERC20__factory,
    HTSTokenOwner__factory,
    HederaERC1967Proxy__factory,
} from '../typechain-types'

import {getClient, 
    deployContractSDK,
    contractCall,
    createToken}
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

    const clientSdk = getClient()
    clientSdk.setOperator(account, privateKey)

    console.log(
        `Deploying ${HederaERC20__factory.name} contract... please wait.`
    )
    const tokenContract = await deployContractSDK(
        HederaERC20__factory,
        privateKey,
        clientSdk
    )

    console.log(
        `Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`
    )
    const parameters = new ContractFunctionParameters()
        .addAddress(tokenContract!.toSolidityAddress())
        .addBytes(new Uint8Array([]))
    const proxyContract = await deployContractSDK(
        HederaERC1967Proxy__factory,
        privateKey,
        clientSdk,
        parameters
    )
    let parametersContractCall: any[] = []
    await contractCall(
        proxyContract,
        'initialize',
        parametersContractCall,
        clientSdk,
        280000,
        HederaERC20__factory.abi
    )

    console.log(
        `Deploying ${HTSTokenOwner__factory.name} contract... please wait.`
    )
    const tokenOwnerContract = await deployContractSDK(
        HTSTokenOwner__factory,
        privateKey,
        clientSdk
    )

    console.log('Creating token... please wait.')
    memo = JSON.stringify({
        proxyContract: String(proxyContract),
        htsAccount: String(tokenOwnerContract),
    })
    const hederaToken = await createToken(
        tokenOwnerContract,
        name,
        symbol,
        decimals,
        initialSupply,
        maxSupply,
        memo,
        freeze,
        account!,
        privateKey!,
        publicKey!,
        clientSdk
    )

    console.log('Setting up contract... please wait.')
    parametersContractCall = [
        tokenOwnerContract!.toSolidityAddress(),
        TokenId.fromString(hederaToken!.toString()).toSolidityAddress(),
    ]
    await contractCall(
        proxyContract,
        'setTokenAddress',
        parametersContractCall,
        clientSdk,
        80000,
        HederaERC20__factory.abi
    )

    parametersContractCall = [proxyContract!.toSolidityAddress()]
    await contractCall(
        tokenOwnerContract,
        'setERC20Address',
        parametersContractCall,
        clientSdk,
        60000,
        HTSTokenOwner__factory.abi
    )

    console.log('Associate administrator account to token... please wait.')
    parametersContractCall = [
        AccountId.fromString(account!).toSolidityAddress(),
    ]
    await contractCall(
        proxyContract,
        'associateToken',
        parametersContractCall,
        clientSdk,
        1300000,
        HederaERC20__factory.abi
    )

    return proxyContract
}