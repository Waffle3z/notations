// Collapsing HPrSS: HPrSS whose entries are ordinal terms, where an entry's children are
// indexed above it (child index u sits at entry p+1+u), so an entry of uncountable
// cofinality collapses like extended Buchholz ψ.
// Standard sequences correspond to EBOCF terms below Ω₁ with the same order, and
// expand(code t, n) = code(t[n]) for Buchholz's fundamental sequences; the limit is EBO.

// Terms are EBOCF terms (ordinals/bocf.js).
// requires: ordinals/bocf.js ordinals/veblen.js
const {ONE, isNat, countable, lex, cmp, parseNested, toSeq: code, fromSeq: parse, expandSeq} = BOCF;

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
