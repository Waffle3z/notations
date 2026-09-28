// Nothing OCF (NOCF): extended Buchholz ψ without + in the closure, and SSS, which encodes it.
//
// A term is its address (u1,…,uk) = ψ_{u1}(ψ_{u2}(…ψ_{uk}(0))), each entry again a term, 0 = [].
// Standard terms are ordered lexicographically on addresses. The SSS sequence of a term is
//   encode(t) = concatenation over its entries u of [0] ++ (encode(u)+1),
// and below [0,0,2] SSS is exactly NOCF, with SSS expansion as its fundamental sequences and
// order type EBO. The explorers use `fundamental`, which skips successors where a limit fits. Needs ordinals/bocf.js and ordinals/veblen.js.

const NOCF = (() => {

const {ONE, lex, cmp: bcmp, add, sub, log, omega, countable} = BOCF;

const cmp = (a, b) => lex(a, b, cmp);

const encode = t => t.flatMap(u => [0, ...encode(u).map(x => x + 1)]);

// the term of an SSS sequence that starts with 0 and steps up by at most 1
function decode(s) {
	const t = [];
	for (let i = 0, j; i < s.length; i = j) {
		for (j = i + 1; j < s.length && s[j] > 0; j++);
		t.push(decode(s.slice(i + 1, j).map(x => x - 1)));
	}
	return t;
}

// SSS expansion: walk left from the parent over the entries not above the
// running minimum, stopping at the first whose normalized suffix is below the parent's
function expand(s, n) {
	const c = s.at(-1), body = s.slice(0, -1);
	const p = body.findLastIndex(x => x < c);
	if (p < 0) return body;
	const norm = i => s.slice(i).map(x => x - s[i]);
	const lt = (a, b) => lex(a, b, (x, y) => x - y) < 0;
	const pseq = norm(p);
	let root = s[p], bad = p;
	for (let i = p - 1; i >= 0; i--) {
		if (s[i] > root) continue;
		root = s[i];
		if (lt(norm(i), pseq)) break;
		bad = i;
	}
	const d = c - s[bad] - 1, out = body.slice(0, bad);
	for (let j = 0; j < n; j++) out.push(...body.slice(bad).map(x => x + d * j));
	return out;
}

// fundamental sequences: SSS expansion, except that no successor stands where a limit could. The
// last entry x of an element ends its innermost subterm, at depth x. If that subterm is a natural
// number it goes, which leaves its parent a successor, and so on up to the first limit: this drops
// the final run that rises by steps of 0 or 1. Below that limit, a run of x's preceded by a larger
// entry is the +k of a subterm at depth x whose predecessor is a limit, and it goes too, down to
// deeper depths. Each step is taken only if the element stays above the previous one.
function fundamental(s, n) {
	let e = expand(s, n);
	if (!n) return e;
	const prev = expand(s, n - 1), above = q => q.length && lex(q, prev, (a, b) => a - b) > 0;
	let i = e.length - 1;
	while (i > 0 && e[i - 1] <= e[i]) i--;
	if (!above(e.slice(0, i))) return e;
	e = e.slice(0, i);
	while (true) {
		const x = e.at(-1);
		let q = e;
		while (q.length && q.at(-1) == x) q = q.slice(0, -1);
		if (!(q.at(-1) > x && above(q))) return e;
		e = q;
	}
}

// ---------------------------------------------------------------- value
// value(t) = Σ over roots d (prefix minima) with children L of Ω_d·ω^rank(d, L), where the rank is
// the fold V of the countable fragment with the true Veblen function, collapsed at level d: a free
// rank R above level d with X = arg_ℓ(R) has every top summand ψ_v(A) of X with d < v ≤ ℓ, v a
// successor, turned into ψ_v(Ω_v² + A).

const Om = l => [[l, []]];
const lev = z => z.length ? z[0][0] : [];
const isSucc = v => v.length && !bcmp([v.at(-1)], ONE);
const isLimit = b => b.length > 0 && bcmp([b.at(-1)], ONE) != 0;
const levelOf = b => isSucc(b) ? b.slice(0, -1) : b;

function argL(l, R) {
	const s = omega(add(Om(l), R));
	if (s.length != 1 || bcmp(s[0][0], l)) throw new Error("arg level");
	return s[0][1];
}

function rankOf(b, X) {
	const main = X.filter(([v]) => bcmp(v, b) > 0), y = X.slice(main.length);
	if (!main.length) return y;
	const lg = log([b, main]);
	return add(b.length ? sub(lg, Om(b)) : lg, y);
}

const transform = (b, l, X) => X.map(([v, A]) =>
	bcmp(v, b) > 0 && bcmp(v, l) <= 0 && isSucc(v) ? [v, add([[v, Om(v)]], A)] : [v, A]);

function collapseArg(b, x) {
	const l = lev(x);
	return bcmp(l, b) < 0 ? x : transform(b, l, argL(l, x));
}

function collapse(b, R) {
	if (!R.length) return R;
	const l = lev(R);
	return bcmp(l, b) <= 0 ? R : rankOf(b, transform(b, l, argL(l, R)));
}

// the chain from base m down to base r, one Cantor-normal-form step at a time, collapsing at each
// level reached; at a limit base whose level below is collapsed it switches to argument mode
function chain(L, m, r, endArg = false) {
	const delta = sub(m, r);
	let x = V(L, m);
	if (isLimit(m) && bcmp(lev(x), m) >= 0) return {arg: W(L, m)};
	x = collapse(levelOf(m), x);
	for (let k = delta.length - 1; k >= 0; k--) {
		const e = log(delta[k]), prev = x;
		x = e.length ? Veblen.phi(e, sub(x, ONE)) : omega(x);
		if (k > 0 || endArg) {
			const b = add(r, delta.slice(0, k));
			if (isLimit(b) && bcmp(lev(x), b) >= 0)
				return {arg: e.length ? collapseArg(b, x) : argL(b, omega(add(Om(b), prev)))};
			if (k > 0) x = collapse(levelOf(b), x);
		}
	}
	return {x};
}

// the last root of L at depth l, if any
const lastAt = (L, l) => L.findLastIndex(x => !bcmp(x, l));

function W(L, l) {
	if (!L.length) return [];
	const i = lastAt(L, l);
	if (i >= 0) return add(W(L.slice(0, i), l), omega(add(Om(l), collapse(l, V(L.slice(i + 1), add(l, ONE))))));
	const res = chain(L, L.reduce((a, x) => bcmp(x, a) < 0 ? x : a), l, true);
	return res.arg ?? collapseArg(l, res.x);
}

function V(L, r) {
	if (!L.length) return [];
	const i = lastAt(L, r);
	if (i >= 0) return add(V(L.slice(0, i), r), omega(collapse(r, V(L.slice(i + 1), add(r, ONE)))));
	const res = chain(L, L.reduce((a, x) => bcmp(x, a) < 0 ? x : a), r);
	return res.arg ? rankOf(add(levelOf(r), ONE), res.arg) : res.x;
}

const memo = new Map();

function value(t) {
	const key = JSON.stringify(t);
	if (memo.has(key)) return memo.get(key);
	const d = t.map(value);
	let out = [];
	for (let i = 0, j; i < d.length; i = j) {
		for (j = i + 1; j < d.length && bcmp(d[j], d[i]) > 0; j++);
		const r = d[i], e = collapse(r, V(d.slice(i + 1, j), add(r, ONE)));
		out = add(out, r.length ? omega(add(Om(r), e)) : omega(e));
	}
	memo.set(key, out);
	return out;
}

// ---------------------------------------------------------------- back from EBOCF

const EBO = [0, 0, 2];

// the SSS sequence with value t < EBO: descend from [0,0,2] along fundamental sequences, taking the
// least element at least t each time (reachability is the order, so this ends at t)
function fromValue(t) {
	if (!countable(t)) return null;
	const val = s => value(decode(s));
	let s = EBO;
	for (let steps = 0; steps < 100000; steps++) {
		if (s != EBO) {
			const c = bcmp(val(s), t);
			if (!c) return s;
			if (c < 0) return null;
		}
		if (s.at(-1) == Math.min(...s)) {
			s = s.slice(0, -1);
			continue;
		}
		const atLeast = n => bcmp(val(expand(s, n)), t) >= 0;
		let lo = 1, hi = 1;
		while (!atLeast(hi)) {
			lo = hi + 1;
			hi *= 2;
			if (hi > 4096) return null;
		}
		while (lo < hi) {
			const mid = Math.floor((lo + hi) / 2);
			if (atLeast(mid)) hi = mid;
			else lo = mid + 1;
		}
		s = expand(s, hi);
	}
	return null;
}

return {cmp, encode, decode, expand, fundamental, value, fromValue, EBO};

})();
