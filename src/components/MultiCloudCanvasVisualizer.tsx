import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Gauge, Layers } from "lucide-react";

const P = {
  bg: "#040d1e",
  navy: "#071428",
  teal: "#00d4c8",
  cyan: "#00aaff",
  orange: "#ff9900",
  purple: "#9b59f5",
  green: "#2ecc71",
  azure: "#0078d4",
  gcp: "#34a853",
  red: "#e74c3c",
  dim: "rgba(120,140,180,0.4)"
};

interface BoxDef {
  x: number;
  y: number;
  w: number;
  h: number;
  lbl: string;
  sub: string;
  c: string;
  g?: string;
  sec?: boolean;
  dash?: boolean;
  pod?: boolean;
  slim?: boolean;
  bar?: boolean;
}

const B: Record<string, BoxDef> = {
  // IaC top row
  dev:  { x: 10,  y: 10, w: 118, h: 44, lbl: "Code / Dev",   sub: "git push",          c: P.teal,   g: "rgba(0,212,200,.45)" },
  tf:   { x: 138, y: 10, w: 148, h: 44, lbl: "Terraform IaC", sub: "3 cloud providers", c: P.purple, g: "rgba(155,89,245,.45)" },
  mc:   { x: 296, y: 10, w: 162, h: 44, lbl: "Multi-Cloud IaC", sub: "Provision & Manage", c: P.purple, g: "rgba(155,89,245,.45)" },
  
  // Identity bar
  sso:  { x: 10,  y: 64, w: 700, h: 38, lbl: "Identity Management & SSO  ·  Cross-Cloud SAML / OIDC", sub: "", c: P.azure, g: "rgba(0,120,212,.4)", bar: true },
  
  // AWS section
  awsS: { x: 10,  y: 112, w: 264, h: 320, lbl: "AWS Cloud (Primary Region)", sub: "", c: P.orange, g: "rgba(255,153,0,.12)", sec: true },
  vpc:  { x: 20,  y: 132, w: 244, h: 178, lbl: "VPC  ·  10.0.0.0/16", sub: "", c: P.teal, dash: true },
  alb:  { x: 30,  y: 150, w: 66,  h: 40,  lbl: "ALB", sub: "Ingress", c: P.purple, g: "rgba(155,89,245,.5)" },
  eks:  { x: 108, y: 143, w: 150, h: 160, lbl: "EKS Cluster", sub: "Microservices", c: P.orange, g: "rgba(255,153,0,.4)" },
  p1:   { x: 115, y: 170, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  p2:   { x: 149, y: 170, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  p3:   { x: 183, y: 170, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  p4:   { x: 217, y: 170, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  p5:   { x: 115, y: 198, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  p6:   { x: 149, y: 198, w: 28,  h: 18,  lbl: "pod", sub: "", c: "#2d3a52", pod: true },
  rds:  { x: 20,  y: 323, w: 120, h: 74,  lbl: "Amazon RDS", sub: "MySQL 8.0 · snapshots", c: P.azure, g: "rgba(0,120,212,.5)" },
  s3:   { x: 150, y: 323, w: 110, h: 74,  lbl: "S3 Bucket", sub: "Secondary backup", c: P.green, g: "rgba(46,204,113,.4)" },
  iam:  { x: 20,  y: 406, w: 240, h: 22,  lbl: "IAM · SAML Provider · OIDC", sub: "", c: P.red, g: "rgba(231,76,60,.3)", slim: true },
  
  // Azure
  azS:  { x: 282, y: 112, w: 150, h: 320, lbl: "Azure Cloud", sub: "", c: P.azure, g: "rgba(0,120,212,.1)", sec: true },
  entra:{ x: 292, y: 256, w: 130, h: 82,  lbl: "Azure Entra ID", sub: "SSO Identity Provider", c: P.azure, g: "rgba(0,120,212,.6)" },
  
  // GCP
  gcpS: { x: 440, y: 112, w: 270, h: 320, lbl: "GCP Cloud (DR Storage)", sub: "", c: P.gcp, g: "rgba(52,168,83,.1)", sec: true },
  api1: { x: 450, y: 128, w: 252, h: 26,  lbl: "S3-compatible API (Internal Only)", sub: "", c: "#334", slim: true },
  gcs:  { x: 450, y: 163, w: 252, h: 200, lbl: "Google Cloud Storage", sub: "RDS Backup Snapshots", c: P.gcp, g: "rgba(52,168,83,.5)" },
  bkt1: { x: 458, y: 208, w: 62,  h: 46,  lbl: "bucket", sub: "", c: P.teal, g: "rgba(0,212,200,.35)" },
  bkt2: { x: 526, y: 208, w: 62,  h: 46,  lbl: "bucket", sub: "", c: P.teal, g: "rgba(0,212,200,.35)" },
  bkt3: { x: 594, y: 208, w: 62,  h: 46,  lbl: "bucket", sub: "", c: P.teal, g: "rgba(0,212,200,.35)" },
  api2: { x: 450, y: 372, w: 252, h: 26,  lbl: "S3-compatible API (Internal Only)", sub: "", c: "#334", slim: true },
  gciam:{ x: 450, y: 404, w: 252, h: 24,  lbl: "GCP IAM · Service Account · Workload Identity", sub: "", c: P.red, g: "rgba(231,76,60,.3)", slim: true },
};

interface FlowDef {
  pts: [number, number][];
  col: string;
  spd: number;
  n: number;
}

interface SceneDef {
  dur: number;
  title: string;
  sub: string;
  hi: string[];
  flows: FlowDef[];
  dimVal: number;
}

const SCENES: SceneDef[] = [
  {
    dur: 5,
    title: "Multi-Cloud DevOps Architecture",
    sub: "A unified enterprise platform spanning AWS, Azure, and GCP via Terraform",
    hi: Object.keys(B),
    flows: [],
    dimVal: 0.25
  },
  {
    dur: 6.5,
    title: "Step 1 — Infrastructure as Code Pipeline",
    sub: "Terraform provisions AWS, Azure, and GCP simultaneously from a single declarative codebase",
    hi: ["dev", "tf", "mc", "awsS", "azS", "gcpS"],
    flows: [
      { pts: [[74, 32], [222, 32]], col: P.purple, spd: 0.5, n: 4 },
      { pts: [[286, 32], [377, 32]], col: P.purple, spd: 0.5, n: 3 },
      { pts: [[222, 54], [141, 112]], col: P.orange, spd: 0.3, n: 3 },
      { pts: [[377, 54], [357, 112]], col: P.azure, spd: 0.3, n: 3 },
      { pts: [[458, 54], [575, 112]], col: P.gcp, spd: 0.3, n: 3 },
    ],
    dimVal: 0.12
  },
  {
    dur: 6.5,
    title: "Step 2 — Identity Federation & OIDC",
    sub: "Azure Entra ID acts as single identity provider configured via SAML 2.0 and cross-cloud OIDC",
    hi: ["sso", "entra", "azS", "iam", "gciam"],
    flows: [
      { pts: [[357, 256], [357, 102]], col: P.azure, spd: 0.3, n: 4 },
      { pts: [[292, 297], [200, 297], [141, 280], [141, 190]], col: P.cyan, spd: 0.22, n: 4 },
      { pts: [[422, 297], [490, 297], [575, 275], [575, 363]], col: P.gcp, spd: 0.22, n: 4 },
    ],
    dimVal: 0.1
  },
  {
    dur: 5.5,
    title: "Step 3 — Single Sign-On Access Flow",
    sub: "Users authenticate once with Entra ID — single trusted identity seamlessly accesses AWS and GCP",
    hi: ["entra", "sso", "alb", "iam"],
    flows: [
      { pts: [[10, 170], [30, 170]], col: P.cyan, spd: 0.6, n: 5 },
      { pts: [[74, 83], [357, 83]], col: P.azure, spd: 0.28, n: 4 },
      { pts: [[357, 83], [141, 190]], col: P.cyan, spd: 0.22, n: 4 },
    ],
    dimVal: 0.1
  },
  {
    dur: 6.5,
    title: "Step 4 — Live Application Traffic & Microservices",
    sub: "Inbound traffic routes through ALB to EKS microservice pods and writes to Amazon RDS MySQL",
    hi: ["alb", "eks", "p1", "p2", "p3", "p4", "p5", "p6", "rds", "awsS", "vpc"],
    flows: [
      { pts: [[10, 170], [30, 170]], col: P.purple, spd: 0.6, n: 7 },
      { pts: [[96, 170], [115, 179]], col: P.orange, spd: 0.5, n: 5 },
      { pts: [[96, 170], [149, 179]], col: P.orange, spd: 0.5, n: 4 },
      { pts: [[96, 170], [183, 179]], col: P.orange, spd: 0.5, n: 4 },
      { pts: [[183, 230], [183, 295], [80, 295], [80, 323]], col: P.azure, spd: 0.22, n: 4 },
    ],
    dimVal: 0.1
  },
  {
    dur: 6.5,
    title: "Step 5 — Automated Cross-Cloud Storage Replication",
    sub: "RDS snapshots stream to AWS S3, then replicate cross-cloud to Google Cloud Storage for disaster recovery",
    hi: ["rds", "s3", "gcs", "bkt1", "bkt2", "bkt3", "gcpS", "awsS"],
    flows: [
      { pts: [[80, 360], [150, 360]], col: P.green, spd: 0.45, n: 5 },
      { pts: [[205, 396], [280, 445], [440, 445], [575, 400], [575, 363]], col: P.teal, spd: 0.14, n: 5 },
      { pts: [[575, 363], [489, 254]], col: P.teal, spd: 0.3, n: 3 },
      { pts: [[575, 363], [557, 254]], col: P.teal, spd: 0.3, n: 3 },
      { pts: [[575, 363], [625, 254]], col: P.teal, spd: 0.3, n: 3 },
    ],
    dimVal: 0.1
  },
  {
    dur: 8,
    title: "The Multi-Cloud Platform is Live",
    sub: "Zero-drift, enterprise-grade cloud estate managed entirely as code via Terraform",
    hi: Object.keys(B),
    flows: [
      { pts: [[74, 32], [222, 32]], col: P.purple, spd: 0.5, n: 3 },
      { pts: [[222, 54], [141, 112]], col: P.orange, spd: 0.3, n: 3 },
      { pts: [[96, 170], [115, 179]], col: P.orange, spd: 0.55, n: 6 },
      { pts: [[80, 360], [150, 360]], col: P.green, spd: 0.45, n: 4 },
      { pts: [[292, 297], [141, 240]], col: P.cyan, spd: 0.28, n: 4 },
      { pts: [[422, 297], [575, 280]], col: P.gcp, spd: 0.28, n: 4 },
      { pts: [[205, 396], [575, 396]], col: P.teal, spd: 0.15, n: 4 },
    ],
    dimVal: 0.45
  },
];

const W = 720;
const H = 460;

function hexRgba(col: string, a: number): string {
  if (col.startsWith("#")) {
    const r = parseInt(col.slice(1, 3), 16);
    const g = parseInt(col.slice(3, 5), 16);
    const b = parseInt(col.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return col.replace(/[\d.]+\)$/, `${a})`);
}

function rr(cx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  cx.beginPath();
  cx.moveTo(x + r, y);
  cx.lineTo(x + w - r, y);
  cx.arcTo(x + w, y, x + w, y + r, r);
  cx.lineTo(x + w, y + h - r);
  cx.arcTo(x + w, y + h, x + w - r, y + h, r);
  cx.lineTo(x + r, y + h);
  cx.arcTo(x, y + h, x, y + h - r, r);
  cx.lineTo(x, y + r);
  cx.arcTo(x, y, x + r, y, r);
  cx.closePath();
}

function ptOnPath(pts: [number, number][], t: number): [number, number] {
  const n = pts.length - 1;
  const s = Math.min(Math.floor(t * n), n - 1);
  const lt = t * n - s;
  return [
    pts[s][0] + (pts[s + 1][0] - pts[s][0]) * lt,
    pts[s][1] + (pts[s + 1][1] - pts[s][1]) * lt,
  ];
}

interface Particle {
  pts: [number, number][];
  col: string;
  spd: number;
  t: number;
}

export const MultiCloudCanvasVisualizer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sceneIdx, setSceneIdx] = useState<number>(0);

  const speedRef = useRef(speed);
  const isPlayingRef = useRef(isPlaying);
  const sceneIdxRef = useRef(sceneIdx);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    sceneIdxRef.current = sceneIdx;
  }, [sceneIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    let animId: number;
    let lastStamp = 0;
    let sceneStart = 0;
    let accumPrev = 0;
    let partPool: Particle[] = [];

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,
      a: Math.random() * Math.PI * 2,
    }));

    function spawnParticles(sIdx: number) {
      partPool = [];
      const sc = SCENES[sIdx];
      sc.flows.forEach((f) => {
        for (let i = 0; i < f.n; i++) {
          partPool.push({
            pts: f.pts,
            col: f.col,
            spd: f.spd * (0.85 + Math.random() * 0.3),
            t: Math.random(),
          });
        }
      });
    }

    function drawComp(key: string, alpha: number, gstr: number) {
      if (!cx) return;
      const b = B[key];
      if (!b) return;
      cx.save();
      cx.globalAlpha = alpha;
      const { x, y, w, h, lbl, sub, c, g, sec, dash, pod, slim, bar } = b;
      const glow = g || "rgba(200,200,200,.3)";

      if (sec) {
        if (gstr > 0.2) {
          cx.shadowBlur = 24;
          cx.shadowColor = glow;
        }
        rr(cx, x, y, w, h, 10);
        const gr = cx.createLinearGradient(x, y, x, y + h);
        gr.addColorStop(0, hexRgba(c, 0.18 + gstr * 0.12));
        gr.addColorStop(1, hexRgba(c, 0.06 + gstr * 0.06));
        cx.fillStyle = gr;
        cx.fill();
        cx.strokeStyle = hexRgba(c, 0.2 + gstr * 0.4);
        cx.lineWidth = 1.5;
        cx.stroke();
        cx.shadowBlur = 0;
        cx.font = "600 11px 'Space Grotesk', sans-serif";
        cx.fillStyle = hexRgba(c, 0.5 + gstr * 0.4);
        cx.fillText(lbl, x + 8, y + 18);
      } else if (dash) {
        cx.setLineDash([5, 4]);
        cx.strokeStyle = hexRgba(c, 0.2 + gstr * 0.5);
        cx.lineWidth = 1;
        rr(cx, x, y, w, h, 8);
        cx.stroke();
        cx.setLineDash([]);
        cx.font = "500 9px 'JetBrains Mono', monospace";
        cx.fillStyle = hexRgba(c, 0.4 + gstr * 0.4);
        cx.fillText(lbl, x + 7, y + 13);
      } else if (pod) {
        if (gstr > 0.4) {
          cx.shadowBlur = 8;
          cx.shadowColor = P.orange;
        }
        rr(cx, x, y, w, h, 3);
        cx.fillStyle = gstr > 0.4 ? hexRgba(P.orange, 0.4 + gstr * 0.3) : hexRgba(c, 0.3);
        cx.fill();
        cx.strokeStyle = gstr > 0.4 ? hexRgba(P.orange, 0.6) : hexRgba(c, 0.3);
        cx.lineWidth = 0.5;
        cx.stroke();
        cx.shadowBlur = 0;
        if (gstr > 0.3) {
          cx.font = "600 7px 'JetBrains Mono', monospace";
          cx.fillStyle = `rgba(255,255,255,${gstr * 0.8})`;
          cx.textAlign = "center";
          cx.fillText("pod", x + w / 2, y + h / 2 + 3);
          cx.textAlign = "left";
        }
      } else if (slim) {
        rr(cx, x, y, w, h, 4);
        cx.fillStyle = hexRgba(c, 0.12 + gstr * 0.18);
        cx.fill();
        cx.strokeStyle = hexRgba(c, 0.2 + gstr * 0.3);
        cx.lineWidth = 0.8;
        cx.stroke();
        cx.font = "500 8px 'JetBrains Mono', monospace";
        cx.fillStyle = hexRgba(c, 0.4 + gstr * 0.4);
        cx.textAlign = "center";
        cx.fillText(lbl, x + w / 2, y + h / 2 + 3);
        cx.textAlign = "left";
      } else if (bar) {
        if (gstr > 0.2) {
          cx.shadowBlur = 16;
          cx.shadowColor = glow;
        }
        rr(cx, x, y, w, h, 8);
        const gr = cx.createLinearGradient(x, y, x + w, y);
        gr.addColorStop(0, hexRgba(P.azure, 0.2 + gstr * 0.25));
        gr.addColorStop(0.5, hexRgba(P.cyan, 0.18 + gstr * 0.22));
        gr.addColorStop(1, hexRgba(P.gcp, 0.2 + gstr * 0.25));
        cx.fillStyle = gr;
        cx.fill();
        cx.strokeStyle = hexRgba(P.cyan, 0.25 + gstr * 0.3);
        cx.lineWidth = 1;
        cx.stroke();
        cx.shadowBlur = 0;
        cx.font = "600 11px 'Space Grotesk', sans-serif";
        cx.fillStyle = `rgba(255,255,255,${0.6 + gstr * 0.35})`;
        cx.textAlign = "center";
        cx.fillText(lbl, x + w / 2, y + h / 2 + 4);
        cx.textAlign = "left";
      } else {
        // Regular box
        if (gstr > 0.1 && g) {
          cx.shadowBlur = 10 + gstr * 20;
          cx.shadowColor = glow;
        }
        rr(cx, x, y, w, h, 7);
        const gr = cx.createLinearGradient(x, y, x, y + h);
        gr.addColorStop(0, hexRgba(c, 0.28 + gstr * 0.32));
        gr.addColorStop(1, hexRgba(c, 0.13 + gstr * 0.17));
        cx.fillStyle = gr;
        cx.fill();
        cx.strokeStyle = hexRgba(c, 0.35 + gstr * 0.55);
        cx.lineWidth = 1.2;
        cx.stroke();
        cx.shadowBlur = 0;
        cx.textAlign = "center";
        const mx = x + w / 2;
        const my = y + h / 2;
        cx.font = "600 10px 'Space Grotesk', sans-serif";
        cx.fillStyle = `rgba(255,255,255,${0.65 + gstr * 0.35})`;
        if (sub) {
          cx.fillText(lbl, mx, my - 3);
          cx.font = "400 8px 'Space Grotesk', sans-serif";
          cx.fillStyle = `rgba(255,255,255,${0.35 + gstr * 0.3})`;
          cx.fillText(sub, mx, my + 9);
        } else {
          cx.fillText(lbl, mx, my + 4);
        }
        cx.textAlign = "left";
      }
      cx.restore();
    }

    function render(stamp: number) {
      if (!lastStamp) {
        lastStamp = stamp;
        sceneStart = stamp;
        spawnParticles(sceneIdxRef.current);
      }
      const raw = (stamp - lastStamp) / 1000;
      lastStamp = stamp;
      const dt = Math.min(raw, 0.05);
      const currentSpeed = speedRef.current;
      const currentIdx = sceneIdxRef.current;
      const sc = SCENES[currentIdx];
      const elapsed = ((stamp - sceneStart) / 1000) * currentSpeed;

      if (!cx) return;

      // Background
      cx.fillStyle = P.bg;
      cx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach((s) => {
        const a = 0.06 + 0.1 * Math.sin(stamp * 0.0004 + s.a * 8);
        cx.fillStyle = `rgba(180,210,255,${a})`;
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        cx.fill();
      });

      // Components
      const gstr = Math.min(elapsed / 1.2, 1);
      Object.keys(B).forEach((k) => {
        const hi = sc.hi.includes(k);
        drawComp(k, hi ? 1 : sc.dimVal, hi ? gstr : 0);
      });

      // Guide lines
      sc.flows.forEach((f) => {
        cx.save();
        cx.globalAlpha = gstr * 0.25;
        cx.strokeStyle = f.col;
        cx.lineWidth = 1;
        cx.setLineDash([3, 4]);
        cx.beginPath();
        cx.moveTo(f.pts[0][0], f.pts[0][1]);
        f.pts.slice(1).forEach((p) => cx.lineTo(p[0], p[1]));
        cx.stroke();
        cx.setLineDash([]);
        cx.restore();
      });

      // Particles
      partPool.forEach((p) => {
        p.t += p.spd * dt * currentSpeed;
        if (p.t > 1) p.t -= 1;
      });

      partPool.forEach((p) => {
        if (elapsed < 0.4) return;
        const [px, py] = ptOnPath(p.pts, p.t);
        cx.save();
        cx.shadowBlur = 10;
        cx.shadowColor = p.col;
        cx.fillStyle = p.col;
        cx.globalAlpha = Math.min(elapsed / 1, 0.85);
        cx.beginPath();
        cx.arc(px, py, 3.5, 0, Math.PI * 2);
        cx.fill();

        // Tail
        for (let i = 1; i <= 3; i++) {
          const tt = ((p.t - i * 0.02) % 1 + 1) % 1;
          const [tx, ty] = ptOnPath(p.pts, tt);
          cx.globalAlpha = Math.min(elapsed / 1, 0.85) * (0.4 - i * 0.1);
          cx.beginPath();
          cx.arc(tx, ty, Math.max(1, 3.5 - i * 0.6), 0, Math.PI * 2);
          cx.fill();
        }
        cx.restore();
      });

      // Title & Subtitle Card
      const fi = Math.min(elapsed / 0.7, 1);
      const fo = elapsed > sc.dur - 0.7 ? Math.max(0, (sc.dur - elapsed) / 0.7) : 1;
      const alphaTitle = fi * fo;

      cx.save();
      cx.globalAlpha = alphaTitle;
      const gTitle = cx.createLinearGradient(0, H - 90, 0, H - 40);
      gTitle.addColorStop(0, "rgba(4,13,30,0)");
      gTitle.addColorStop(1, "rgba(4,13,30,.88)");
      cx.fillStyle = gTitle;
      cx.fillRect(0, H - 90, W, 90);

      cx.font = "700 17px 'Space Grotesk', sans-serif";
      cx.fillStyle = "rgba(255,255,255,.98)";
      cx.fillText(sc.title, 18, H - 64);

      if (sc.sub) {
        cx.font = "400 11px 'Space Grotesk', sans-serif";
        cx.fillStyle = "rgba(160,210,255,.75)";
        cx.fillText(sc.sub, 18, H - 48);
      }
      cx.restore();

      // Progress bar
      const totDur = SCENES.reduce((s, scene) => s + scene.dur, 0);
      const curAccum = SCENES.slice(0, currentIdx).reduce((s, scene) => s + scene.dur, 0);
      const ov = (curAccum + elapsed) / totDur;

      cx.save();
      cx.fillStyle = "rgba(255,255,255,.08)";
      rr(cx, 16, H - 32, W - 32, 4, 2);
      cx.fill();

      const gProg = cx.createLinearGradient(16, 0, W - 16, 0);
      gProg.addColorStop(0, P.azure);
      gProg.addColorStop(0.5, P.teal);
      gProg.addColorStop(1, P.green);
      cx.fillStyle = gProg;
      rr(cx, 16, H - 32, Math.min(W - 32, Math.max(0, (W - 32) * ov)), 4, 2);
      cx.fill();

      const dx = 16 + (W - 32) * Math.min(1, Math.max(0, ov));
      cx.shadowBlur = 8;
      cx.shadowColor = P.teal;
      cx.fillStyle = "#fff";
      cx.beginPath();
      cx.arc(dx, H - 30, 3, 0, Math.PI * 2);
      cx.fill();
      cx.restore();

      // Advance scene
      if (elapsed >= sc.dur) {
        const nextIdx = (currentIdx + 1) % SCENES.length;
        setSceneIdx(nextIdx);
        sceneIdxRef.current = nextIdx;
        sceneStart = performance.now();
        lastStamp = stamp;
        spawnParticles(nextIdx);
      }

      if (isPlayingRef.current) {
        animId = requestAnimationFrame(render);
      }
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setSceneIdx((idx) => (idx + 1) % SCENES.length);
  };

  const handlePrev = () => {
    setSceneIdx((idx) => (idx - 1 + SCENES.length) % SCENES.length);
  };

  const handleRestart = () => {
    setSceneIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/20 bg-[#040D1E] text-white select-none">
      {/* Canvas */}
      <div className="relative w-full aspect-[720/460] bg-[#040D1E] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full object-contain block"
        />
      </div>

      {/* Modern Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#061124] border-t border-cyan-900/40 text-xs gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-cyan-500/20 border border-white/15 text-white/90 text-[11px] font-mono flex items-center space-x-1 transition-all cursor-pointer"
            title="Previous Scene"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className="px-3 py-1 rounded-full bg-cyan-600/30 hover:bg-cyan-500/40 border border-cyan-400/40 text-cyan-200 text-[11px] font-mono flex items-center space-x-1.5 transition-all cursor-pointer font-bold shadow-2xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 text-cyan-300" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-cyan-300 fill-cyan-300" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-cyan-500/20 border border-white/15 text-white/90 text-[11px] font-mono flex items-center space-x-1 transition-all cursor-pointer"
            title="Next Scene"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Restart Animation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Scene Indicator */}
        <div className="flex items-center space-x-3">
          <div className="text-[10px] font-mono tracking-wider uppercase text-cyan-400/90 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
            Scene {sceneIdx + 1} / {SCENES.length}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-black/40 border border-white/15 rounded-lg px-1.5 py-0.5">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-white/80 text-[10px] font-mono outline-none cursor-pointer"
            >
              <option value="0.5" className="bg-[#071428] text-white">0.5× speed</option>
              <option value="1" className="bg-[#071428] text-white">1.0× speed</option>
              <option value="1.5" className="bg-[#071428] text-white">1.5× speed</option>
              <option value="2" className="bg-[#071428] text-white">2.0× speed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
