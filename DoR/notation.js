// DoR: Taranovsky's Degrees of Reflection (https://taranovsky.github.io/OrdinalNotation.html).
// Terms are 0, Ω and C(a,b), compared as postfix strings (C(a,b) is "b a C") with C < 0 < Ω.
//
// Below C(C(Ω·2,0),0), the standard terms correspond in order to the EBOCF terms below EBO. Here
// Ω₁, Ω₂, ... are Buchholz's, and DoR's Ω stays Ω in DoR terms: C(Ω,0) = Ω₁, C(Ω,C(Ω,0)) = Ω₂,
// C(Ω₂,0) = ψ₀(Ω₂), and C(Ω+e, Ω_ν) = Ω_μ for the least μ > ν of the form ν' + ω^e.
// Over a base at level ν (0 or a ψ_ν term), C(a,b) = b + ω^a for a < Ω_(ν+1), and otherwise a
// collapse ψ_ν(β + c(a)) extending the base's argument β, where the contribution c(a) is ω^a
// unless a reaches Ω_(ν+2). Then a's part H above Ω_(ν+1) reflects: c(a) = ω^(ψ_(ν+1)(Y(H)) + rest),
// Y giving the value of C(H, Ω_(ν+1)), and the first contribution of a chain over Ω_ν is lifted
// to the part of its ψ_(ν+1) argument above Ω_(ν+1) (with ψ_(ν+1)(X) added unless X is all above).
//
// Fundamental sequences: below EBO, Buchholz's (ordinals/bocf.js) carried over through this bijection;
// from EBO up to C(Ω,0), the limit of the recursive terms, α[k] is the largest standard term below α
// with k more C's, as in https://googology.fandom.com/wiki/User_blog:Hyp_cos/Fundamental_Sequences_in_Taranovsky%27s_Notation
// requires: ordinals/bocf.js ordinals/veblen.js

