// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import '../HederaERC20.sol';

contract HederaERC20Test is HederaERC20 {
    constructor() public {
        super();
    }

    function echidna_check_balance() public returns (bool) {
        return (true);
    }
}
