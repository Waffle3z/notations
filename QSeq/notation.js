// The ? sequence: sequences starting 1,2, limit sup [1,2,n].
// For the last entry c with parent p (the last earlier entry below c): no parent means a
// successor; c = s[p]+1 expands like PrSS; otherwise like SSS, walking left from p over the
// entries not above the running minimum, stopping at the first whose normalized suffix is
// lexicographically below the parent's, with copies shifted by c - s[bad] - 1.
// Below [1,2,5] = EBO it encodes extended Buchholz terms: enc(ψ_ν(a), r) = r, enc(ν, r+2), enc(a, r+1)
// (Lean: Googology/Minimal/Extended/QSeq, QEnc, qseq_type_eq_EBO; tools/qseq.py).
// requires: ordinals/bocf.js

function lexLess(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return false;
		if (a[i] != b[i]) return a[i] < b[i];
	}
	return a.length < b.length;
}

function expand(s, n) {
	const c = s.at(-1), body = s.slice(0, -1);
	const p = body.findLastIndex(x => x < c);
	if (p < 0) return body;
	let bad = p, d = 0;
	if (c != s[p] + 1) {
		const norm = i => s.slice(i).map(x => x - s[i]);
		const pseq = norm(p);
		let root = s[p];
		for (let i = p - 1; i >= 0; i--) {
			if (s[i] > root) continue;
			root = s[i];
			if (lexLess(norm(i), pseq)) break;
			bad = i;
		}
		d = c - s[bad] - 1;
	}
	const out = body.slice(0, bad);
	for (let j = 0; j < n; j++) out.push(...body.slice(bad).map(x => x + d * j));
	return out;
}

// EBOCF terms (ordinals/bocf.js) <-> sequences: children at r+2 carry the subscript, at r+1 the argument
const enc = (t, r = 1) => t.flatMap(([u, a]) => [r, ...enc(u, r + 2), ...enc(a, r + 1)]);

function dec(s, r = 1) {
	const t = [];
	for (let i = 0, j; i < s.length; i = j) {
		for (j = i + 1; j < s.length && s[j] > r; j++);
		const body = s.slice(i + 1, j);
		let k = 0;
		while (k < body.length && body[k] >= r + 2) k++;
		t.push([dec(body.slice(0, k), r + 2), dec(body.slice(k), r + 1)]);
	}
	return t;
}

class notation {
	static title = "? sequence";
	static aliases = true;

	static parameters = [
		{type: "checkbox", id: "aliases", label: "Show EBOCF"},
	]

	static lessOrEqual(a, b) {
		return !lexLess(b, a);
	}

	// 1,2,2 ; 1,2,3 ; 1,2,4 ; ...
	static expandLimit(n) {
		return [1, 2, n + 2];
	}

	static expand(a, n) {
		return a.length ? expand(a, n) : [];
	}

	static isSuccessor(a) {
		return !a.length || a.slice(0, -1).every(x => x >= a.at(-1));
	}

	static toString(a) {
		return a.join(",");
	}

	static fromString(s) {
		return s ? s.split(",").map(Number) : [];
	}

	// conversion to and from EBOCF terms (for Compare/), below EBO = 1,2,5
	static ebo = [1, 2, 5];

	static toOrdinal(a) {
		return lexLess(a, notation.ebo) ? dec(a) : null;
	}

	static fromOrdinal(t) {
		return BOCF.countable(t) ? enc(t) : null;
	}

	static convertToNotation(value) {
		if (!value) return "∅";
		const t = notation.toOrdinal(notation.fromString(value));
		return notation.aliases && t ? value + " = " + BOCF.show(t) : value;
	}
};
