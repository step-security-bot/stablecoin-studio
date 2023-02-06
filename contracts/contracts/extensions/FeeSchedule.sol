// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IFeeSchedule.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract FeeSchedule is IFeeSchedule, TokenOwner, Roles {
    /**
     * @dev Grant KYC to account for the token
     *
     */
    function addFeeSchedule()
        external
        override(IFeeSchedule)
        onlyRole(_getRoleId(RoleName.FEESCHEDULE))
        returns (bool)
    {
        require(false, 'Not implemented');
    }

    /**
     * @dev Revoke KYC to account for the token
     *
     */
    function removeFeeSchedule()
        external
        override(IFeeSchedule)
        onlyRole(_getRoleId(RoleName.FEESCHEDULE))
        returns (bool)
    {
        require(false, 'Not implemented');
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
