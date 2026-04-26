# Hackathon: deploy `ProvenanceAnchor` on Sepolia (step-by-step)

Do this once. Then you can demo “we anchor a provenance hash on Ethereum testnet.”

## 0. What you get

- Smart contract: `contracts/ProvenanceAnchor.sol` — stores a `bytes32` hash with a timestamp (one anchor per hash).
- After deploy: copy the **contract address** and use the Python helper or Remix to call `anchor`.

## 1. Wallet + test ETH (Sepolia)

1. Install **MetaMask** (browser extension).
2. Create a wallet (or use a fresh one for the hackathon).
3. Switch network to **Sepolia** (if missing: *Settings → Networks → Add network* — use [chainlist.org](https://chainlist.org) for Sepolia, chain ID `11155111`).
4. Get free Sepolia ETH from a **faucet** (search “Sepolia faucet”, e.g. Alchemy, Infura, or sepoliafaucet.com). You need a tiny amount for 1–2 transactions.

## 2. RPC URL (Alchemy — 2 minutes)

1. Go to [alchemy.com](https://www.alchemy.com) → sign up.
2. Create an **app** → chain **Ethereum** → network **Sepolia**.
3. Copy **HTTPS** URL. You will use it as `SEPOLIA_RPC_URL`.

## 3. Deploy with Remix (no install — fastest)

1. Open [remix.ethereum.org](https://remix.ethereum.org).
2. File Explorer → create file `ProvenanceAnchor.sol` → paste contents from `blockchain/contracts/ProvenanceAnchor.sol`.
3. **Solidity compiler** (left) → version **0.8.20+** → **Compile** `ProvenanceAnchor.sol`.
4. **Deploy** (left):
   - Environment: **Injected Provider — MetaMask** (Sepolia selected).
5. Click **Deploy** and confirm in MetaMask.
6. **Copy the deployed contract address** (starts with `0x`). This is `PROVENANCE_CONTRACT`.

   **Important:** In Remix, after deploy, copy the address under **“Deployed Contracts”** (or from Etherscan tx type **Contract Creation**).  
   Do **not** use your MetaMask **Account** address — that is a wallet (EOA), not a contract; `get_code` will be empty.

## 4. Environment variables (for Python script / Django later)

In PowerShell (example):

```powershell
$env:SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
$env:SEPOLIA_PRIVATE_KEY = "0x...."   # same MetaMask account → Account details → Export private key (test only!)
$env:PROVENANCE_CONTRACT = "0x...."   # from Remix
```

**Never** commit the private key or put it in GitHub. Use a throwaway test wallet for hackathons.

## 5. Install Python `web3` and run one anchor

```powershell
cd path\to\Nurtura\backend
py -3.12 -m pip install web3
py -3.12 blockchain\scripts\anchor_one.py 0x1111111111111111111111111111111111111111111111111111111111111111
```

(Replace with a real `bytes32` — 64 hex chars after `0x` — e.g. hash your JSON in Django `hashlib` and left-pad to 32 bytes if needed.)

You should see a **transaction hash**; check it on [sepolia.etherscan.io](https://sepolia.etherscan.io).

## 6. Demo story (judges)

1. Off-app: build JSON of farm + batch + cert → `sha256` / `keccak256` → `bytes32`.
2. Call `anchor(bytes32)` once → Etherscan shows the tx and the contract `Anchored` event.
3. `anchoredAt(hash)` in Remix “Read” returns a **timestamp** if anchored.

## Troubleshooting

- **Insufficient funds:** get more Sepolia ETH from a faucet.
- **Wrong network:** MetaMask and Remix must be **Sepolia** (11155111).
- **tx underpriced:** run again; gas on Sepolia is cheap but variable.
