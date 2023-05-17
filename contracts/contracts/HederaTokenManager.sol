// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    IERC20Upgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {
    IERC20MetadataUpgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import {IHederaTokenManager} from './Interfaces/IHederaTokenManager.sol';
import {CashIn} from './extensions/CashIn.sol';
import {Burnable} from './extensions/Burnable.sol';
import {Wipeable} from './extensions/Wipeable.sol';
import {Pausable} from './extensions/Pausable.sol';
import {Freezable} from './extensions/Freezable.sol';
import {Rescatable} from './extensions/Rescatable.sol';
import {Deletable} from './extensions/Deletable.sol';
import {Reserve} from './extensions/Reserve.sol';

import {
    TokenOwner,
    HederaResponseCodes,
    IHederaTokenService
} from './extensions/TokenOwner.sol';
import {KYC} from './extensions/KYC.sol';
import {RoleManagement} from './extensions/RoleManagement.sol';
import {KeysLib} from './library/KeysLib.sol';

contract HederaTokenManager is
    IHederaTokenManager,
    CashIn,
    Burnable,
    Wipeable,
    Pausable,
    Freezable,
    Deletable,
    Rescatable,
    KYC,
    RoleManagement
{
    uint256 private constant _SUPPLY_KEY_BIT = 4;

    // Constructor required to avoid Initializer attack on logic contract
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the stable coin frmo the proxy
     *
     * @param init the underlying token to create
     *
     */
    function initialize(
        InitializeStruct calldata init
    )
        external
        payable
        initializer
        addressIsNotZero(init.originalSender)
        returns (address)
    {
        __reserveInit(init.reserveAddress); // Initialize reserve
        __rolesInit();
        _grantInitialRoles(init.originalSender, init.roles, init.cashinRole);

        (int64 responseCode, address createdTokenAddress) = IHederaTokenService(
            _PRECOMPILED_ADDRESS
        ).createFungibleToken{value: msg.value}(
            init.token,
            init.initialTotalSupply,
            init.tokenDecimals
        );

        _checkResponse(responseCode);

        __tokenOwnerInit(createdTokenAddress);

        // Sending back the remaining HBARs from msg.value
        uint256 currentBalance = address(this).balance;
        if (currentBalance > 0) {
            (bool s, ) = init.originalSender.call{value: currentBalance}('');
            require(
                s,
                'Transfering funds back to Original sender did not work'
            );
        }

        return createdTokenAddress;
    }

    function _grantInitialRoles(
        address originalSender,
        RolesStruct[] memory roles,
        CashinRoleStruct memory cashinRole
    ) private onlyInitializing {
        // granting all roles except cashin role
        for (uint256 i = 0; i < roles.length; i++) {
            _grantRole(roles[i].role, roles[i].account);
        }

        // granting cashin role
        if (cashinRole.account != address(0)) {
            if (cashinRole.allowance > 0)
                _grantSupplierRole(cashinRole.account, cashinRole.allowance);
            else _grantUnlimitedSupplierRole(cashinRole.account);
        }

        // granting admin role, always to the SC creator
        _setupRole(_getRoleId(RoleName.ADMIN), originalSender);
    }

    /**
     * @dev Returns the name of the token
     *
     * @return string The the name of the token
     */
    function name() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).name();
    }

    /**
     * @dev Returns the symbol of the token
     *
     * @return string The the symbol of the token
     */
    function symbol() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).symbol();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return uint8 The number of decimals of the token
     */
    function decimals() external view returns (uint8) {
        return _decimals();
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(
        address account
    ) external view override(IHederaTokenManager) returns (uint256) {
        return _balanceOf(account);
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */

    function _balanceOf(
        address account
    ) internal view override(TokenOwner) returns (uint256) {
        return IERC20Upgradeable(_getTokenAddress()).balanceOf(account);
    }

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param to The address the tokens are transferred to
     */
    function _transfer(
        address to,
        int64 amount
    )
        internal
        override(TokenOwner)
        valueIsNotGreaterThan(
            uint256(uint64(amount)),
            _balanceOf(address(this)),
            true
        )
    {
        if (to != address(this)) {
            address currentTokenAddress = _getTokenAddress();

            int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
                .transferToken(currentTokenAddress, address(this), to, amount);

            _checkResponse(responseCode);

            emit TokenTransfer(currentTokenAddress, address(this), to, amount);
        }
    }

    /**
     * @dev Update token keys
     *
     * @param updatedToken Values to update the token
     */
    function updateToken(
        UpdateTokenStruct calldata updatedToken
    )
        external
        override(IHederaTokenManager)
        onlyRole(_getRoleId(RoleName.ADMIN))
    {
        address currentTokenAddress = _getTokenAddress();

        address newTreasury = address(0);

        // Token Keys
        IHederaTokenService.TokenKey[]
            memory hederaKeys = new IHederaTokenService.TokenKey[](
                updatedToken.keys.length
            );

        for (uint256 i = 0; i < updatedToken.keys.length; i++) {
            hederaKeys[i] = IHederaTokenService.TokenKey({
                keyType: updatedToken.keys[i].keyType,
                key: KeysLib.generateKey(
                    updatedToken.keys[i].publicKey,
                    address(this),
                    updatedToken.keys[i].isED25519
                )
            });
            if (KeysLib.containsKey(_SUPPLY_KEY_BIT, hederaKeys[i].keyType)) {
                if (hederaKeys[i].key.delegatableContractId == address(this))
                    newTreasury = address(this);
                else newTreasury = msg.sender;
            }
        }

        // Hedera Token Expiry
        IHederaTokenService.Expiry memory expiry;
        if (updatedToken.second >= 0) expiry.second = updatedToken.second;
        if (updatedToken.autoRenewPeriod >= 0)
            expiry.autoRenewPeriod = updatedToken.autoRenewPeriod;

        // Hedera Token Info
        IHederaTokenService.HederaToken memory hederaTokenInfo;
        if (bytes(updatedToken.tokenName).length > 0)
            hederaTokenInfo.name = updatedToken.tokenName;
        if (bytes(updatedToken.tokenSymbol).length > 0)
            hederaTokenInfo.symbol = updatedToken.tokenSymbol;
        hederaTokenInfo.tokenKeys = hederaKeys;
        // hederaTokenInfo.memo = _getTokenInfo(currentTokenAddress); // this is required because of an Hedera bug.
        hederaTokenInfo.expiry = expiry;

        if (newTreasury != address(0)) hederaTokenInfo.treasury = newTreasury;

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .updateTokenInfo(currentTokenAddress, hederaTokenInfo);

        _checkResponse(responseCode);

        emit TokenUpdated(currentTokenAddress, updatedToken, newTreasury);
    }

    // This method is required because of an Hedera's bug, when keys are updated for a token, the memo gets removed.
    /* function _getTokenInfo(
        address tokenAddress
    ) private returns (string memory) {
        (
            int64 responseCode,
            IHederaTokenService.TokenInfo memory info
        ) = IHederaTokenService(_PRECOMPILED_ADDRESS).getTokenInfo(
                tokenAddress
            );

        _checkResponse(responseCode);

        return info.token.memo;
    } */
}
