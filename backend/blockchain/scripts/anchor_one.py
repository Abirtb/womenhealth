"""
One-off: anchor a bytes32 on Sepolia (run from backend folder).

  cd backend
  set SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
  set SEPOLIA_PRIVATE_KEY=0x...
  set PROVENANCE_CONTRACT=0x...
  py -3.12 blockchain/scripts/anchor_one.py 0x0123456789abcdef...64hex

Requires: pip install web3
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env")

sys.path.insert(0, str(_ROOT))

if __name__ == "__main__":
    from blockchain.sepolia_client import anchor_hash_hex

    if len(sys.argv) != 2:
        print("Usage: py anchor_one.py 0x<64 hex bytes32>")
        sys.exit(1)
    h = anchor_hash_hex(sys.argv[1])
    print("tx:", h)
