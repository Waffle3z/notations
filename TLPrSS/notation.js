// Transfinite LPrSS: LPrSS with ordinal entries, limit Γ₀.
// Expanding L,c: c = 0 is dropped; a limit c expands in place (by expanding its own nested
// sequence, so ω[n] = n); c = c'+1 copies the bad part from its parent r, shifting the i-th
// copy by x ↦ r + (δ·i + (x-r)), δ = c'-r.
// The value is PrSS with ordinal depths: an entry x with parent p is ω^(x-p-1) levels deeper.
// Ordinals are EBOCF terms (ordinals/bocf.js) with Veblen functions (ordinals/veblen.js).
// requires: ordinals/bocf.js ordinals/veblen.js

const {ONE, nat, isOne, isNat, lex, cmp, add, sub, log, omega, parseNested} = BOCF;
const {phi, veblenOf, dimensional} = Veblen;
const GAMMA0 = dimensional([[ONE, nat(2)]]);

// a chain of exponent e: G e x = φ(e, x-1)
const G = (e, x) => phi(e, sub(x, ONE));

function seqValue(s) {
	const children = s.map(() => []), roots = [], stack = [];
	s.forEach((x, i) => {
		while (stack.length && cmp(s[stack.at(-1)], x) >= 0) stack.pop();
		(stack.length ? children[stack.at(-1)] : roots).push(i);
		stack.push(i);
	});
	// siblings have non-increasing exponents x-p-1; a drop in exponent e applies G e
	const value = [];
	for (let i = s.length - 1; i >= 0; i--) {
		let acc = [], prev = [];
		for (const c of children[i]) {
			const e = sub(s[c], add(s[i], ONE));
			if (acc.length && cmp(e, prev)) acc = G(prev, acc);
			acc = add(acc, value[c]);
			prev = e;
		}
		value[i] = omega(prev.length ? G(prev, acc) : acc);
	}
	return roots.reduce((acc, r) => add(acc, value[r]), []);
}

// the largest φ(E,β) ≤ x with E > lev, as [summand, E, β]
function largestFixed(x, lev) {
	if (!x.length) return null;
	const {E, arg} = veblenOf(x[0]);
	return cmp(E, lev) > 0 ? [x[0], E, arg] : largestFixed(arg, lev);
}

// Emit the children of p making the value x at exponent lev. The largest fixed point is a
// chain of higher exponent, kept even when absorbed (0,2,1,3 = ω^(ε₀·2), not 0,1,3,2,4).
function emit(out, p, x, lev) {
	const F = largestFixed(x, lev);
	if (F) {
		emit(out, p, add(ONE, F[2]), F[1]);
		x = sub(x, [F[0]]);
	}
	const y = add(p, add(ONE, lev));
	for (const t of x) {
		out.push(y);
		emit(out, y, log(t), []);
	}
}

// the standard sequence of an ordinal
function ordToSeq(x) {
	const out = [];
	for (const t of x) {
		out.push([]);
		emit(out, [], log(t), []);
	}
	return out;
}

function expand(a, n) {
	const out = a.slice(0, -1), cut = a.at(-1);
	if (!cut?.length) return out;
	if (!isOne(cut.at(-1))) return [...out, seqValue(expand(ordToSeq(cut), n))];
	const root = out.findLastIndex(x => cmp(x, cut) < 0);
	const r = out[root], delta = sub(cut.slice(0, -1), r), bad = out.slice(root);
	let result = out, shift = [];
	for (let i = 1; i < n; i++) {
		shift = add(shift, delta);
		result = result.concat(bad.map(x => add(r, add(shift, sub(x, r)))));
	}
	return result;
}

const nested = x => isNat(x) ? String(x.length) : `(${ordToSeq(x).map(nested).join(",")})`;

class notation {
	static title = "TLPrSS";
	static header = "Transfinite LPrSS";
	static entries = "ordinal";
	static aliases = true;
	static syntax = "veblen";

	static parameters = [
		{legend: "Entries:", inputs: [
			{type: "radio", id: "entries", value: "ordinal", label: "Ordinal (0,ω)"},
			{type: "radio", id: "entries", value: "nested", label: "Nested (0,(0,1))"},
		]},
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
		{legend: "Ordinal syntax:", inputs: [
			{type: "radio", id: "syntax", value: "veblen", label: "Veblen (φ(ω,0))"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η (ψ(ψ₁(ψ₁(1))))"},
			{type: "radio", id: "syntax", value: "bocf", label: "Buchholz (ψ(ψ₁(ψ₁(1))))"},
		]},
	]

	static lessOrEqual(a, b) {
		return lex(a, b, cmp) <= 0;
	}

	// 0,1 ; 0,(0,1) ; 0,(0,(0,1)) ; ...
	static expandLimit(n) {
		let x = ONE;
		for (let i = 0; i < n; i++) x = seqValue([[], x]);
		return [[], x];
	}

	static expand(a, n) {
		return expand(a, n);
	}

	static isSuccessor(a) {
		return !a.at(-1)?.length;
	}

	static toString(a) {
		return a.map(nested).join(",");
	}

	static fromString(s) {
		return parseNested(s, seqValue);
	}

	// conversion to and from EBOCF terms (for Compare/)
	static limit = GAMMA0;

	static toOrdinal(a) {
		return seqValue(a);
	}

	static fromOrdinal(t) {
		return cmp(t, GAMMA0) < 0 ? ordToSeq(t) : null;
	}

	static convertToNotation(value) {
		const a = notation.fromString(value);
		if (!a.length) return "∅";
		const show = x => (notation.syntax == "bocf" ? BOCF.show : Veblen.show)(x, {named: notation.syntax == "named"});
		const str = notation.entries == "nested" ? value : a.map(x => show(x)).join(",");
		return notation.aliases ? str + " = " + show(seqValue(a)) : str;
	}
};
