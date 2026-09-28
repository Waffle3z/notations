// SSS: sequences starting 0,0, limit sup [0,0,n]. For the last entry c with parent p (the last
// earlier entry below c): no parent means a successor; otherwise walk left from p over the entries
// not above the running minimum, stopping at the first whose normalized suffix is lexicographically
// below the parent's, and copy from the last entry passed, shifted by c - s[bad] - 1.
// Below [0,0,2] = EBO it is the SSS encoding of Nothing OCF (ordinals/nocf.js).
// requires: ordinals/bocf.js ordinals/veblen.js ordinals/nocf.js

function lexLess(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return false;
		if (a[i] != b[i]) return a[i] < b[i];
	}
	return a.length < b.length;
}

class notation {
	static title = "SSS";
	static aliases = true;
	static syntax = "named";
	static cnf = true;

	// the ordinal settings only matter for "Show ordinal"
	static parameters = [
		{legend: "Ordinal syntax:", visibleIf: () => notation.aliases, inputs: [
			{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
			{type: "radio", id: "syntax", value: "veblen", label: "Veblen below ψ(Ω₂)"},
		]},
		{type: "checkbox", id: "cnf", visibleIf: () => notation.aliases, label: "Cantor normal form"},
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
	]

	static lessOrEqual(a, b) {
		return !lexLess(b, a);
	}

	// 0,0,1 ; 0,0,2 ; 0,0,3 ; ...
	static expandLimit(n) {
		return [0, 0, n + 1];
	}

	static expand(a, n) {
		return a.length ? NOCF.fundamental(a, n) : [];
	}

	static isSuccessor(a) {
		return !a.length || a.at(-1) == Math.min(...a);
	}

	static toString(a) {
		return a.join(",");
	}

	static fromString(s) {
		return s ? s.split(",").map(Number) : [];
	}

	// conversion to and from EBOCF terms (for Compare/), below EBO = 0,0,2
	static ebo = NOCF.EBO;

	static toOrdinal(a) {
		return lexLess(a, notation.ebo) ? NOCF.value(NOCF.decode(a)) : null;
	}

	static fromOrdinal(t) {
		return NOCF.fromValue(t);
	}

	static convertToNotation(value) {
		if (!value) return "∅";
		const t = notation.toOrdinal(notation.fromString(value));
		if (!notation.aliases || !t) return value;
		const opts = {cnf: notation.cnf, named: notation.syntax == "named"};
		return value + " = " + (notation.syntax == "psi" ? BOCF.show : Veblen.show)(t, opts);
	}
};
