/**
 * The Hairline look's geometry, without its engine: a 2:1 isometric camera and
 * rounded solids drawn as a silhouette plus one crease. Ported from the small
 * pure helpers in @lucasmarkes/hairline's kernel (rrect, hull, run, prism).
 *
 * World space is x/y on the ground and z up. +x runs down-right on screen, +y
 * down-left, so the corner with the largest x + y is nearest the viewer:
 * paint by ascending x + y.
 */

export type Vec3 = [number, number, number];
type Pt = [number, number];

/** sin(elevation): 0.5 is the 2:1 view. */
const K = 0.5;
const ZK = Math.sqrt(1 - K * K);
const C45 = Math.SQRT1_2;

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface ICamera {
  /** World point to screen point. */
  P: (x: number, y: number, z: number) => Pt;
  /** World units to screen units, for radii. */
  S: number;
}

/** A camera at scale S, centring the box of `points` on (cx, cy). */
export function camera(S: number, points: Vec3[], cx = 120, cy = 143): ICamera {
  const raw = (x: number, y: number, z: number): Pt => [
    (x - y) * C45 * S,
    ((x + y) * C45 * K - z * ZK) * S,
  ];
  const pts = points.map((p) => raw(...p));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const ox = cx - (Math.min(...xs) + Math.max(...xs)) / 2;
  const oy = cy - (Math.min(...ys) + Math.max(...ys)) / 2;
  return {
    P: (x, y, z) => {
      const [sx, sy] = raw(x, y, z);
      return [r2(sx + ox), r2(sy + oy)];
    },
    S,
  };
}

interface ISample {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

/** A rounded rectangle on the ground, as a ring of samples with outward normals. */
export function rrect(x0: number, y0: number, x1: number, y1: number, r: number, n = 4): ISample[] {
  r = Math.max(0, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
  const corners: [number, number, number][] = [
    [x1 - r, y0 + r, -90],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
    [x0 + r, y0 + r, 180],
  ];
  return corners.flatMap(([cx, cy, a0]) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = ((a0 + (90 * i) / n) * Math.PI) / 180;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
    }),
  );
}

/** Whether a ring sample faces the camera. */
const front = (s: ISample) => s.nx + s.ny > 1e-6;

/** The one cyclic run of samples that pass `keep`. */
function run(ring: ISample[], keep: (s: ISample) => boolean): ISample[] {
  const start = ring.findIndex((s, i) => keep(s) && !keep(ring[(i - 1 + ring.length) % ring.length]));
  if (start < 0) return ring.filter(keep);
  const out: ISample[] = [];
  for (let i = 0; i < ring.length && keep(ring[(start + i) % ring.length]); i++) out.push(ring[(start + i) % ring.length]);
  return out;
}

/** Convex hull of screen points (monotone chain). */
function hull(points: Pt[]): Pt[] {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (pts: Pt[]) => {
    const h: Pt[] = [];
    for (const q of pts) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...half(p), ...half(p.slice().reverse())];
}

const poly = (pts: Pt[]) => `M${pts.map((p) => p.join(" ")).join("L")}Z`;
const open = (pts: Pt[]) => `M${pts.map((p) => p.join(" ")).join("L")}`;

export interface ISolid {
  sil: string;
  crease: string;
}

/** Turns ground point (x, y) by `deg` about (cx, cy). */
export function turn(x: number, y: number, cx: number, cy: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
}

/** Turns a ring's samples, positions and normals, by `deg` about (cx, cy). */
function turnRing(ring: ISample[], cx: number, cy: number, deg: number): ISample[] {
  if (!deg) return ring;
  return ring.map((q) => {
    const [x, y] = turn(q.x, q.y, cx, cy, deg);
    const [nx, ny] = turn(q.nx, q.ny, 0, 0, deg);
    return { x, y, nx, ny };
  });
}

/**
 * A rounded box standing from z0 to z1 on the footprint (x0, y0)–(x1, y1),
 * turned by `rotate` degrees about its centre: the hull of its top and base
 * rings, and the front of its top, inset by b, as the crease. No vertical
 * edges are drawn.
 */
export function box(
  { P }: ICamera,
  [x0, y0, x1, y1]: [number, number, number, number],
  r: number,
  b: number,
  z0: number,
  z1: number,
  rotate = 0,
): ISolid {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const ring = turnRing(rrect(x0, y0, x1, y1, r), cx, cy, rotate);
  const inner = turnRing(rrect(x0 + b, y0 + b, x1 - b, y1 - b, r - b), cx, cy, rotate);
  return {
    sil: poly(hull([...ring.map((s) => P(s.x, s.y, z0)), ...ring.map((s) => P(s.x, s.y, z1))])),
    crease: open(run(inner, front).map((s) => P(s.x, s.y, z1))),
  };
}

export interface IPawnSize {
  /** The base's radius and height. */
  r: number;
  base: number;
  /** The head's radius. */
  head: number;
}

/** A player: a round base with a ball for a head, standing on z at (x, y). */
export function pawn(cam: ICamera, x: number, y: number, z: number, size: IPawnSize) {
  const [hx, hy] = cam.P(x, y, z + size.base + size.head * 0.9);
  return {
    base: cylinder(cam, x, y, size.r, 1.2, z, z + size.base),
    head: { cx: hx, cy: hy, r: size.head * cam.S },
  };
}

/** A round solid standing from z0 to z1 at (x, y): sides, back arc on top, front arc below; its top, inset by b, as the crease. */
export function cylinder({ P, S }: ICamera, x: number, y: number, r: number, b: number, z0: number, z1: number): ISolid {
  const [cx, t] = P(x, y, z1), [, bt] = P(x, y, z0);
  const rx = r * S, ry = rx * K, ix = (r - b) * S, iy = ix * K;
  return {
    sil:
      `M${cx - rx} ${t}L${cx - rx} ${bt}A${rx} ${ry} 0 0 0 ${cx + rx} ${bt}` +
      `L${cx + rx} ${t}A${rx} ${ry} 0 0 0 ${cx - rx} ${t}Z`,
    crease: `M${cx - ix} ${t}A${ix} ${iy} 0 1 0 ${cx + ix} ${t}A${ix} ${iy} 0 1 0 ${cx - ix} ${t}Z`,
  };
}

/** A ground footprint: (x0, y0)–(x1, y1). */
export type Footprint = [number, number, number, number];

/** A square footprint of side `size` centred on (x, y). */
export const square = (x: number, y: number, size: number): Footprint => [
  x - size / 2,
  y - size / 2,
  x + size / 2,
  y + size / 2,
];

/** A footprint's four corners at height z, for fitting a camera. */
export const corners = ([x0, y0, x1, y1]: Footprint, z: number): Vec3[] => [
  [x0, y0, z],
  [x1, y0, z],
  [x0, y1, z],
  [x1, y1, z],
];

/**
 * An SVG transform that lays flat artwork onto the horizontal plane at height
 * z: artwork (u, v) lands on ground (x0 + u·scale, y0 + v·scale). Its right
 * runs along +x and its down along +y, so it reads like a sheet on a desk.
 */
export function plane({ P }: ICamera, x0: number, y0: number, z: number, scale: number): string {
  // Measured over a long step: P rounds to hundredths.
  const STEP = 100;
  const [ox, oy] = P(x0, y0, z);
  const [ux, uy] = P(x0 + STEP, y0, z);
  const [vx, vy] = P(x0, y0 + STEP, z);
  const k = scale / STEP;
  return `matrix(${(ux - ox) * k} ${(uy - oy) * k} ${(vx - ox) * k} ${(vy - oy) * k} ${ox} ${oy})`;
}
