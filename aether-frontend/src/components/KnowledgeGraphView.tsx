"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface NodeData {
  id: string;
  label: string;
  type: "threat-actor" | "ipv4" | "pgp" | "wallet" | "darknet" | "hash";
  subtext: string;
  confidence: string;
  color: string;
  hexColor: number;
  details: Record<string, string>;
  pos: [number, number, number];
}

interface EdgeData {
  from: string;
  to: string;
  label: string;
  proof: string;
  isDeterministic: boolean;
  color: number;
}

const NODES: NodeData[] = [
  {
    id: "actor-1",
    label: "ZeroTrace (APT-091)",
    type: "threat-actor",
    subtext: "Primary Ransomware Operator",
    confidence: "94.8%",
    color: "#f87171",
    hexColor: 0xf87171,
    details: {
      "Threat Category": "Cybercrime Syndicate / Ransomware Cartel",
      "Observed Active": "2023-Present (Dread, Exploit.in)",
      "Targeted Sectors": "Critical Infrastructure, Finance, Defense",
      "STIX 2.1 Type": "threat-actor--7f3b8112-a8ce",
    },
    pos: [0, 0, 0],
  },
  {
    id: "alias-1",
    label: "ShadowByte",
    type: "threat-actor",
    subtext: "Rebranded Access Broker Alias",
    confidence: "93.4%",
    color: "#fb7185",
    hexColor: 0xfb7185,
    details: {
      "Stylometry Cosine": "0.934 (Char 3-gram match)",
      "Registered Forum": "exploit.in (Darknet Russian Forum)",
      "First Activity": "2025-11-04 UTC",
    },
    pos: [-46, 28, 22],
  },
  {
    id: "ip-1",
    label: "185.220.101.42",
    type: "ipv4",
    subtext: "Clearnet Apache Origin Server",
    confidence: "99.2%",
    color: "#38bdf8",
    hexColor: 0x38bdf8,
    details: {
      "Geolocation": "Munich, Bavaria, Germany",
      "Autonomous System": "AS16276 OVH SAS",
      "Discovery Vector": "Favicon MurmurHash3 -129482710 + /server-status leak",
      "JARM Fingerprint": "29d29d00029d29d00029d29d29d29d2f2d93e1b7",
    },
    pos: [48, 30, -20],
  },
  {
    id: "pgp-1",
    label: "4D9E 27BC ... F980",
    type: "pgp",
    subtext: "40-char RSA 4096-bit Public Key",
    confidence: "100.0%",
    color: "#4ade80",
    hexColor: 0x4ade80,
    details: {
      "Fingerprint": "4D9E27BC918A4F02C73109AE2C5B88E140FA7D3C",
      "Key Algorithm": "RSA 4096-bit / PGP Signature",
      "Proof Type": "Deterministic Cryptographic Match across Dread & Exploit",
    },
    pos: [-42, -32, 28],
  },
  {
    id: "btc-1",
    label: "1A1zP1...Cluster",
    type: "wallet",
    subtext: "Bitcoin Peel Root (14 Addresses)",
    confidence: "88.5%",
    color: "#fbbf24",
    hexColor: 0xfbbf24,
    details: {
      "Root Wallet": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "Clustered Volume": "38.45 BTC ($2.48M USD)",
      "Co-spend Heuristic": "Multi-Input Common Ownership",
      "Known Off-Ramp": "VASP Exchange Deposit Subpoena Pending",
    },
    pos: [44, -30, 32],
  },
  {
    id: "onion-1",
    label: "dreadmarket.onion",
    type: "darknet",
    subtext: "Tor Hidden Service (V3)",
    confidence: "98.0%",
    color: "#c084fc",
    hexColor: 0xc084fc,
    details: {
      "Onion Address": "http://p4lx7e22kq6dreadmarket.onion",
      "Consensus Routing": "Tor SOCKS5 Proxy 127.0.0.1:9050",
      "Server Banner": "Apache/2.4.52 (Debian)",
    },
    pos: [-65, 6, -34],
  },
  {
    id: "hash-1",
    label: "mmh3: -129482710",
    type: "hash",
    subtext: "Shodan Favicon Hash Match",
    confidence: "99.0%",
    color: "#22d3ee",
    hexColor: 0x22d3ee,
    details: {
      "MurmurHash3": "-129482710",
      "Icon File": "favicon.ico (25,931 bytes)",
      "Clearnet Correlation": "Direct Shodan facet match to 185.220.101.42",
    },
    pos: [65, 8, -36],
  },
];

