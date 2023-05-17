import '@hashgraph/hardhat-hethers'
import { BigNumber, ethers } from 'ethers'
import {
    deployContractsWithSDK,
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
} from '../../scripts/deploy'
import { clientId } from '../../scripts/utils'
import {
    grantRole,
    revokeRole,
    hasRole,
    Burn,
    getTotalSupply,
} from '../../scripts/contractsMethods'
import { BURN_ROLE } from '../../scripts/constants'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { HederaERC20__factory } from '../../typechain-types/index'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(100).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('Estimations', function () {
    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)
        nonOperatorClient = getNonOperatorClient(client1, client2, clientId)
        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        nonOperatorAccount = getNonOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )
        nonOperatorIsE25519 = getNonOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: TokenDecimals,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
        })

        proxyAddress = result[0]
    })

    it('Estimations', async function () {
        // const url = 'http://127.0.0.1:7546/api';
        const url = `https://testnet.hashio.io/api`
        const provider = new ethers.providers.JsonRpcProvider(url)

        const burnSignature = 'burn(int64)'
        const pauseSignature = 'pause()'

        const burnSelector = ethers.utils
            .keccak256(ethers.utils.toUtf8Bytes(burnSignature))
            .slice(0, 10)
        const pauseSelector = ethers.utils
            .keccak256(ethers.utils.toUtf8Bytes(pauseSignature))
            .slice(0, 10)

        const burnValue = ethers.BigNumber.from('1')
        const burnEncodedValue = ethers.utils.defaultAbiCoder
            .encode(['int64'], [burnValue])
            .slice(2, 66)

        const estimationBurn = await provider.estimateGas({
            to: proxyAddress.toSolidityAddress(),

            // burnToken(1)
            data: burnSelector + burnEncodedValue,
        })

        const estimationPause = await provider.estimateGas({
            to: proxyAddress.toSolidityAddress(),

            // pause()
            data: pauseSelector,
        })

        console.log('estimation Burn : ' + estimationBurn.toString())
        console.log('estimation Pause : ' + estimationPause.toString())
    })
})
