// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './hts-precompile/IHederaTokenService.sol';
import './hts-precompile/HederaResponseCodes.sol';
import './HederaERC20.sol';
import './HederaERC20Proxy.sol';
import './HederaERC20ProxyAdmin.sol';
import './HederaReserve.sol';
import './HederaReserveProxy.sol';
import './HederaReserveProxyAdmin.sol';
import './Interfaces/IStableCoinFactory.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract StableCoinFactory is IStableCoinFactory, HederaResponseCodes {
    // Hedera HTS precompiled contract
    address constant precompileAddress = address(0x167);
    string constant memo_1 = '{"p":"';
    string constant memo_2 = '","a":"';
    string constant memo_3 = '"}';

    event Deployed(DeployedStableCoin);

    function deployStableCoin(
        tokenStruct calldata requestedToken,
        address StableCoinContractAddress
    ) external payable override returns (DeployedStableCoin memory) {

        // Reserve
        address reserveAddress = requestedToken.reserveAddress;
        HederaReserveProxy reserveProxy;
        HederaReserveProxyAdmin reserveProxyAdmin;

        if (requestedToken.createReserve) {
            HederaReserve reserveContract = new HederaReserve();
            validationReserveInitialAmount(
                reserveContract.decimals(),
                requestedToken.reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );

            reserveProxyAdmin = new HederaReserveProxyAdmin();
            reserveProxyAdmin.transferOwnership(msg.sender);
            reserveProxy = new HederaReserveProxy(
                address(reserveContract),
                address(reserveProxyAdmin),
                ''
            );

            HederaReserve(address(reserveProxy)).initialize(
                requestedToken.reserveInitialAmount,
                msg.sender
            );
            reserveAddress = address(reserveProxy);
        }
        else if(reserveAddress != address(0)){
            (, int256 reserveInitialAmount, , , ) = HederaReserve(reserveAddress)
                .latestRoundData();

            validationReserveInitialAmount(
                HederaReserve(reserveAddress).decimals(),
                reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );
        }

        // Deploy Proxy Admin
        HederaERC20ProxyAdmin StableCoinProxyAdmin = new HederaERC20ProxyAdmin();

        // Transfer Proxy Admin ownership
        StableCoinProxyAdmin.transferOwnership(msg.sender);

        // Deploy Proxy
        HederaERC20Proxy StableCoinProxy = new HederaERC20Proxy(
            StableCoinContractAddress,
            address(StableCoinProxyAdmin),
            ''
        );

        // Create Token
        IHederaTokenService.HederaToken memory token = createToken(
            requestedToken,
            address(StableCoinProxy),
            address(StableCoinProxyAdmin)
        );

        // Initialize Proxy
        address tokenAddress = HederaERC20(address(StableCoinProxy)).initialize{
            value: msg.value
        }(
            token,
            requestedToken.tokenInitialSupply,
            requestedToken.tokenDecimals,
            msg.sender,
            reserveAddress
        );

        // Associate token
        if (treasuryIsContract(requestedToken.treasuryAddress))
            HederaERC20(address(StableCoinProxy)).associateToken(msg.sender);

        DeployedStableCoin memory deployedStableCoin;

        deployedStableCoin.stableCoinProxy = address(StableCoinProxy);
        deployedStableCoin.stableCoinProxyAdmin = address(StableCoinProxyAdmin);
        deployedStableCoin
            .stableCoinContractAddress = StableCoinContractAddress;
        deployedStableCoin.tokenAddress = tokenAddress;
        deployedStableCoin.reserveProxy = reserveAddress;
        deployedStableCoin.reserveProxyAdmin = address(reserveProxyAdmin);

        emit Deployed(deployedStableCoin);

        return deployedStableCoin;
    }

    function createToken(
        tokenStruct memory requestedToken,
        address StableCoinProxyAddress,
        address StableCoinProxyAdminAddress
    ) internal pure returns (IHederaTokenService.HederaToken memory) {
        // token Memo
        string memory tokenMemo = string(
            abi.encodePacked(
                memo_1,
                Strings.toHexString(StableCoinProxyAddress),
                memo_2,
                Strings.toHexString(StableCoinProxyAdminAddress),
                memo_3
            )
        );

        // Token Expiry
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = requestedToken.autoRenewAccountAddress;
        tokenExpiry.autoRenewPeriod = 7776000;

        // Token Keys
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](
                requestedToken.keys.length
            );
        for (uint256 i = 0; i < requestedToken.keys.length; i++) {
            keys[i] = IHederaTokenService.TokenKey({
                keyType: requestedToken.keys[i].keyType,
                key: generateKey(
                    requestedToken.keys[i].PublicKey,
                    StableCoinProxyAddress,
                    requestedToken.keys[i].isED25519
                )
            });
        }

        IHederaTokenService.HederaToken memory token;
        token.name = requestedToken.tokenName;
        token.symbol = requestedToken.tokenSymbol;
        token.treasury = treasuryIsContract(requestedToken.treasuryAddress)
            ? StableCoinProxyAddress
            : requestedToken.treasuryAddress;
        token.memo = tokenMemo;
        token.tokenSupplyType = requestedToken.supplyType;
        token.maxSupply = requestedToken.tokenMaxSupply;
        token.freezeDefault = requestedToken.freeze;
        token.tokenKeys = keys;
        token.expiry = tokenExpiry;

        return token;
    }

    function generateKey(
        bytes memory PublicKey,
        address StableCoinProxyAddress,
        bool isED25519
    ) internal pure returns (IHederaTokenService.KeyValue memory) {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory Key;
        if (PublicKey.length == 0)
            Key.delegatableContractId = StableCoinProxyAddress;
        else if (isED25519) Key.ed25519 = PublicKey;
        else Key.ECDSA_secp256k1 = PublicKey;

        return Key;
    }

    function treasuryIsContract(
        address treasuryAddress
    ) internal pure returns (bool) {
        return treasuryAddress == address(0);
    }

    function validationReserveInitialAmount(
        uint8 reserveDecimals,
        int256 reserveInitialAmount,
        uint32 tokenDecimals,
        uint256 tokenInitialSupply
    ) internal pure {
        //Validate initial reserve amount
        require(
            reserveInitialAmount >= 0,
            'Reserve initial amount must be positive'
        );
        uint256 initialReserve = uint(reserveInitialAmount);
        if (tokenDecimals > reserveDecimals) {
            initialReserve =
                initialReserve *
                (10 ** (tokenDecimals - reserveDecimals));
        } else {
            tokenInitialSupply =
                tokenInitialSupply *
                (10 ** (reserveDecimals - tokenDecimals));
        }
        require(
            tokenInitialSupply <= initialReserve,
            'Initial supply is lower than initial reserve'
        );
    }
}
