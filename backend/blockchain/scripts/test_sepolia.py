"""
Load backend/.env, verify RPC + contract, optionally send one anchor tx.

  cd backend
  python -m pip install -r requirements.txt
  python blockchain/scripts/test_sepolia.py          # read-only checks
  python blockchain/scripts/test_sepolia.py anchor # send anchor (uses gas)
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env")


def main() -> None:
    from web3 import Web3

    rpc = os.environ.get("SEPOLIA_RPC_URL", "").strip()
    contract_addr = os.environ.get("PROVENANCE_CONTRACT", "").strip()
    key = os.environ.get("SEPOLIA_PRIVATE_KEY", "").strip()
    if not key.startswith("0x") and len(key) == 64:
        key = "0x" + key

    if not rpc or not contract_addr:
        print("Missing SEPOLIA_RPC_URL or PROVENANCE_CONTRACT in backend/.env")
        sys.exit(1)

    w3 = Web3(Web3.HTTPProvider(rpc))
    if not w3.is_connected():
        print("FAIL: cannot connect to SEPOLIA_RPC_URL")
        sys.exit(1)

    cid = w3.eth.chain_id
    print("OK: connected. chain_id =", cid, "(expect 11155111 for Sepolia)")
    if cid != 11155111:
        print("WARN: not Sepolia — switch RPC/network.")

    code = w3.eth.get_code(Web3.to_checksum_address(contract_addr))
    print("OK: contract bytecode length =", len(code), "(0 means wrong address)")
    if len(code) < 10:
        print("FAIL: no contract at PROVENANCE_CONTRACT")
        sys.exit(1)

    if key:
        acct = w3.eth.account.from_key(key)
        bal = w3.eth.get_balance(acct.address)
        print("OK: signer", acct.address, "balance_wei =", bal)
        if bal == 0:
            print("WARN: zero balance — fund Sepolia from a faucet before anchor tx.")

    if len(sys.argv) > 1 and sys.argv[1] == "anchor":
        if not key:
            print("FAIL: SEPOLIA_PRIVATE_KEY needed for anchor")
            sys.exit(1)
        from blockchain.sepolia_client import anchor_hash_hex
        import secrets

        h = "0x" + secrets.token_hex(32)
        print("Anchoring random bytes32:", h)
        txh = anchor_hash_hex(h)
        print("OK: tx submitted:", txh)
        print("View on https://sepolia.etherscan.io/tx/" + txh[2:])
    else:
        print('Tip: run with "anchor" to submit one test anchor() tx (costs test ETH).')


if __name__ == "__main__":
    main()