const DoR = (() => {

const {ONE, cmp, add, log, omega, countable} = BOCF;

// ---------------------------------------------------------------- terms
const W = "W";
const C = (a, b) => [a, b];
const isC = Array.isArray;

function post(t, out = []) {
	if (t === 0) out.push(1);
	else if (t === W) out.push(2);
	else {
		post(t[1], out);
		post(t[0], out);
		out.push(0);
	}
	return out;
}

const dcmp = (x, y) => BOCF.lex(post(x), post(y), (a, b) => a - b);
const ltW = t => dcmp(t, W) < 0;

// C(C(Ω·2,0),0), with Ω·2 = C(Ω,Ω)
const EBO = C(C(C(W, W), 0), 0);

// ---------------------------------------------------------------- DoR -> EBOCF
class Bad extends Error {}

const succ = v => add(v, ONE);
const Om = v => [[v, []]];
const levelOf = B => B.length && B[0][0].length ? B[0][0] : null;
const above = (X, v) => X.filter(([u]) => cmp(u, v) > 0);
const atMost = (X, v) => X.filter(([u]) => cmp(u, v) <= 0);
const isLimit = s => s.length > 0 && !BOCF.isOne(s.at(-1));
const lsub = H => H.at(-1)[0];

// Ω + e as the chain C(x_k, … C(x_1, Ω)): the x's, innermost first, or null
function omegaPlus(a) {
	const xs = [];
	while (a !== W) {
		if (!isC(a) || ltW(a[1])) return null;
		xs.push(a[0]);
		a = a[1];
	}
	return xs.reverse();
}

// the least μ > μ0 of the form ζ + ω^d, d ≥ E
function nextIndex(mu0, E) {
	const keep = [];
	for (const s of mu0) {
		if (cmp(log(s), E) < 0) break;
		keep.push(s);
	}
	return add(keep, omega(E));
}

// the argument Y of ψ_k(Y), the value of C(H, Ω_k), for every level k below H's least subscript s:
// Y = E_s(Ω_s + ψ_s(Y(H')) + rest) for a limit s (H' the part of H above Ω_s), else lift(contrib)
function Yof(H) {
	const s = lsub(H);
	if (isLimit(s)) {
		const H1 = above(H, s);
		const w = omega(add([[s, []]], add(H1.length ? [[s, Yof(H1)]] : [], H.slice(H1.length))));
		if (cmp(w[0][0], s)) throw new Bad("level");
		return w[0][1];
	}
	const m = s.slice(0, -1);
	return lift(m, contrib(m, H));
}

// the level-ν contribution of a collapse degree with value A ≥ Ω_(ν+1)
function contrib(nu, A) {
	const H = above(A, succ(nu));
	return omega(H.length ? add([[succ(nu), Yof(H)]], A.slice(H.length)) : A);
}

function lift(nu, c) {
	const v1 = succ(nu), [u, X] = c[0];
	if (cmp(u, v1)) return c;
	const H = above(X, v1);
	return !H.length ? c : H.length == X.length ? H : add(H, c);
}

function value(t) {
	if (t === 0) return [];
	if (t === W) throw new Bad("Ω");
	const [a, b] = t;
	if (!ltW(b)) throw new Bad("above Ω");
	const B = value(b), nu = levelOf(B) || [];
	if (!ltW(a)) {
		const xs = omegaPlus(a);
		if (!xs || !xs.every(ltW)) throw new Bad("degree ≥ Ω·2");
		return Om(nextIndex(nu, xs.reduce((e, x) => add(e, omega(value(x))), [])));
	}
	const A = value(a);
	if (cmp(A, Om(succ(nu))) < 0) return add(B, omega(A));
	const c = contrib(nu, A);
	if (!B.length || B.length == 1 && !B[0][1].length && B[0][0].length) return [[nu, lift(nu, c)]];
	if (B.length == 1 && !cmp(B[0][0], nu)) return [[nu, add(B[0][1], c)]];
	throw new Bad("collapse over a non-collapse base");
}

// ---------------------------------------------------------------- EBOCF -> DoR
// Ω_ν = C(Ω+e_k, … C(Ω+e_1, 0)) for ν = ω^e_1 + … + ω^e_k, where Ω+e is a chain over Ω
function base(nu) {
	let cur = 0;
	for (const s of nu) cur = C(chain(W, log(s)), cur);
	return cur;
}

const term = L => L.length ? chain(principal(L[0]), L.slice(1)) : 0;

// b followed by C(log q, ·) for each summand q
const chain = (b, L) => L.reduce((cur, q) => C(term(log(q)), cur), b);

function principal([u, b]) {
	if (!b.length) return u.length ? base(u) : C(0, 0);
	const U = above(b, u), r = atMost(b, u);
	if (r.length) return C(term(log([u, b])), U.length ? principal([u, U]) : base(u));
	return contribs(u, U).reduce((cur, X) => C(degree(u, X), cur), base(u));
}

// whether the first of rr has hi as its part above Ω_t, and more
function absorbs(t, hi, rr) {
	if (!rr.length) return false;
	const X = rr[0][1], XH = above(X, t);
	return !cmp(XH, hi) && X.length > XH.length;
}

// the ψ_(u+1) arguments X that a collapse at level u adds up
function contribs(u, U) {
	const hi = above(U, succ(u)), rr = atMost(U, succ(u));
	const xs = rr.map(q => q[1]);
	return !hi.length || absorbs(succ(u), hi, rr) ? xs : [hi, ...xs];
}

// a degree whose contribution at level u is ψ_(u+1)(X)
function degree(u, X) {
	const v = succ(u), H = above(X, v), lo = atMost(X, v);
	if (!H.length) return term(log([v, X]));
	return chain(jump(H, !cmp(lsub(H), succ(v)) && absorbs(succ(u), H, above(lo, u))), lo);
}

// a degree whose part above is H: it jumps to H's least subscript s
function jump(H, ab) {
	const s = lsub(H);
	if (isLimit(s)) {
		const U = above(H, s), rr = atMost(H, s);
		return U.length ? chain(jump(U, !cmp(lsub(U), succ(s)) && absorbs(s, U, rr)), rr) : term(H);
	}
	const t = s.slice(0, -1), cs = contribs(t, H), X1 = cs[0];
	const whole = cs.length == 1 && !atMost(X1, t).length || ab;
	return chain(degree(t, above(X1, t)), whole ? [] : [[t, H]]);
}

// ---------------------------------------------------------------- standard form
// C(a,b) is standard if a and b are, a ≤ c when b = C(c,d), and (for b < Ω) condition 3: for every
// subterm x of a below Ω and every subterm y of x with x < y < Ω, some z with y ⊑ z < Ω contains x
// properly or is below C(a,b)
function cond3(a, cab) {
	const check = (x, low) => {
		if (!isC(x)) return true;
		const lx = ltW(x);
		if (lx && !low) {
			const ok = (y, z) => {
				if (!isC(y) || !ltW(y)) return !isC(y) || ok(y[0], z) && ok(y[1], z);
				const zy = z || dcmp(y, cab) < 0;
				return (dcmp(x, y) >= 0 || zy) && ok(y[0], zy) && ok(y[1], zy);
			};
			const z = dcmp(x, cab) < 0;
			if (!ok(x[0], z) || !ok(x[1], z)) return false;
		}
		return check(x[0], low || lx) && check(x[1], low || lx);
	};
	return check(a, false);
}

const standards = new Map();

function standard(t) {
	if (!isC(t)) return true;
	const key = post(t).join("");
	if (!standards.has(key)) {
		const [a, b] = t;
		standards.set(key, standard(a) && standard(b) && !(isC(b) && dcmp(a, b[0]) > 0) && (!ltW(b) || cond3(a, t)));
	}
	return standards.get(key);
}

// ---------------------------------------------------------------- fundamental sequences
// α[k] = the largest standard term below α with k more C's than α (Hyp cos). The search runs through
// postfix strings from the largest down, pruned by Taranovsky's theorem that each prefix of a standard
// term's postfix string, closed with C's, is standard.

function fromPost(codes) {
	const stack = [];
	for (const s of codes) {
		if (s) stack.push(s == 1 ? 0 : W);
		else {
			const a = stack.pop(), b = stack.pop();
			stack.push(C(a, b));
		}
	}
	return stack[0];
}

const size = t => isC(t) ? 1 + size(t[0]) + size(t[1]) : 0;

// the largest standard term below α with m C's
function below(alpha, m) {
	const A = post(alpha), N = 2 * m + 1, out = [];
	const dfs = (i, d, tight) => {
		if (i == N) return d == 1 && (!tight || N < A.length);
		if (tight && i >= A.length) return false;
		for (const s of [2, 1, 0]) {
			if (tight && s > A[i] || !s && d < 2) continue;
			const d2 = s ? d + 1 : d - 1, r = N - i - 1;
			if (d2 - 1 > r || (r - d2 + 1) % 2) continue;
			out.push(s);
			if (standard(fromPost([...out, ...Array(d2 - 1).fill(0)])) && dfs(i + 1, d2, tight && s == A[i])) return true;
			out.pop();
		}
		return false;
	};
	return dfs(0, 0, true) ? fromPost(out) : null;
}

return {W, C, isC, dcmp, ltW, EBO, value, term, Bad, countable, standard, below, size};

})();

