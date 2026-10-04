// LOCF: TrialPurpleCube's "Definition of LOCF" (blog post, last revised 2024-05-07; the idea is
// Eryx Jayakari's), https://googology.fandom.com/wiki/User_blog:TrialPurpleCube/Definition_of_LOCF,
// with the corrections needed to make it work as intended, and with a strong reading of the levels below L.
//
// Terms are 0, Ł_a, ψ_a(b) and a+b, compared lexicographically as in the original. Sugar:
// L = Ł₀, L₂ = Ł₁, ..., Ω = ψ_L(0), d = ψ_{L₂}(0) = Ω_{L+1}, ψ(x) = ψ_Ω(x), 1 = ψ(0), ω = ψ(1).
// Ł is only used in the definition: terms are written with L_a = Ł_a for infinite a and L_n = Ł_(n−1),
// and ψ_{Ł_(a+1)}(0) as Ω_{L_a+1}. L⁺⁺ = ψ_{L₂}(1) = Ω_{L+2}, L⁺⁺⁺ = ψ_{L₂}(2).
//
// Below L. The levels ψ_L(x), x < L⁺⁺, are read with the strong 2-shifted collapse analysis that T OCF also uses
// (ordinals/tocf.js): every level k is a collapse ψ_k over a collapsing regular T_(k+1), and LOCF's Ł_k⁺ =
// ψ_{Ł_(k+1)}(0) plays T_(k+1). In the analysis' terms:
//   ψ_L(x) = ψ₀(T·(1+x̂)),  ψ_{Ł_k}(ξ) = ψ_k(T_(k+1)·ξ̂) for k ≥ 1 (so d ↦ T, L⁺⁺ ↦ Ω_(T+1), L₂⁺ ↦ T₂),
//   ψ_σ(z) = ψ_k(T_(k+1)·ξ̂+1+ẑ) for the successor level σ = ψ_{Ł_k}(ξ+1) (ψ_{L⁺⁺}(y) = ψ₁(1+ŷ), ψ_{L⁺⁺⁺}(z) = ψ₁(T₂+1+ẑ)),
//   where z is read as the argument of a collapse below a level one level up (below): its part H = (Ł_k⁺)·γ is a
//   level, a run after it reads Ł_k as the next regular D = ψ_{Ł_k}(X+H+Ł_k⁺), and other terms stay below that D.
// Inside the argument of ψ_{Ł_k}, Ł_k is the ordinal being collapsed. A run, the final segment of a sum that starts
// with Ł_k or ψ_{Ł_k⁺}(y), is a digit climbing to Ł_k⁺; with D = ψ_k(Y_D) the regular ψ_{Ł_k}(argument with the run
// raised to Ł_k⁺), the run reads Ł_k ↦ D and ψ_{Ł_k⁺}(y) ↦ ψ_k(Y_D+1+ŷ), so ψ_{Ł_k⁺} is the collapse into D's successor
// level. Runs are read left to right. So
//   ψ_L(L) = ψ(T·I) is the first Ω-fixed point; ψ_L(ψ_d(d)) = ψ_L(ε_(L+1)) = ψ(T·Ω_(I+1)) is Φ(1@(1@…)), the
//   limit of the Ω-fixed-point hierarchy; ψ_L(d) = ψ(T²) = I, ψ_L(d+d) = I₂, ψ_L(d^d) = M,
//   ψ_L(ε_(d+1)) = ψ(ε_(T+1)), ψ_L(φ(d,1)) = ψ(φ(T,1)), ψ_L(ψ_{L⁺⁺}(L⁺⁺⁺)) = ψ(ψ₁(Ω_(T+2))),
//   ψ_L(ψ_{L⁺⁺}(L₂)) = ψ(ψ₁(I_(T+1))) (the collapse at the Ω-fixed point above T, as ψ(L) = ψ(I) is the one at Λ),
//   ψ_L(ψ_{L⁺⁺}(L₂⁺)) = ψ(ψ₁(Ω_(I_(T+1)+1))), and ψ_L(L⁺⁺) is the least ordinal above all of these.
// Every other ordinal below L is a collapse below a level: ψ_σ(c) = ψ(Q+1+ĉ) for a level σ = ψ(Q+T) (ψ(ĉ) for σ = Ω),
// so ψ_σ(c) = ω^(X+1+c) with X = ψ(Q) the level below σ. In c the stable structure is read as inside ψ_L, from σ on:
// its part H = d·γ from d on stands for the level ψ_L(H+γ) (γ a successor) or ψ_L(H); a run after H reads L as
// D = ψ_L(H+d); otherwise terms of the analysis below that D may follow. So ψ(L) = ψ(I), ψ(d) = ψ(Ω_(I+1)),
// ψ(d+ε_(Ω_(I+1)+1)) = ψ(Ω_(I+2)), ψ(d+L) = ψ(I₂), ψ(d+d) = ψ(Ω_(I₂+2)), ψ(d^d) = ψ(M), and ψ(c) climbs to ψ(L⁺⁺) as c
// climbs to L⁺⁺. Every LOCF ordinal below σ may appear in c, also those above L⁺⁺: Ω·x = ψ_Ω₂(x) for every countable
// x, so Ω² = ψ_Ω₂(Ω) has the sequence Ω·ψ(L⁺⁺), Ω·ψ(L_L), .... Such a collapse is compared with the terms below L
// through ĉ.
// A regular with no level below it, such as ψ_L(d) (rule R4a below), has no such collapses: ψ_σ(c) takes c ≥ L⁺⁺,
// above everything below σ. Countable collapses likewise take arguments below L⁺⁺ or from L⁺⁺ on; ψ(c) for c in
// [L⁺⁺, ...) continues above every ordinal below ψ_L(L⁺⁺).
//
// Above, principals come in three kinds: Ł_a (stable levels), ψ_{Ł_a}(b) (admissible-type levels) and ψ_σ(c) with
// σ = ψ_{Ł_a}(b) or a regular below L (Buchholz-style collapses below σ).
//
// Corrections. Without them there is an infinite descent of standard terms (found by EricABQ,
// earlier by Patcail): ψ(d+ψ_L(d)+I_{k+1}) with I₀ = ψ_L(d), I_{k+1} = ψ_L(ψ_d(d+I_k)), reached from
// ψ(L₂), because clause 6.8 fed a countable argument under ψ_d inside ψ_L.
//  - Standard form: sums non-increasing; ψ_{Ł_a} only for a = 0 or a successor; ψ_σ only for a
//    regular σ; and Buchholz's G at every collapse κ = ψ_s(b): each collapse subterm ψ_{s'}(e) of b
//    that is ≥ κ has e < b (Ł_x is a constant whose index is inspected; subterms < κ are parameters;
//    a level ψ_L(x) below L that is ≥ κ is charged its argument x). A collapse into a successor cardinal
//    ψ_{Ł_c}(0) or ψ_{Ł_c}(ξ+1) (d, L⁺⁺, L⁺⁺⁺, L₂⁺, …) is strong: G does not charge it at a ψ_{Ł}(b) or inside another
//    such collapse, so ψ_L(ψ_{L⁺⁺⁺}(L⁺⁺⁺)) and ψ_L(ψ_d(Ω_{L+ω})) are levels, as ψ_L(ψ_{L⁺⁺}(L⁺⁺)) is. Inside it G applies:
//    ψ_d(L₂) is the collapse at the fixed point ψ_{L₂}(L₂), and ψ_d(ψ_{L₂}(L₂)) is not standard (as ψ(ψ_L(L)) is not).
//  - dom of ψ_{Ł_a}(b) with dom(b) a regular A-term above Ł_a: regular if b ends in that term
//    (R4a), a sup of cofinality ω if it is buried inside b's last principal (R4b). This replaces
//    clause 4.4.
//  - Clause 6.8 is removed: in ψ_σ(c) with dom(c) = R ≥ σ regular, the climb is c[ψ_R(...)] for
//    every regular R, except that it collapses into σ itself when R is σ's own level Ł and no
//    ψ_Ł-value above σ is admissible.
//  - [[n]]: [n] when dom ∈ {0,1,ω}; ψ_t(λ_n) at a regular t (ψ_t(L⁺⁺), the sup of everything below t that the levels
//    below L name, at such a regular); else descend into the last argument, where a term below L with a regular dom R
//    takes R[[n]] as its index. Tops λ₀ = 0, λ_n = Ł_{λ_(n−1)}.
// Standardness and fundamental sequences are checked empirically (also against an LOCF–BMS analysis by 东冬送屋, whose
// ψ_X(ψ_{Ł_c}(y)) is ψ_X(y) here); well-foundedness is not proved.

