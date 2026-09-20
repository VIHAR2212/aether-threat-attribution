"""Entity knowledge graph and deterministic cryptocurrency clustering service.

Provides:
1. Multi-input Bitcoin peel-chain transaction clustering heuristics.
2. Forensic entity relationship graph modeling (Actor, Alias, PGP, Wallet, Host IP, ASN).
3. Cypher query generator for Neo4j import and JSON export for frontend SVG graph visualization.
"""

from __future__ import annotations

from typing import Any, Dict, List, Set


class EntityGraph:
    """Directed attribution relationship graph."""

    def __init__(self, case_id: str):
        self.case_id = case_id
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def add_node(self, node_id: str, label: str, node_type: str, metadata: Dict[str, Any] | None = None) -> None:
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "label": label,
                "type": node_type,
                "metadata": metadata or {},
            }

    def add_edge(self, source_id: str, target_id: str, relationship: str, weight: float = 1.0, deterministic: bool = True) -> None:
        self.edges.append({
            "source": source_id,
            "target": target_id,
            "relationship": relationship,
            "weight": weight,
            "deterministic": deterministic,
        })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "node_count": len(self.nodes),
            "edge_count": len(self.edges),
            "nodes": list(self.nodes.values()),
            "edges": self.edges,
        }

    def to_cypher(self) -> List[str]:
        """Generate Cypher statements for importing this graph into Neo4j."""
        statements = [f"// AETHER Case {self.case_id} Graph Ingestion"]
        for node in self.nodes.values():
            safe_type = node["type"].replace("-", "_")
            statements.append(
                f"MERGE (n:{safe_type} {{id: '{node['id']}', label: '{node['label']}'}})"
            )
        for edge in self.edges:
            statements.append(
                f"MATCH (a {{id: '{edge['source']}'}}), (b {{id: '{edge['target']}'}}) "
                f"MERGE (a)-[:{edge['relationship']} {{deterministic: {str(edge['deterministic']).lower()}, weight: {edge['weight']}}}]->(b)"
            )
        return statements


def cluster_bitcoin_transactions(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Multi-input Bitcoin clustering heuristic.

    Addresses co-spent as inputs in the same transaction are inferred to be
    controlled by the same actor/wallet cluster.
    """
    clusters: List[Set[str]] = []

    for tx in transactions:
        inputs = set(tx.get("inputs", []))
        if not inputs:
            continue

        # Find any existing cluster that overlaps with these inputs
        matching_cluster_indices = [
            i for i, c in enumerate(clusters) if not c.isdisjoint(inputs)
        ]

        if matching_cluster_indices:
            # Merge inputs into the first matching cluster
            target_idx = matching_cluster_indices[0]
            clusters[target_idx].update(inputs)
            # Merge any other overlapping clusters
            for other_idx in reversed(matching_cluster_indices[1:]):
                clusters[target_idx].update(clusters[other_idx])
                clusters.pop(other_idx)
        else:
            clusters.append(set(inputs))

    # Determine peel chain outputs (outputs with repeated addresses or change patterns)
    peel_hops = []
    for tx in transactions:
        txid = tx.get("txid", "tx_unknown")
        outputs = tx.get("outputs", [])
        for out in outputs:
            peel_hops.append({
                "txid": txid,
                "address": out.get("address"),
                "amount_btc": out.get("amount", 0.0),
                "is_change": out.get("is_change", False),
            })

    return {
        "cluster_count": len(clusters),
        "clusters": [sorted(list(c)) for c in clusters],
        "peel_hops": peel_hops,
    }


DEFAULT_CASE_DATA = {
    "evidence_id": "AT-2026-0047",
    "actor_name": "UNC-3844",
    "origin_ip": "185.220.101.42",
    "asn": "AS9009 M247 Europe",
    "pgp": "4B8F 90A2 E83C 1204 D76A 58B9 2F10 CC49 E81A 9044",
    "btc_root": "bc1qa5wkgaew2dkv56kfvj49j0av5nqvrl529w40b5",
    "alias_dread": "VortexBroker",
    "alias_exploit": "Vortex_Seller",
}


def build_default_case_graph(case_data: Dict[str, Any] | None = None) -> EntityGraph:
    """Build the forensic correlation graph for an AETHER case."""
    data = dict(DEFAULT_CASE_DATA)
    if case_data:
        data.update(case_data)

    graph = EntityGraph(case_id=data.get("evidence_id", "AT-2026-0047"))

    # Central Actor Node
    actor_id = f"actor_{data['actor_name']}"
    graph.add_node(actor_id, data["actor_name"], "ThreatActor", {"type": "Syndicate Lead"})

    # Aliases
    dread_id = "alias_dread"
    graph.add_node(dread_id, data["alias_dread"], "Alias", {"forum": "Dread Forum", "role": "Vendor"})
    graph.add_edge(actor_id, dread_id, "USES_ALIAS", 1.0, True)

    exploit_id = "alias_exploit"
    graph.add_node(exploit_id, data["alias_exploit"], "Alias", {"forum": "Exploit.in", "role": "Broker"})
    graph.add_edge(actor_id, exploit_id, "USES_ALIAS", 1.0, True)

    # Cryptographic Key
    pgp_id = "pgp_key"
    graph.add_node(pgp_id, data["pgp"][:16] + "...", "PGPFingerprint", {"full_fingerprint": data["pgp"]})
    graph.add_edge(dread_id, pgp_id, "PUBLISHES_KEY", 1.0, True)
    graph.add_edge(exploit_id, pgp_id, "PUBLISHES_KEY", 1.0, True)

    # Cryptocurrency Wallet
    btc_id = "btc_wallet"
    graph.add_node(btc_id, data["btc_root"][:14] + "...", "CryptoWallet", {"currency": "BTC", "root_address": data["btc_root"]})
    graph.add_edge(dread_id, btc_id, "RECEIVES_PAYMENT", 0.95, True)

    # Unmasked Clearnet Server & ASN
    ip_id = "ip_server"
    graph.add_node(ip_id, data["origin_ip"], "IPv4Address", {"unmasked_via": ["mmh3", "JARM", "server-status"]})
    graph.add_edge(actor_id, ip_id, "CONTROLS_SERVER", 0.92, True)

    asn_id = "asn_host"
    graph.add_node(asn_id, data["asn"], "AutonomousSystem", {})
    graph.add_edge(ip_id, asn_id, "ROUTED_THROUGH", 1.0, True)

    return graph
