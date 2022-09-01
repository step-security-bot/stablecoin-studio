/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace IHederaTokenService {
  export type ExpiryStruct = {
    second: PromiseOrValue<BigNumberish>;
    autoRenewAccount: PromiseOrValue<string>;
    autoRenewPeriod: PromiseOrValue<BigNumberish>;
  };

  export type ExpiryStructOutput = [number, string, number] & {
    second: number;
    autoRenewAccount: string;
    autoRenewPeriod: number;
  };

  export type KeyValueStruct = {
    inheritAccountKey: PromiseOrValue<boolean>;
    contractId: PromiseOrValue<string>;
    ed25519: PromiseOrValue<BytesLike>;
    ECDSA_secp256k1: PromiseOrValue<BytesLike>;
    delegatableContractId: PromiseOrValue<string>;
  };

  export type KeyValueStructOutput = [
    boolean,
    string,
    string,
    string,
    string
  ] & {
    inheritAccountKey: boolean;
    contractId: string;
    ed25519: string;
    ECDSA_secp256k1: string;
    delegatableContractId: string;
  };

  export type TokenKeyStruct = {
    keyType: PromiseOrValue<BigNumberish>;
    key: IHederaTokenService.KeyValueStruct;
  };

  export type TokenKeyStructOutput = [
    BigNumber,
    IHederaTokenService.KeyValueStructOutput
  ] & { keyType: BigNumber; key: IHederaTokenService.KeyValueStructOutput };
}

