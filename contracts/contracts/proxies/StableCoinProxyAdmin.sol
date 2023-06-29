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
import {TimeDelay} from './TimeDelay.sol';

contract StableCoinProxyAdmin is Ownable, ProxyAdmin, Ownable2Step, TimeDelay {
    // pending admin changes
    address private _pendingAdmin;
    ITransparentUpgradeableProxy private _pendingAdminProxy;
    uint256 private _pendingAdminTimestamp;

    // pending implementation changes
    address private _pendingImplementation;
    bytes private _pendingImplementationData;
    uint256 private _pendingImplementationValue;
    ITransparentUpgradeableProxy private _pendingImplementationProxy;
    uint256 private _pendingImplementationTimestamp;

    // events for pending admin chnages
    event AdminChangedStarted(
        ITransparentUpgradeableProxy indexed proxy,
        address previousAdmin,
        address newAdmin
    );
    event AdminChangedCancelled(
        ITransparentUpgradeableProxy indexed proxy,
        address previousAdmin,
        address newAdmin
    );

    // events for pending implementation chnages
    event ImplementationChangedStarted(
        ITransparentUpgradeableProxy indexed proxy,
        address previousImplementation,
        address newImplementation,
        uint256 value,
        bytes data
    );
    event ImplementationChangedCancelled(
        ITransparentUpgradeableProxy indexed proxy,
        address previousImplementation,
        address newImplementation,
        uint256 value,
        bytes data
    );

    constructor(address initialOwner, uint256 initialDelay) Ownable2Step() {
        _transferOwnership(initialOwner);
        _requestDelayChange(initialDelay);
        _confirmDelayChange();
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

    // Update time Delay
    function requestDelayChange(uint256 newDelay) external onlyOwner {
        _requestDelayChange(newDelay);
    }

    function cancelDelayChange() external onlyOwner {
        _cancelDelayChange();
    }

    function confirmDelayChange() external onlyOwner {
        _confirmDelayChange();
    }

    // Update Admin change
    function getPendingAdminChange()
        external
        view
        returns (ITransparentUpgradeableProxy, address, uint256)
    {
        return (_pendingAdminProxy, _pendingAdmin, _pendingAdminTimestamp);
    }

    function changeProxyAdmin(
        ITransparentUpgradeableProxy proxy,
        address newAdmin
    ) public override(ProxyAdmin) onlyOwner {
        _pendingAdmin = newAdmin;
        _pendingAdminProxy = proxy;
        _pendingAdminTimestamp = block.timestamp;
        emit AdminChangedStarted(proxy, getProxyAdmin(proxy), newAdmin);
    }

    function cancelProxyAdminChange() external onlyOwner {
        ITransparentUpgradeableProxy proxy = _pendingAdminProxy;
        address pendingAdmin = _pendingAdmin;

        _removePendingAdmin();

        emit AdminChangedCancelled(proxy, getProxyAdmin(proxy), pendingAdmin);
    }

    function confirmProxyAdminChange()
        external
        onlyOwner
        isChangePending(_pendingAdminTimestamp)
        isDelayOK(_pendingAdminTimestamp)
    {
        _pendingAdminProxy.changeAdmin(_pendingAdmin);
        _removePendingAdmin();
    }

    function _removePendingAdmin() private {
        delete (_pendingAdmin);
        delete (_pendingAdminProxy);
        delete (_pendingAdminTimestamp);
    }

    // Update Implementation change
    function getPendingImplementationChange()
        external
        view
        returns (
            ITransparentUpgradeableProxy,
            address,
            uint256,
            bytes memory,
            uint256
        )
    {
        return (
            _pendingImplementationProxy,
            _pendingImplementation,
            _pendingImplementationValue,
            _pendingImplementationData,
            _pendingImplementationTimestamp
        );
    }

    function upgrade(
        ITransparentUpgradeableProxy proxy,
        address implementation
    ) public override(ProxyAdmin) onlyOwner {
        _setNewImplementation(proxy, implementation, 0, '');
    }

    function upgradeAndCall(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        bytes memory data
    ) public payable override(ProxyAdmin) onlyOwner {
        _setNewImplementation(proxy, implementation, msg.value, data);
    }

    function _setNewImplementation(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        uint256 value,
        bytes memory data
    ) private {
        _pendingImplementation = implementation;
        _pendingImplementationProxy = proxy;
        _pendingImplementationValue = value;
        _pendingImplementationData = data;
        _pendingImplementationTimestamp = block.timestamp;
        emit ImplementationChangedStarted(
            proxy,
            getProxyImplementation(proxy),
            implementation,
            value,
            data
        );
    }

    function cancelUpgradeChange() external onlyOwner {
        ITransparentUpgradeableProxy proxy = _pendingImplementationProxy;
        address pendingImplementation = _pendingImplementation;
        uint256 pendingValue = _pendingImplementationValue;
        bytes memory pendingData = _pendingImplementationData;

        _removePendingUpgrade();

        emit ImplementationChangedCancelled(
            proxy,
            getProxyImplementation(proxy),
            pendingImplementation,
            pendingValue,
            pendingData
        );
    }

    function confirmUpgradeChange()
        external
        onlyOwner
        isChangePending(_pendingImplementationTimestamp)
        isDelayOK(_pendingImplementationTimestamp)
    {
        if (
            _pendingImplementationValue != 0 ||
            _pendingImplementationData.length > 0
        )
            _pendingImplementationProxy.upgradeToAndCall{
                value: _pendingImplementationValue
            }(_pendingImplementation, _pendingImplementationData);
        else _pendingImplementationProxy.upgradeTo(_pendingImplementation);

        _removePendingUpgrade();
    }

    function _removePendingUpgrade() private {
        delete (_pendingImplementation);
        delete (_pendingImplementationProxy);
        delete (_pendingImplementationValue);
        delete (_pendingImplementationData);
        delete (_pendingImplementationTimestamp);
    }
}
