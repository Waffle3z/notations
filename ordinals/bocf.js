// Extended Buchholz ψ (EBOCF) terms: the shared ordinal representation.
//
// A term is a list of summands [u, b] = ψ_u(b) in non-increasing order, so 0 = [], 1 = ψ₀(0),
// n = n copies of 1, ω = ψ₀(1), Ω_u = ψ_u(0). Terms compare by their bracket strings, which is
// the ordinal order on standard terms.

const BOCF = (() => {

const ONE = [[[], []]];
const nat = n => Array(n).fill(ONE[0]);
const isOne = ([u, b]) => !u.length && !b.length;
const isNat = t => t.every(isOne);
const countable = t => t.every(([u]) => !u.length);

function lex(x, y, cmpElem) {
	for (let i = 0; i < x.length; i++) {
		if (i >= y.length) return 1;
		const c = cmpElem(x[i], y[i]);
		if (c) return c;
	}
	return x.length < y.length ? -1 : 0;
}

// summands compare by subscript, then argument
const cmpSummand = ([u1, b1], [u2, b2]) => cmp(u1, u2) || cmp(b1, b2);
const cmp = (x, y) => lex(x, y, cmpSummand);

function add(x, y) {
	if (!y.length) return x;
	let i = x.length;
	while (i && cmpSummand(x[i - 1], y[0]) < 0) i--;
	return [...x.slice(0, i), ...y];
}

// the z with y + z = x, for y ≤ x
function sub(x, y) {
	let i = 0;
	while (i < y.length && i < x.length && !cmpSummand(x[i], y[i])) i++;
	return x.slice(i);
}

// ψ_w(b) = ω^(ψ_w(U) + rest), where U is the part of b above Ω_(w+1) and b = U + rest;
// for w = 0 and no U this is ω^b
function log([w, b]) {
	const U = b.filter(([u]) => cmp(u, w) > 0);
	return add(U.length || w.length ? [[w, U]] : [], b.slice(U.length));
}

// ω^c, the inverse of log
function omega(c) {
	if (!c.length) return ONE;
	const [w, b] = c[0];
	const U = b.filter(([u]) => cmp(u, w) > 0);
	return [[w, [...U, ...(U.length || w.length ? sub(c, [[w, U]]) : c)]]];
}

// Cantor normal form in base Ω_v, for terms below ε_(Ω_v+1)

const below = (x, v) => x.every(([u, b]) => cmp(u, v) < 0 || (!cmp(u, v) && below(b, v)));

// Ω_v·x, using Ω_v·ω^β = ψ_v(β)
const mulOmega = (x, v) => x.map(s => [v, log(s)]);

// the digits [F, k] of t = Σ Ω_v^F·k with k < Ω_v, or null if t is not below ε_(Ω_v+1)
function digits(t, v) {
	if (!below(t, v)) return null;
	const out = [];
	for (const s of t) {
		let F = [], k = [s];
		if (!cmp(s[0], v)) { // s = ω^g with g = Ω_v·F + r
			const g = add([[v, []]], s[1]);
			F = g.filter(([u]) => !cmp(u, v)).flatMap(([, z]) => omega(z));
			k = omega(g.filter(([u]) => cmp(u, v) < 0));
		}
		if (out.length && !cmp(out.at(-1)[0], F)) out.at(-1)[1] = add(out.at(-1)[1], k);
		else out.push([F, k]);
	}
	return out;
}

// Σ Ω_v^F·k, with Ω_v^F·ω^c = ω^(Ω_v·F + c)
const undigits = (d, v) => d.flatMap(([F, k]) => k.flatMap(s => omega(add(mulOmega(F, v), log(s)))));

// printing: opts.cnf writes terms in base Ω_v for their largest Ω_v, opts.countable, if given,
// prints countable terms, and opts.psi, if given, can print a ψ term another way

const subscriptDigits = n => [...String(n)].map(d => "₀₁₂₃₄₅₆₇₈₉"[d]).join("");

// parenthesize a sum or product
function wrap(s, chars = "+·") {
	let depth = 0;
	for (const ch of s) {
		if ("({".includes(ch)) depth++;
		else if (")}".includes(ch)) depth--;
		else if (!depth && chars.includes(ch)) return `(${s})`;
	}
	return s;
}

function subscript(u, opts) {
	if (isNat(u)) return subscriptDigits(u.length);
	const s = show(u, opts);
	return wrap(s, "+·^") == s ? "_" + s : "_{" + s + "}";
}

function principal([u, b], opts) {
	if (!u.length && !cmp(b, ONE)) return "ω";
	if (!b.length) return !cmp(u, ONE) ? "Ω" : "Ω" + subscript(u, opts);
	return opts.psi?.([u, b]) || "ψ" + (u.length ? subscript(u, opts) : "") + `(${show(b, opts)})`;
}

// runs of equal summands: [[s, count], ...]
function runs(t) {
	const out = [];
	for (const s of t) {
		if (out.length && !cmpSummand(out.at(-1)[0], s)) out.at(-1)[1]++;
		else out.push([s, 1]);
	}
	return out;
}

function show(t, opts = {}) {
	if (opts.countable && t.length && countable(t)) return opts.countable(t);
	const v = t[0]?.[0];
	const d = opts.cnf && v?.length && digits(t, v);
	if (d) {
		const base = principal([v, []], opts);
		return d.map(([F, k]) => {
			if (!F.length) return show(k, opts);
			const power = cmp(F, ONE) ? base + "^" + wrap(show(F, opts)) : base;
			return cmp(k, ONE) ? power + "·" + wrap(show(k, opts)) : power;
		}).join("+");
	}
	return runs(t).map(([s, k]) => isOne(s) ? String(k) : principal(s, opts) + (k > 1 ? "·" + k : "")).join("+") || "0";
}

// "0,(0,1),2": a sequence with ordinal entries, where inner(seq) is the value of a nested sequence
function parseNested(str, inner) {
	let i = 0;
	const seq = () => {
		const out = [];
		while (true) {
			if (str[i] == "(") {
				i++;
				out.push(inner(seq()));
				i++;
			} else {
				const j = i;
				while (/\d/.test(str[i])) i++;
				out.push(nat(+str.slice(j, i)));
			}
			if (str[i] != ",") return out;
			i++;
		}
	};
	return str ? seq() : [];
}

return {ONE, nat, isOne, isNat, countable, lex, cmpSummand, cmp, add, sub, log, omega, below, digits, undigits,
	subscriptDigits, wrap, principal, runs, show, parseNested};

})();