export interface HTSTokenOwnerInterface extends utils.Interface {
  functions: {
    "burnToken(address,uint256)": FunctionFragment;
    "erc20address()": FunctionFragment;
    "getTokenAddress()": FunctionFragment;
    "getTokenExpiryInfo(address)": FunctionFragment;
    "getTokenKey(address,uint256)": FunctionFragment;
    "getTokenOwnerAddress()": FunctionFragment;
    "grantTokenKyc(address,address)": FunctionFragment;
    "isKyc(address,address)": FunctionFragment;
    "mintToken(address,uint256)": FunctionFragment;
    "pauseToken(address)": FunctionFragment;
    "revokeTokenKyc(address,address)": FunctionFragment;
    "setERC20Address(address)": FunctionFragment;
    "setTokenAddress(address,address)": FunctionFragment;
    "toString(bytes)": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transfer(address,address,address,uint256)": FunctionFragment;
    "unpauseToken(address)": FunctionFragment;
    "updateTokenExpiryInfo(address,(uint32,address,uint32))": FunctionFragment;
    "updateTokenKeys(address,(uint256,(bool,address,bytes,bytes,address))[])": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "burnToken"
      | "erc20address"
      | "getTokenAddress"
      | "getTokenExpiryInfo"
      | "getTokenKey"
      | "getTokenOwnerAddress"
      | "grantTokenKyc"
      | "isKyc"
      | "mintToken"
      | "pauseToken"
      | "revokeTokenKyc"
      | "setERC20Address"
      | "setTokenAddress"
      | "toString"
      | "transfer(address,uint256)"
      | "transfer(address,address,address,uint256)"
      | "unpauseToken"
      | "updateTokenExpiryInfo"
      | "updateTokenKeys"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "burnToken",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "erc20address",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenExpiryInfo",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenKey",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenOwnerAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "grantTokenKyc",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isKyc",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "mintToken",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "pauseToken",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeTokenKyc",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setERC20Address",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setTokenAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "toString",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "transfer(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transfer(address,address,address,uint256)",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "unpauseToken",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateTokenExpiryInfo",
    values: [PromiseOrValue<string>, IHederaTokenService.ExpiryStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "updateTokenKeys",
    values: [PromiseOrValue<string>, IHederaTokenService.TokenKeyStruct[]]
  ): string;

  decodeFunctionResult(functionFragment: "burnToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "erc20address",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenExpiryInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenOwnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "grantTokenKyc",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isKyc", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mintToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pauseToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "revokeTokenKyc",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setERC20Address",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "toString", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transfer(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transfer(address,address,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unpauseToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateTokenExpiryInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateTokenKeys",
    data: BytesLike
  ): Result;

  events: {};
}

export interface HTSTokenOwner extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: HTSTokenOwnerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    burnToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    erc20address(overrides?: CallOverrides): Promise<[string]>;

    getTokenAddress(overrides?: CallOverrides): Promise<[string]>;

    getTokenExpiryInfo(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getTokenKey(
      token: PromiseOrValue<string>,
      keyType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<[string]>;

    grantTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    mintToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    pauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setERC20Address(
      _erc20address: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    toString(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    "transfer(address,uint256)"(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "transfer(address,address,address,uint256)"(
      tokenAddress: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unpauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    updateTokenExpiryInfo(
      token: PromiseOrValue<string>,
      expiryInfo: IHederaTokenService.ExpiryStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    updateTokenKeys(
      token: PromiseOrValue<string>,
      keys: IHederaTokenService.TokenKeyStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  burnToken(
    tokenAddress: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  erc20address(overrides?: CallOverrides): Promise<string>;

  getTokenAddress(overrides?: CallOverrides): Promise<string>;

  getTokenExpiryInfo(
    token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getTokenKey(
    token: PromiseOrValue<string>,
    keyType: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

  grantTokenKyc(
    token: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isKyc(
    token: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  mintToken(
    tokenAddress: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  pauseToken(
    token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeTokenKyc(
    token: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setERC20Address(
    _erc20address: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setTokenAddress(
    _htsTokenOwnerAddress: PromiseOrValue<string>,
    _tokenAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  toString(
    data: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  "transfer(address,uint256)"(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "transfer(address,address,address,uint256)"(
    tokenAddress: PromiseOrValue<string>,
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unpauseToken(
    token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  updateTokenExpiryInfo(
    token: PromiseOrValue<string>,
    expiryInfo: IHederaTokenService.ExpiryStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  updateTokenKeys(
    token: PromiseOrValue<string>,
    keys: IHederaTokenService.TokenKeyStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    burnToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    erc20address(overrides?: CallOverrides): Promise<string>;

    getTokenAddress(overrides?: CallOverrides): Promise<string>;

    getTokenExpiryInfo(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, IHederaTokenService.ExpiryStructOutput] & {
        responseCode: BigNumber;
        expiryInfo: IHederaTokenService.ExpiryStructOutput;
      }
    >;

    getTokenKey(
      token: PromiseOrValue<string>,
      keyType: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, IHederaTokenService.KeyValueStructOutput] & {
        responseCode: BigNumber;
        key: IHederaTokenService.KeyValueStructOutput;
      }
    >;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

    grantTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, boolean] & { responseCode: BigNumber; kycGranted: boolean }
    >;

    mintToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    pauseToken(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    revokeTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setERC20Address(
      _erc20address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    toString(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    "transfer(address,uint256)"(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "transfer(address,address,address,uint256)"(
      tokenAddress: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    unpauseToken(
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateTokenExpiryInfo(
      token: PromiseOrValue<string>,
      expiryInfo: IHederaTokenService.ExpiryStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateTokenKeys(
      token: PromiseOrValue<string>,
      keys: IHederaTokenService.TokenKeyStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    burnToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    erc20address(overrides?: CallOverrides): Promise<BigNumber>;

    getTokenAddress(overrides?: CallOverrides): Promise<BigNumber>;

    getTokenExpiryInfo(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getTokenKey(
      token: PromiseOrValue<string>,
      keyType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<BigNumber>;

    grantTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    mintToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    pauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setERC20Address(
      _erc20address: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    toString(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "transfer(address,uint256)"(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "transfer(address,address,address,uint256)"(
      tokenAddress: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unpauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    updateTokenExpiryInfo(
      token: PromiseOrValue<string>,
      expiryInfo: IHederaTokenService.ExpiryStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    updateTokenKeys(
      token: PromiseOrValue<string>,
      keys: IHederaTokenService.TokenKeyStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    burnToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    erc20address(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTokenAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTokenExpiryInfo(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getTokenKey(
      token: PromiseOrValue<string>,
      keyType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getTokenOwnerAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    mintToken(
      tokenAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    pauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeTokenKyc(
      token: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setERC20Address(
      _erc20address: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    toString(
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "transfer(address,uint256)"(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "transfer(address,address,address,uint256)"(
      tokenAddress: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unpauseToken(
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    updateTokenExpiryInfo(
      token: PromiseOrValue<string>,
      expiryInfo: IHederaTokenService.ExpiryStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    updateTokenKeys(
      token: PromiseOrValue<string>,
      keys: IHederaTokenService.TokenKeyStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