const EDGES: EdgeData[] = [
  { from: "actor-1", to: "alias-1", label: "STYLOMETRY_SIMILAR", proof: "Cosine 0.934", isDeterministic: false, color: 0xfb7185 },
  { from: "actor-1", to: "ip-1", label: "ORIGIN_EXPOSURE", proof: "Apache Leak", isDeterministic: true, color: 0x38bdf8 },
  { from: "actor-1", to: "pgp-1", label: "DECLARED_KEY", proof: "Deterministic PGP", isDeterministic: true, color: 0x4ade80 },
  { from: "alias-1", to: "pgp-1", label: "REUSES_KEY", proof: "Deterministic PGP", isDeterministic: true, color: 0x4ade80 },
  { from: "actor-1", to: "btc-1", label: "EXTORTION_ROOT", proof: "Co-spent Cluster", isDeterministic: true, color: 0xfbbf24 },
  { from: "actor-1", to: "onion-1", label: "ADMINISTRATES", proof: "Darknet Marketplace", isDeterministic: true, color: 0xc084fc },
  { from: "ip-1", to: "hash-1", label: "FAVICON_MATCH", proof: "MurmurHash3", isDeterministic: true, color: 0x22d3ee },
  { from: "onion-1", to: "hash-1", label: "SERVES_ICON", proof: "Binary MD5 Hash", isDeterministic: true, color: 0x38bdf8 },
];

import { InvestigationResult } from "@/lib/api";

interface KnowledgeGraphViewProps {
  investigation?: InvestigationResult | null;
  onShowToast: (title: string, message: string) => void;
  onOpenEvidence: () => void;
}

