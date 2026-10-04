// T OCF, telescoped, at every level: a strong 2-shifted Buchholz ψ_j over the collapsing regular T_(j+1), for every j.
//
// Values. T_0 = 1 and ψ_j(0) = T_j. Level 0 lies below T = T_1, and level j ≥ 1 is [T_j, T_(j+1)).
//  - ψ_0(T·(1+x)) = Ω_(1+x), ψ(T²) = I, ψ(T^T) = M, ψ(T^T^T) = K: the regulars are named by the T-structure of the
//    argument, and the sub-T tail is collapsed at that level (Buchholz's ψ_ν, with ν moved into the argument).
//  - Every ψ_j is 2-shifted in the same way over T_(j+1): ψ_j(T_(j+1)) = Ω_(T_j+1), ψ_j(T_(j+1)·2) = Ω_(T_j+2),
//    ψ_j(T_(j+1)²) is the first inaccessible above T_j, and so on.
//  - ψ_j(x) for x < T_(j+1) is Buchholz's collapse at T_j with next regular Ω_(T_j+1): ψ_j(s) = ω^(T_j+s) below
//    Ω_(T_j+1), ψ_j(Ω_(T_j+1)) = ε_(T_j+1), ψ_j(Ω_(T_j+1)^T_j) = φ(T_j, 1).
// Telescoping. The argument of ψ_j stays below Ω_(T_(j+1)+1): a higher level enters only through ψ_(j+1)-values. So
// ψ_0(ψ_0(ψ_1(Ω_(T+1)))) = ψ_0(ψ_0(ε_(T+1))) stands where the untelescoped form has ψ(ψ(T_2)), and the limit of the
// notation is the sup of ψ_0(ψ_0(ψ_1(ψ_1(ψ_2(ψ_2(… ψ_n(ψ_n(T_(n+1))) …)))))).
//
// Terms are non-increasing sums of principals:
//   ψ_j(a)      every level-0 principal (j = 0); for j ≥ 1 an "atom" (a below T_(j+1), all of it ≥ Ω_(T_j+1): an
//               ε-number below Ω_(T_j+1)) or a strong collapse (a ≥ T_(j+1): a value ≥ Ω_(T_j+1))
//   T_b^e·c     b ≥ 1, 0 < e < Ω_(T_b+1), c < T_b a principal: the rest of [T_b, Ω_(T_b+1)); T_b^atom = atom
// Order: by level, then T_b^e·c < atom iff e < atom, atoms below strong collapses, collapses by their arguments
// (monotone on standard arguments), sums lexicographically. The order is claimed only on standard terms.
//
// Reading ψ_j(x). The last digit of x decides everything, as in Buchholz's notation, with every digit a Buchholz
// slot. Write x = Q + T^τ·c (T = T_(j+1), c the trailing coefficient below T):
//  - τ = 0: a Buchholz slot, the collapse at the level ψ_j(Q);
//  - c ≠ 1: the coefficient slot of T^τ;
//  - c = 1: the same analysis inside the exponent τ.
// An atom standing alone is read through its argument. A strong collapse of a higher level is read in Cantor normal
// form to the base of its own regular R = ψ_b(Q_R): R^u·p, with the coefficient p, then the exponent u, as digits
// (R-atoms ψ_R(H), H ≥ R⁺, are read through H; a singular R through its own argument). Each digit has a
// diagonaliser D = ψ_j(x with the digit := T); the digit is a point (an index or sort jump) if it has a part below
// D, otherwise a collapse. Regular: the last step is a successor made by T. A successor made by a higher regular is
// a sup of cofinality ω, whose fundamental sequence is that of the enclosing collapse.
// Standard form: Buchholz's G slot by slot (the parameters of a coefficient slot's class are free), the level of
// every slot standard, no index or sort passing a fixed point, and the Θ rule (ψ_0(Λ) is spelled ψ_0(I)).
// Fundamental sequences: Buchholz's, with the crossing iterates of a coefficient collapse lying in [D, R).
//
// Standard form and fundamental sequences are empirical: below ψ(ψ(T^ω)) they are meant to agree with the ?
// sequence; above, they are checked for closure and order, and nothing here is proved.

