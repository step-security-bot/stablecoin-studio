// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

abstract contract Roles {
    
    // keccak_256("SUPPLIER_ROLE")
    bytes32 public constant SUPPLIER_ROLE = 0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60;

    /**
    * @dev Role to protect rescue token and rescue hbar
    * 
    * keccak256("ROLE_RESCUE");
    */ 
    bytes32 constant ROLE_RESCUE = 0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;
}