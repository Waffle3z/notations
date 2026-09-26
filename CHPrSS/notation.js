// Collapsing HPrSS: HPrSS whose entries are ordinal terms, where an entry's children are
// indexed above it (child index u sits at entry p+1+u), so an entry of uncountable
// cofinality collapses like extended Buchholz ψ.
// Standard sequences correspond to EBOCF terms below Ω₁ with the same order, and
// expand(code t, n) = code(t[n]) for Buchholz's fundamental sequences; the limit is EBO.
// (Lean: Googology/Minimal/Extended, ecodeIso, expand_code, eboType_eq; tools/ebocf.py)

// Terms are EBOCF terms (ordinals/bocf.js).
// requires: ordinals/bocf.js ordinals/veblen.js
const {ONE, isOne, isNat, countable, lex, cmp, add, sub, parseNested} = BOCF;

// term -> sequence: ψ_u(b) is the entry base+u followed by the code of b above it
const code = (t, base = []) => t.flatMap(([u, b]) => {
	const e = add(base, u);
	return [e, ...code(b, add(e, ONE))];
});

// sequence -> term: the children of an entry are the following run of larger entries
function parse(s, lo = 0, hi = s.length, base = null) {
	const out = [];
	for (let i = lo, j; i < hi; i = j) {
		for (j = i + 1; j < hi && cmp(s[i], s[j]) < 0; j++);
		out.push([base ? sub(s[i], add(base, ONE)) : s[i], parse(s, i + 1, j, s[i])]);
	}
	return out;
}

const parent = (s, i) => s.findLastIndex((x, j) => j < i && cmp(x, s[i]) < 0);

function index(s, j) {
	const p = parent(s, j);
	return p < 0 ? s[j] : sub(s[j], add(s[p], ONE));
}

// The expansion s[n], or {mu, K} when the last entry has cofinality Ω_(mu+1): it is resolved
// by an ancestor with index ≤ mu, and K builds the sequence around a nested copy.
function expandSeq(s, n) {
	const body = s.slice(0, -1), p = parent(s, s.length - 1);
	const base = p < 0 ? [] : add(s[p], ONE);
	const lam = sub(s.at(-1), base);
	const climb = (j, mu) => {
		while (j >= 0 && cmp(mu, index(s, j)) < 0) j = parent(s, j);
		return j;
	};
	if (!lam.length) return p < 0 ? body : body.concat(...Array(n).fill(s.slice(p, -1)));
	if (isOne(lam.at(-1))) {
		const mu = lam.slice(0, -1), cp = add(base, mu);
		const r = p < 0 ? -1 : climb(p, mu);
		if (r < 0) return {mu, K: L => L ? [...body, cp, ...L.map(x => add(add(cp, ONE), x))] : body};
		const inc = sub(cp, s[r]), bad = s.slice(r, -1);
		let out = body, shift = s[r];
		for (let k = 1; k <= n; k++) {
			shift = add(shift, inc);
			out = out.concat(bad.map(x => add(shift, sub(x, s[r]))));
		}
		return out;
	}
	// a limit index: expand it as a sequence of its own
	const res = expandSeq(code(lam), n);
	if (Array.isArray(res)) return [...body, add(base, parse(res))];
	const K = L => [...body, add(base, parse(res.K(L)))];
	const r = p < 0 ? -1 : climb(p, res.mu);
	if (r < 0) return {mu: res.mu, K};
	const rb = add(s[r], ONE);
	let L = null;
	for (let k = 0; k < n; k++) L = K(L).slice(r + 1).map(x => sub(x, rb));
	return K(L);
}

const nested = e => isNat(e) ? String(e.length) : `(${code(e).map(nested).join(",")})`;

class notation {
	static title = "CHPrSS";
	static header = "Collapsing HPrSS";
	static entries = "ordinal";
	static aliases = true;
	static cnf = true;
	static syntax = "named";

	static parameters = [
		{legend: "Entries:", inputs: [
			{type: "radio", id: "entries", value: "ordinal", label: "Ordinal (0,Ω)"},
			{type: "radio", id: "entries", value: "nested", label: "Nested (0,(1))"},
		]},
		{legend: "Ordinal syntax:", inputs: [
			{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
			{type: "radio", id: "syntax", value: "veblen", label: "Dimensional veblen"},
		]},
		{type: "checkbox", id: "cnf", label: "Cantor normal form (ψ₁(ψ₁(Ω)) = Ω^Ω)"},
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
	]

	static lessOrEqual(a, b) {
		return lex(a, b, cmp) <= 0;
	}

	// 0,1 ; 0,Ω ; 0,Ω_Ω ; ...  = ω, ψ(Ω_Ω), ψ(Ω_Ω_Ω), ...
	static expandLimit(n) {
		let x = ONE;
		for (let i = 0; i < n; i++) x = [[x, []]];
		return [[], x];
	}

	static expand(a, n) {
		if (!a.length) return [];
		const res = expandSeq(a, n);
		return Array.isArray(res) ? res : a.slice(0, -1); // unreachable below Ω₁
	}

	static isSuccessor(a) {
		return !a.at(-1)?.length;
	}

	static toString(a) {
		return a.map(nested).join(",");
	}

	static fromString(s) {
		return parseNested(s, parse);
	}

	// conversion to and from EBOCF terms (for Compare/)
	static toOrdinal(a) {
		return parse(a);
	}

	static fromOrdinal(t) {
		return countable(t) ? code(t) : null;
	}

	static convertToNotation(value) {
		const a = notation.fromString(value);
		if (!a.length) return "∅";
		const opts = {cnf: notation.cnf, named: notation.syntax == "named"};
		const show = x => (notation.syntax == "psi" ? BOCF.show : Veblen.show)(x, opts);
		const str = notation.entries == "nested" ? value : a.map(show).join(",");
		return notation.aliases ? str + " = " + show(parse(a)) : str;
	}
};
