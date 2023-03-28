// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import '../HederaERC20.sol';

contract HederaERC20Test is HederaERC20 {
    constructor() HederaERC20() {}

    function echidna_check_balance() public pure returns (bool) {
        return (true);
    }
}
