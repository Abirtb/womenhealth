"""
Future on-chain food traceability module.

This package defines interfaces only. Production work might anchor:
- farm origin attestation
- cold-chain / transport events
- organic or safety certifications

Implementation options later: Hyperledger Fabric, Polygon / L2 for proofs, or
merkle batches written by a trusted notary service.
"""

from __future__ import annotations

import hashlib
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Protocol


def _canonical_hash(payload: dict) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(blob).hexdigest()


@dataclass(frozen=True)
class ProvenanceRecord:
    food_item_id: str
    farm_origin_hash: str
    transport_hash: str
    certification_hash: str
    anchor_tx_id: str | None = None


class TraceabilityWriter(Protocol):
    def write_provenance(self, record: ProvenanceRecord) -> str:
        """Persist provenance; return public reference id."""
        ...


class TraceabilityReader(Protocol):
    def verify(self, reference_id: str) -> bool:
        """Return True if hashes verify against stored anchor."""
        ...


class InMemoryTraceabilityAdapter(TraceabilityWriter, TraceabilityReader):
    """Placeholder backing store for local development."""

    def __init__(self) -> None:
        self._ledger: dict[str, ProvenanceRecord] = {}

    def write_provenance(self, record: ProvenanceRecord) -> str:
        reference = _canonical_hash(
            {
                "food": record.food_item_id,
                "farm": record.farm_origin_hash,
                "transport": record.transport_hash,
                "cert": record.certification_hash,
            }
        )
        self._ledger[reference] = record
        return reference

    def verify(self, reference_id: str) -> bool:
        return reference_id in self._ledger


class BlockchainTraceClient(ABC):
    """Swap InMemoryTraceabilityAdapter with this in production."""

    @abstractmethod
    def anchor_batch(self, records: list[ProvenanceRecord]) -> str:
        raise NotImplementedError

    @abstractmethod
    def fetch_proof(self, reference_id: str) -> dict:
        raise NotImplementedError
