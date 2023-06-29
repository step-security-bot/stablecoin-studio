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
        address newImplementation
    );
    event ImplementationChangedCancelled(
        ITransparentUpgradeableProxy indexed proxy,
        address previousImplementation,
        address newImplementation
    );

    constructor(address initialOwner, uint256 initialDelay) Ownable2Step() {
        _transferOwnership(initialOwner);
        _requestDelayChange(initialDelay);
        _confirmDelayChange();
    }

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
}
