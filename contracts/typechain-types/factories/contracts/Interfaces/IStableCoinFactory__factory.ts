/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IStableCoinFactory,
  IStableCoinFactoryInterface,
} from "../../../contracts/Interfaces/IStableCoinFactory";

const _abi = [
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
            internalType: "int64",
            name: "tokenMaxSupply",
            type: "int64",
          },
          {
            internalType: "uint64",
            name: "tokenInitialSupply",
            type: "uint64",
          },
          {
            internalType: "uint32",
            name: "tokenDecimals",
            type: "uint32",
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
              {
                internalType: "bool",
                name: "isED25519",
                type: "bool",
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
      {
        internalType: "address",
        name: "StableCoinContractAddress",
        type: "address",
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
];

export class IStableCoinFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IStableCoinFactoryInterface {
    return new utils.Interface(_abi) as IStableCoinFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IStableCoinFactory {
    return new Contract(address, _abi, signerOrProvider) as IStableCoinFactory;
  }
}
