// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

abstract contract TimeDelay {
    uint256 private _delay;
    uint256 private _pendingDelay;
    uint256 private _pendingDelayTimestamp;

    event TimeDelayChangedStarted(uint256 previousDelay, uint256 newDelay);
    event TimeDelayChanged(uint256 previousDelay, uint256 newDelay);
    event TimeDelayChangedCancelled(uint256 previousDelay, uint256 newDelay);

    error DelayNOK(uint256 timestamp, uint256 delay);
    error ChangeNotPending();

    // modifier checking that the delay has expired
    modifier isDelayOK(uint256 timestamp) {
        _checkDelay(timestamp);
        _;
    }

    // modifier checking that there is a pending change
    modifier isChangePending(uint256 timestamp) {
        _checkPendingChange(timestamp);
        _;
    }

    // check delay functions
    function _checkDelay(uint256 timestamp) internal view {
        if (!_isDelayOK(timestamp)) revert DelayNOK(timestamp, _delay);
    }

    function _isDelayOK(uint256 timestamp) internal view returns (bool) {
        return (block.timestamp >= timestamp + _delay);
    }

    // check pending changes
    function _checkPendingChange(uint256 timestamp) internal pure {
        if (!_isChangePending(timestamp)) revert ChangeNotPending();
    }

    function _isChangePending(uint256 timestamp) internal pure returns (bool) {
        return (timestamp != 0);
    }

    // retrieve pending changes
    function getPendingDelayChange() external view returns (uint256, uint256) {
        return (_pendingDelay, _pendingDelayTimestamp);
    }

    // retrieve current delay
    function getDelay() external view returns (uint256) {
        return (_delay);
    }

    // request, confirm and cancel delay changes
    function _confirmDelayChange()
        internal
        isChangePending(_pendingDelayTimestamp)
        isDelayOK(_pendingDelayTimestamp)
    {
        uint256 previousDelay = _delay;
        _delay = _pendingDelay;
        _removePendingDelay();
        emit TimeDelayChanged(previousDelay, _delay);
    }

    function _requestDelayChange(uint256 newDelay) internal {
        _pendingDelay = newDelay;
        _pendingDelayTimestamp = block.timestamp;
        emit TimeDelayChangedStarted(_delay, newDelay);
    }

    function _cancelDelayChange() internal {
        uint256 pendingDelay = _pendingDelay;
        _removePendingDelay();
        emit TimeDelayChangedCancelled(_delay, pendingDelay);
    }

    // remove pending changes
    function _removePendingDelay() private {
        delete (_pendingDelay);
        delete (_pendingDelayTimestamp);
    }
}
