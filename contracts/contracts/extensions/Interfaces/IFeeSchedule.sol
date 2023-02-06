// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IFeeSchedule {
    /**
     * @dev Emitted when the KYC is granted to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    //event FeeScheduleAdded(address token, address account);

    /**
     * @dev Emitted when the KYC is revoked to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    //event FeeScheduledRemoved(address token, address account);

    /**
     * @dev Grants KYC to an account for the token
     *
     */
    function addFeeSchedule() external returns (bool);

    /**
     * @dev Revokes KYC to an account for the token
     *
     */
    function removeFeeSchedule() external returns (bool);
}
