// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

interface IReserve {
    /**
    * @dev Emitted when the address for the reserve is changed
    *
    * @param previousAddress The previous reserve address
    * @param newAddress The new reserve address
    */  
    event ReserveAddressChanged(address previousAddress, address newAddress);
    
    /**
     * @dev Changes the current reserve
     * 
     * @param newAddress The new reserve address
     */
    function updateReserve(address newAddress) external;
}