// The display: plain LOCF terms, hash-consed, with LOCF's order, its Cantor normal form and the string options.
const Disp = (() => {

	// ---------------------------------------------------------------- hash-consed terms (for display)
	// a term is {id, ps}, ps its principals; a principal is {id, k: "L", a} or {id, k: "P", s, b}
	let nextId = 0;
	const prins = new Map(), terms = new Map();
	function prinL(a) {
		const key = "L" + a.id;
		let p = prins.get(key);
		if (!p) prins.set(key, p = {id: nextId++, k: "L", a});
		return p;
	}
	function prinX(s) {
		const key = "X" + s;
		let p = prins.get(key);
		if (!p) prins.set(key, p = {id: nextId++, k: "X", s});
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
		if (p.k == "X") return null;
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
	const ltSafe = (x, y) => { try { return lt(x, y); } catch (e) { return false; } };

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

	// the log of a leaf below L, from the level analysis (LOCF's own identities read L literally)
	const trueLog = new Set();
	function setLog(t, g) { logs.set(t.id, g); trueLog.add(t.id); }
	// q < ε_(X+1) for a principal q: q ≤ X, or q = ω^g with every principal of g below ε_(X+1)
	function belowEps(q, X, depth) {
		if (q === X || lt(q, X)) return true;
		const g = log(q);
		if (g === q || depth > 12) return false;
		return g.ps.every(p => belowEps(one(p), X, depth + 1));
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
			if (splitU(p.b, p.s)[0] !== ZERO && !trueLog.has(h.id)) return null;
			const x = below(p.s);
			if (x == "omega") return null;
			X = x == "fix" ? Psi(p.s, ZERO) : x;
			E = Psi(p.s, p.s);
		}
		if (trueLog.has(h.id) ? !belowEps(h, X, 0) : !lt(t, E)) return null;
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
	const CANON = {om: true, psi: true, d: true, omx: false, coef: false, cnf: false};

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
		if (o.cnf) {
			try {
				return showCNF(t, o);
			} catch (e) { // a T OCF leaf without an LOCF spelling
				o = {...o, cnf: false};
			}
		}
		return showPlain(t, o);
	}

	function showCNF(t, o) {
		const r = digits(t);
		if (r) {
			const B = showPrin(r.X.ps[0], o);
			return r.d.map(([F, k]) => {
				if (F === ZERO) return show(k, o);
				const pw = F === ONE ? B : B + "^" + par(show(F, o));
				return k === ONE ? pw : pw + "·" + par(show(k, o));
			}).join("+");
		}
		if (t !== ZERO && lt(t, OM)) { // countable: Σ ω^g·k, preserving ψ_Ω collapses of Ω-parts
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
		return showPlain(t, o);
	}

	function showPlain(t, o) {
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
		if (p.k == "X") return p.s;
		if (p.k == "L") return showLevel(p.a, o);
		const t = one(p);
		if (t === OMEGA && o.psi && o.om) return "ω";
		const lev = isPrin(p.s) && p.s.ps[0].k == "L" ? p.s.ps[0].a : null; // σ = Ł_lev
		if (lev && !p.b.ps.length) { // ψ_{L_(a+1)}(0)
			if (lev === ZERO && o.om) return "Ω";
			const a = isSucc(lev) ? front(lev) : null;
			if (a) return t === D && o.d ? "d" : "Ω_{" + showLevel(a, o) + "+1}";
		}
		if (lev && o.omx && (lev === ZERO || isSucc(lev)) && ltSafe(p.b, Psi(p.s, p.s))) { // below the first fixed point
			const n = natOf(p.b);
			if (lev === ZERO) return n == 0 ? "Ω" : n > 0 ? "Ω" + subDigits(n + 1) : "Ω_" + wrap(p.b, o);
			return "Ω_" + wrap(osum(add(Lv(front(lev)), ONE), p.b), o);
		}
		const sub = p.s === OM && o.psi ? "" : "_" + wrap(p.s, o);
		return "ψ" + sub + "(" + show(p.b, o) + ")";
	}

const X = s => term([prinX(s)]);
return {term, Lv, Psi, X, ONE, show, setLog, CANON};

})();

const LOCF = (() => {

const T = TOCF;

// the shared level analysis (ordinals/tocf.js): level-0 principals ψ(a) are the leaves; T = T₁, Ω_(T+1) = ψ₁(T₂)
const isW0 = m => m.k === "S" && m.j === 0;
const subT = t => t.every(isW0);
const isTP = m => m.k === "P" && m.b === 1;                     // T^e·c
const isAt = m => T.atomB(m) && m.j === 1;                      // ψ₁(α), α < T₂
const isV = m => T.strong(m) && m.j === 1;                      // a strong ψ₁-value, ≥ Ω_(T+1)
const prin0 = a => T.mkPsi(0, a);
const mkP1 = (e, c) => T.mkPow(1, e, c);
const TT1 = T.TT(1), UU = [T.U(1)];

class Undef extends Error {}
class NoImage extends Undef {}                                   // a LOCF spelling with no T-world image

// ---------------- terms
// A term is a list of principals: {t: "W", w} a T OCF principal (a leaf: the ordinals below L that T OCF names are kept
// in T OCF form, the "T OCF world"), {t: "L", a} Ł_a, and {t: "P", s, b} ψ_s(b). Terms that are not leaves form the
// superstructure. A leaf w = ψ(T·(1+x̂)) is the level ψ_L(x); x̂ is its hidden argument (wHidden).
const Z = [];
const W = w => ({ t: "W", w });
const Wt = tt => tt.map(m => { if (!isW0(m)) throw new Undef("W-leaf not sub-T: " + T.show([m])); return W(m); });
const L = a => [{ t: "L", a }];
const P = (s, b) => [{ t: "P", s, b }];
const cat = (x, y) => x.concat(y);
const pk = p => p.t === "W" ? "W" + T.key([p.w]) : p.t === "X" ? "X" + T.key([p.w]) : p.t === "L" ? `Ł(${key(p.a)})` : `ψ(${key(p.s)},${key(p.b)})`;
const key = x => x.length ? x.map(pk).join("+") : "0";
const eq = (x, y) => key(x) === key(y);
const last = x => [x[x.length - 1]];
const ONE = [W(T.ONEP)];
const OMEGA = Wt(T.parse("w"));
const OM = Wt(T.parse("W"));
const nat = n => { let r = Z; for (let i = 0; i < n; i++) r = cat(r, ONE); return r; };
const natOf = t => t.every(q => q.t === "W" && T.isOneM(q.w)) ? t.length : -1;
const isSucc = x => x.length > 0 && eq(last(x), ONE);
const pred = x => x.slice(0, -1);
const in01 = x => x.length === 0 || eq(x, ONE);
const L0 = L(Z), D = P(L(ONE), Z), LPP = P(L(ONE), ONE), LP3 = P(L(ONE), nat(2));
const lamTop = n => { let r = Z; for (let i = 0; i < n; i++) r = L(r); return r; };

function kind(p) {
	if (p.t === "W") return "W";
	if (p.t === "L") return "L";
	const s = p.s;
	if (s.length !== 1) return null;
	if (s[0].t === "L") return "A";
	if (s[0].t === "W" || (s[0].t === "P" && kind(s[0]) === "A")) return "C";
	return null;
}
const isL = t => t.length === 1 && t[0].t === "L";
const isA = t => t.length === 1 && t[0].t === "P" && kind(t[0]) === "A";
const regL = t => isL(t) && (t[0].a.length === 0 || isSucc(t[0].a));
const wReg = w => { const d = T.domT([w]); return d.t === "reg" && T.key(d.R) === T.key([w]); };

// ---------------- order
const memo = new Map();
function lt(a, b) { const k = key(a) + "<" + key(b); let r = memo.get(k); if (r === undefined) { r = lt0(a, b); memo.set(k, r); } return r; }
const le = (a, b) => eq(a, b) || lt(a, b);
function lt0(a, b) {
	if (!a.length) return b.length > 0;
	if (!b.length) return false;
	if (a.length > 1 || b.length > 1) {
		const a1 = [a[0]], b1 = [b[0]];
		if (eq(a1, b1)) return lt(a.slice(1), b.slice(1));
		return lt(a1, b1);
	}
	const p = a[0], q = b[0], ka = kind(p), kb = kind(q);
	if (ka === "W" && kb === "W") return T.cmp([p.w], [q.w]) < 0;
	if (ka === "W") {                                             // T-world below all superstructure, except:
		if (kb === "C" && q.s[0].t === "W") return isHybrid(q) ? wBelowH(p.w, q) : lt(a, q.s);      // a collapse into σ lies above the T-world below σ
		if (kb === "A" && !q.s[0].a.length && lt(q.b, LPP)) return wBelowA(p.w, q.b);   // ψ_L(y), y < L⁺⁺, y not T-world
		return true;
	}
	if (kb === "W") {
		if (ka === "C" && p.s[0].t === "W") return isHybrid(p) ? !wBelowH(q.w, p) : le(p.s, b);
		if (ka === "A" && !p.s[0].a.length && lt(p.b, LPP)) return !wBelowA(q.w, p.b);
		return false;
	}
	if (ka === "L") return kb === "L" ? lt(p.a, q.a) : lt(a, q.s);
	if (ka === "A") {
		if (kb === "L") return le(p.s[0].a, q.a);
		if (kb === "A") return eq(p.s, q.s) ? lt(p.b, q.b) : lt(p.s[0].a, q.s[0].a);
		return lt(a, q.s);
	}
	if (kb === "L") return lt(p.s, b);
	if (kb === "A") return le(p.s, b);
	if (eq(p.s, q.s) && isHybrid(p) && isHybrid(q)) { const x = hybItems(p), y = hybItems(q); if (x && y) return cmpItems(x, y) < 0; }
	return eq(p.s, q.s) ? lt(p.b, q.b) : lt(p.s, q.s);
}

// w < ψ_L(y) (y < L⁺⁺ with a superstructure parameter): w countable, or w ∈ [Ω_x, Ω_{x+1}) with x < y
function wBelowA(w, y) {
	if (subT(w.a)) return true;
	return cmpCL(wHidden(w), y) < 0;
}
// A level ψ_L(y) whose argument has a countable parameter beyond the T-world (a hybrid level, e.g. ψ_L(d^ξ) for such a
// ξ) is compared with the analysis' terms through the dictionary, principal by principal: cmpCL(x̂, y) compares the
// analysis' term x̂ with the LOCF term y as arguments.
const onePlus = z => !z.length || T.isOneM(z[0].w || {}) ? cat(ONE, z) : z;
function cmpCL(xh, y) {
	// a run in y: Ł ↦ its value D (kept as a translated principal), ψ_d(z) ↦ ψ(Y_D+1+z) (marked, compared below)
	const f = findRun(y);
	if (f) {
		let Dw = null;
		try { Dw = toW7(f.raised)[0].w; } catch (e) { if (!(e instanceof Undef)) throw e; }
		if (Dw) {
			const mark = r => r.map(q => q.t === "L" && !q.a.length ? {t: "X", w: Dw} : q.t === "P" && eq(q.s, D) ? {t: "R", D: Dw, z: mark(q.b)}
				: q.t === "P" && !lt([q], D) ? {t: "P", s: q.s, b: mark(q.b)} : q);
			y = f.put(mark(f.run));
		}
	}
	for (let i = 0; ; i++) {
		if (i >= xh.length) return i >= y.length ? 0 : -1;
		if (i >= y.length) return 1;
		const c = cmpPrinCL(xh[i], y[i]);
		if (c) return c;
	}
}
function cmpPrinCL(m, p) {
	if (p.t === "R") {                                            // ψ_d(z) in a run with value D = ψ(Y_D): ψ(Y_D+1+z)
		if (T.lev(m) > 0) return 1;
		const Y = p.D.a, a = m.a;
		const c = T.cmp(a.slice(0, Y.length), Y);
		if (c) return c;
		return a.length === Y.length ? -1 : cmpCL(a.slice(Y.length), onePlus(p.z));
	}
	if (p.t === "L" && natOf(p.a) >= 1) return T.lev(m) <= natOf(p.a) ? -1 : 1;   // Ł_k: above the levels ≤ k, below T_(k+1)
	const kA = p.t === "P" ? stableIdx(p.s) : -1;
	if (kA >= 1) {                                                // ψ_{Ł_k}(ξ) = ψ_k(T_(k+1)·ξ̂)
		if (T.lev(m) !== kA) return T.lev(m) < kA ? -1 : 1;
		if (!T.strong(m)) return p.b.length ? -1 : T.cmpM(m, T.TT(kA)[0]);
		let i = 0;
		while (i < m.a.length && T.lev(m.a[i]) > kA) i++;
		const g = divTj(kA + 1, m.a.slice(0, i));
		if (!g) throw new Undef("cannot compare " + T.show([m]) + " with " + show([p]));
		const c = cmpCL(g, p.b);
		return c || (i < m.a.length ? 1 : 0);
	}
	let q = null;
	try { const t = pl([p], null); if (t.length === 1) q = t[0]; } catch (e) { if (!(e instanceof Undef)) throw e; }
	if (q) return T.cmpM(m, q);
	if (lt([p], D)) return T.lev(m) > 0 ? 1 : eq([W(m)], [p]) ? 0 : lt([W(m)], [p]) ? -1 : 1;   // p below d
	const k = p.t === "P" && p.s.length === 1 && p.s[0].t === "P" ? stableIdx(p.s[0].s) : -1;
	if (k >= 1 && isSucc(p.s[0].b)) {                             // ψ_σ(z) = ψ_k(T_(k+1)·ξ̂+1+ẑ), σ = ψ_{Ł_k}(ξ+1)
		if (T.lev(m) !== k) return T.lev(m) < k ? -1 : 1;
		// m = ψ_k(A+1+ẑ) with A = T_(k+1)·ξ̂ known: split off A by its length (a collapse ψ_(k+1)(h) in ẑ is a T_(k+1)-monomial
		// too, ψ₂(Ω) = T₂·ω^Ω, so the form of a principal does not tell where A ends)
		const xi = pred(p.s[0].b), ah = T.argOf(m), A = T.mul(T.TT(k + 1), argK(k, xi));
		const c = T.cmp(ah.slice(0, A.length), A);
		if (c) return c;
		// ẑ is read with collArgK (a level part H is a level value), so compare in LOCF: spell ẑ back and compare arguments
		const zh = ah.slice(A.length), zh1 = zh.length && T.isOneM(zh[0]) ? zh.slice(1) : zh;
		let zm = null;
		try {
			zm = invCollArg(k, xi, zh1, p.s, {}, {}, {lastD: {}}).full;
			if (T.key(collArgK(k, xi, zm, 0, null)) !== T.key(zh1)) zm = null;
		} catch (e) { if (!(e instanceof Undef)) throw e; zm = null; }
		if (zm) return eq(zm, p.b) ? 0 : lt(zm, p.b) ? -1 : 1;
		return cmpCL(zh, onePlus(p.b));
	}
	if (k >= 1 && regular(p.s)) {                                 // ψ_σ(z) below a regular σ = ψ_{Ł_k}(ξ) with no level below it:
		if (T.lev(m) !== k) return T.lev(m) < k ? -1 : 1;           // above all of the analysis below σ (rule R4a), below σ
		const S = T.mkPsi(k, T.mul(T.TT(k + 1), argK(k, p.s[0].b)));
		return T.cmp([m], S) < 0 ? -1 : 1;
	}
	throw new Undef("cannot compare " + T.show([m]) + " with " + show([p]));
}
// ---------------- the dictionary: LOCF levels below L⁺⁺ as the shared level analysis
// ψ_L(x), x < L⁺⁺, is the level ψ₀(T·(1+x̂)), and ψ_{Ł_k}(ξ) (k ≥ 1) inside it is ψ_k(T_(k+1)·ξ̂): Ł_k plays T_k's
// predecessor, so Ł_k⁺ = ψ_{Ł_(k+1)}(0) ↦ T_(k+1), Ł_k⁺⁺ = ψ_{Ł_(k+1)}(1) ↦ Ω_(T_(k+1)+1). A collapse into the successor level
// ψ_{Ł_k}(ξ+1) is the Buchholz collapse ψ_k(T_(k+1)·ξ̂+1+ẑ) above it (ψ_{L⁺⁺}(y) ↦ ψ₁(1+ŷ), ψ_{L⁺⁺⁺}(z) ↦ ψ₁(T₂+1+ẑ)).
// Inside the argument of ψ_{Ł_k}, Ł_k is the collapsed ordinal itself: a run (the final segment from a principal in
// [Ł_k, Ł_k⁺), i.e. Ł_k or ψ_{Ł_k⁺}(y)) raised to Ł_k⁺ gives the regular D = ψ_{Ł_k}(argument with the run := Ł_k⁺), and
// inside the run Ł_k ↦ D and ψ_{Ł_k⁺}(y) ↦ ψ_k(Y_D+1+ŷ) with D = ψ_k(Y_D).
const Lk = k => L(nat(k)), dk = k => P(L(nat(k + 1)), Z);
const stableIdx = s => s.length === 1 && s[0].t === "L" ? natOf(s[0].a) : -1;
const isRunAt = (p, k) => (p.t === "L" && natOf(p.a) === k) || (p.t === "P" && eq(p.s, dk(k)));
const isRunP = p => isRunAt(p, 0);
function findRunK(x, k) {
	const dK = dk(k);
	for (let i = 0; i < x.length; i++) {
		const p = x[i];
		if (isRunAt(p, k)) return { run: x.slice(i), raised: cat(x.slice(0, i), dK), put: r => cat(x.slice(0, i), r) };
		if (p.t === "P" && !lt([p], dK)) {                          // a principal of a higher level: a run may sit in its argument
			const f = findRunK(p.b, k);
			if (f) return { run: f.run, raised: cat(x.slice(0, i), P(p.s, f.raised)), put: r => cat(cat(x.slice(0, i), P(p.s, f.put(r))), x.slice(i + 1)) };
		}
	}
	return null;
}
const findRun = x => findRunK(x, 0);
// the plain translation at level k; Dk is the level-k run value (a principal of the shared analysis), or null
function plK(k, x, Dk) {
	let r = T.Z;
	for (const p of x) {
		let y;
		if (p.t === "W" || p.t === "X") y = [p.w];
		else if (p.t === "L") {
			if (natOf(p.a) !== k || !Dk) throw new NoImage("no T-world spelling: " + show([p]));
			y = [Dk];
		} else if (Dk && eq(p.s, dk(k))) {                           // ψ_{Ł_k⁺}(y) in a run
			const yy = plK(k, p.b, Dk);
			if (T.cmp(yy, [T.U(k + 1)]) >= 0) throw new NoImage("ψ_{Ł⁺}(y) with y ≥ Ł⁺⁺: the collapse would leave its level: " + show([p]));
			y = T.mkPsi(k, T.add(T.argOf(Dk), T.add(T.ONE, yy)));
		} else {
			const j = stableIdx(p.s);
			if (j >= 1) y = levelImg(j, p.b);                          // ψ_{Ł_j}(ξ) ↦ ψ_j(T_(j+1)·ξ̂), j ≥ 1
			else if (j === 0 && lt(p.b, LPP)) y = [toW7(p.b)[0].w];
			else if (p.s.length === 1 && p.s[0].t === "P" && stableIdx(p.s[0].s) >= 1 && isSucc(p.s[0].b)) {
				const i = stableIdx(p.s[0].s), xi = pred(p.s[0].b);    // ψ_σ(z), σ = ψ_{Ł_i}(ξ+1)
				y = T.mkPsi(i, T.add(T.mul(T.TT(i + 1), argK(i, xi)), T.add(T.ONE, collArgK(i, xi, p.b, k, Dk))));
			} else throw new NoImage("no T-world spelling: " + show([p]));
		}
		r = T.add(r, y);
	}
	return r;
}
const pl = (x, Dw) => plK(0, x, Dw ? Dw[0] : null);
// The argument z of a collapse ψ_σ(z) into σ = ψ_{Ł_i}(ξ+1) is read as LOCF reads the argument of a collapse below a
// level ψ_L(x+1), one level up (Ł_j ↦ Ł_(j+1)): the part H = (Ł_i⁺)·γ from Ł_i⁺ on stands for the level ψ_{Ł_i}(X+H+γ)
// (γ a successor) or ψ_{Ł_i}(X+H), with X = ξ's part from Ł_i⁺ on; a run after it reads Ł_i as D = ψ_{Ł_i}(X+H+Ł_i⁺); other
// terms stay below that D. So ψ_{L⁺⁺}(L₂) is the collapse at the Ω-fixed point above L (ψ₁(I_(T+1))), as ψ_{Ω₂}(L) is at
// the one above 0, and ψ_{L⁺⁺}(ψ_{L₂}(L₂⁺)) is not standard (its argument is not below D).
const isHPrinK = (i, p) => eq([p], dk(i)) || (p.t === "P" && eq(p.s, P(L(nat(i + 1)), ONE)));
function collArgK(i, xi, z, k, Dk) {
	const dI = dk(i), X = xi.filter(p => !lt([p], dI));
	let j = 0;
	while (j < z.length && z[j].t !== "X" && z[j].t !== "W" && !lt([z[j]], dI)) j++;   // (translated values are not a level part)
	const H = z.slice(0, j), x = z.slice(j);
	if (j && !H.every(p => isHPrinK(i, p))) throw new NoImage("no level part in " + show(z));
	let r = T.Z;
	if (j) {
		const xh = argK(i, cat(X, H)), g = divTj(i + 1, argK(i, H));
		if (!g) throw new Undef("no level for " + show(H));
		r = T.mkPsi(i, T.mul(T.TT(i + 1), g.length && T.isOneM(g[g.length - 1]) ? T.add(xh, g) : xh));
	}
	if (!x.length) return r;
	const Dw = levelImg(i, cat(cat(X, H), dI))[0];
	// a run, or (while a spelling is raised) a translated value at least D that stands for one
	if (isRunAt(x[0], i) || (x[0].t === "X" && T.lev(x[0].w) === i && T.cmpM(x[0].w, Dw) >= 0)) return T.add(r, plK(i, x, Dw));
	const y = plK(k, x, Dk);
	if (T.cmp(y, [Dw]) >= 0) throw new Undef("collapse argument after its level part not below the run value: " + show(z));
	return T.add(r, y);
}
const coreReg = w => { const d = T.domT([w]); return d.t === "reg" && T.key(d.R) === T.key([w]); };
const memoK = new Map();
// x̂: ψ_L(x) ↦ ψ₀(T·(1+x̂)), ψ_{Ł_k}(x) ↦ ψ_k(T_(k+1)·x̂)
function argK(k, x) {
	const key0 = k + ":" + key(x);
	if (memoK.has(key0)) { const v = memoK.get(key0); if (v instanceof Error) throw v; return v; }
	let v;
	try {
		let y = x, lastD = null;
		for (let f = findRunK(y, k), guard = 0; f; f = findRunK(y, k), guard++) {
			if (guard > 20) throw new NoImage("too many runs");
			// A later run whose raise is not standard sits in a coefficient whose climb is cut by G before Ł⁺ (the raised
			// coefficient would exceed the collapse, e.g. ψ₁(Ω_{T+1}^D·φ(T,1))): it lies in the same collapse region, so it
			// takes the previous run's D.  E.g. ψ_L(φ(L,φ(L,d·2))) ↦ ψ₀(ψ₁(Ω_{T+1}^D·ψ₁(Ω_{T+1}^D·T))), D = ψ_L(φ(d,1)), the least α⁺-stable α.
			let Dk;
			try { Dk = k ? levelImg(k, f.raised)[0] : toW7(f.raised)[0].w; }
			catch (e) { if (!(e instanceof Undef) || e instanceof NoImage || !lastD) throw e; Dk = lastD; }
			lastD = Dk;
			if (!coreReg(Dk)) throw new NoImage("raised run not regular: ψ_{Ł_" + k + "}(" + show(f.raised) + ")");
			const c = plK(k, f.run, Dk);
			if (!c.every(m => T.lev(m) <= k)) throw new NoImage("digit not below T_" + (k + 1) + ": " + T.show(c));
			y = f.put(k ? c.map(w => ({t: "X", w})) : Wt(c));
		}
		v = plK(k, y, null);
	} catch (e) { if (e instanceof Undef) memoK.set(key0, e); throw e; }
	memoK.set(key0, v);
	return v;
}
const arg7 = x => argK(0, x);
function levelImg(k, x) {                                       // ψ_{Ł_k}(x) for k ≥ 1
	const w = T.mkPsi(k, T.mul(T.TT(k + 1), argK(k, x)));
	if (!T.std(w)) throw new Undef("image not standard: ψ_{Ł_" + k + "}(" + show(x) + ") = " + T.show(w));
	return w;
}
function toW7(x) {
	const w = prin0(T.mul(TT1, T.add(T.ONE, arg7(x))));
	if (!T.std(w)) throw new Undef("T-world image not standard: ψ_L(" + show(x) + ") = " + T.show(w));
	return Wt(w);
}

// ψ_L(x), x < L⁺⁺: the W-leaf when x is T-world; otherwise (x has a superstructure parameter, e.g. a collapse into a
// T-world regular) a superstructure collapse ψ_L(x), allowed only without Ł and without collapses into higher levels.
const foreignOK = x => x.every(p => {
	if (p.t === "L") return true;                                 // L as a run; Ł_k, k ≥ 1, as a parameter beyond the T-world
	if (p.t === "P" && eq(p.s, D)) return foreignOK(p.b);         // ψ_d(z) in a run
	if (!(p.t === "P" && kind(p) === "C" && p.s[0].t === "P" && !eq(p.s[0].s, L0))) return true;
	const k = stableIdx(p.s[0].s);                                // a collapse into a higher level: a successor level
	if (k < 1) return false;                                      // ψ_{Ł_k}(ξ+1) of the dictionary, or another regular
	if (!isSucc(p.s[0].b)) return regular(p.s) && foreignOK(p.b); // ψ_{Ł_k}(ξ) (I_{L+1} = ψ_{L₂}(L₂⁺): its collapses climb to it)
	try { argK(k, pred(p.s[0].b)); } catch (e) { if (e instanceof Undef) return false; throw e; }
	return foreignOK(p.b);
});
function mkA(s, x) {
	if (!(eq(s, L0) && lt(x, LPP))) return P(s, x);
	try { return toW7(x); } catch (e) {
		if (!(e instanceof Undef)) throw e;
		if (e instanceof NoImage && !foreignOK(x)) throw e;
		return P(s, x);                                             // beyond the T-world, or a spelling that is not standard
	}
}
// ψ_Dm(x) in a climb: below L⁺⁺, a collapse below a T OCF level is a T OCF term (or a hybrid); a T OCF regular
// without a level below it has none, and the climb takes the sup of T OCF below it
const mkPsi = (Dm, x) => isL(Dm) ? mkA(Dm, x) : (Dm[0].t === "W" && lt(x, LPP)) ? (levelQ(Dm) ? psiOf(Dm, x) : gapW(Dm, 0)) : P(Dm, x);

// a cofinal sequence of the countable-level part below T: ψ(ψ₁(ψ₁(… ψ_(n+1)(ψ_(n+1)(T_(n+2))) …))), and the gap
// start below a regular W-leaf σ = ψ(r)
function top(n) { let x = T.TT(n + 2); for (let j = n + 1; j >= 1; j--) x = T.mkPsi(j, T.mkPsi(j, x)); return prin0(x); }
function gapW(sig, n) {
	const r = sig[0].w.a;
	try { return Wt(prin0(T.level(0).lower(r, top(n)))); } catch (e) { throw new Undef("gap start below " + show(sig) + ": " + e.message); }
}

// ---------------- dom
const memoDom = new Map();
function dom(a) { const k = key(a); let r = memoDom.get(k); if (!r) { r = dom0(a); memoDom.set(k, r); } return r; }
function dom0(a) {
	if (!a.length) return Z;
	if (a.length > 1) return dom(last(a));
	const p = a[0], kd = kind(p);
	if (kd === "W") { const cf = colForm(p.w); if (cf) return dom(cf); const d = T.domT([p.w]); return d.t === "zero" ? Z : d.t === "succ" ? ONE : d.t === "w" ? OMEGA : Wt(d.R); }
	if (kd === "L") return regL(a) ? a : dom(p.a);
	if (kd === "A") {
		const lv = p.s, b = p.b, db = dom(b);
		if (in01(db)) return a;
		if (lt(db, lv)) return db;
		if (isL(db)) return OMEGA;
		if (isA(db)) return eq(last(b), db) ? a : OMEGA;
		return OMEGA;
	}
	if (kd === "C") { const dc = dom(p.b); if (in01(dc)) return OMEGA; if (lt(dc, p.s)) return dc; return OMEGA; }
	throw new Undef("dom: " + show(a));
}
const regular = a => a.length === 1 && eq(dom(a), a);

// ---------------- a[t]
// Buchholz's climb b[0], b[ψ_Dm(b[0])], b[ψ_Dm(b[ψ_Dm(b[0])])], …
function climb(b, Dm, n) { let lam = fs(b, Z); for (let i = 0; i < n; i++) lam = fs(b, mkPsi(Dm, lam)); return lam; }
// a T OCF collapse (countable, or below a level) expands as its LOCF spelling ψ_σ(c); levels keep T OCF's sequences
// when its first elements that way are standard and increasing (a climb that copies d into a collapse below another
// level changes d's meaning, and then T OCF's own sequence is kept)
const colMemo = new Map();
function colForm(w) {
	const k = T.key([w]);
	if (colMemo.has(k)) return colMemo.get(k);
	colMemo.set(k, null);
	const sp = spell(w);
	let r = sp && !eq(sp.s, L0) && sp.b.length ? P(sp.s, sp.b) : null;
	if (r) {
		try {
			const self = [W(w)], d = dom(r);
			if (in01(d)) r = null;
			else {
				let prev = null;
				for (let n = 0; n < 3 && r; n++) {
					const e = eq(d, OMEGA) ? fs(r, nat(n)) : fs2(r, n);
					if (!std(e) || !lt(e, self) || (prev && !lt(prev, e))) r = null;
					prev = e;
				}
				// and cofinal: it passes the analysis' own element 1 within a few steps (ψ_σ(L) at σ = Ω_(F+1) climbs
				// through F·Ω, F·Ω_Ω, … only up to F·Λ, while its value is above F²)
				const cd = T.domT([w]);
				if (r && cd.t === "w" && eq(d, OMEGA)) {
					const target = Wt(T.fsT([w], 1));
					let ok = false;
					for (let n = 0; n < 8 && !ok; n++) if (!lt(fs(r, nat(n)), target)) ok = true;
					if (!ok) r = null;
				}
			}
		} catch (e) { if (!(e instanceof Undef)) throw e; r = null; }
	}
	colMemo.set(k, r);
	return r;
}
function rep(x, t) { const n = natOf(t); if (n < 0) throw new Undef("needs a natural index"); let r = Z; for (let i = 0; i < n; i++) r = cat(r, x); return r; }   // x·n, as ω[n] = n
function needN(t, why) { const n = natOf(t); if (n < 0) throw new Undef(why + " needs a natural index"); return n; }
function fs(a, t) {
	if (!a.length) return Z;
	if (a.length > 1) return cat([a[0]], fs(a.slice(1), t));
	const p = a[0], kd = kind(p);
	if (kd === "W") {
		const cf = colForm(p.w);
		if (cf) return fs(cf, t);
		const d = T.domT([p.w]);
		if (d.t === "succ") return Wt(T.fsT([p.w]));
		if (d.t === "w") return Wt(T.fsT([p.w], needN(t, "W")));
		if (d.t === "reg") {
			if (T.key(d.R) === T.key([p.w])) return t;
			if (t.every(q => q.t === "W")) return Wt(T.fsT([p.w], t.map(q => q.w)));
			// a superstructure index t < R: w = ψ(T·(1+x̂)) = ψ_L(x̂), so w[t] = ψ_L(x̂[t]) (a superstructure ψ_L)
			if (p.w.a.every(m => isTP(m) && T.eq(m.e, T.ONE))) {
				const sp = spell(p.w);                                  // through its spelling, which keeps the runs
				if (sp && eq(sp.s, L0)) return fs(P(L0, sp.b), t);
				return mkA(L0, fs(Wt(wHidden(p.w)), t));
			}
			// a collapse ψ_σ(c) below a level: ψ_σ(c[t]), a hybrid when t is beyond T OCF (Ω²[ψ(L⁺⁺)] = Ω·ψ(L⁺⁺))
			const a = p.w.a;
			let i = a.length;
			while (i && isW0(a[i - 1])) i--;
			if (i < a.length) {
				const tail = a.slice(i), sig = i ? Wt(prin0(T.add(a.slice(0, i), TT1))) : OM;
				let c0 = Wt(i ? minusOne(tail) : tail);
				try { const c1 = spellCollapse(sig, a); if (c1.length && c1[c1.length - 1].t === "W") c0 = c1; } catch (e) { if (!(e instanceof Undef)) throw e; }
				return psiOf(sig, fs(c0, t));
			}
			// otherwise through its LOCF spelling ψ_s(b), whose argument carries the same cofinality (ψ_L(d^Ω)[t])
			const sp = spell(p.w);
			if (sp) return fs(P(sp.s, sp.b), t);
			throw new Undef("W with dom " + T.show(d.R) + " at a superstructure index: " + T.show([p.w]));
		}
		return Z;
	}
	if (kd === "L") {
		if (regL(a)) return t;
		const x = fs(p.a, t);
		return L(natOf(x) >= 0 ? cat(ONE, x) : x);                  // Ł_a[t] = Ł_{1+a[t]}: ψ_L(L_ω)[n] = ψ_L(L_{n+2})
	}
	if (kd === "A") {
		if (regular(a)) return t;
		const db = dom(p.b);
		if (lt(db, p.s)) return mkA(p.s, fs(p.b, t));
		return mkA(p.s, climb(p.b, db, needN(t, "A-climb")));
	}
	// C: ψ_σ(c)
	const sig = p.s, c = p.b;
	if (!c.length) {
		const n = needN(t, "ψ_σ(0)");
		if (sig[0].t === "W") return gapW(sig, n);
		const a1 = sig[0].s[0].a, a2 = sig[0].b;
		if (!a2.length) { if (!isSucc(a1)) throw new Undef("ψ_σ(0) over singular Ł"); return rep(L(pred(a1)), t); }
		if (isSucc(a2)) return rep(mkA(L(a1), pred(a2)), t);
		const Dm = dom(a2);
		if (!a1.length && eq(a2, LPP)) return Wt(top(n));           // below ψ_L(L⁺⁺) (the least α⁺⁺-stable α): all of T OCF
		let beta = Z; for (let i = 0; i < n; i++) beta = mkPsi(Dm, fs(a2, beta));
		return mkA(L(a1), fs(a2, beta));
	}
	if (eq(c, ONE)) return rep(psiOf(sig, Z), t);
	if (isSucc(c)) return rep(psiOf(sig, pred(c)), t);
	const dc = dom(c);
	if (sig[0].t === "W" && natOf(t) >= 0 && !lt(c, LPP)) return wSeq(sig, c, dc, natOf(t));
	if (lt(dc, sig)) return psiOf(sig, fs(c, t));
	const n = needN(t, "C-climb");
	if (!regular(dc)) throw new Undef("C-climb: dom not regular: " + show(a));
	// dom(c) = σ's own stable level Ł (L for a W-leaf σ): Buchholz's climb starts at σ itself (β₀ = σ, β_{k+1} = ψ_Ł(c[β_k]))
	// when ψ_σ(c[σ]) is standard; otherwise no ψ_Ł-value above σ is admissible in c and the climb collapses into σ itself.
	const own = sig[0].t === "W" ? L0 : L(sig[0].s[0].a);
	if (eq(dc, own)) {
		if (std(psiOf(sig, fs(c, mkPsi(dc, fs(c, Z)))))) return psiOf(sig, climb(c, dc, n));
		return psiOf(sig, climb(c, sig, n));
	}
	return psiOf(sig, climb(c, dc, n));
}

// A collapse into a T-world regular σ takes arguments ≥ L⁺⁺ only (below that it would be T OCF's own ψ).  Its ω-sequence:
// the elements of the Buchholz sequence whose argument is ≥ L⁺⁺; if there are none (c = L⁺⁺), the gap start below σ.
function wSeq(sig, c, dc, n) {
	const raw = k => {                                            // the k-th element's argument
		if (lt(dc, sig)) return fs(c, nat(k));
		const own = eq(dc, L0);
		let lam = Z;
		if (!own || std(psiOf(sig, fs(c, mkPsi(dc, fs(c, Z)))))) return climb(c, dc, k);
		return climb(c, sig, k);
	};
	// the standard elements, in increasing order (below L⁺⁺ an element is a T OCF term or a hybrid when it has a value)
	let found = -1, prev = null;
	for (let k = 0; k < n + 40; k++) {
		const e = psiOf(sig, raw(k));
		if (std(e) && (!prev || lt(prev, e))) { found++; prev = e; if (found === n) return e; }
		else if (k > 30 && found < 0) break;
	}
	return gapW(sig, n);
}

// ---------------- a[[n]]
function fs2(a, n) {
	const da = dom(a);
	if (in01(da) || eq(da, OMEGA)) return fs(a, nat(n));
	if (a.length > 1) return cat([a[0]], fs2(a.slice(1), n));
	const p = a[0];
	// a regular a: ψ_a(λ_n), λ = 0, L, Ł_L, … (ψ_Ł(Ł_1), ψ_Ł(Ł_L), … at a stable level); a T OCF regular without a level
	// below it starts at ψ_a(L⁺⁺), the sup of everything below a that T OCF names, then ψ_a(Ł_L), …
	if (eq(da, a)) return isL(a) ? mkA(a, L(n ? lamTop(n) : ONE))
		: a[0].t === "W" ? (levelQ(a) ? psiOf(a, lamTop(n)) : P(a, n ? lamTop(n + 1) : LPP)) : P(a, lamTop(n));
	if (p.t === "W") {
		const cf = colForm(p.w);
		if (cf) return fs2(cf, n);
		// a level or a collapse below one takes R[[n]] (Ω²[[n]] = Ω·ψ(λ_n)); other T OCF shapes stay in T OCF
		const w = p.w, tail = w.a.length && isW0(w.a[w.a.length - 1]);
		if (tail || w.a.every(m => isTP(m) && T.eq(m.e, T.ONE))) {
			try { return fs(a, fs2(da, n)); } catch (e) { if (!(e instanceof Undef)) throw e; }
		}
		return Wt(T.fsT([w], gapW(da, n).map(q => q.w)));
	}                    // a[R[[n]]]: through the LOCF ordinals below R
	if (p.t === "L") return L(fs2(p.a, n));
	return psiOf(p.s, fs2(p.b, n));
}

// ---------------- standard form
// G also charges a W-leaf w ≥ κ: w = ψ(T·(1+x̂)) (+ a sub-T tail) is ψ_L(x) in LOCF, generated only if x < b.
function wHidden(w) {                                           // x̂ of w = ψ(a) (the T-part of a, divided by T, minus 1)
	const a = w.a.filter(m => !isW0(m));
	const m1 = e => e.every(T.isOneM) ? e.slice(1) : e;
	const q = a.map(m => isAt(m) ? m : mkP1(m1(m.e), m.c));
	return q.length && q.every(T.isOneM) ? q.slice(1) : q;
}
function wArgLess(w, b) {
	if (subT(w.a)) return lt(Wt(w.a), b);                       // a countable T OCF ψ(a): its argument a < T
	if (isW0(w.a[w.a.length - 1])) { const sp = spell(w); return !sp || lt(sp.b, b); }   // a collapse ψ_σ(c) below a level: c
	const x = wHidden(w);
	if (subT(x)) return lt(Wt(x), b);                           // x < L: compare as a T-world value
	if (!lt(b, LPP)) return true;                                 // x ∈ [d, L⁺⁺) ≤ b
	for (let k = b.length; k > 0; k--) {                           // the longest translatable prefix of b decides
		let tb; try { tb = arg7(b.slice(0, k)); } catch (e) { if (e instanceof Undef) continue; throw e; }
		const c = T.cmp(x, tb); return c < 0 || (c === 0 && k < b.length);
	}
	return false;
}
// A collapse into a successor cardinal σ = ψ_{Ł_c}(ξ) of a stable, with ξ = 0 or a successor (d, L⁺⁺, L₂⁺, …), is strong: it is a
// value of its own level, not generated by the enclosing collapse, so G does not charge it (ψ_L(ψ_{L⁺⁺⁺}(L⁺⁺⁺)) is the
// X-world copy of Π_ω⁻ = ψ_L(ψ_{L⁺⁺}(L⁺⁺))). Its argument is not bounded (ψ_d(L₂⁺+…) lies between ψ_d(L₂) and d), but
// inside it G applies as usual: as ψ(L) is the collapse at the Ω-fixed point ψ_L(L), ψ_d(L₂) is the one at ψ_{L₂}(L₂), and
// ψ_d(ψ_{L₂}(L₂)) is not standard.
const succStableIdx = s => {
	if (s.length !== 1 || s[0].t !== "P" || !isL(s[0].s)) return null;
	return s[0].b.length === 0 || isSucc(s[0].b) ? s[0].s[0].a : null;
};
const isStrongAtom = p => p.t === "P" && succStableIdx(p.s) !== null;
const atLeastStable = (p, c) => p.t === "P" && isL(p.s) && le(c, p.s[0].a);
function collectAbove(t, kappa, out, inAtom = null, strong = false) {
	for (const p of t) {
		if (lt([p], kappa)) continue;
		if (strong && isStrongAtom(p)) continue;
		if (p.t === "W") { out.push({ w: p.w }); continue; }
		if (p.t === "L") { collectAbove(p.a, kappa, out, inAtom, strong); continue; }
		out.push(p.b); collectAbove(p.b, kappa, out, inAtom, strong); collectAbove(p.s, kappa, out, inAtom, strong);
	}
	return out;
}
// A hybrid level ψ_L(y), d ≤ y < L⁺⁺, whose argument has countable parameters beyond the T-world: its standard form is
// that of the analysis with each such parameter replaced by a stand-in countable (they lie below every collapse of the
// level, so only their place matters); Buchholz's G of LOCF does not apply to it, as to the T-world leaves.
const STAND_IN = W(T.parse("e0")[0]);
function standIn(y) {
	return y.flatMap(q => q.t === "W" || q.t === "X" || q.t === "L" ? [q] : lt([q], OM) ? [STAND_IN] : psiOf(q.s, standIn(q.b)));
}
// the countable parameters beyond the T-world that standIn replaces
const foreignParams = (y, out = []) => {
	for (const q of y) if (q.t === "P") { if (lt([q], OM)) out.push([q]); else foreignParams(q.b, out); }
	return out;
};
// true/false when the stand-in argument has a T-world image (standard or not), null otherwise
const hybMemoStd = new Map();
function hybStd(y) {
	const k = key(y);
	if (hybMemoStd.has(k)) return hybMemoStd.get(k);
	let r;
	try { toW7(standIn(y)); r = true; } catch (e) { if (!(e instanceof Undef)) throw e; r = e instanceof NoImage ? null : false; }
	hybMemoStd.set(k, r);
	return r;
}
const isHybLevel = p => p.t === "P" && eq(p.s, L0) && lt(p.b, LPP) && !p.b.every(q => q.t === "W") && hybStd(p.b) !== null;
function gViolation(t) {
	for (const p of t) {
		if (p.t === "W") continue;
		if (p.t === "L") { const v = gViolation(p.a); if (v) return v; continue; }
		if (isHybLevel(p)) continue;
		const strong = kind(p) === "A" || isStrongAtom(p);            // the exemption holds at ψ_{Ł}(b) and inside strong collapses
		const bad = collectAbove(p.b, [p], [], isStrongAtom(p) ? succStableIdx(p.s) : null, strong).find(c => c.w ? !wArgLess(c.w, p.b) : !lt(c, p.b));
		if (bad) return { at: show([p]), arg: bad.w ? "hidden argument of " + T.show([bad.w]) : show(bad) };
		const v = gViolation(p.s) || gViolation(p.b); if (v) return v;
	}
	return null;
}
const memoStd = new Map();
function std(t) { const k = key(t); let r = memoStd.get(k); if (r === undefined) { try { r = std0(t); } catch (e) { if (e instanceof Undef) r = false; else throw e; } memoStd.set(k, r); } return r; }
function std0(t) {
	if (!t.length) return true;
	if (t.length > 1) {
		for (const p of t) if (!std([p])) return false;
		for (let i = 0; i + 1 < t.length; i++) if (lt([t[i]], [t[i + 1]])) return false;
		return true;
	}
	const p = t[0], kd = kind(p);
	if (kd === null) return false;
	if (kd === "W") return isW0(p.w) && T.std([p.w]);
	if (kd === "L") return std(p.a);
	if (isHybLevel(p)) return hybStd(p.b) === true && foreignParams(p.b).every(std);
	if (!std(p.s) || !std(p.b)) return false;
	if (kd === "A") {
		if (!regL(p.s)) return false;
		if (!p.s[0].a.length && lt(p.b, LPP)) {                     // ψ_L(x), x < L⁺⁺: a W-leaf unless x is not T-world
			try { arg7(p.b); return false; } catch (e) { if (!(e instanceof NoImage) || !foreignOK(p.b)) return false; }
			if (hybStd(p.b) === false) return false;
		}
	}
	if (kd === "C") {
		const sig = p.s;
		if (sig[0].t === "W") {
			if (!wReg(sig[0].w) || (lt(p.b, LPP) && !stdHybrid(p))) return false;
		} else if (!regular(sig)) return false;
	}
	return !gViolation(t);
}

// ---------------- collapses below T OCF levels
// The dictionary covers the levels ψ_L(x). Below a level σ = ψ(Q+T) (Q = 0 for Ω), LOCF's Buchholz-style collapses
// spell the rest: ψ_σ(c) = ψ(Q+1+ĉ) (ψ(ĉ) for σ = Ω), so ψ_σ(c) = ω^(X+1+c) with X = ψ(Q) the level below σ.
// In c the stable structure is read as inside ψ_L, from σ = ψ_L(x) on (X = x's part from d on):
//  - the part H = d·γ of c from d on stands for the level ψ_L(X+H+γ) if γ is a successor, ψ_L(X+H) otherwise: the
//    sup of what H' + (anything below d) reaches, H = H'+d;
//  - a run after it (L or ψ_d(y) and what follows) reads L ↦ D, ψ_d(y) ↦ ψ(Y_D+1+ŷ), with D = ψ(Y_D) = ψ_L(X+H+d);
//  - otherwise T OCF terms below that D may follow H.
// For σ = Ω: ψ(L) = ψ(I), ψ(d) = ψ(Ω_(I+1)), ψ(d+ε_(Ω_(I+1)+1)) = ψ(Ω_(I+2)), ψ(d+L) = ψ(I₂), ψ(d+ψ_d(d)) =
// ψ(Ω_(I₂+1)), ψ(d+d) = ψ(Ω_(I₂+2)), ψ(d·ω) = ψ(I_ω), ψ(d²) = ψ(I(1,0)), ψ(d^d) = ψ(M), and ψ(c) climbs to ψ(L⁺⁺) as
// c climbs to L⁺⁺ (ψ_L(L⁺⁺) = T).
// T OCF terms stand for themselves, and so do the LOCF ordinals beyond T OCF (ψ(L⁺⁺), ψ_σ(L⁺⁺), Ω_ψ(L⁺⁺), ...): an
// argument with one of those is not translated, and ψ_σ(c) stays an LOCF collapse (a hybrid), ordered against T OCF
// terms through ĉ. So Ω·x = ψ_Ω₂(x) for every countable x.
// A regular with no level below it (ψ_L(d) = I, made by rule R4a) has no such collapses: everything below it is a level
// ψ_L(x) or a collapse below one of those, and ψ_I(c) starts at c = L⁺⁺, above all of T OCF below I.

// σ = ψ(Q+T): Q, or null
function levelQ(sig) {
	if (sig.length !== 1 || sig[0].t !== "W") return null;
	const a = sig[0].w.a, m = a[a.length - 1];
	if (!a.length || !isTP(m) || !T.isOne(m.e) || !T.isOneM(m.c)) return null;
	return a.slice(0, -1);
}
// X (σ's argument from d on) for a level σ, or null
const levelMemo = new Map();
function levelD(sig) {
	const k = key(sig);
	if (!levelMemo.has(k)) {
		let r = null;
		try {
			const sp = spell(sig[0].w);
			if (sp && eq(sp.s, L0)) r = {X: sp.b.filter(p => !lt([p], D))};
		} catch (e) { if (!(e instanceof Undef)) throw e; }
		levelMemo.set(k, r);
	}
	return levelMemo.get(k);
}
// the argument c of ψ_σ(c) read in T OCF: a list of items, T OCF principals {m} or LOCF principals beyond T OCF {x},
// summed with absorption; null if c has a part that cannot be read below σ (Ł, ψ_{L⁺⁺}, ...)
const subTItem = y => y.x || isW0(y.m);
function cmpItem(a, b) {
	if (a.m && b.m) return T.cmpM(a.m, b.m);
	if (!subTItem(a)) return 1;                                   // a T-power (in Q) is above every LOCF ordinal below T
	if (!subTItem(b)) return -1;
	const x = a.m ? [W(a.m)] : [a.x], y = b.m ? [W(b.m)] : [b.x];
	return eq(x, y) ? 0 : lt(x, y) ? -1 : 1;
}
function addItems(r, ys) {
	for (const y of ys) {
		let i = r.length;
		while (i && cmpItem(r[i - 1], y) < 0) i--;
		r = r.slice(0, i).concat([y]);
	}
	return r;
}
// h/T for a T OCF term h = T·g
function divT(h) {
	const g = h.map(m => isTP(m) && isFinT(m.e) ? mkP1(m.e.slice(1), m.c) : m);
	return T.key(T.mul(TT1, g)) === T.key(h) ? g : null;
}
const levelOfArg = z => prin0(T.mul(TT1, T.add(T.ONE, z)))[0];   // ψ_L(x) from x̂
// the level H = d·γ stands for (after X), and the regular D a run after it reads L as
function hLevel(X, H) {
	const xh = arg7(cat(X, H)), g = divT(arg7(H));
	if (!g) throw new Undef("no level for " + key(H));
	const succ = g.length && T.isOneM(g[g.length - 1]);
	return succ ? levelOfArg(T.add(xh, g)) : levelOfArg(xh);
}
const runD = (X, H) => toW7(cat(cat(X, H), D))[0].w;
const isHPrin = p => eq([p], D) || (p.t === "P" && eq(p.s, LPP));
function items(sig, c) {
	const lv = levelD(sig);
	let i = 0;
	while (i < c.length && !lt([c[i]], D)) i++;
	const H = c.slice(0, i), x = c.slice(i);
	if (i && (!lv || !H.every(isHPrin))) return null;
	let r = i ? [{m: hLevel(lv.X, H)}] : [];
	const run = x.length && isRunP(x[0]);
	if ((run || i) && !lv) return null;
	const Dw = lv ? runD(lv.X, H) : null;
	for (const p of x) {
		let ys;
		if (p.t === "W") ys = [{m: p.w}];
		else if (isRunP(p) && run) ys = pl([p], [Dw]).map(m => ({m}));
		else if (p.t === "P" && lt([p], L0)) ys = [{x: p}];
		else return null;
		r = addItems(r, ys);
	}
	// T OCF terms after H (or alone) stay below the run's D: ψ(d+M) is not ψ(M) (that is ψ(d^d))
	if (!run && x.length && lv && cmpItem(x[0].t === "W" ? {m: x[0].w} : {x: x[0]}, {m: Dw}) >= 0) return null;
	return r;
}
// Q+1+ĉ (ĉ for σ = Ω) as items
function argItems(sig, c) {
	const Q = levelQ(sig);
	if (!Q) return null;
	const it = items(sig, c);
	if (!it) return null;
	return Q.length ? addItems(Q.map(m => ({m})), addItems([{m: T.ONEP}], it)) : it;
}
const tOnly = it => it.every(y => y.m);

// the leaf ψ_σ(c) for a T OCF level σ when c reads entirely in T OCF, or null
function leafOf(sig, c) {
	let it = null;
	try { it = argItems(sig, c); } catch (e) { if (!(e instanceof Undef)) throw e; }
	if (!it || !tOnly(it)) return null;
	const a = it.map(y => y.m);
	return levelQ(sig).length || subT(a) ? Wt(prin0(a)) : null;
}
const psiOf = (sig, c) => leafOf(sig, c) || (eq(sig, L0) ? mkA(sig, c) : P(sig, c));
// a hybrid: ψ_σ(c) into a T OCF level whose argument has a part beyond T OCF
const isHybrid = p => p.t === "P" && p.s.length === 1 && p.s[0].t === "W" && lt(p.b, LPP);
const hybMemo = new Map();
function hybItems(p) {
	const k = pk(p);
	if (!hybMemo.has(k)) {
		let it = null;
		try { it = argItems(p.s, p.b); } catch (e) { if (!(e instanceof Undef)) throw e; }
		hybMemo.set(k, it);
	}
	return hybMemo.get(k);
}
function cmpItems(x, y) {
	for (let i = 0; i < Math.min(x.length, y.length); i++) { const c = cmpItem(x[i], y[i]); if (c) return c; }
	return x.length - y.length;
}
// w < h for a T OCF principal w and a hybrid h = ψ_σ(c): through the arguments
function wBelowH(w, h) {
	const sw = h.s[0].w, Q = levelQ(h.s), it = hybItems(h);
	if (T.cmp([w], [sw]) >= 0) return false;
	if (!it) return true;
	if (Q.length && T.cmp([w], prin0(Q)) <= 0) return true;
	return cmpItems(w.a.map(m => ({m})), it) < 0;
}
// the canonical spelling of a collapse argument from its items: the level part H, then a run or T OCF terms
function hFromLevel(X, w) {                                     // H with hLevel(X, H) = w, or null
	const z = wHidden(w);
	if (T.key(T.mul(TT1, T.add(T.ONE, z))) !== T.key(w.a)) return null;
	const xh = arg7(X);
	const zr = !X.length ? z : z.length > xh.length && T.key(z.slice(0, xh.length)) === T.key(xh) ? z.slice(xh.length)
		: T.key(T.add(xh, z)) === T.key(z) ? z : null;              // (X absorbed: ψ_L(d+d^d) = M)
	if (!zr) return null;
	const strip = y => { const x = invArg(T.add(xh, y)); return !X.length ? x : x.length > X.length && key(x.slice(0, X.length)) === key(X) ? x.slice(X.length) : x; };
	for (let k = 1; k <= zr.length; k++) {                        // successor γ: ẑ = Ĥ + γ̂ with Ĥ = T·γ̂
		const Hh = zr.slice(0, k), g = divT(Hh);
		if (g && g.length && T.isOneM(g[g.length - 1]) && T.key(zr.slice(k)) === T.key(g)) {
			const H = strip(Hh);
			if (H && H.every(isHPrin)) return H;
		}
	}
	const H = strip(zr);                                          // limit γ
	return H && H.every(isHPrin) ? H : null;
}
// Buchholz's G for the part of c after H (H is read as a level argument, as inside ψ_L): ψ(ψ_d(d²)) is not ψ(I₂)
function gRest(sig, c) {
	const kappa = P(sig, c);
	let i = 0;
	while (i < c.length && !lt([c[i]], D)) i++;
	return collectAbove(c.slice(i), kappa, []).every(e => e.w ? wArgLess(e.w, c) : lt(e, c));
}
function spellItems(sig, it) {
	const lv = levelD(sig), raw = y => y.m ? W(y.m) : y.x;
	if (!lv || !it.length) return it.map(raw);
	const asRun = (ys, Dw) => ys.flatMap(y => y.m ? invPrin(y.m, [Dw], null, {lastD: null}).full : [y.x]);
	const cands = [() => it.map(raw), () => asRun(it, runD(lv.X, []))];
	const y = it[0].m;
	if (y) {
		const a = y.a;
		let i = a.length;
		while (i && isW0(a[i - 1])) i--;
		// levels at or below the lead: its own level, then its argument with trailing monomials dropped
		for (let k = i, n = 0; k > 0 && n < 8; k--, n++) {
			const lvl = prin0(a.slice(0, k))[0], rest = k === a.length ? it.slice(1) : it;
			cands.push(() => {                                        // lvl is the level of a part H
				const H = hFromLevel(lv.X, lvl);
				if (!H) return null;
				const Dw = runD(lv.X, H);
				return cat(H, rest.length && rest[0].m && T.cmp([rest[0].m], [Dw]) >= 0 ? asRun(rest, Dw) : rest.map(raw));
			});
			cands.push(() => {                                        // lvl is the D of a run after a part H
				const z = wHidden(lvl);
				if (T.key(T.mul(TT1, T.add(T.ONE, z))) !== T.key(lvl.a)) return null;
				const x = invArg(z), X = lv.X;
				const Hd = X.length && x.length > X.length && key(x.slice(0, X.length)) === key(X) ? x.slice(X.length) : x;
				if (!Hd.length || !eq([Hd[Hd.length - 1]], D)) return null;
				const H = Hd.slice(0, -1);
				return H.every(isHPrin) ? cat(H, asRun(it, lvl)) : null;
			});
		}
	}
	// the first candidate that reads back and satisfies LOCF's G; failing that, the first that reads back (the leaf is
	// standard by the analysis, whose G is class-relative where LOCF's is not)
	for (const useG of [true, false]) for (const f of cands) {
		let c = null;
		try { c = f(); } catch (e) { if (!(e instanceof Undef)) throw e; }
		if (!c) continue;
		let back = null;
		try { back = items(sig, c); } catch (e) { if (!(e instanceof Undef)) throw e; }
		if (back && back.length === it.length && cmpItems(back, it) === 0 && (!useG || gRest(sig, c))) return c;
	}
	throw new Undef("no spelling");
}
// the argument c of ψ_σ(c) from the T OCF argument a of the leaf ψ(a) = ψ_σ(c)
function spellCollapse(sig, a) {
	const Q = levelQ(sig);
	let it = a.slice(Q.length).map(m => ({m}));
	if (Q.length) it = it.length && T.isOneM(it[0].m) ? it.slice(1) : it;
	return spellItems(sig, it);
}
function stdHybrid(p) {
	const Q = levelQ(p.s);
	if (!Q || !Q.length || !wReg(p.s[0].w)) return false;
	const it = hybItems(p);
	if (!it || tOnly(it)) return false;
	let c = it.slice(Q.length);
	if (c.length && c[0].m && T.isOneM(c[0].m)) c = c.slice(1);
	if (key(spellItems(p.s, c)) !== key(p.b)) return false;
	const xd = T.level(0).thetaXD(Q);                                      // T OCF's Θ form for the lead of the argument
	const lead = it[Q.length];
	return !(xd && lead && cmpItem(lead, {m: xd[0][0]}) >= 0 && cmpItem(lead, {m: xd[1][0]}) < 0);
}

// The inverse of the dictionary: an LOCF argument x with arg7(x) = y, checked against arg7 by the caller. Runs are read
// back left to right: at level k, a digit of level k at least the regular D = ψ_{Ł_k}(argument with the digit := Ł_k⁺)
// starts a run, in which D is Ł_k and ψ_k(Y_D+1+z) is ψ_{Ł_k⁺}(z). A context records, per level, the run value (runs)
// and how a partial argument sits in the whole argument of that level (wraps), for the raise.
const isFinT = e => e.every(T.isOneM);
const leafOf0 = (k, m) => k ? {t: "X", w: m} : W(m);            // a value kept as is, for raising
const Xs = t => t.map(m => T.lev(m) ? {t: "X", w: m} : W(m));
function invThetaJ(j, m) {                                      // h with ψ_j(h) = m, m below Ω_(T_j+1)
	if (T.atomB(m) && m.j === j) return m.a;
	if (m.k !== "P" || m.b !== j) return null;
	const E = m.e;
	let H = Z, s1;
	if (T.atomB(E[0]) && E[0].j === j) { H = E[0].a; s1 = E.slice(1); }
	else s1 = T.isOneM(E[0]) ? E.slice(1) : E;
	const s1o = s1.map(f => T.atomB(f) && f.j === j ? f : T.lev(f) < j ? T.mkPow(j, T.ONE, f)
		: T.mkPow(j, isFinT(f.e) ? [T.ONEP, ...f.e] : f.e, f.c));
	const h = [...H, ...s1o, ...T.logP(m.c)];
	return T.key(T.mkPsi(j, h)) === T.key([m]) ? h : null;
}
const invTheta = m => invThetaJ(1, m);
function divTj(j, A) {                                          // g with T_j·g = A
	const g = A.map(m => m.k === "P" && m.b === j ? T.mkPow(j, isFinT(m.e) ? m.e.slice(1) : m.e, m.c) : m);
	return T.key(T.mul(T.TT(j), g)) === T.key(A) ? g : null;
}
const minusOne = h => h.length && T.isOneM(h[0]) ? h.slice(1) : h;   // 1+y = h
const runVal = (k, x) => k ? levelImg(k, x)[0] : toW7(x)[0].w;
// wraps restricted to the levels below j, each wrapped once more by f
const wrapsBelow = (wraps, j, f) => { const o = {}; for (const i in wraps) if (+i < j && wraps[i]) o[i] = r => wraps[i](f(r)); return o; };
function invArgK(k, y, runs = {}, wraps = {}, st = {lastD: {}}) {
	return invSumK(y, {...runs, [k]: undefined}, {...wraps, [k]: r => r}, st).full;
}
const invArg = y => invArgK(0, y);
function invSumK(y, runs, wraps, st) {
	const full = [], res = [];
	for (let i = 0; i < y.length; i++) {
		const m = y[i], k = T.lev(m);
		if (wraps[k] && !runs[k] && T.lev(m) === k && !T.isOneM(m) && !(m.k === "P" && T.isOne(m.e) && T.isOneM(m.c))) {
			let Dl = null;                                            // a digit outside a run of its level: a leaf or a run start
			try { Dl = runVal(k, wraps[k](cat(res, dk(k)))); }
			catch (e) { if (!(e instanceof Undef) || e instanceof NoImage) throw e; Dl = st.lastD[k]; }
			if (Dl && coreReg(Dl) && T.cmpM(m, Dl) >= 0) {
				st.lastD[k] = Dl;
				const r = invSumK(y.slice(i), {...runs, [k]: Dl}, {...wraps, [k]: null}, st);
				return {full: cat(full, r.full), res: cat(res, Xs(y.slice(i)))};
			}
		}
		const w2 = {};
		for (const l in wraps) if (wraps[l]) w2[l] = r => wraps[l](cat(res, r));
		const p = invPrinK(m, runs, w2, st);
		full.push(...p.full); res.push(...p.res);
	}
	return {full, res};
}
function invPrinK(m, runs, wraps, st) {
	const j = T.lev(m), keep = {full: [leafOf0(j, m)], res: [leafOf0(j, m)]}, Dk = runs[j];
	if (Dk && T.cmpM(m, Dk) === 0) return {full: Lk(j), res: [leafOf0(j, m)]};
	if (Dk && T.cmpM(m, Dk) > 0 && m.k === "S") {                 // ψ_j(Y_D+1+z) = ψ_{Ł_j⁺}(z) in a run
		const a = m.a, Y = T.argOf(Dk);
		if (a.length > Y.length && T.key(a.slice(0, Y.length)) === T.key(Y)) {
			const z = minusOne(a.slice(Y.length));
			if (T.key(T.mkPsi(j, T.add(Y, T.add(T.ONE, z)))) === T.key([m]))
				return {full: P(dk(j), invSumK(z, runs, wrapsBelow(wraps, j, r => P(dk(j), r)), st).full), res: [leafOf0(j, m)]};
		}
	}
	if (j === 0 || !T.strong(m)) {
		if (j === 0) return keep;
		if (m.k === "P" && T.isOne(m.e) && T.isOneM(m.c)) return {full: dk(j - 1), res: dk(j - 1)};   // T_j = Ł_(j-1)⁺
		const h = invThetaJ(j, m);                                  // ψ_j(1+y) = ψ_{Ł_(j-1)⁺⁺}(y)
		if (!h) throw new Undef("no inverse");
		const s = P(L(nat(j)), ONE);
		const y = invCollArg(j, Z, minusOne(h), s, runs, wraps, st);
		return {full: P(s, y.full), res: P(s, y.res)};
	}
	// a strong ψ_j(A + s), A its part of level > j: ψ_{Ł_j}(ξ) with T_(j+1)·ξ̂ = A, or the collapse ψ_σ(z) into
	// σ = ψ_{Ł_j}(ξ+1) with s = 1+ẑ
	const a = m.a;
	let i = 0;
	while (i < a.length && T.lev(a[i]) > j) i++;
	const A = a.slice(0, i), s = a.slice(i), g = divTj(j + 1, A);
	if (!g) throw new Undef("no inverse");
	if (!s.length) {
		const xi = invSumK(g, {...runs, [j]: undefined}, {...wrapsBelow(wraps, j, r => P(L(nat(j)), r)), [j]: r => r}, st).full;
		return {full: P(L(nat(j)), xi), res: [leafOf0(j, m)]};
	}
	const xi = invSumK(g, {...runs, [j]: undefined}, {[j]: r => r}, st).full;
	const sig = P(L(nat(j)), cat(xi, ONE));
	const z = invCollArg(j, xi, minusOne(s), sig, runs, wraps, st);
	return {full: P(sig, z.full), res: P(sig, z.res)};
}
// the argument z of ψ_σ(z), σ = ψ_{Ł_j}(ξ+1), from ẑ (the inverse of collArgK): the plain reading, a run of level j, or a
// level part H followed by a run or terms below its D; the first spelling that reads back to ẑ
function hFromLevelK(j, X, w) {                                 // H with the level part of X+H equal to w, or null
	if (!(w.k === "S" && T.strong(w) && w.j === j)) return null;
	const zz = divTj(j + 1, w.a);
	if (!zz) return null;
	const xh = argK(j, X);
	const zr = !X.length ? zz : zz.length > xh.length && T.key(zz.slice(0, xh.length)) === T.key(xh) ? zz.slice(xh.length)
		: T.key(T.add(xh, zz)) === T.key(zz) ? zz : null;
	if (!zr) return null;
	const strip = y => { const x = invArgK(j, T.add(xh, y)); return !X.length ? x : x.length > X.length && key(x.slice(0, X.length)) === key(X) ? x.slice(X.length) : x; };
	const ok = H => H && H.length && H.every(p => isHPrinK(j, p));
	for (let k = 1; k <= zr.length; k++) {                        // successor γ: ẑ = Ĥ + γ̂ with Ĥ = T_(j+1)·γ̂
		const Hh = zr.slice(0, k), g = divTj(j + 1, Hh);
		if (g && g.length && T.isOneM(g[g.length - 1]) && T.key(zr.slice(k)) === T.key(g)) {
			let H = null; try { H = strip(Hh); } catch (e) { if (!(e instanceof Undef)) throw e; }
			if (ok(H)) return H;
		}
	}
	let H = null; try { H = strip(zr); } catch (e) { if (!(e instanceof Undef)) throw e; }
	return ok(H) ? H : null;
}
function invCollArg(j, xi, zh, sig, runs, wraps, st) {
	const Xp = xi.filter(p => !lt([p], dk(j))), wb = wrapsBelow(wraps, j, r => P(sig, r));
	const cands = [() => {                                         // as at level 0, a level part H first: ψ_{L⁺⁺}(L₂⁺), not ψ_{L⁺⁺}(ψ_{L₂⁺}(L₂⁺))
		if (!zh.length) return null;
		const H = hFromLevelK(j, Xp, zh[0]);
		if (!H) return null;
		const r = invSumK(zh.slice(1), {...runs, [j]: undefined}, {...wb, [j]: q => cat(cat(Xp, H), q)}, st);
		return {full: cat(H, r.full), res: cat(H, r.res)};
	}, () => {                                                     // the lead is the D of a run after a part H: ψ_{L⁺⁺}(L₂⁺+L₂)
		const w = zh[0];
		if (!w || !(w.k === "S" && T.strong(w) && w.j === j)) return null;
		const zz = divTj(j + 1, w.a);
		if (!zz) return null;
		const x = invArgK(j, zz);
		const Hd = Xp.length && x.length > Xp.length && key(x.slice(0, Xp.length)) === key(Xp) ? x.slice(Xp.length) : x;
		if (!Hd.length || !eq([Hd[Hd.length - 1]], dk(j))) return null;
		const H = Hd.slice(0, -1);
		if (!H.every(p => isHPrinK(j, p))) return null;
		const r = invSumK(zh, {...runs, [j]: w}, {...wb, [j]: null}, st);
		return {full: cat(H, r.full), res: cat(H, r.res)};
	},
		() => invSumK(zh, runs, wb, st),
		() => invSumK(zh, {...runs, [j]: undefined}, {...wb, [j]: r => cat(Xp, r)}, st),
	];
	let first = null;
	for (const f of cands) {
		let c = null;
		try { c = f(); } catch (e) { if (!(e instanceof Undef)) throw e; }
		if (!c) continue;
		if (!first) first = c;
		let back = null;
		try { back = collArgK(j, xi, c.full, 0, null); } catch (e) { if (!(e instanceof Undef)) throw e; }
		if (back && T.key(back) === T.key(zh)) return c;
	}
	if (first) return first;
	throw new Undef("no inverse");
}
// level 0 entry used by the collapse spellings: m read inside a run with value Dw
const invPrin = (m, Dw, wrapP, st) => invPrinK(m, Dw ? {0: Dw[0]} : {}, wrapP ? {0: wrapP} : {}, {lastD: {}});

// the LOCF spelling of a leaf: {s, b} for ψ_s(b), or null (shown in T OCF)
const spellMemo = new Map();
function spell(w) {
	const k = T.key([w]);
	if (!spellMemo.has(k)) {
		spellMemo.set(k, null);                                     // (levelD of a level needs only its own spelling)
		let r = null;
		try { r = spell0(w); } catch (e) { if (!(e instanceof Undef)) throw e; }
		spellMemo.set(k, r);
	}
	return spellMemo.get(k);
}
function spell0(w) {
	const a = w.a;
	if (!a.length) return null;                                   // 1
	let i = a.length;
	while (i && isW0(a[i - 1])) i--;
	if (i < a.length) {                                           // a collapse ψ_σ(c) below the level σ = ψ(Q+T)
		const sig = i ? Wt(prin0(T.add(a.slice(0, i), TT1))) : OM, c = spellCollapse(sig, a);
		const back = leafOf(sig, c);
		return back && T.key([back[0].w]) === T.key([w]) ? {s: sig, b: c} : null;
	}
	const xh = wHidden(w);                                        // a level ψ_L(x)
	if (T.key(T.mul(TT1, T.add(T.ONE, xh))) !== T.key(a)) return null;
	const x = invArg(xh);
	return T.key(arg7(x)) === T.key(xh) ? {s: L0, b: x} : null;
}


// ---------------- display
// Terms are shown through hash-consed copies (Disp) whose leaves are replaced by their LOCF spellings. A leaf without
// one is shown as ⟨T OCF term⟩, which the parser reads back.
function toDisp(x) {
	return Disp.term(x.flatMap(p => dispPrin(p).ps));
}
function dispPrin(p) {
	if (p.t === "L") return Disp.Lv(toDisp(p.a));
	if (p.t === "P") return Disp.Psi(toDisp(p.s), toDisp(p.b));
	if (p.t === "X") return Disp.X("⟨" + T.show([p.w]) + "⟩");
	if (T.isOneM(p.w)) return Disp.ONE;
	const sp = spell(p.w);
	if (!sp) return Disp.X("⟨" + T.show([p.w]) + "⟩");
	const d = Disp.Psi(toDisp(sp.s), toDisp(sp.b));
	const g = T.logP(p.w);                                         // its Cantor normal form comes from the analysis
	Disp.setLog(d, T.key(g) === T.key([p.w]) ? d : toDisp(Wt(g)));
	return d;
}
function show(x, o) {
	try { return Disp.show(toDisp(x), o); } catch (e) { if (o) throw e; return key(x); }
}

// ---------------- parse
// also accepts ASCII: p for ψ, W for Ω, w for ω, L2 for L₂, and ⟨T OCF term⟩ (or <...>) for a T OCF leaf
const SUB = "₀₁₂₃₄₅₆₇₈₉";
// the stable level a term's first principal lives below
function levelOf(p) {
	if (p.t === "W") return Z;
	if (p.t === "L") return p.a;
	const s = p.s[0];
	if (s.t === "L") return s.a;
	return s.t === "W" ? Z : s.s[0].a;
}
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
	// Ω_s: ψ_{Ł_(a+1)}(b) with s = Ł_a+1+b, Ł_a the largest stable level below s, or ψ_L(b) with s = 1+b
	function omegaAt(t) {
		const n = natOf(t);
		if (n == 0) fail();
		if (n > 0) return mkA(L0, nat(n - 1));
		const h = t[0];
		if (h.t === "L") {
			const r = t.slice(1), m = natOf(r);
			if (!r.length) fail();
			return P(L(cat(h.a, ONE)), m > 0 ? nat(m - 1) : r);
		}
		const a = levelOf(h);
		if (!a.length) return mkA(L0, t);
		if (!isSucc(a)) fail();
		return P(L(a), t);
	}
	function prin() {
		const n = digits();
		if (n >= 0) return nat(n);
		const c = s[i++];
		if (c == "ω" || c == "w") return OMEGA;
		if (c == "Ω" || c == "W") {
			const m = digits();
			if (m == 0) fail();
			if (m > 0) return mkA(L0, nat(m - 1));
			return eat("_") ? omegaAt(sub()) : OM;
		}
		if (c == "d") return D;
		if (c == "L") {
			if (eat("_")) { // L_a = Ł_a for infinite a, L_n = Ł_(n-1)
				const a = sub(), m = natOf(a);
				if (m == 0) fail();
				return L(m > 0 ? nat(m - 1) : a);
			}
			const m = digits();
			if (m == 0) fail();
			return L(nat(m < 0 ? 0 : m - 1));
		}
		if (c == "Ł") {
			need("_");
			return L(sub());
		}
		if (c == "ψ" || c == "p") {
			const sb = eat("_") ? sub() : OM;
			if (sb.length != 1) fail();
			need("(");
			const b = sum();
			need(")");
			return psiOf(sb, b);
		}
		if (c == "⟨" || c == "<") {
			let j = i, depth = 1;
			while (depth) {
				if (j >= s.length) fail();
				if (s[j] == "⟨" || s[j] == "<") depth++;
				if (s[j] == "⟩" || s[j] == ">") depth--;
				j++;
			}
			const t = Wt(T.parse(s.slice(i, j - 1)));
			i = j;
			return t;
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
		let t = Z;
		for (let j = 0; j < k; j++) t = cat(t, p);
		return t;
	}
	function sum() {
		let t = term();
		while (eat("+")) t = cat(t, term());
		return t;
	}
	const t = sum();
	if (i < s.length) fail();
	return t;
}

return {Undef, Z, OM, ONE, D, L0, LPP, key, eq, lt, le, isSucc, dom, regular, fs, fs2, std, show, parse, spell, arg7,
	toW7, CANON: Disp.CANON};

})();

