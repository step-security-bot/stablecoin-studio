/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  StableCoinFactoryWrapper,
  StableCoinFactoryWrapperInterface,
} from "../../contracts/StableCoinFactoryWrapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "factory",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousFactory",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newFactory",
        type: "address",
      },
    ],
    name: "newFactoryAddress",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newFactory",
        type: "address",
      },
    ],
    name: "changeFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tokenName",
            type: "string",
          },
          {
            internalType: "string",
            name: "tokenSymbol",
            type: "string",
          },
          {
            internalType: "bool",
            name: "freeze",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "supplyType",
            type: "bool",
          },
          {
            internalType: "uint32",
            name: "tokenMaxSupply",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "tokenInitialSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenDecimals",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "autoRenewAccountAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "treasuryAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "keyType",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "PublicKey",
                type: "bytes",
              },
            ],
            internalType: "struct IStableCoinFactory.KeysStruct[]",
            name: "keys",
            type: "tuple[]",
          },
        ],
        internalType: "struct IStableCoinFactory.tokenStruct",
        name: "requestedToken",
        type: "tuple",
      },
    ],
    name: "deployStableCoin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getFactory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516109e53803806109e583398101604081905261002f916101b4565b61003833610047565b61004181610097565b506101e4565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b61009f610158565b6001600160a01b0381166101065760405162461bcd60e51b815260206004820152602360248201527f466163746f727920616464726573732063616e6e6f742062652061646472657360448201526207320360ec1b60648201526084015b60405180910390fd5b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907fcd103125ee23517ba0a0c9b0db91ae94581eb693f492898e305e38f57c9adf2c90600090a35050565b6000546001600160a01b031633146101b25760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016100fd565b565b6000602082840312156101c657600080fd5b81516001600160a01b03811681146101dd57600080fd5b9392505050565b6107f2806101f36000396000f3fe6080604052600436106100655760003560e01c806388cc58e41161004357806388cc58e4146100ec5780638da5cb5b1461011e578063f2fde38b1461013c57600080fd5b806311c6e7411461006a5780633544478b1461008c578063715018a6146100d7575b600080fd5b34801561007657600080fd5b5061008a61008536600461046a565b61015c565b005b61009f61009a36600461048e565b610244565b604080516001600160a01b03958616815293851660208501529184169183019190915290911660608201526080015b60405180910390f35b3480156100e357600080fd5b5061008a6102ea565b3480156100f857600080fd5b506001546001600160a01b03165b6040516001600160a01b0390911681526020016100ce565b34801561012a57600080fd5b506000546001600160a01b0316610106565b34801561014857600080fd5b5061008a61015736600461046a565b6102fe565b61016461038e565b6001600160a01b0381166101e55760405162461bcd60e51b815260206004820152602360248201527f466163746f727920616464726573732063616e6e6f742062652061646472657360448201527f732030000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b600180546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907fcd103125ee23517ba0a0c9b0db91ae94581eb693f492898e305e38f57c9adf2c90600090a35050565b6001546040517f3544478b0000000000000000000000000000000000000000000000000000000081526000918291829182916001600160a01b0390911690633544478b903490610298908990600401610633565b60806040518083038185885af11580156102b6573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906102db919061075d565b93509350935093509193509193565b6102f261038e565b6102fc60006103e8565b565b61030661038e565b6001600160a01b0381166103825760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016101dc565b61038b816103e8565b50565b6000546001600160a01b031633146102fc5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016101dc565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b038116811461038b57600080fd5b803561046581610445565b919050565b60006020828403121561047c57600080fd5b813561048781610445565b9392505050565b6000602082840312156104a057600080fd5b813567ffffffffffffffff8111156104b757600080fd5b8201610140818503121561048757600080fd5b6000808335601e198436030181126104e157600080fd5b830160208101925035905067ffffffffffffffff81111561050157600080fd5b80360383131561051057600080fd5b9250929050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b8035801515811461046557600080fd5b803563ffffffff8116811461046557600080fd5b6000808335601e1984360301811261057b57600080fd5b830160208101925035905067ffffffffffffffff81111561059b57600080fd5b8060051b360383131561051057600080fd5b81835260006020808501808196508560051b81019150846000805b88811015610625578385038a528235603e198936030181126105e8578283fd5b88018035865260406105fc888301836104ca565b925081898901526106108289018483610517565b9c89019c9750505092860192506001016105c8565b509298975050505050505050565b60208152600061064383846104ca565b61014080602086015261065b61016086018385610517565b925061066a60208701876104ca565b9250601f1980878603016040880152610684858584610517565b945061069260408901610540565b801515606089015293506106a860608901610540565b801515608089015293506106be60808901610550565b63ffffffff811660a0890152935060a088013560c088015260c088013560e08801526106ec60e0890161045a565b93506101009150610707828801856001600160a01b03169052565b61071282890161045a565b9350610120915061072d828801856001600160a01b03169052565b61073982890189610564565b94509150808786030183880152506107528484836105ad565b979650505050505050565b6000806000806080858703121561077357600080fd5b845161077e81610445565b602086015190945061078f81610445565b60408601519093506107a081610445565b60608601519092506107b181610445565b93969295509093505056fea26469706673582212208f1b7f94d6fd28657f53cf3941e1ed7c216ca91da67beddf6dccf2e56cf4ca4d64736f6c634300080a0033";

type StableCoinFactoryWrapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StableCoinFactoryWrapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StableCoinFactoryWrapper__factory extends ContractFactory {
  constructor(...args: StableCoinFactoryWrapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    factory: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<StableCoinFactoryWrapper> {
    return super.deploy(
      factory,
      overrides || {}
    ) as Promise<StableCoinFactoryWrapper>;
  }
  override getDeployTransaction(
    factory: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(factory, overrides || {});
  }
  override attach(address: string): StableCoinFactoryWrapper {
    return super.attach(address) as StableCoinFactoryWrapper;
  }
  override connect(signer: Signer): StableCoinFactoryWrapper__factory {
    return super.connect(signer) as StableCoinFactoryWrapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StableCoinFactoryWrapperInterface {
    return new utils.Interface(_abi) as StableCoinFactoryWrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StableCoinFactoryWrapper {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as StableCoinFactoryWrapper;
  }
}
