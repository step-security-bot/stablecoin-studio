// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

abstract contract TimeDelayGeneric {
    bytes32 private constant _TIME_DELAY = keccak256('TIME_DELAY');
    uint256 private _delay;
    mapping(bytes32 => uint256) private _timestamps;
    mapping(bytes32 => bytes32) private _pendingOperations;

    event TimeDelayChangedStarted(uint256 previousDelay, uint256 newDelay);
    event TimeDelayChangedPerformed();
    event TimeDelayChangedCancelled();

    error DelayNOK();
    error ChangeNotPending();

    // modifier checking that there is a pending change
    modifier isChangePending(bytes32 pendingOp, bytes32 hash) {
        _checkPendingChange(pendingOp, hash);
        _;
    }

    function _checkPendingChange(
        bytes32 pendingOp,
        bytes32 hash
    ) internal view {
        if (_pendingOperations[pendingOp] != hash) revert ChangeNotPending();
    }

    // modifier checking that the delay has expired
    modifier isDelayOK(bytes32 pendingOp) {
        _checkDelay(pendingOp);
        _;
    }

    function _checkDelay(bytes32 pendingOp) internal view {
        if (
            block.timestamp <
            _timestamps[_pendingOperations[pendingOp]] + _delay
        ) revert DelayNOK();
    }

    constructor(uint256 initialDelay) {
        _delay = initialDelay;
    }

    // retrieve current delay
    function getDelay() external view returns (uint256) {
        return (_delay);
    }

    // calculate delay input
    function _delayInputArguments(
        uint256 newDelay
    ) internal pure returns (bytes32) {
        bytes32[] memory input = new bytes32[](2);
        input[0] = _TIME_DELAY;
        input[1] = bytes32(newDelay);

        return _hashOperation(input);
    }

    // request, confirm and cancel delay changes
    function _confirmDelayChange(
        uint256 newDelay
    )
        internal
        isChangePending(_TIME_DELAY, _delayInputArguments(newDelay))
        isDelayOK(_TIME_DELAY)
    {
        _delay = newDelay;
        _removeChange(_TIME_DELAY);
        emit TimeDelayChangedPerformed();
    }

    function _requestDelayChange(uint256 newDelay) internal {
        _addChange(_TIME_DELAY, _delayInputArguments(newDelay));
        emit TimeDelayChangedStarted(_delay, newDelay);
    }

    function _cancelDelayChange() internal {
        _removeChange(_TIME_DELAY);
        emit TimeDelayChangedCancelled();
    }

    // Add and remove changes
    function _addChange(bytes32 pendingOp, bytes32 hash) internal {
        _pendingOperations[pendingOp] = hash;
        _timestamps[hash] = block.timestamp;
    }

    function _removeChange(bytes32 pendingOp) internal {
        bytes32 opHash = _pendingOperations[pendingOp];

        if (opHash == bytes32(0)) return;

        delete (_timestamps[opHash]);
        delete (_pendingOperations[pendingOp]);
    }

    // hashing
    function _hashOperation(
        bytes32[] memory inputArguments
    ) internal pure returns (bytes32 hash) {
        return keccak256(abi.encode(inputArguments));
    }
}
