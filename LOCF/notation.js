// LOCF: TrialPurpleCube's "Definition of LOCF" (blog post, last revised 2024-05-07; the idea is
// Eryx Jayakari's), https://googology.fandom.com/wiki/User_blog:TrialPurpleCube/Definition_of_LOCF,
// with the corrections needed to make it work as intended.
//
// Terms are 0, Ł_a, ψ_a(b) and a+b, compared lexicographically as in the original. Sugar:
// L = Ł₀, L₂ = Ł₁, ..., Ω = ψ_L(0), d = ψ_{L₂}(0) = Ω_{L+1}, ψ(x) = ψ_Ω(x), 1 = ψ(0), ω = ψ(1).
// Ł is only used in the definition: terms are written with L_a = Ł_a for infinite a and L_n = Ł_(n−1),
// and ψ_{Ł_(a+1)}(0) as Ω_{L_a+1}.
// Principals come in three kinds: Ł_a (stable levels), ψ_{Ł_a}(b) (admissible-type levels) and
// ψ_σ(c) with σ = ψ_{Ł_a}(b) (Buchholz-style collapses below σ).
//
// Corrections. Without them there is an infinite descent of standard terms (found by EricABQ,
// earlier by Patcail): ψ(d+ψ_L(d)+I_{k+1}) with I₀ = ψ_L(d), I_{k+1} = ψ_L(ψ_d(d+I_k)), reached from
// ψ(L₂), because clause 6.8 fed a countable argument under ψ_d inside ψ_L.
//  - Standard form: sums non-increasing; ψ_{Ł_a} only for a = 0 or a successor; ψ_σ only for a
//    regular σ; and Buchholz's G at every collapse κ = ψ_s(b): each collapse subterm ψ_{s'}(e) of b
//    that is ≥ κ has e < b (Ł_x is a constant whose index is inspected; subterms < κ are parameters).
//  - dom of ψ_{Ł_a}(b) with dom(b) a regular A-term above Ł_a: regular if b ends in that term
//    (R4a), a sup of cofinality ω if it is buried inside b's last principal (R4b). This replaces
//    clause 4.4. A buried climb inserts collapses into the buried regular.
//  - Clause 6.8 is removed: in ψ_σ(c) with dom(c) = R ≥ σ regular, the climb is c[ψ_R(...)] for
//    every regular R, except that it collapses into σ itself when R is σ's own level Ł, σ's
//    argument a₂ is ≥ Ł and a₂ ≮ c[σ]. ψ_σ(0) for σ = ψ_Ł(P+D) (D regular) is ψ_Ł(P+β_n) with
//    β₀ = 0, β_{n+1} = ψ_D(P+β_n).
//  - [[n]]: [n] when dom ∈ {0,1,ω}; ψ_t(λ_n) at a regular t; else descend into the last argument.
//    Tops λ₀ = 0, λ_n = Ł_{λ_(n−1)} (the text's Ł_{λ_n} read as Ł_{λ_(n−1)}).
// Empirically checked (closures of hundreds of thousands of terms stay standard and decrease, and
// the descent above is not standard); well-foundedness is not proved.

