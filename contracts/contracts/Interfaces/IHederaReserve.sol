// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

interface IHederaReserve is AggregatorV3Interface {

    event ReserveInitialized(int256 initialReserve);

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function set(int256 newValue) external;

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(address admin) external;
}
