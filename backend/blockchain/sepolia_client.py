"""
Call ProvenanceAnchor.anchor() on Sepolia. Used after hackathon deploy.

Env:
  SEPOLIA_RPC_URL       e.g. https://eth-sepolia.g.alchemy.com/v2/KEY
  SEPOLIA_PRIVATE_KEY   0x... (test wallet, never commit)
  PROVENANCE_CONTRACT   0x... deployed ProvenanceAnchor address
"""
from __future__ import annotations

import os
from typing import Any

# Minimal ABI for anchor(bytes32) and anchoredAt(bytes32)
ABI: list[dict[str, Any]] = [
    {
        "inputs": [{"name": "provenanceHash", "type": "bytes32"}],
        "name": "anchor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "", "type": "bytes32"}],
        "name": "anchoredAt",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]


def _client():
    from web3 import Web3

    rpc = os.environ.get("SEPOLIA_RPC_URL", "").strip()
    if not rpc:
        raise OSError("Set SEPOLIA_RPC_URL")
    w3 = Web3(Web3.HTTPProvider(rpc))
    if w3.is_connected() is not True:  # pragma: no cover
        raise ConnectionError("Cannot connect to SEPOLIA_RPC_URL")
    return w3


def anchor_hash_hex(hash_hex: str) -> str:
    """
    hash_hex: 0x + 64 hex chars (32 bytes), e.g. keccak of your payload or sha256 as bytes32.
    Returns transaction hash.
    """
    from web3 import Web3

    key = os.environ.get("SEPOLIA_PRIVATE_KEY", "").strip().strip('"').strip("'")
    contract_addr = os.environ.get("PROVENANCE_CONTRACT", "").strip()
    if not key or not contract_addr:
        raise OSError("Set SEPOLIA_PRIVATE_KEY and PROVENANCE_CONTRACT")
    if not key.startswith("0x") and len(key) == 64:
        key = "0x" + key

    w3 = _client()
    acct = w3.eth.account.from_key(key)
    c = w3.eth.contract(address=Web3.to_checksum_address(contract_addr), abi=ABI)

    h = hash_hex.strip().lower()
    if not h.startswith("0x") or len(h) != 66:
        raise ValueError("hash_hex must be 0x + 64 hex characters (bytes32)")

    tx = c.functions.anchor(bytes.fromhex(h[2:])).build_transaction(
        {
            "from": acct.address,
            "nonce": w3.eth.get_transaction_count(acct.address),
            "gas": 200_000,
            "gasPrice": w3.eth.gas_price,
            "chainId": 11155111,
        }
    )
    signed = w3.eth.account.sign_transaction(tx, private_key=key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    return w3.to_hex(tx_hash)
