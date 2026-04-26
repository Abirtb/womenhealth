// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ProvenanceAnchor — hackathon MVP: anchor a keccak256 / bytes32 proof on Sepolia
/// @notice Store a one-time timestamp per hash. food provenance: hash off-chain, anchor hash here.
contract ProvenanceAnchor {
    event Anchored(
        bytes32 indexed provenanceHash,
        uint256 timestamp,
        address indexed sender
    );

    /// @dev provenanceHash -> block timestamp (0 = not anchored)
    mapping(bytes32 => uint256) public anchoredAt;

    /// @notice Anchor a 32-byte hash (use SHA-256 bytes padded or keccak256 of your JSON on backend)
    function anchor(bytes32 provenanceHash) external {
        require(anchoredAt[provenanceHash] == 0, "already anchored");
        anchoredAt[provenanceHash] = block.timestamp;
        emit Anchored(provenanceHash, block.timestamp, msg.sender);
    }

    function isAnchored(bytes32 provenanceHash) external view returns (bool) {
        return anchoredAt[provenanceHash] != 0;
    }

    function timeOf(bytes32 provenanceHash) external view returns (uint256) {
        return anchoredAt[provenanceHash];
    }
}