const LOCF = (() => {

class NoFS extends Error {}

// ---------------------------------------------------------------- hash-consed terms
// a term is {id, ps}, ps its principals; a principal is {id, k: "L", a} or {id, k: "P", s, b}
let nextId = 0;
const prins = new Map(), terms = new Map();
function prinL(a) {
	const key = "L" + a.id;
	let p = prins.get(key);
	if (!p) prins.set(key, p = {id: nextId++, k: "L", a});
	return p;
}
function prinP(s, b) {
	const key = "P" + s.id + "," + b.id;
	let p = prins.get(key);
	if (!p) prins.set(key, p = {id: nextId++, k: "P", s, b});
	return p;
}
function term(ps) {
	const key = ps.map(p => p.id).join(",");
	let t = terms.get(key);
	if (!t) terms.set(key, t = {id: nextId++, ps});
	return t;
}
const ZERO = term([]);
const Lv = a => term([prinL(a)]);
const Psi = (s, b) => term([prinP(s, b)]);
const one = p => term([p]);
const add = (x, y) => term(x.ps.concat(y.ps));
const lastOf = t => one(t.ps[t.ps.length - 1]);
const front = t => term(t.ps.slice(0, -1));

const LL = Lv(ZERO);
const OM = Psi(LL, ZERO);
const ONE = Psi(OM, ZERO);
const OMEGA = Psi(OM, ONE);
const D = Psi(Lv(ONE), ZERO);
const ONEP = ONE.ps[0];

function nat(n) {
	return term(Array(n).fill(ONEP));
}
function natOf(t) {
	return t.ps.every(p => p === ONEP) ? t.ps.length : -1;
}
function top(n) {
	let t = ZERO;
	while (n-- > 0) t = Lv(t);
	return t;
}

const isPrin = t => t.ps.length == 1;
const isSucc = t => t.ps.length > 0 && t.ps[t.ps.length - 1] === ONEP;
const zeroOrOne = t => t === ZERO || t === ONE;

// "L": Ł_a, "A": ψ_{Ł_a}(b), "C": ψ_σ(c) with σ of kind A, null otherwise
function kind(p) {
	if (p.k == "L") return "L";
	if (!isPrin(p.s)) return null;
	const q = p.s.ps[0];
	if (q.k == "L") return "A";
	return kind(q) == "A" ? "C" : null;
}
// the index a of the stable level Ł_a a principal lives at
function level(p) {
	const kd = kind(p);
	if (kd == "L") return p.a;
	if (kd == "A") return p.s.ps[0].a;
	if (kd == "C") return p.s.ps[0].s.ps[0].a;
	throw new Error("unsupported subscript");
}
const isL = t => isPrin(t) && t.ps[0].k == "L";
const isA = t => isPrin(t) && kind(t.ps[0]) == "A";
const regularL = t => isL(t) && (t.ps[0].a === ZERO || isSucc(t.ps[0].a));

// ---------------------------------------------------------------- order
const cmpMemo = new Map();
function cmp(x, y) {
	if (x === y) return 0;
	const key = x.id + "," + y.id;
	let r = cmpMemo.get(key);
	if (r === undefined) {
		r = 0;
		const n = Math.min(x.ps.length, y.ps.length);
		for (let i = 0; i < n && !r; i++) r = cmpPrin(x.ps[i], y.ps[i]);
		if (!r) r = x.ps.length < y.ps.length ? -1 : 1;
		cmpMemo.set(key, r);
	}
	return r;
}
const lt = (x, y) => cmp(x, y) < 0;

function cmpPrin(p, q) {
	if (p === q) return 0;
	const kp = kind(p), kq = kind(q);
	if (!kp || !kq) throw new Error("unsupported subscript");
	if (kp == "L" && kq == "L") return cmp(p.a, q.a);
	if (kp == "L") return lt(p.a, level(q)) ? -1 : 1;
	if (kq == "L") return -cmpPrin(q, p);
	if (kp == "A" && kq == "A") return p.s === q.s ? cmp(p.b, q.b) : cmp(p.s, q.s);
	if (kp == "C" && kq == "C") return p.s === q.s ? cmp(p.b, q.b) : cmp(p.s, q.s);
	if (kp == "A") return cmp(one(p), q.s) < 0 ? -1 : 1;  // ψ_σ(c) < σ
	return -cmpPrin(q, p);
}

// ---------------------------------------------------------------- dom
const domMemo = new Map();
function dom(t) {
	let r = domMemo.get(t.id);
	if (!r) domMemo.set(t.id, r = domOf(t));
	return r;
}
function domOf(t) {
	if (t === ZERO) return ZERO;
	if (!isPrin(t)) return dom(lastOf(t));
	const p = t.ps[0], kd = kind(p);
	if (kd == "L") return regularL(t) ? t : dom(p.a);
	if (kd == "A") {
		const db = dom(p.b);
		if (zeroOrOne(db)) return t;                                   // R1
		if (lt(db, p.s)) return db;                                    // R2
		if (isA(db) && lastOf(p.b) === db) return t;                   // R4a; R3 and R4b give ω
		return OMEGA;
	}
	if (kd == "C") {
		if (t === ONE) return ONE;
		const dc = dom(p.b);
		return !zeroOrOne(dc) && lt(dc, p.s) ? dc : OMEGA;
	}
	throw new NoFS("unsupported subscript");
}
const regular = t => isPrin(t) && dom(t) === t;

// ---------------------------------------------------------------- a[t]
function index(t) {
	const n = natOf(t);
	if (n < 0) throw new NoFS("needs a natural index");
	return n;
}
// λ(0) = 0, λ(k+1) = b[ψ_R(λ(k))]
function climb(b, R, n) {
	let x = ZERO;
	for (let i = 0; i < n; i++) x = fs(b, Psi(R, x));
	return x;
}
function times(x, n) {
	return term(Array(n + 1).fill(x.ps[0]));
}

function fs(a, t) {
	if (a === ZERO || a === ONE) return ZERO;
	if (isSucc(a)) return front(a);
	if (!isPrin(a)) return add(one(a.ps[0]), fs(term(a.ps.slice(1)), t));
	const p = a.ps[0], kd = kind(p);
	if (kd == "L") return regularL(a) ? t : Lv(fs(p.a, t));
	if (kd == "A") {
		if (regular(a)) return t;
		const db = dom(p.b);
		if (lt(db, p.s)) return Psi(p.s, fs(p.b, t));
		return Psi(p.s, climb(p.b, db, index(t)));
	}
	// ψ_σ(c), σ = ψ_{Ł_a1}(a2)
	const sig = p.s, a1 = sig.ps[0].s.ps[0].a, a2 = sig.ps[0].b, c = p.b;
	if (c === ZERO) {
		if (a2 === ZERO) {
			if (!isSucc(a1)) throw new NoFS("ψ_σ(0) over a singular level");
			return times(Lv(front(a1)), index(t));
		}
		if (isSucc(a2)) return times(Psi(Lv(a1), front(a2)), index(t));
		// σ = ψ_Ł(P+D) with D regular: ψ_Ł(P+β_n), β_{k+1} = ψ_D(P+β_k)
		const n = index(t), R = dom(a2);
		let beta = ZERO;
		for (let i = 0; i < n; i++) beta = Psi(R, fs(a2, beta));
		return Psi(Lv(a1), fs(a2, beta));
	}
	if (isSucc(c)) return times(Psi(sig, front(c)), index(t));
	const dc = dom(c);
	if (lt(dc, sig)) return Psi(sig, fs(c, t));
	const n = index(t);
	if (!regular(dc)) throw new NoFS("dom of the argument is not regular");
	// no ψ_Ł-value above σ is admissible under G: collapse into σ itself
	if (dc === Lv(a1) && !lt(a2, dc) && !lt(a2, fs(c, sig))) return Psi(sig, climb(c, sig, n));
	return Psi(sig, climb(c, dc, n));
}

// a[[n]]
function fs2(a, n) {
	const da = dom(a);
	if (zeroOrOne(da) || da === OMEGA) return fs(a, nat(n));
	if (!isPrin(a)) return add(one(a.ps[0]), fs2(term(a.ps.slice(1)), n));
	if (da === a) return Psi(a, top(n));
	const p = a.ps[0];
	return p.k == "L" ? Lv(fs2(p.a, n)) : Psi(p.s, fs2(p.b, n));
}

// ---------------------------------------------------------------- standard form
// the arguments of the collapse subterms of t that are not below the principal k
function argsAbove(t, k, out = []) {
	for (const p of t.ps) {
		if (cmpPrin(p, k) < 0) continue;
		if (p.k == "L") {
			argsAbove(p.a, k, out);
		} else {
			out.push(p.b);
			argsAbove(p.b, k, out);
			argsAbove(p.s, k, out);
		}
	}
	return out;
}
const stdMemo = new Map();
function standard(t) {
	let r = stdMemo.get(t.id);
	if (r === undefined) stdMemo.set(t.id, r = standardOf(t));
	return r;
}
function standardOf(t) {
	if (!isPrin(t)) {
		for (let i = 0; i < t.ps.length; i++) {
			if (!standard(one(t.ps[i]))) return false;
			if (i && cmpPrin(t.ps[i - 1], t.ps[i]) < 0) return false;
		}
		return true;
	}
	const p = t.ps[0], kd = kind(p);
	if (!kd) return false;
	if (kd == "L") return standard(p.a);
	if (!standard(p.s) || !standard(p.b)) return false;
	if (kd == "A" ? !regularL(p.s) : !regular(p.s)) return false;
	return argsAbove(p.b, p).every(e => lt(e, p.b));                   // G
}

// ---------------------------------------------------------------- Cantor normal form
// For a regular σ = ψ_{Ł_a}(b) and c with no summand ≥ σ, ψ_σ(c) = ω^(X+1+c), X the level below σ:
// X = Ł_(a−1) for b = 0, X = ψ_{Ł_a}(b−1) for a successor b (ψ = ψ_Ω has no X: ψ(c) = ω^c). When b
// ends in a regular A-term (σ = ψ_L(d), ...), σ has no level below and ψ_σ(c) = ω^(ψ_σ(0)+c). Above
// the first fixed point ψ_σ(σ) = ε_(X+1), c = U+r with U its summands ≥ σ and ψ_σ(U+r) = ω^(ψ_σ(U)+r).
// Levels Ł_a and ψ_{Ł_a}(b) are ε-numbers. Checked against the fundamental sequences, not proved.

const first = t => one(t.ps[0]);
const rest = t => term(t.ps.slice(1));

// x + y with absorption
function osum(x, y) {
	if (y === ZERO) return x;
	let i = x.ps.length;
	while (i && cmp(one(x.ps[i - 1]), first(y)) < 0) i--;
	return term(x.ps.slice(0, i).concat(y.ps));
}

// the summands of c that are ≥ σ, and the rest
function splitU(c, sig) {
	let i = 0;
	while (i < c.ps.length && !lt(one(c.ps[i]), sig)) i++;
	return [term(c.ps.slice(0, i)), term(c.ps.slice(i))];
}

// the level below σ, or "omega" for σ = Ω, or "fix" when σ has none
function below(sig) {
	const p = sig.ps[0], a = p.s.ps[0].a, b = p.b;
	if (b === ZERO) return a === ZERO ? "omega" : Lv(front(a));
	return isSucc(b) ? Psi(p.s, front(b)) : "fix";
}

// the next level above a level X
const nextLevel = X => X.ps[0].k == "L" ? Psi(Lv(add(X.ps[0].a, ONE)), ZERO) : Psi(X.ps[0].s, add(X.ps[0].b, ONE));

// g with ω^g = t, for a principal t
const logs = new Map();
function log(t) {
	if (logs.has(t.id)) return logs.get(t.id);
	const p = t.ps[0];
	let r = t;
	if (kind(p) == "C") {
		const [U, rr] = splitU(p.b, p.s), x = below(p.s);
		r = U !== ZERO ? osum(Psi(p.s, U), rr) : x == "omega" ? p.b : x == "fix" ? osum(Psi(p.s, ZERO), p.b) : osum(add(x, ONE), p.b);
	}
	logs.set(t.id, r);
	return r;
}

// ω^g
function omega(g) {
	if (g === ZERO) return ONE;
	const h = first(g), p = h.ps[0], rs = rest(g);
	if (kind(p) != "C") {
		if (rs === ZERO) return h;
		const n = natOf(rs);
		return Psi(nextLevel(h), n > 0 ? nat(n - 1) : rs);
	}
	const [U] = splitU(p.b, p.s);
	if (U !== ZERO && U === p.b) return Psi(p.s, add(p.b, rs));
	if (below(p.s) == "fix" && p.b === ZERO) return rs === ZERO ? h : Psi(p.s, rs);
	return Psi(p.s, add(U, g));
}

// t = Σ X^F·k with X its base level and t < ε_(X+1), or null
function digits(t) {
	if (t === ZERO) return null;
	const h = first(t), p = h.ps[0];
	let X, E;
	if (kind(p) != "C") {
		X = h;
		E = Psi(nextLevel(h), nextLevel(h));
	} else {
		if (splitU(p.b, p.s)[0] !== ZERO) return null;
		const x = below(p.s);
		if (x == "omega") return null;
		X = x == "fix" ? Psi(p.s, ZERO) : x;
		E = Psi(p.s, p.s);
	}
	if (!lt(t, E)) return null;
	const out = [];
	for (const q of t.ps) {
		const s = one(q);
		let F = ZERO, k = s;
		if (!lt(s, X)) {
			const g = log(s);
			let i = 0;
			while (i < g.ps.length && !lt(one(g.ps[i]), X)) {
				const e = log(one(g.ps[i]));
				F = add(F, omega(first(e) === X ? rest(e) : e));
				i++;
			}
			k = omega(term(g.ps.slice(i)));
		}
		if (out.length && out.at(-1)[0] === F) out.at(-1)[1] = add(out.at(-1)[1], k);
		else out.push([F, k]);
	}
	return {X, d: out};
}

// ---------------------------------------------------------------- strings
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const subDigits = n => String(n).replace(/\d/g, c => SUB[c]);

// display options: om (Ω for ψ_L(0)), psi (ψ(x) for ψ_Ω(x)), d (d for Ω_{L+1}), coef (p+p+p as
// p·3), cnf (base-X Cantor normal form); ψ_{L_(a+1)}(0) is always written Ω_{L_a+1}. The defaults
// give the canonical string.
const CANON = {om: true, psi: true, d: true, coef: false, cnf: false};

// parenthesize a sum or product, as in ordinals/bocf.js (powers group to the right)
function par(s) {
	let depth = 0;
	for (const c of s) {
		if (c == "(" || c == "{") depth++;
		else if (c == ")" || c == "}") depth--;
		else if ("+·".includes(c) && !depth) return "(" + s + ")";
	}
	return s;
}

function show(t, o = CANON) {
	const r = o.cnf && digits(t);
	if (r) {
		const B = showPrin(r.X.ps[0], o);
		return r.d.map(([F, k]) => {
			if (F === ZERO) return show(k, o);
			const pw = F === ONE ? B : B + "^" + par(show(F, o));
			return k === ONE ? pw : pw + "·" + par(show(k, o));
		}).join("+");
	}
	if (o.cnf && t !== ZERO && lt(t, OM)) { // countable: Σ ω^g·k, preserving ψ_Ω collapses of Ω-parts
		const out = [];
		for (let i = 0, j; i < t.ps.length; i = j) {
			for (j = i; j < t.ps.length && t.ps[j] === t.ps[i]; j++);
			const p = t.ps[i], s = one(p), g = log(s);
			const [U] = kind(p) == "C" && p.s === OM ? splitU(p.b, p.s) : [ZERO];
			const x = g === ZERO ? null : g === ONE ? "ω" : g === s || U !== ZERO ? showPrin(p, o) : "ω^" + par(show(g, o));
			out.push(x == null ? String(j - i) : j - i > 1 ? x + "·" + (j - i) : x);
		}
		return out.join("+");
	}
	const out = [];
	for (let i = 0; i < t.ps.length;) {
		let j = i;
		while (j < t.ps.length && t.ps[j] === ONEP) j++;
		if (j > i) {
			out.push(String(j - i));
			i = j;
			continue;
		}
		while (j < t.ps.length && t.ps[j] === t.ps[i]) j++;
		const p = showPrin(t.ps[i], o);
		if (o.coef && j - i > 1) out.push(p + "·" + (j - i));
		else for (let k = i; k < j; k++) out.push(p);
		i = j;
	}
	return out.length ? out.join("+") : "0";
}

// a subscript, in braces only when it is a sum or has a coefficient
function wrap(t, o) {
	const s = show(t, o);
	let depth = 0;
	for (const c of s) {
		if (c == "(" || c == "{") depth++;
		else if (c == ")" || c == "}") depth--;
		else if ("+·^".includes(c) && !depth) return "{" + s + "}";
	}
	return s;
}

// the stable level Ł_a is written L_(1+a): L = Ł₀, L₂ = Ł₁, ..., and L_a = Ł_a for infinite a
function showLevel(a, o) {
	const n = natOf(a);
	return n == 0 ? "L" : n > 0 ? "L" + subDigits(n + 1) : "L_" + wrap(a, o);
}

function showPrin(p, o) {
	if (p.k == "L") return showLevel(p.a, o);
	const t = one(p);
	if (t === OMEGA && o.psi && o.om) return "ω";
	const lev = isPrin(p.s) && p.s.ps[0].k == "L" ? p.s.ps[0].a : null; // σ = Ł_lev
	if (lev && !p.b.ps.length) { // ψ_{L_(a+1)}(0)
		if (lev === ZERO && o.om) return "Ω";
		const a = isSucc(lev) ? front(lev) : null;
		if (a) return t === D && o.d ? "d" : "Ω_{" + showLevel(a, o) + "+1}";
	}
	const sub = p.s === OM && o.psi ? "" : "_" + wrap(p.s, o);
	return "ψ" + sub + "(" + show(p.b, o) + ")";
}

// also accepts ASCII: p for ψ, W for Ω, w for ω, L2 for L₂
function parse(str) {
	const s = str.replace(/\s+/g, "").replace(/[₀-₉]/g, c => SUB.indexOf(c));
	let i = 0;
	const fail = () => { throw new Error("cannot parse " + str + " at " + i); };
	const eat = c => s[i] == c ? (i++, true) : false;
	const need = c => eat(c) || fail();
	function digits() {
		const j = i;
		while (/\d/.test(s[i] || "")) i++;
		return i > j ? +s.slice(j, i) : -1;
	}
	function sub() {
		if (!eat("{")) return prin();
		const t = sum();
		need("}");
		return t;
	}
	function prin() {
		const n = digits();
		if (n >= 0) return nat(n);
		const c = s[i++];
		if (c == "ω" || c == "w") return OMEGA;
		if (c == "Ω" || c == "W") {
			if (!eat("_")) return OM;
			const t = sub(); // Ω_{L_a+1} = ψ_{Ł_(a+1)}(0)
			const lv = front(t);
			if (!isSucc(t) || !isPrin(lv) || lv.ps[0].k != "L") fail();
			return Psi(Lv(add(lv.ps[0].a, ONE)), ZERO);
		}
		if (c == "d") return D;
		if (c == "L") {
			if (eat("_")) { // L_a = Ł_a for infinite a, L_n = Ł_(n-1)
				const a = sub();
				const n = natOf(a);
				if (n == 0) fail();
				return Lv(n > 0 ? nat(n - 1) : a);
			}
			const m = digits();
			if (m == 0) fail();
			return Lv(nat(m < 0 ? 0 : m - 1));
		}
		if (c == "Ł") {
			need("_");
			return Lv(sub());
		}
		if (c == "ψ" || c == "p") {
			const sb = eat("_") ? sub() : OM;
			if (!isPrin(sb)) fail();
			need("(");
			const b = sum();
			need(")");
			return Psi(sb, b);
		}
		i--;
		fail();
	}
	// a principal, possibly with a coefficient p·k
	function term() {
		const p = prin();
		if (!eat("·")) return p;
		const k = digits();
		if (k < 1) fail();
		let t = ZERO;
		for (let j = 0; j < k; j++) t = add(t, p);
		return t;
	}
	function sum() {
		let t = term();
		while (eat("+")) t = add(t, term());
		return t;
	}
	const t = sum();
	if (i < s.length) fail();
	return t;
}

return {digits, log, omega, NoFS, isSucc, ZERO, ONE, OM, OMEGA, D, cmp, lt, kind, dom, regular, fs, fs2, standard, show, parse, top, nat, CANON};

})();