const TOCF = (() => {

// ---------------------------------------------------------------- terms
// A term is a non-increasing sum of principals:
//   {k: "S", j, a}     ψ_j(a): for j = 0 every level-0 principal; for j ≥ 1 either an atom of the Buchholz part
//                      (a below T_(j+1), all of it at least Ω_(T_j+1): an ε-number below Ω_(T_j+1)) or a strong
//                      collapse (a at least T_(j+1): a value at least Ω_(T_j+1))
//   {k: "P", b, e, c}  T_b^e·c (b ≥ 1, e ≠ 0 below Ω_(T_b+1), c a principal below T_b): the ordinals of [T_b, Ω_(T_b+1))
//                      that are not atoms
// Levels: ψ_0 and its values lie below T = T_1; level b ≥ 1 is [T_b, T_(b+1)).
const Z = [];
const S = (j, a) => ({k: "S", j, a});
const Pw = (b, e, c) => ({k: "P", b, e, c});
const ONEP = S(0, Z), ONE = [ONEP];
const lev = m => m.k === "S" ? m.j : m.b;
const isOneM = m => m.k === "S" && m.j === 0 && !m.a.length;
const isOne = t => t.length === 1 && isOneM(t[0]);
const last = t => t[t.length - 1];
const pred = t => t.slice(0, -1);
const Tp = b => Pw(b, ONE, ONEP);
const TT = b => [Tp(b)];
const strong = m => m.k === "S" && m.j >= 1 && m.a.length > 0 && lev(m.a[0]) > m.j;
const atomB = m => m.k === "S" && m.j >= 1 && !strong(m);                 // a Buchholz-part atom
const num = n => Array(n).fill(ONEP);
const isFin = t => t.every(isOneM);

function cmpM(m, n) {
  if (m === n) return 0;
  const lm = lev(m), ln = lev(n);
  if (lm !== ln) return lm < ln ? -1 : 1;
  if (m.k === "S" && n.k === "S") {
    const sm = strong(m), sn = strong(n);
    return sm !== sn ? (sm ? 1 : -1) : cmp(m.a, n.a);
  }
  if (m.k === "P" && n.k === "P") return cmp(m.e, n.e) || cmpM(m.c, n.c);
  if (m.k === "S") return -cmpM(n, m);
  if (strong(n)) return -1;                                       // T_b^e·c < Ω_(T_b+1) ≤ a strong collapse
  const c = cmp(m.e, [n]);                                        // an atom is the T_b-power of itself
  return c || (isOneM(m.c) ? 0 : 1);
}
function cmp(x, y) {
  if (x === y) return 0;
  const L = Math.min(x.length, y.length);
  for (let i = 0; i < L; i++) { const c = cmpM(x[i], y[i]); if (c) return c; }
  return x.length < y.length ? -1 : x.length > y.length ? 1 : 0;
}
const eq = (x, y) => cmp(x, y) === 0;
function add(x, y) {
  if (!y.length) return x;
  let i = x.length;
  while (i && cmpM(x[i - 1], y[0]) < 0) i--;
  return [...x.slice(0, i), ...y];
}
function keyM(m) { return m.k === "S" ? "S" + m.j + "(" + key(m.a) + ")" : "P" + m.b + "[" + key(m.e) + "|" + keyM(m.c) + "]"; }
function key(t) { let s = ""; for (const m of t) s += keyM(m) + ","; return s; }
function size(t) { let n = 0; for (const m of t) n += 1 + (m.k === "S" ? size(m.a) : size(m.e) + size([m.c])); return n; }

// T_b^e·c, with T_b^ψ_b(α) = ψ_b(α) for an atom
function mkPow(b, e, c) {
  if (!e.length) return c;
  if (isOneM(c) && e.length === 1 && atomB(e[0]) && e[0].j === b) return e[0];
  return Pw(b, e, c);
}
const mulMono = (b, e, h) => h.map(m => mkPow(b, e, m));       // T_b^e·h for h below T_b
const minus1 = e => e.length && isFin(e) ? num(e.length - 1) : e; // −1 + e
const U = j => S(j, TT(j + 1));                                    // Ω_(T_j+1) = ψ_j(T_(j+1))

// ---------------------------------------------------------------- arithmetic
// the trailing summands of x of level ≤ j, and the rest
function splitTail(x, j) { let i = x.length; while (i && lev(x[i - 1]) <= j) i--; return [x.slice(0, i), x.slice(i)]; }
// the log of a principal: ω^log(p) = p
function logP(p) {
  if (p.k === "P") {
    if (isOneM(p.c) && isOne(p.e)) return TT(p.b);                // T_b is an ε-number
    return add(mul(TT(p.b), p.e), logP(p.c));
  }
  if (atomB(p)) return [p];
  const j = p.j, x = p.a;
  if (!x.length) return Z;                                        // ψ_0(0) = 1
  const [Q, a0] = splitTail(x, j);
  if (!a0.length) return [p];
  const nxt = S(j, add(Q, TT(j + 1)));
  const a = thetaDigit(j, Q, a0, true);
  let k = 0;
  while (k < a.length && cmpM(a[k], nxt) >= 0) k++;
  const H = a.slice(0, k), r = a.slice(k);
  if (H.length) return add(mkPsi(j, add(Q, H)), r);
  if (Q.length) return add([S(j, Q)], r);
  return r;
}
// ψ_j(h) for j ≥ 1 and h below T_(j+1): ψ_j(H+s) = ω^(ψ_j(H)+s) with H its part at least Ω_(T_j+1), ψ_j(s) = ω^(T_j+s)
function theta(j, h) {
  const u = U(j);
  let i = 0;
  while (i < h.length && cmpM(h[i], u) >= 0) i++;
  const H = h.slice(0, i), s = h.slice(i);
  const s0 = s.filter(m => lev(m) < j), s1 = s.filter(m => lev(m) === j).map(m => m.k === "P" ? mkPow(j, minus1(m.e), m.c) : m);
  const w = omega(s0)[0];
  if (H.length) { const A = S(j, H); return s.length ? [mkPow(j, add([A], s1), w)] : [A]; }
  return [mkPow(j, add(ONE, s1), w)];
}
// ψ_j(a) as a term in normal form
function mkPsi(j, a) {
  if (j === 0 || (a.length && lev(a[0]) > j)) return [S(j, a)];
  return theta(j, a);
}
// The Θ spelling: a Buchholz slot at a level ψ_j(Q) of the Ω-fixed-point family takes no digit in [X₀, D) (the
// collapses there are invisible to it), and writes the sup ψ_j(Q+X₀) as ψ_j(Q+D). So in the digit each top-level D
// stands for X₀: ψ(T·I+I) = ω^(Λ+Λ) = Λ². toX0: D ↦ X₀ (reading a value), otherwise X₀ ↦ D (spelling one).
function thetaDigit(j, Q, g, toX0) {
  if (!Q.length || !g.length) return g;
  const xd = level(j).thetaXD(Q);
  if (!xd) return g;
  const X0 = xd[0][0], D = xd[1][0];
  if (toX0 ? cmpM(g[0], D) !== 0 : cmpM(g[0], X0) < 0 || cmpM(g[0], D) >= 0) return g;
  // only the lead, with X₀ and the rest below the next level: a digit D+r reads X₀+r, strictly monotone in r. A rest
  // reaching the next level makes the lead D an ordinary digit of the Buchholz part (D+D is not X₀+D).
  const nxt = S(j, add(Q, TT(j + 1)));
  if (cmpM(X0, nxt) >= 0 || g.slice(1).some(m => cmpM(m, nxt) >= 0)) return g;
  if (toX0) return add([X0], g.slice(1));
  return cmpM(g[0], X0) === 0 ? add([D], g.slice(1)) : add([D], g);  // a lead in (X₀, D) absorbs X₀: spelled D+g
}
// ω^c
function omega(c) {
  if (!c.length) return ONE;
  const l = lev(c[0]);
  if (l === 0 || strong(c[0])) {                                  // the Buchholz rule at the level of c's leader
    const x = c[0].a, rest = c.slice(1);
    const [Q, a] = splitTail(x, l);
    if (Q.length && !a.length) return [S(l, add(Q, thetaDigit(l, Q, rest, false)))];
    const nxt = S(l, add(Q, TT(l + 1)));
    const am = thetaDigit(l, Q, a, true);                         // a leader ψ(Q+D+r) read as X₀+r is no ε-number
    let k = 0;
    while (k < a.length && am === a && cmpM(a[k], nxt) >= 0) k++;
    const H = a.slice(0, k);
    if (H.length) return mkPsi(l, k === a.length ? add(add(Q, H), rest) : add(add(Q, H), c));
    return mkPsi(l, add(Q, thetaDigit(l, Q, c, false)));
  }
  // c in [T_l, Ω_(T_l+1)): ω^(T_l+s) = ψ_l(s)
  const t = Tp(l);
  return theta(l, c[0] === t || (c[0].k === "P" && cmpM(c[0], t) === 0) ? c.slice(1) : c);
}
// ordinal multiplication
function mul(x, y) {
  if (!x.length || !y.length) return Z;
  const h = x[0];                                                  // T_b^e·c exactly, without logs
  if (x.length === 1 && h.k === "P" && isOneM(h.c) && y.every(m => lev(m) < h.b)) return y.map(m => mkPow(h.b, h.e, m));
  let out = Z;
  const lx = logP(x[0]);
  for (const m of y) out = add(out, isOneM(m) ? x : omega(add(lx, logP(m))));
  return out;
}
function pow(x, y) {
  if (x.length === 1 && x[0].k === "P" && eq(x, TT(x[0].b))) return [mkPow(x[0].b, y, ONEP)];
  if (isFin(y)) { let r = ONE; for (let i = 0; i < y.length; i++) r = mul(r, x); return r; }
  if (x.length === 1) return omega(mul(logP(x[0]), y));
  throw new Error("pow: unsupported");
}

// ---------------------------------------------------------------- views
const isStrongOf = (m, b) => m.k === "S" && m.j === b && strong(m);
const isAtomOf = (m, b) => m.k === "S" && m.j === b && atomB(m);
const ofLevel = (t, b) => t.length > 0 && lev(t[0]) <= b;              // every summand of level ≤ b
// the ψ_b-argument of a level-b principal: ψ_b(argOf(m)) = m
function argOf(m) {
  if (m.k === "S") return m.a;
  const b = m.b, L = add(mul(TT(b), m.e), logP(m.c));               // T_b^e·c = ω^(T_b·e + log c) = ω^(T_b + s)
  return L.length && L[0].k === "P" && cmpM(L[0], Tp(b)) === 0 ? L.slice(1) : L;
}
// −R + x for x ≥ R
const minusR = (R, x) => x.length && cmpM(x[0], R) === 0 ? x.slice(1) : x;
// The R-view of a strong level-b principal m = ψ_b(Q_R + y): R = ψ_b(Q_R) (Q_R the part of level > b) and
//   m = R^u·p (p < R a principal), when y has no part ≥ R⁺ = ψ_b(Q_R + T_(b+1)) or a part below it;
//   m an R-atom ψ_R(H) = R^m (atom: true, u = [m], p = 1) when y = H is all ≥ R⁺.
const RV = new Map();
function rview(m) {
  const k = keyM(m);
  let v = RV.get(k);
  if (v) return v;
  const b = m.j, a = m.a;
  let i = 0;
  while (i < a.length && lev(a[i]) > b) i++;
  const QR = a.slice(0, i), y = a.slice(i), R = S(b, QR);
  const nxt = S(b, add(QR, TT(b + 1)));
  let h = 0;
  while (h < y.length && cmpM(y[h], nxt) >= 0) h++;
  if (h && h === y.length) v = {R, QR, u: [m], p: ONEP, atom: true, H: y};
  else {
    const L = logP(m);
    let l = 0;
    while (l < L.length && cmpM(L[l], R) >= 0) l++;
    const hi = L.slice(0, l), lo = L.slice(l);
    let u = Z;
    for (const t of hi) u = add(u, omega(minusR(R, logP(t))));
    v = {R, QR, u, p: omega(lo)[0], atom: false};
  }
  RV.set(k, v);
  return v;
}
// R^u·h for a sum h of principals below R
function mulR(R, u, h) {
  if (!u.length) return h;
  const Ru = mul([R], u);
  return h.map(q => omega(add(Ru, logP(q)))[0]);
}

// ---------------------------------------------------------------- one level: ψ_j over T = T_(j+1)
// The analysis of ψ_j is level 0's, shifted: "sub-T" means level ≤ j, the T-monomials are T_(j+1)^e·c and the atoms
// of level j+1, and the strong principals of level j+1 are read through their R-views (U-CNF for R = Ω_(T_j+1)).
const LEVELS = [];
function level(j) {
  if (LEVELS[j]) return LEVELS[j];
  const L = {};
  LEVELS[j] = L;
  const b1 = j + 1, TTj = TT(b1);
  const sub = m => lev(m) <= j;
  const subT = t => t.every(sub);
  const isV = m => isStrongOf(m, b1);
  const isA = m => isAtomOf(m, b1);
  const prin = a => mkPsi(j, a);
  const pv = p => argOf(p[0]);
  const expOf = m => sub(m) ? Z : lev(m) > b1 || m.k !== "P" ? [m] : m.e;   // a higher monomial groups only with itself
  const coefOf = m => sub(m) ? m : lev(m) > b1 || m.k !== "P" ? ONEP : m.c;
  const mkP = (e, c) => mkPow(b1, e, c);
  const mulMono = (e, h) => h.map(m => mkP(e, m));
  const powAt = (Q, e, depth) => (depth === 0 && !e.length) ? Q : add(Q, [mkP(e, ONEP)]);
  const theta = h => mkPsi(b1, h);
  const Tn = n => [mkP(num(n), ONEP)];                                // T^n

  // ---------------------------------------------------------------- slot analysis
  const AN = new Map();
  function analyze(x) {
    const k = key(x);
    if (AN.has(k)) return AN.get(k);
    const r = anIn(y => y, 0, x, null, null);
    AN.set(k, r);
    return r;
  }
  function trailing(y) {
    const tau = expOf(last(y));
    let i = y.length;
    while (i && !isV(y[i - 1]) && eq(expOf(y[i - 1]), tau)) i--;
    return {Q: y.slice(0, i), tau, c: y.slice(i).map(coefOf)};
  }
  function anIn(F, depth, y, at, um, vd) {
    const m = last(y);
    if (strong(m) && m.j > j) {                                       // the last R-group R^u·c
      const b = m.j, v = rview(m), kR = keyM(v.R), ku = key(v.u);
      if (!v.atom && isOneM(v.p) && isOneM(last(v.u)) && !level(b).regular(v.QR)) {   // R^(η+1) at a singular R:
        const Q = pred(y), u1 = pred(v.u), at2 = {ctx: t => F(add(Q, t)), atom: m, up: at};   // read R itself
        return anIn(h => F(add(Q, mulR(v.R, u1, mkPsi(b, h)))), depth + 1, v.QR, at2, null);
      }
      let i = y.length;
      while (i && isStrongOf(y[i - 1], b) && keyM(rview(y[i - 1]).R) === kR && key(rview(y[i - 1]).u) === ku) i--;
      const Q = y.slice(0, i), c = y.slice(i).map(x => rview(x).p);
      if (v.atom && isOne(c)) {                                       // an R-atom standing alone: read through it
        const at2 = {ctx: t => F(add(Q, t)), atom: m, up: at};
        return anIn(h => F(add(Q, mkPsi(b, add(v.QR, h)))), depth + 1, v.H, at2, null);
      }
      const umade = isOneM(v.p) && isOneM(last(v.u)) ? at : null;
      if (isOne(c)) return anIn(e => F(add(Q, mulR(v.R, e, ONE))), depth + 1, v.u, at, umade);
      const vd = () => { const y2 = add(Q, mulR(v.R, v.u, pred(c))); return anIn(e => F(add(y2, mulR(v.R, e, ONE))), depth + 1, v.u, at, null); };
      return anIn(h => F(add(Q, mulR(v.R, v.u, h))), depth + 1, c, at, umade, vd);
    }
    if (lev(m) > b1) {                                                // T_b-monomials and atoms above T: digits inside
      const b = lev(m), eb = x => x.k === "P" ? x.e : [x], cb = x => x.k === "P" ? x.c : ONEP, tau = eb(m);
      let i = y.length;
      while (i && lev(y[i - 1]) === b && !strong(y[i - 1]) && eq(eb(y[i - 1]), tau)) i--;
      const Q = y.slice(0, i), c = y.slice(i).map(cb);
      const tmade = isOneM(last(tau)) ? at : null;                   // T_b^(η+1): a sup
      if (!isOne(c)) {
        const vd = () => { const y2 = add(Q, pred(c).map(x => mkPow(b, tau, x))); return anIn(e => F(add(y2, [mkPow(b, e, ONEP)])), depth + 1, tau, at, tmade); };
        return anIn(h => F(add(Q, h.map(x => mkPow(b, tau, x)))), depth + 1, c, at, isOneM(last(c)) ? tmade : null, vd);
      }
      if (m.k === "S") {
        const at2 = {ctx: t => F(add(Q, t)), atom: m, up: at};
        return anIn(h => F(add(Q, mkPsi(b, h))), depth + 1, m.a, at2, null);
      }
      return anIn(e => F(add(Q, [mkPow(b, e, ONEP)])), depth + 1, tau, at, tmade);
    }
    const {Q, tau, c} = trailing(y);
    if (!tau.length) {
      if (depth === 0) return {slot: "B", Q, g: c, ctx: h => add(Q, h), cls: TTj, Dz: add(Q, TTj), at};
      return finish({slot: "S", depth, Q, g: c, ctx: h => F(add(Q, h)), Dz: F(add(Q, TTj)), at, umade: um, vd});
    }
    if (!isOne(c)) return finish({slot: "C", depth, F, Q, tau, g: c, ctx: h => F(add(Q, mulMono(tau, h))), Dz: F(add(Q, [mkP(add(tau, ONE), ONEP)])), at});
    if (isA(m)) {                                                     // an atom standing alone: read through its argument
      const at2 = {ctx: t => F(add(Q, t)), atom: m, up: at};
      return anIn(h => F(add(Q, theta(h))), depth + 1, m.a, at2, null);
    }
    return anIn(e => F(powAt(Q, e, depth)), depth + 1, tau, at, null);
  }
  function finish(r) {
    r.D = prin(r.Dz);
    r.cls = [last(r.Dz)];
    let k = 0;
    while (k < r.g.length && cmpM(r.g[k], r.D[0]) >= 0) k++;
    r.big = r.g.slice(0, k);
    r.small = r.g.slice(k);
    r.kind = r.small.length ? "point" : "coll";
    return r;
  }
  function info(p) {
    const x = pv(p);
    if (!x.length) return {kind: "one"};
    const A = analyze(x);
    return A.slot === "B" ? Object.assign({kind: "B"}, A) : A;
  }
  const GV = new Map();
  function gview(p) {
    const k = key(p);
    if (GV.has(k)) return GV.get(k);
    let A = info(p);
    while (A.kind === "point" && A.slot === "C" && A.small.length && isOneM(last(A.small))) {
      const y = add(A.Q, mulMono(A.tau, pred(A.g))), d = A.depth, F = A.F;
      A = anIn(e => F(powAt(y, e, d)), d + 1, A.tau, A.at, null);
    }
    GV.set(k, A);
    return A;
  }
  const isCoef = A => A.slot === "C";
  function sbase(p) {
    const A = gview(p);
    if (A.kind === "one") return null;
    let z;
    if (A.kind !== "point") z = A.ctx(Z);
    else if (isCoef(A)) z = A.big.length ? A.ctx(A.big) : A.ctx(Z);
    else {
      const l = last(A.small);
      z = isOneM(l) ? A.ctx(add(A.big, pred(A.small))) : A.big.length ? A.ctx(add(A.big, ONE)) : A.ctx(pred(A.small));
    }
    return z.length ? prin(z) : null;
  }
  const collArg = A => A.kind === "B" ? A.g : A.big;
  // the level-j principals of a term (through T-monomials, atoms and R-views)
  function principals(t, out = []) {
    for (const m of t) {
      const l = lev(m);
      if (l < j) continue;
      if (l === j) { if (j === 0 ? m.a.length : !(m.k === "P" && isOne(m.e) && isOneM(m.c))) out.push([m]); continue; }
      if (m.k === "P") { principals(m.e, out); principals([m.c], out); }
      else if (atomB(m)) principals(m.a, out);
      else { const v = rview(m); principals(v.QR, out); if (v.atom) principals(v.H, out); else { principals(v.u, out); principals([v.p], out); } }
    }
    return out;
  }
  function children(p) {
    const A = gview(p);
    if (A.kind === "one") return [];
    const out = [], b = sbase(p);
    if (b) out.push(b);
    principals(A.kind === "point" ? (isCoef(A) ? A.small : A.g) : collArg(A), out);
    if (A.slot === "C") { principals(A.tau, out); if (!isOne(A.g)) out.push(prin(A.ctx(ONE))); }
    return out;
  }

  // ---------------------------------------------------------------- regularity
  // the last step is a successor made by T; an R-made successor (R^(η+1)·1 last in an atom) is a sup
  function succLike(t) {
    if (!t.length) return false;
    const m = last(t);
    if (sub(m)) return isOneM(m);
    if (m.k === "P") {
      if (m.b === b1) return isOneM(m.c) && succLike(m.e);
      return isOneM(m.c) ? !isOneM(last(m.e)) && succLike(m.e) : succLike([m.c]);   // T_b-made: a sup
    }
    if (atomB(m)) return succLike(m.a);
    const v = rview(m);
    if (v.atom) return succLike(v.H);
    if (isOneM(v.p)) return !isOneM(last(v.u)) ? succLike(v.u) : !level(m.j).regular(v.QR) && succLike(v.QR);
    return succLike([v.p]);
  }
  function regular(x) {
    if (!x.length) return false;
    const m = last(x);
    if (isA(m)) return succLike(m.a);
    return m.k === "P" && m.b === b1 && isOneM(m.c) && succLike(m.e);
  }


  // ---------------------------------------------------------------- sorts and fixed points
  const lastE = z => z.length ? expOf(last(z)) : Z;
  function inSort(p) {
    const A = info(p);
    if (A.kind === "one" || A.kind === "B") return Z;
    if (A.slot === "C" && A.depth === 0) return A.tau;
    if (A.kind === "point") return lastE(A.ctx(A.g));
    const d = domT(A.big);
    const g = d.t === "reg" ? fsT(A.big, p) : A.big;
    return lastE(A.ctx(g));
  }
  function fixedFor(p, tau) {
    const A = info(p);
    if (A.kind === "one" || A.kind === "B") return false;
    if (A.slot === "C" && A.depth === 0) return A.kind === "coll" ? cmp(A.tau, tau) >= 0 : cmp(A.tau, tau) > 0;
    return cmp(inSort(p), tau) > 0;
  }
  function hiFix(q, tau) {
    for (let n = 0; q && n < 10000; n++) { if (fixedFor(q, tau)) return q; q = sbase(q); }
    return null;
  }

  // ---------------------------------------------------------------- standardness of ψ_j(x)
  const STD = new Map();
  function stdP(p) {
    const x = pv(p);
    if (!x.length) return true;
    const k = key(x);
    if (STD.has(k)) return STD.get(k);
    STD.set(k, true);
    const r = cmp(x, [U(b1)]) < 0 && std(x) && stdSlot(p);
    STD.set(k, r);
    return r;
  }
  // Θ canonical form: a B-slot collapse at a level that is not of type I (ψ(…+T²·…)) cannot start its argument in [X₀, D)
  function thetaXD(Q) {
    const hi = Q.filter(m => cmp(expOf(m), ONE) > 0), c = Q.filter(m => eq(expOf(m), ONE)).map(coefOf);
    if (hi.length && !c.length) {
      const eL = expOf(last(Q)), n = eL.every(isOneM) ? eL.length : -1;
      if (n < 2) return null;
      const cj = Q.filter(m => eq(expOf(m), eL)).map(coefOf), hj = Q.filter(m => cmp(expOf(m), eL) > 0);
      const Dj = prin(add(hj, Tn(n + 1)));
      if (cmpM(cj[0], Dj[0]) < 0) return null;
      return [prin(add(hj, mulMono(eL, Dj))), Dj];
    }
    const D = prin(add(hi, Tn(2)));
    return [prin(add(hi, mulMono(ONE, D))), D];
  }
  function thetaCanon(A) {
    if (!A.g.length) return true;
    const xd = thetaXD(A.Q);
    if (!xd) return true;
    const lead = [A.g[0]];
    return !(cmp(lead, xd[0]) >= 0 && cmp(lead, xd[1]) < 0);
  }
  function stdSlot(p) {
    const A = info(p);
    // the top-level prefix Q₀ (x = Q₀ + T^τ·c) is a standard level (ψ(T^F + T) is not: ψ(T^F) = F)
    { const tr = trailing(pv(p)); if (tr.Q.length && !stdP(prin(tr.Q))) return false; }
    // a point slot below the top has its level with the digit := 0 standard
    if (A.kind === "point" && A.depth >= 1) { const z0 = A.ctx(Z); if (z0.length && !stdP(prin(z0))) return false; }
    if (A.slot === "C" && !isOne(A.g) && !stdP(prin(A.ctx(ONE)))) return false;      // the class exists
    if (A.kind === "B" || A.kind === "coll") {
      const z = A.ctx(Z);
      if (z.length && !stdP(prin(z))) return false;
      if (A.kind === "B" && !thetaCanon(A)) return false;
      return G(p, A);
    }
    if (A.big.length && !stdP(prin(A.ctx(A.big)))) return false;
    const p1 = [A.small[0]], B = sbase(p);
    if (A.slot === "C" && A.depth === 0) {
      const h = hiFix(p1, A.tau);                                     // the index must not absorb a fixed point
      if (h && (!B || cmp(h, B) > 0)) return false;
    } else {                                                          // nor the sort a fixed point of the sort map
      const fixedE = q => { const i = info(q); return i.kind !== "one" && i.kind !== "B" && cmp(inSort(q), lastE(A.ctx(add(A.big, [q[0]])))) >= 0; };
      let q = p1, h = null;
      for (let n = 0; q && n < 10000; n++) { if (fixedE(q)) { h = q; break; } q = sbase(q); }
      if (h && (!B || cmp(h, B) > 0)) return false;
    }
    return true;
  }
  // Buchholz's G, slot by slot. The class parameters of a coefficient collapse (the principals of its sort τ and
  // prefix) are free: the class exists, so the self-collapse of every regular is available.
  function G(p, A) {
    const alpha = collArg(A), cls = A.cls, base = sbase(p), seen = new Set(), Om = prin(TTj);
    if (A.slot === "C") for (const q of [...principals(A.tau), ...principals(A.Q)]) seen.add(key(q));
    let ok = true;
    function walk(q) {
      if (!ok) return;
      if (base && cmp(q, base) <= 0) return;
      if (cmp(q, p) < 0) return;
      const kq = key(q);
      if (seen.has(kq)) return;
      seen.add(kq);
      const B = gview(q);
      if (B.kind === "one") return;
      if (A.slot === "C") {
        const tr = trailing(pv(q));
        if (tr.tau.length && eq(tr.tau, A.tau) && tr.c.every(m => cmpM(m, prin(add(tr.Q, [mkP(add(A.tau, ONE), ONEP)]))[0]) < 0)) {
          if (tr.Q.length) walk(prin(tr.Q));
          for (const c of principals(tr.c)) walk(c);
          return;
        }
      }
      if (B.kind === "B" || B.kind === "coll") {
        const beta = collArg(B);
        if (cmp(B.cls, cls) <= 0) { if (cmp(beta, alpha) >= 0) { ok = false; return; } }
        else if (cmp(B.cls, Om) > 0 && cmp(beta, alpha) >= 0) { ok = false; return; }
        else for (const J of principals(beta)) if (cmp(logP(J[0]), alpha) >= 0) { ok = false; return; }
      }
      for (const c of children(q)) walk(c);
    }
    for (const q of principals(alpha)) walk(q);
    return ok;
  }


  // ---------------------------------------------------------------- fundamental sequences of ψ_j(x)
  // an R-made sup: the enclosing atom's own fundamental sequence
  // an R-made sup: the fundamental sequence of the innermost enclosing principal that has cofinality ω (or the
  // cofinality of a level ≤ j regular, passed through)
  function uplan(at) {
    for (let e = at; e; e = e.up) {
      const d = domT([e.atom]);
      if (d.t === "w" || (d.t === "reg" && lev(d.R[0]) <= j)) return {dom: d, fs: a => prin(e.ctx(fsT([e.atom], a)))};
    }
    throw new Error("uplan: no enclosing principal of cofinality ω");
  }
  function plan(p) {
    const x = pv(p);
    if (!x.length) return j === 0 ? {dom: {t: "succ"}, fs: () => Z} : {dom: {t: "reg", R: p}, fs: xi => xi};
    if (regular(x)) return {dom: {t: "reg", R: p}, fs: xi => xi};
    if (j >= 1 && strong(p[0])) {                                     // R^u·p at a regular R: Cantor normal form base R
      const v = rview(p[0]);
      if (!v.atom && v.QR.length < x.length && regular(v.QR)) {
        if (!isOneM(v.p)) return {dom: domT([v.p]), fs: a => mulR(v.R, v.u, fsT([v.p], a))};
        if (isOneM(last(v.u))) return {dom: {t: "reg", R: [v.R]}, fs: xi => mulR(v.R, pred(v.u), xi)};
        return {dom: domT(v.u), fs: a => mulR(v.R, fsT(v.u, a), ONE)};
      }
    }
    let A = info(p);
    if (A.umade) return uplan(A.umade);
    while (A.kind === "point" && domT(A.g).t === "succ") {
      if (A.slot === "S" && A.vd && isOneM(last(A.g))) {             // R- or T_b-coefficient successor at a limit
        A = A.vd();                                                   // exponent: descend into the exponent
        if (A.umade) return uplan(A.umade);
        continue;
      }
      if (A.slot !== "C") throw new Error("plan: successor digit in a non-coefficient slot");
      const y = add(A.Q, mulMono(A.tau, pred(A.g))), d = A.depth, F = A.F;
      A = anIn(e => F(powAt(y, e, d)), d + 1, A.tau, A.at, null);
      if (A.umade) return uplan(A.umade);
    }
    const g = A.kind === "B" ? A.g : A.kind === "point" ? A.g : A.big;
    const dg = domT(A.kind === "point" ? A.small : g);
    const argF = A.kind === "point" ? (xi => xi) : (xi => fsT(g, xi));
    if (A.kind === "B" && dg.t === "succ") { const b = prin(A.ctx(pred(g))); return {dom: {t: "w"}, fs: n => Array(n).fill(b[0])}; }
    if (A.kind === "point") {
      if (dg.t === "w") return {dom: {t: "w"}, fs: n => prin(A.ctx(add(A.big, fsT(A.small, n))))};
      if (dg.t === "reg") return {dom: dg, fs: xi => prin(A.ctx(add(A.big, fsT(A.small, xi))))};
      throw new Error("plan: point digit dom " + dg.t);
    }
    if (dg.t === "w") return {dom: {t: "w"}, fs: n => prin(A.ctx(fsT(g, n)))};
    if (dg.t !== "reg") throw new Error("plan: collapse digit dom " + dg.t);
    const R = dg.R, base = A.ctx(Z);
    if (lev(R[0]) < j || cmp(R, prin(base)) <= 0 || cmp(R, p) < 0) return {dom: dg, fs: xi => prin(A.ctx(fsT(g, xi)))};
    if (A.kind === "B" && base.length) {
      const xd = thetaXD(A.Q);
      if (xd && eq(xd[1], R) && eq([last(g)], R)) {
        const X0 = xd[0], beta = pred(g);
        if ((!beta.length || cmp([beta[0]], X0) < 0) && domT(X0).t === "w")
          return {dom: {t: "w"}, fs: n => prin(A.ctx(add(beta, fsT(X0, n))))};
      }
      if (xd && eq(xd[1], R) && !eq([last(g)], R) && cmp(R, p) > 0) {
        const r = pv(R), aF = xi => fsT(g, xi);
        return {dom: {t: "w"}, fs: n => { let gam = Z; for (let k = 0; k < n; k++) gam = prin(lower(r, aF(gam))); return prin(A.ctx(aF(gam))); }};
      }
    }
    if (A.kind === "coll" && A.slot === "C" && A.depth === 0 && eq(A.tau, ONE) && eq([last(g)], R)) {
      const r = pv(R), lm = last(r);
      const n1 = lm.k === "P" && lm.b === b1 && lm.e.every(isOneM) ? lm.e.length : -1;
      if (n1 >= 3 && isOneM(lm.c)) {
        const hi = pred(r), X0 = prin(add(hi, mulMono(num(n1 - 1), R))), beta = pred(g);
        if (cmp(X0, R) < 0 && (!beta.length || cmp([beta[0]], X0) < 0) && domT(X0).t === "w")
          return {dom: {t: "w"}, fs: n => prin(A.ctx(add(beta, fsT(X0, n))))};
      }
    }
    // crossing: g_(k+1) = ψ(join(base, lower(r, α[g_k]))); at a coefficient slot of T^τ whose R-collapse is an
    // exponent, climb through the sorts above τ
    const r = pv(R);
    const shift = A.slot === "C" && A.depth === 0 && expType(r);
    const xd = A.kind === "B" ? thetaXD(A.Q) : null;
    const step = gam => {
      const b = argF(gam);
      let y = lower(r, b);
      if (shift && y.length && cmp(y, A.Dz) < 0) {                   // strong: the iterates lie in [D, R)
        let i = 0;
        while (i < y.length && i < A.Dz.length && !cmpM(y[i], A.Dz[i])) i++;
        const E = i < y.length ? expOf(y[i]) : Z, s = expOf(A.Dz[i]);
        if (cmp(E, s) < 0) {
          let k = 0;
          while (k < E.length && k < s.length && !cmpM(E[k], s[k])) k++;
          y = add(A.Dz.slice(0, i), [mkP(add(s, E.slice(k)), ONEP)]);
        }
      }
      const v = prin(join(base, y));
      if (xd) { const h = argF(v); if (h.length && cmp([h[0]], xd[0]) >= 0 && cmp([h[0]], xd[1]) < 0) return xd[1]; }
      return v;
    };
    {
      let gam = Z;
      for (let k = 1; k <= 4; k++) {
        gam = step(gam);
        if (!stdP(prin(A.ctx(argF(gam))))) {                          // cap: the least excluded collapse
          let cap = gam;
          for (let guard = 0; guard < 50 && domT(cap).t === "w"; guard++) {
            let lw = null;
            for (let m = 0; m <= 4; m++) { const c = fsT(cap, m); if (!stdP(prin(A.ctx(argF(c))))) { lw = c; break; } }
            if (!lw) break;
            cap = lw;
          }
          if (domT(cap).t === "w") return {dom: {t: "w"}, fs: n => prin(A.ctx(argF(fsT(cap, n))))};
          break;
        }
      }
    }
    return {dom: {t: "w"}, fs: n => {
      let gam = Z;
      for (let k = 0; k < n; k++) gam = step(gam);
      return prin(A.ctx(argF(gam)));
    }};
  }
  function expType(r) { const tau = expOf(last(r)); return tau.length > 0 && expOf(last(tau)).length > 0; }
  function join(Qj, y) { return cmp(y, Qj) >= 0 ? y : add(Qj, y); }
  // lower(r, β): replace the final regular-making T (or R) of r by β
  function lower(r, beta) {
    const m = last(r), Qr = pred(r);
    if (sub(m)) throw new Error("lower at level " + j + ": " + show(r));
    if (atomB(m)) return add(Qr, mkPsi(m.j, lower(m.a, beta)));
    if (strong(m)) {
      const v = rview(m), b = m.j;
      if (v.atom) return add(Qr, mkPsi(b, add(v.QR, lower(v.H, beta))));
      if (!isOneM(v.p)) return add(Qr, mulR(v.R, v.u, lower([v.p], beta)));
      if (!isOneM(last(v.u))) return add(Qr, mulR(v.R, lower(v.u, beta), ONE));
      if (level(b).regular(v.QR)) return add(Qr, mulR(v.R, pred(v.u), beta));
      return add(Qr, mulR(v.R, pred(v.u), mkPsi(b, lower(v.QR, beta))));
    }
    if (m.b > b1) return isOneM(m.c) ? add(Qr, [mkPow(m.b, lower(m.e, beta), ONEP)]) : add(Qr, lower([m.c], beta).map(x => mkPow(m.b, m.e, x)));
    const tau = m.e, lt = last(tau);
    if (isOneM(lt)) return add(Qr, mulMono(pred(tau), beta));
    return add(Qr, [mkP(lower(tau, beta), ONEP)]);
  }
  // the self-collapse of a regular p = ψ(r): its last regular-making T replaced by p itself
  function selfCollapse(p) {
    const r = pv(p);
    let s = lower(r, p);
    const A = analyze(s);
    if (A.slot === "B" && A.Q.length) { const xd = thetaXD(A.Q); if (xd && cmp(p, xd[0]) >= 0 && cmp(p, xd[1]) < 0) s = add(A.Q, xd[1]); }
    return prin(s);
  }

  Object.assign(L, {j, analyze, info, gview, sbase, regular, succLike, inSort, stdP, thetaXD, plan, lower, selfCollapse, principals, prin, pv, trailing});
  return L;
}


// ---------------------------------------------------------------- standard form
// a sum is standard when it is non-increasing and every principal is: T_b^e·c needs 0 < e < Ω_(T_b+1) (telescoping)
// and c below T_b (not T_b^atom·1, which is the atom); ψ_b(a) needs a < Ω_(T_(b+1)+1) (telescoping), a in normal
// form (ψ_b(a) for a < Ω_(T_b+1) is a T_b-power) and the slot rules of its level.
function std(t) {
  for (let i = 0; i < t.length; i++) {
    if (i && cmpM(t[i - 1], t[i]) < 0) return false;
    const m = t[i];
    if (m.k === "P") {
      if (m.b < 1 || !m.e.length || cmp(m.e, [U(m.b)]) >= 0 || lev(m.c) >= m.b || !std(m.e) || !std([m.c])) return false;
      if (isOneM(m.c) && m.e.length === 1 && isAtomOf(m.e[0], m.b)) return false;
    } else if (m.j > 0) {
      const r = mkPsi(m.j, m.a);
      if (r.length !== 1 || r[0].k !== "S" || key(r[0].a) !== key(m.a)) return false;
      if (!level(m.j).stdP([m])) return false;
    } else if (!level(0).stdP([m])) return false;
  }
  return true;
}

// ---------------------------------------------------------------- fundamental sequences
// domT(t): {t:"zero"} | {t:"succ"} | {t:"w"} | {t:"reg", R};  fsT(t, arg): arg = n (ω) or a term (reg)
function domT(t) { return t.length ? domP([last(t)]) : {t: "zero"}; }
function fsT(t, arg) { if (!t.length) return Z; return add(pred(t), fsP([last(t)], arg)); }
const DOM = new Map();
function planOf(p) {
  return level(lev(p[0])).plan(p);                                   // T_b^e·c = ψ_b(s) for s below Ω_(T_b+1)
}
function domP(p) {
  const k = key(p);
  if (!DOM.has(k)) DOM.set(k, shifted(planOf(p)));
  return DOM.get(k).dom;
}
function shifted(pl) {
  if (pl.dom.t !== "w") return pl;
  const idx = [];
  return {dom: pl.dom, fs: n => {
    let k = idx.length ? last(idx) + 1 : 0;
    while (idx.length <= n) { let skip = 0; while (skip < 8 && !std(pl.fs(k))) { k++; skip++; } idx.push(k); k++; }
    return pl.fs(idx[n]);
  }};
}
function fsP(p, arg) { domP(p); return DOM.get(key(p)).fs(arg); }
function fsn(t, n) {
  const d = domT(t);
  if (d.t === "succ") return fsT(t);
  if (d.t === "w") return fsT(t, n);
  throw new Error("fsn: dom " + d.t);
}


// ---------------------------------------------------------------- parse / show
// ASCII syntax: p(x) = ψ₀(x), pn(x) = ψ_n(x), T = T₁, Tn = T_n, Wn = Ω_(T_n+1) = ψ_n(T_(n+1)), W = Ω = ψ(T), w = ω,
// numbers, +, *, ^ and the names below.
const DEFS = [["I", "p(T^2)"], ["M", "p(T^T)"], ["K", "p(T^T^T)"], ["N", "p(T^T^2)"], ["L", "p(T*I)"], ["e0", "p(W)"],
  ["X", "p(T^(M+1))"], ["F", "p(T^M)"], ["E", "p1(W1)"], ["E2", "p1(W1*T)"], ["P1", "p1(W1^T)"], ["S1", "p1(W1^T*E2)"]];
const NAMES = new Map();
function parse(s) {
  s = s.replace(/\s+/g, "").replace(/Ω([₀-₉]+)/g, (_, n) => "p(T*" + n + ")").replace(/[₀-₉]/g, c => String(c.charCodeAt(0) - 0x2080)).replace(/_\{([0-9]+)\}/g, "$1")
    .replace(/ψ_?([0-9]+)/g, "p$1").replace(/ψ/g, "p").replace(/T_?([0-9]+)/g, "T$1")
    .replace(/Ω_\{?T([0-9]*)\+1\}?/g, (_, n) => "W" + (n || 1)).replace(/Ω/g, "W").replace(/ω/g, "w").replace(/ε0/g, "e0")
    .replace(/·|⋅/g, "*").replace(/ε_\{?T\+1\}?/g, "E").replace(/ε_\{?T\*2\}?/g, "E2").replace(/Λ/g, "L");
  let i = 0;
  const peek = () => s[i];
  const close = () => { if (s[i++] !== ")") throw new Error("parse: ) expected in " + s); };
  const numAt = () => { let k = i; while (/[0-9]/.test(s[k] || "")) k++; const n = k > i ? +s.slice(i, k) : null; i = k; return n; };
  function expr() { let x = prod(); while (peek() === "+") { i++; x = add(x, prod()); } return x; }
  function prod() { let x = power(); while (peek() === "*") { i++; x = mul(x, power()); } return x; }
  function power() { const b = atomP(); if (peek() === "^") { i++; const e = power(); return pow(b, e); } return b; }
  function atomP() {
    const c = peek();
    if (c === "(") { i++; const x = expr(); close(); return x; }
    if (/[0-9]/.test(c)) return num(numAt());
    if (c === "p") {
      i++;
      const n = numAt() ?? 0;
      if (s[i++] !== "(") throw new Error("parse: ( expected after ψ");
      const x = expr();
      close();
      return mkPsi(n, x);
    }
    if (c === "T") { i++; const n = numAt() ?? 1; if (n < 1) throw new Error("parse: T0"); return TT(n); }
    if (c === "W" && /[0-9]/.test(s[i + 1] || "")) { i++; const n = numAt(); return [U(n)]; }
    if ((c === "W" || c === "ε") && s[i + 1] === "_") { i += 2; return c === "W" ? omegaAt(index()) : epsAt(index()); }
    for (const [nm, src] of DEFS) if (s.startsWith(nm, i) && !/[0-9A-Za-z]/.test(s[i + nm.length] || "")) {
      i += nm.length;
      if (!NAMES.has(nm)) NAMES.set(nm, parse(src));
      return NAMES.get(nm);
    }
    if (c === "W") { i++; return [U(0)]; }
    if (c === "w") { i++; return [S(0, ONE)]; }
    throw new Error(`parse: unexpected '${c}' at ${i} in ${s}`);
  }
  // an index: {expr} or one atom
  function index() {
    if (peek() === "{") { i++; const x = expr(); if (s[i++] !== "}") throw new Error("parse: } expected in " + s); return x; }
    return atomP();
  }
  const x = expr();
  if (i !== s.length) throw new Error("parse: trailing input in " + s);
  return x;
}
// Ω_x = ψ(T·x) for x below T; Ω_(T_j+g) = ψ_j(T_(j+1)·g); Ω_(X+g) = ψ_j(Q+T_(j+1)·g) for a level X = ψ_j(Q)
function omegaAt(idx) {
  if (!idx.length) throw new Error("parse: Ω_0");
  const h = idx[0], g = idx.slice(1);
  if (h.k === "P" && isOne(h.e) && isOneM(h.c)) return mkPsi(h.b, mul(TT(h.b + 1), g));         // Ω_(T_j+g)
  if (h.k === "S" && (h.j === 0 || strong(h)) && g.length && h.a.length && h.a.every(q => lev(q) === h.j + 1)
    && h.a.some(q => !(q.k === "P" && isOne(q.e)))) return mkPsi(h.j, add(h.a, mul(TT(h.j + 1), g)));   // Ω_(X+g)
  return mkPsi(lev(h), mul(TT(lev(h) + 1), idx));                                                // Ω_x (T_j+x = x)
}
// ε_(T_j+k) = ψ_j(Ω_(T_j+1)·k)
function epsAt(idx) {
  const h = idx[0];
  if (!h || lev(h) < 1) throw new Error("parse: ε needs an index T_j+k");
  const j = lev(h), exact = h.k === "P" && isOne(h.e) && isOneM(h.c);
  if (exact && idx.length < 2) throw new Error("parse: ε_(T_j) is not an ε-number above T_j");
  return mkPsi(j, mul([U(j)], exact ? idx.slice(1) : idx));                                      // T_j+k = k when k > T_j
}
let SHOWN = null;
function nameOf(m) {
  // F and X are input shorthands only (X is also the name of the 3-shifted diagonalizer, not ψ(T^(M+1)))
  if (!SHOWN) { SHOWN = new Map(); for (const [nm] of DEFS) { if (nm === "F" || nm === "X") continue; const t = parse(nm); if (t.length === 1) SHOWN.set(keyM(t[0]), nm); } }
  return SHOWN.get(keyM(m));
}
// a string needs no brackets when it is a word or one call p(…)
function atomic(s) {
  if (/^\w+$/.test(s)) return true;
  const m = /^\w+\(/.exec(s);
  if (!m) return false;
  let depth = 0;
  for (let i = m[0].length - 1; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i === s.length - 1;
  }
  return false;
}
const wrap = s => atomic(s) ? s : `(${s})`;
// an exponent needs brackets only for a top-level sum or product: powers group to the right (T^T^T^T)
function wrapExp(s) {
  let depth = 0;
  for (const c of s) {
    if (c === "(" || c === "{") depth++;
    else if (c === ")" || c === "}") depth--;
    else if (!depth && (c === "+" || c === "*")) return `(${s})`;
  }
  return s;
}
const psiName = j => j ? "p" + j : "p";
const tName = b => b === 1 ? "T" : "T" + b;
function showR(R, hook) {
  if (R.a.length === 1 && cmpM(R.a[0], Tp(R.j + 1)) === 0) return R.j ? "W" + R.j : "W";
  return showM(R, hook);
}
// hook(m, show) may name a principal (display options of a page); it gets show for the names' indices
function showM(m, hook) {
  if (hook) { const h = hook(m, t => show(t, hook)); if (h) return h; }
  const nm = hook && hook.noNames ? null : nameOf(m);
  if (nm) return nm;
  if (m.k === "P") {
    // T_b^atom = atom (an atom is an ε-number above T_b): T^ε_(T+1)·ω is written ε_(T+1)·ω
    let s = m.e.length === 1 && isAtomOf(m.e[0], m.b) ? showM(m.e[0], hook) : tName(m.b);
    if (!isOne(m.e) && s === tName(m.b)) s += "^" + wrapExp(show(m.e, hook));
    if (!isOneM(m.c)) s += "*" + wrap(showM(m.c, hook));
    return s;
  }
  if (m.j === 0) return !m.a.length ? "1" : isOne(m.a) ? "w" : cmpM(m, U(0)) === 0 ? "W" : `p(${show(m.a, hook)})`;
  if (strong(m)) {
    const v = rview(m);
    if (!v.atom && !(isOne(v.u) && isOneM(v.p))) {
      let s = showR(v.R, hook);
      if (!isOne(v.u)) s += "^" + wrapExp(show(v.u, hook));
      if (!isOneM(v.p)) s += "*" + wrap(showM(v.p, hook));
      return s;
    }
    if (!v.atom && m.a.length === 1 && cmpM(m.a[0], Tp(m.j + 1)) === 0) return "W" + m.j;
  }
  return `${psiName(m.j)}(${show(m.a, hook)})`;
}
function show(t, hook) {
  if (!t.length) return "0";
  const parts = [];
  for (let i = 0; i < t.length;) {
    let k = i;
    while (k < t.length && !cmpM(t[k], t[i])) k++;
    const n = k - i, m = t[i];
    if (isOneM(m)) parts.push(String(n));
    else parts.push(showM(m, hook) + (n > 1 ? "*" + n : ""));
    i = k;
  }
  return parts.join("+");
}

return {Z, ONE, ONEP, S, Pw, TT, U, lev, strong, atomB, isOne, isOneM, cmp, cmpM, eq, add, mul, pow, num, omega, logP,
  mkPsi, mkPow, argOf, rview, mulR, key, keyM, size, std, domT, fsT, fsn, level, parse, show};

})();