class notation {
	static title = "DoR";
	static header = "Degrees of Reflection";
	static aliases = true;
	static subterms = "uncountable";
	static syntax = "named";
	static cnf = true;

	// the ordinal settings only matter for ordinals that are written out
	static parameters = [
		{legend: "Ordinal syntax:", visibleIf: () => notation.aliases || notation.subterms != "nested", inputs: [
			{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
			{type: "radio", id: "syntax", value: "veblen", label: "Veblen below ψ(Ω₂)"},
		]},
		{type: "checkbox", id: "cnf", visibleIf: () => notation.aliases || notation.subterms != "nested", label: "Cantor normal form"},
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
		{legend: "Subterms:", inputs: [
			{type: "radio", id: "subterms", value: "nested", label: "Nested C(C(C(1,0),0),0)"},
			{type: "radio", id: "subterms", value: "uncountable", label: "C(Z,0) = Ω"},
			{type: "radio", id: "subterms", value: "ordinal", label: "Ordinals C(ω,0)"},
		]},
	]

	static lessOrEqual(a, b) {
		return DoR.dcmp(a, b) <= 0;
	}

	// the limit of the recursive terms is C(Ω,0): 1, C(C(Ω,0),0) = ε₀, C(C(C(Ω,Ω),0),0) = EBO, ...
	static expandLimit(n) {
		return notation.expand(DoR.C(DoR.W, 0), n);
	}

	// below EBO, Buchholz's fundamental sequences carried over; from EBO on, Hyp cos's
	static expand(a, n) {
		if (notation.isSuccessor(a)) return a && a[1];
		if (DoR.dcmp(a, DoR.EBO) < 0) return DoR.term(BOCF.expand(DoR.value(a), n));
		const key = notation.toString(a) + ";" + n;
		if (!notation.elements.has(key)) notation.elements.set(key, DoR.below(a, DoR.size(a) + n));
		return notation.elements.get(key);
	}

	static elements = new Map();

	static isSuccessor(a) {
		return a === 0 || DoR.isC(a) && a[0] === 0;
	}

	// natural numbers are written as digits
	static toString(a) {
		let n = 0;
		for (let t = a; t !== 0; t = t[1]) {
			if (!DoR.isC(t) || t[0] !== 0) return a === DoR.W ? "Ω" : `C(${notation.toString(a[0])},${notation.toString(a[1])})`;
			n++;
		}
		return String(n);
	}

	static fromString(s) {
		let i = 0;
		const read = () => {
			if (s[i] == "Ω") return i++, DoR.W;
			if (s[i] == "C") {
				i += 2;
				const a = read();
				i++;
				const b = read();
				i++;
				return DoR.C(a, b);
			}
			const j = i;
			while (/\d/.test(s[i])) i++;
			let t = 0;
			for (let k = +s.slice(j, i); k > 0; k--) t = DoR.C(0, t);
			return t;
		};
		return read();
	}

	// conversion to and from EBOCF terms (for Compare/), below EBO = C(C(Ω·2,0),0)
	static ebo = DoR.EBO;

	static toOrdinal(a) {
		if (DoR.dcmp(a, DoR.EBO) >= 0) return null;
		try {
			return DoR.value(a);
		} catch (e) {
			if (e instanceof DoR.Bad) return null;
			throw e;
		}
	}

	static fromOrdinal(t) {
		return DoR.countable(t) ? DoR.term(t) : null;
	}

	static convertToNotation(value) {
		const a = notation.fromString(value), t = notation.toOrdinal(a);
		const opts = {cnf: notation.cnf, named: notation.syntax == "named"};
		const ord = x => (notation.syntax == "psi" ? BOCF.show : Veblen.show)(x, opts);
		// a subterm below Ω as its ordinal (with "uncountable", only if it is uncountable), or null
		const mode = notation.subterms;
		const asOrdinal = (d, inner) => {
			if (mode == "nested" || !DoR.ltW(d)) return null;
			try {
				const x = DoR.value(d);
				return inner && mode == "ordinal" || !DoR.countable(x) ? ord(x) : null;
			} catch (e) {
				if (e instanceof DoR.Bad) return null;
				throw e;
			}
		};
		const show = (d, inner) => d === DoR.W ? (mode == "nested" ? "Ω" : "Z") : !DoR.isC(d) || notation.isNat(d) ? notation.toString(d) :
			asOrdinal(d, inner) ?? `C(${show(d[0], true)},${show(d[1], true)})`;
		const str = show(a, false);
		return notation.aliases && t ? str + " = " + ord(t) : str;
	}

	static isNat(a) {
		for (; a !== 0; a = a[1]) if (!DoR.isC(a) || a[0] !== 0) return false;
		return true;
	}
};
