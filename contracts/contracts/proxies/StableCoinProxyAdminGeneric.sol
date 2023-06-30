// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {
    ProxyAdmin
} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {
    ITransparentUpgradeableProxy
} from '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';
import {Ownable2Step} from '@openzeppelin/contracts/access/Ownable2Step.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {TimeDelayGeneric} from './TimeDelayGeneric.sol';

contract StableCoinProxyAdminGeneric is
    Ownable,
    ProxyAdmin,
    Ownable2Step,
    TimeDelayGeneric
{
    bytes32 private constant _ADMIN_CHANGE = keccak256('ADMIN_CHANGE');
    bytes32 private constant _IMPLEMENTATION_UPGRADE =
        keccak256('IMPLEMENTATION_UPGRADE');

    // events for pending admin chnages
    event AdminChangedStarted(
        ITransparentUpgradeableProxy indexed proxy,
        address previousAdmin,
        address newAdmin
    );
    event AdminChangedCancelled();

    // events for pending implementation chnages
    event ImplementationChangedStarted(
        ITransparentUpgradeableProxy indexed proxy,
        address previousImplementation,
        address newImplementation,
        uint256 value,
        bytes data
    );
    event ImplementationChangedCancelled();

    constructor(
        address initialOwner,
        uint256 initialDelay
    ) Ownable2Step() TimeDelayGeneric(initialDelay) {
        _transferOwnership(initialOwner);
    }

    // transfer ownership using Owner2Step
    function transferOwnership(
        address newOwner
    ) public override(Ownable, Ownable2Step) onlyOwner {
        Ownable2Step.transferOwnership(newOwner);
    }

    function _transferOwnership(
        address newOwner
    ) internal override(Ownable, Ownable2Step) {
        Ownable2Step._transferOwnership(newOwner);
    }

    // DELAY --------------------------------------------------
    function requestDelayChange(uint256 newDelay) external onlyOwner {
        _requestDelayChange(newDelay);
    }

    function cancelDelayChange() external onlyOwner {
        _cancelDelayChange();
    }

    function confirmDelayChange(uint256 newDelay) external onlyOwner {
        _confirmDelayChange(newDelay);
    }

    // ADMIN --------------------------------------------------
    function changeProxyAdmin(
        ITransparentUpgradeableProxy proxy,
        address newAdmin
    ) public override(ProxyAdmin) onlyOwner {
        _addChange(_ADMIN_CHANGE, _adminInputArguments(proxy, newAdmin));
        emit AdminChangedStarted(proxy, getProxyAdmin(proxy), newAdmin);
    }

    function cancelProxyAdminChange() external onlyOwner {
        _removeChange(_ADMIN_CHANGE);
        emit AdminChangedCancelled();
    }

    function confirmProxyAdminChange(
        ITransparentUpgradeableProxy proxy,
        address newAdmin
    )
        external
        onlyOwner
        isChangePending(_ADMIN_CHANGE, _adminInputArguments(proxy, newAdmin))
        isDelayOK(_ADMIN_CHANGE)
    {
        proxy.changeAdmin(newAdmin);
        _removeChange(_ADMIN_CHANGE);
    }

    function _adminInputArguments(
        ITransparentUpgradeableProxy proxy,
        address newAdmin
    ) private pure returns (bytes32) {
        bytes32[] memory input = new bytes32[](3);
        input[0] = _ADMIN_CHANGE;
        input[1] = bytes32(uint256(uint160(address(proxy))));
        input[2] = bytes32(uint256(uint160(newAdmin)));

        return _hashOperation(input);
    }

    // IMPLEMENTATION --------------------------------------------------
    function upgrade(
        ITransparentUpgradeableProxy proxy,
        address implementation
    ) public override(ProxyAdmin) onlyOwner {
        _changeImplementation(proxy, implementation, 0, '');
    }

    function upgradeAndCall(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        bytes memory data
    ) public payable override(ProxyAdmin) onlyOwner {
        _changeImplementation(proxy, implementation, msg.value, data);
    }

    function _changeImplementation(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        uint256 value,
        bytes memory data
    ) private {
        _addChange(
            _IMPLEMENTATION_UPGRADE,
            _implementationInputArguments(proxy, implementation, value, data)
        );
        emit ImplementationChangedStarted(
            proxy,
            getProxyImplementation(proxy),
            implementation,
            value,
            data
        );
    }

    function cancelUpgradeChange() external onlyOwner {
        _removeChange(_IMPLEMENTATION_UPGRADE);
        emit ImplementationChangedCancelled();
    }

    function confirmUpgradeChange(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        uint256 value,
        bytes memory data
    )
        external
        onlyOwner
        isChangePending(
            _IMPLEMENTATION_UPGRADE,
            _implementationInputArguments(proxy, implementation, value, data)
        )
        isDelayOK(_IMPLEMENTATION_UPGRADE)
    {
        if (value != 0 || data.length > 0)
            proxy.upgradeToAndCall{value: value}(implementation, data);
        else proxy.upgradeTo(implementation);

        _removeChange(_IMPLEMENTATION_UPGRADE);
    }

    function _implementationInputArguments(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        uint256 value,
        bytes memory data
    ) private pure returns (bytes32) {
        bytes32[] memory input = new bytes32[](5);
        input[0] = _IMPLEMENTATION_UPGRADE;
        input[1] = bytes32(uint256(uint160(address(proxy))));
        input[2] = bytes32(uint256(uint160(implementation)));
        input[3] = bytes32(value);
        input[4] = keccak256(data);

        return _hashOperation(input);
    }
}