// Generate high-resolution crisp 2D canvas texture for 3D billboard sprites
function makeLabelSprite(node: NodeData, isSelected: boolean): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background badge
    ctx.fillStyle = isSelected ? "rgba(30, 41, 59, 0.95)" : "rgba(10, 14, 23, 0.88)";
    ctx.strokeStyle = isSelected ? "#ffffff" : node.color;
    ctx.lineWidth = isSelected ? 4 : 2;

    const r = 8;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Primary Text Label
    ctx.font = "bold 32px 'JetBrains Mono', monospace";
    ctx.fillStyle = isSelected ? "#ffffff" : "#f1f5f9";
    ctx.textAlign = "center";
    ctx.fillText(node.label, canvas.width / 2, 54);

    // Subtitle Text
    ctx.font = "20px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = isSelected ? "#cbd5e1" : "#94a3b8";
    ctx.fillText(node.subtext, canvas.width / 2, 94);

    // Confidence Tag
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.fillStyle = node.color;
    ctx.fillText(`CONFIDENCE: ${node.confidence}`, canvas.width / 2, 122);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(19, 5.2, 1);
  return sprite;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  investigation,
  onShowToast,
  onOpenEvidence,
}) => {
  const activeNodes: NodeData[] = React.useMemo(() => {
    if (!investigation?.graph?.nodes || investigation.graph.nodes.length === 0) {
      return NODES;
    }
    const rawNodes = investigation.graph.nodes;
    const count = rawNodes.length;

    const typeMap: Record<string, NodeData["type"]> = {
      "threat-actor": "threat-actor",
      "ThreatActor": "threat-actor",
      "Alias": "threat-actor",
      "ipv4": "ipv4",
      "IPv4Address": "ipv4",
      "pgp": "pgp",
      "PGPFingerprint": "pgp",
      "wallet": "wallet",
      "CryptoWallet": "wallet",
      "darknet": "darknet",
      "hash": "hash",
      "domain": "darknet",
    };

    const colorMap: Record<string, string> = {
      "threat-actor": "#f87171",
      "ipv4": "#38bdf8",
      "pgp": "#4ade80",
      "wallet": "#fbbf24",
      "darknet": "#c084fc",
      "hash": "#22d3ee",
    };

    return rawNodes.map((n, idx) => {
      const isCentral = idx === 0 || n.type === "threat-actor" || n.type === "ThreatActor";
      const angle = (idx / Math.max(count - 1, 1)) * Math.PI * 2;
      const dist = isCentral ? 0 : 45 + (idx % 3) * 12;
      const posX = isCentral ? 0 : Math.cos(angle) * dist;
      const posY = isCentral ? 0 : Math.sin(angle) * (dist * 0.6) + (idx % 2 === 0 ? 15 : -15);
      const posZ = isCentral ? 0 : idx % 2 === 0 ? 25 : -25;

      const mappedType = typeMap[n.type] || "darknet";
      const nodeColor = (n.metadata && n.metadata.color) || colorMap[mappedType] || "#38bdf8";
      const hexColor = parseInt(nodeColor.replace("#", ""), 16) || 0x38bdf8;

      return {
        id: n.id,
        label: n.label,
        type: mappedType,
        subtext: (n.metadata && n.metadata.subtext) || `${mappedType.toUpperCase()} Node`,
        confidence: (n.metadata && n.metadata.confidence) || "95.0%",
        color: nodeColor,
        hexColor,
        details: {
          "Entity Category": n.type,
          "Identifier": n.id,
          "Label / Value": n.label,
          "Case Reference": investigation?.case?.evidence_id || "AT-2026-0047",
        },
        pos: [posX, posY, posZ] as [number, number, number],
      };
    });
  }, [investigation]);

  const activeEdges: EdgeData[] = React.useMemo(() => {
    if (!investigation?.graph?.edges || investigation.graph.edges.length === 0) {
      return EDGES;
    }
    return investigation.graph.edges.map((e) => ({
      from: e.source,
      to: e.target,
      label: e.relationship,
      proof: e.deterministic ? "Deterministic Cryptographic Link" : "Probabilistic NLP/Circadian Lead",
      isDeterministic: e.deterministic,
      color: e.deterministic ? 0x38bdf8 : 0xfb7185,
    }));
  }, [investigation]);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData>(activeNodes[0]);
  const [filterType, setFilterType] = useState<string>("all");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  useEffect(() => {
    if (activeNodes.length > 0) {
      setSelectedNode(activeNodes[0]);
    }
  }, [activeNodes]);


  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const labelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());

  // 1. Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene - Pure Pitch Black Cybernetic Space
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 45, 140);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 250;
    controls.minDistance = 35;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.65;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 300);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xf87171, 2.5, 250);
    redLight.position.set(-60, -30, -40);
    scene.add(redLight);

    // 2. Create 3D Nodes
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const labelSprites = new Map<string, THREE.Sprite>();

    activeNodes.forEach((node, idx) => {
      const isCentral = idx === 0 || node.type === "threat-actor";
      const radius = isCentral ? 5.5 : 3.8;

      // Node Geometry (Spherical or Faceted)
      const geo = isCentral
        ? new THREE.SphereGeometry(radius, 32, 32)
        : new THREE.IcosahedronGeometry(radius, 2);

      const mat = new THREE.MeshStandardMaterial({
        color: node.hexColor,
        emissive: node.hexColor,
        emissiveIntensity: isCentral ? 0.75 : 0.5,
        roughness: 0.3,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.pos);
      mesh.userData = { nodeId: node.id, nodeData: node };
      scene.add(mesh);
      nodeMeshes.set(node.id, mesh);

      // Outer Halo Wireframe for Central Core
      if (isCentral) {
        const haloGeo = new THREE.SphereGeometry(radius * 1.5, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xf87171,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.name = "halo";
        haloMesh.raycast = () => {}; // Prevent halo from intercepting raycasts
        mesh.add(haloMesh);
      }

      // Billboard Text Sprite above Node
      const sprite = makeLabelSprite(node, node.id === selectedNode.id);
      sprite.position.set(node.pos[0], node.pos[1] + (isCentral ? 9.5 : 8), node.pos[2]);
      scene.add(sprite);
      labelSprites.set(node.id, sprite);
    });

    nodeMeshesRef.current = nodeMeshes;
    labelSpritesRef.current = labelSprites;

    // 3. Create 3D Edges and Animated Flow Pulses
    const edgeLinesGroup = new THREE.Group();
    const pulses: { mesh: THREE.Mesh; p1: THREE.Vector3; p2: THREE.Vector3; progress: number; speed: number }[] = [];

    activeEdges.forEach((edge) => {
      const fromNode = activeNodes.find((n) => n.id === edge.from);
      const toNode = activeNodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;


      const p1 = new THREE.Vector3(...fromNode.pos);
      const p2 = new THREE.Vector3(...toNode.pos);

      // Line conduit geometry
      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: edge.color,
        transparent: true,
        opacity: edge.isDeterministic ? 0.65 : 0.35,
        linewidth: 1.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { from: edge.from, to: edge.to, defaultOpacity: lineMat.opacity };
      edgeLinesGroup.add(line);

      // Animated traveling data pulse
      const pulseGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: edge.color });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulseMesh);

      pulses.push({
        mesh: pulseMesh,
        p1,
        p2,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.005,
      });
    });

    scene.add(edgeLinesGroup);

    // 4. Raycasting Setup for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshes.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const targetObj = intersects[0].object;
        const hitNode = (targetObj.userData?.nodeData || targetObj.parent?.userData?.nodeData) as NodeData | undefined;

        if (hitNode && hitNode.id) {
          container.style.cursor = "pointer";
          setHoveredNode(hitNode);

          // Highlight connected edges, dim others
          edgeLinesGroup.children.forEach((obj) => {
            const l = obj as THREE.Line;
            const lMat = l.material as THREE.LineBasicMaterial;
            const isConnected = l.userData?.from === hitNode.id || l.userData?.to === hitNode.id;
            lMat.opacity = isConnected ? 0.95 : 0.15;
          });
          return;
        }
      }

      container.style.cursor = "grab";
      setHoveredNode(null);
      // Reset edge opacity
      edgeLinesGroup.children.forEach((obj) => {
        const l = obj as THREE.Line;
        const lMat = l.material as THREE.LineBasicMaterial;
        lMat.opacity = l.userData?.defaultOpacity ?? 0.5;
      });
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshes.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const targetObj = intersects[0].object;
        const hitNode = (targetObj.userData?.nodeData || targetObj.parent?.userData?.nodeData) as NodeData | undefined;
        if (hitNode && hitNode.id) {
          setSelectedNode(hitNode);
          onShowToast("Node Focused", `3D target locked: ${hitNode.label} (${hitNode.confidence})`);
        }
      }
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("click", handlePointerDown);

    // 5. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Controls update
      controls.update();

      // Rotate central halo
      const central = nodeMeshes.get("actor-1");
      if (central) {
        const halo = central.getObjectByName("halo");
        if (halo) {
          halo.rotation.y += delta * 0.4;
          halo.rotation.x += delta * 0.2;
        }
      }

      // Update edge data pulse positions
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        p.mesh.position.lerpVectors(p.p1, p.p2, p.progress);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on Unmount (Recursive WebGL Resource Disposal)
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("click", handlePointerDown);
      cancelAnimationFrame(animationFrameId);

      // Recursively dispose all scene geometries, materials, and textures
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite || obj instanceof THREE.Line) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => {
                if (m.map) m.map.dispose();
                m.dispose();
              });
            } else {
              if (obj.material.map) obj.material.map.dispose();
              obj.material.dispose();
            }
          }
        }
      });

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeNodes, activeEdges]);

  // Update Controls AutoRotate state when changed
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update Node highlighting & Sprite textures when selectedNode changes
  useEffect(() => {
    activeNodes.forEach((node) => {
      const sprite = labelSpritesRef.current.get(node.id);
      if (sprite) {
        const isSelected = node.id === selectedNode.id;
        const oldMat = sprite.material;
        const newSprite = makeLabelSprite(node, isSelected);
        sprite.material = newSprite.material;

        // Dispose previous material and texture to prevent GPU memory leak
        if (oldMat) {
          if (oldMat.map) oldMat.map.dispose();
          oldMat.dispose();
        }
      }
    });

    // Smoothly pan camera target toward selected node
    if (controlsRef.current) {
      const targetPos = new THREE.Vector3(...selectedNode.pos);
      controlsRef.current.target.lerp(targetPos, 0.4);
    }
  }, [selectedNode, activeNodes]);

  // Filter nodes visibility
  useEffect(() => {
    nodeMeshesRef.current.forEach((mesh, id) => {
      const node = activeNodes.find((n) => n.id === id);
      const sprite = labelSpritesRef.current.get(id);
      if (!node) return;

      const isMatch = filterType === "all" || node.type === filterType;
      mesh.visible = isMatch;
      if (sprite) sprite.visible = isMatch;
    });
  }, [filterType, activeNodes]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 45, 140);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      onShowToast("Camera Reset", "Restored default 3D forensic orbital vantage.");
    }
  };

  const handleCopyCypher = () => {
    const cypher = `MATCH (a:ThreatActor {name: "${selectedNode.label}"})\nRETURN a;`;
    navigator.clipboard.writeText(cypher);
    onShowToast("Cypher Exported", "Neo4j query copied to clipboard.");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header Card */}
      <div className="matte-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#141a24] text-slate-300 border border-[#263245]">
              STAGE 02
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>3D Forensic Knowledge Graph</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 bg-[#162233] text-cyan-400 border border-[#253954]">
                THREE.JS WebGL
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial 3D threat actor attribution matrix with real-time orbit controls, raycasting, and pulse conduits.
          </p>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {["all", "threat-actor", "ipv4", "pgp", "wallet"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 font-mono uppercase text-[11px] transition border ${
                filterType === t
                  ? "bg-[#1e2736] text-white border-[#3d4c66] font-bold"
                  : "bg-[#10141d] text-slate-400 hover:text-slate-200 border-[#222b3a]"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={onOpenEvidence}
            className="px-3 py-1 bg-[#162338] text-blue-300 border border-[#2d436b] hover:bg-[#1f304d] transition text-[11px] font-bold flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus text-[10px]"></i> Add Anchor
          </button>
        </div>
      </div>

      {/* Main 3D Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Three.js 3D WebGL Canvas (2 Columns) */}
        <div className="lg:col-span-2 matte-card p-4 relative overflow-hidden flex flex-col">
          {/* HUD Top Bar */}
          <div className="flex justify-between items-center pb-3 border-b border-[#1e2533] text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Spatial Engine // 7 Nodes &bull; 8 Conduits
              </span>
              {hoveredNode && (
                <span className="text-cyan-300 hidden sm:inline">
                  &bull; Hover: <strong className="text-white">{hoveredNode.label}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`px-2.5 py-1 text-[10px] font-bold transition border ${
                  autoRotate
                    ? "bg-[#16253b] text-cyan-300 border-[#2d466b]"
                    : "bg-[#10141d] text-slate-400 border-[#222b3a]"
                }`}
                title="Toggle ambient 3D orbit rotation"
              >
                <i className="fa-solid fa-rotate text-[10px] mr-1"></i> Auto-Spin: {autoRotate ? "ON" : "OFF"}
              </button>
              <button
                onClick={handleResetCamera}
                className="px-2.5 py-1 bg-[#10141d] hover:bg-[#1a212e] text-slate-300 border border-[#222b3a] text-[10px] font-bold transition"
                title="Reset 3D camera to default vantage"
              >
                <i className="fa-solid fa-crosshairs text-[10px] mr-1"></i> Center
              </button>
            </div>
          </div>

          {/* Canvas Mount Container */}
          <div
            ref={mountRef}
            className="relative w-full h-[520px] bg-[#000000] border border-[#161f2e] mt-3 overflow-hidden select-none"
          >
            {/* Quick 3D Interaction Instructions Overlay */}
            <div className="absolute bottom-3 left-3 bg-[#0a0e17]/85 border border-[#1f293d] px-3 py-1.5 text-[10px] font-mono text-slate-400 pointer-events-none z-10 flex items-center gap-3">
              <span><strong className="text-slate-200">Left Drag:</strong> Rotate 360°</span>
              <span><strong className="text-slate-200">Scroll:</strong> Zoom</span>
              <span><strong className="text-slate-200">Right Drag:</strong> Pan</span>
              <span><strong className="text-slate-200">Click Node:</strong> Lock Focus</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Panel (1 Column) */}
        <div className="matte-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[#1e2533]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Entity Inspector
              </h3>
              <span
                className="text-[11px] font-mono px-2 py-0.5 border"
                style={{
                  color: selectedNode.color,
                  borderColor: selectedNode.color + "44",
                  backgroundColor: selectedNode.color + "11",
                }}
              >
                Confidence: {selectedNode.confidence}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                Target Entity
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">{selectedNode.label}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedNode.subtext}</p>
            </div>

            {/* Attributes Table */}
            <div className="mt-4 space-y-2.5 text-xs font-mono">
              {Object.entries(selectedNode.details).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-[#090c12] p-2.5 border border-[#1a212d] flex flex-col gap-1"
                >
                  <span className="text-[10px] text-slate-400 uppercase">{key}</span>
                  <span className="text-slate-200 break-all text-[11px] font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-4 border-t border-[#1e2533] space-y-2">
            <button
              onClick={handleCopyCypher}
              className="w-full py-2.5 bg-[#1e2736] hover:bg-[#283448] text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 border border-[#37455d]"
            >
              <i className="fa-solid fa-code text-xs"></i> Copy Neo4j Cypher Query
            </button>
            <button
              onClick={() =>
                onShowToast(
                  "Entity Pivot",
                  `Timeline pivoted to ${selectedNode.label}. Correlated across all STIX bundles.`
                )
              }
              className="w-full py-2 bg-[#121721] hover:bg-[#19212d] text-slate-300 border border-[#232d3d] text-xs font-semibold font-mono transition"
            >
              Pivot Timeline to Entity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