class notation {
	static title = "LOCF";
	static lessOrEqual(a, b) {
		return LOCF.cmp(a, b) <= 0;
	}

	// ψ(0), ψ(L), ψ(L_L), ψ(L_L_L), ...: Ω[[n]]
	static expandLimit(n) {
		return LOCF.fs2(LOCF.OM, n);
	}

	static expand(a, n) {
		return a === LOCF.ZERO ? a : LOCF.fs2(a, n);
	}

	static isSuccessor(a) {
		return a === LOCF.ZERO || LOCF.isSucc(a);
	}

	static toString(a) {
		return LOCF.show(a);
	}

	static fromString(s) {
		return LOCF.parse(s);
	}

	static om = true;
	static psi = true;
	static d = true;
	static coef = true;
	static cnf = true;

	static parameters = [
		{type: "checkbox", id: "om", label: "Ω = ψ_L(0)"},
		{type: "checkbox", id: "psi", label: "ψ(x) = ψ_Ω(x)"},
		{type: "checkbox", id: "d", label: "d = Ω_{L+1}"},
		{type: "checkbox", id: "coef", visibleIf: () => !notation.cnf, label: "Coefficients (L+L = L·2)"},
		{type: "checkbox", id: "cnf", label: "Cantor normal form (L^L)"},
	]

	static convertToNotation(value) {
		return LOCF.show(LOCF.parse(value), {om: notation.om, psi: notation.psi, d: notation.d, coef: notation.coef, cnf: notation.cnf});
	}
};
