// PSS: pair sequences (two-row Bashicu matrices), limit sup (0,0)(1,1)…(n,n) = ψ₀(Ω_ω).
// For the last column c: (0,0) is deleted; otherwise the active row is 1 if c's second entry is
// nonzero and 0 if not. The row-0 parent of a column is the last earlier column with a smaller first
// entry, and its row-1 parent the first row-0 ancestor with a smaller second entry. The bad part runs
// from c's parent in the active row to just before c, and copy i of it has its first entries raised
// by i·Δ, with Δ = c's first entry minus the parent's in row 1, and Δ = 0 in row 0.
//
// Value: Buchholz's ψ with bridges, by the PSS value map (ordinals/pss.js), which maps the standard
// sequences onto the terms below ψ₀(Ω_ω) in order.
// requires: ordinals/bocf.js ordinals/veblen.js ordinals/pss.js ordinals/syntax.js

const value = s => PSSMap.value(s);

const pairLess = (a, b) => a[0] - b[0] || a[1] - b[1];

class notation {
	static title = "PSS";
	static header = "Pair Sequence System";
	static aliases = true;
	static syntax = "named";
	static cnf = true;

	// the ordinal settings only matter for "Show ordinal"
	static parameters = [
		...OrdinalSyntax.parameters({visibleIf: () => notation.aliases}),
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
	]

	static lessOrEqual(a, b) {
		return BOCF.lex(a, b, pairLess) <= 0;
	}

	// (0,0)(1,0) ; (0,0)(1,1) ; (0,0)(1,1)(2,2) ; ...
	static expandLimit(n) {
		return !n ? [[0, 0], [1, 0]] : Array.from({length: n + 1}, (_, i) => [i, i]);
	}

	static expand(s, n) {
		const c = s.at(-1), body = s.slice(0, -1);
		if (!c) return [];
		if (!c[0] && !c[1]) return body;
		const parent = j => s.findLastIndex((x, i) => i < j && x[0] < s[j][0]);
		let r = parent(s.length - 1);
		if (c[1]) while (r >= 0 && s[r][1] >= c[1]) r = parent(r);
		if (r < 0) return body;
		const d = c[1] ? c[0] - s[r][0] : 0, out = body.slice(0, r);
		for (let i = 0; i < n; i++) out.push(...body.slice(r).map(([x, y]) => [x + d * i, y]));
		return out;
	}

	static isSuccessor(s) {
		const c = s.at(-1);
		return !c || !c[0] && !c[1];
	}

	static toString(s) {
		return s.map(c => `(${c})`).join("");
	}

	static fromString(str) {
		return (str.match(/\d+,\d+/g) ?? []).map(c => c.split(",").map(Number));
	}

	// conversion to and from EBOCF terms (for Compare/), below ψ₀(Ω_ω)
	static limit = [[[], [[[[[], BOCF.ONE]], []]]]];

	static toOrdinal(s) {
		return value(s);
	}

	// descend from the tops along fundamental sequences, taking the least element at least t each time
	static fromOrdinal(t) {
		if (!BOCF.countable(t) || BOCF.cmp(t, notation.limit) >= 0) return null;
		if (!t.length) return [];
		const at = s => BOCF.cmp(value(s), t);
		let k = 0;
		while (at(notation.expandLimit(k)) < 0) k++;
		let s = notation.expandLimit(k);
		for (let steps = 0; steps < 100000; steps++) {
			const c = at(s);
			if (!c) return s;
			if (c < 0) return null;
			if (notation.isSuccessor(s)) {
				s = s.slice(0, -1);
				continue;
			}
			const atLeast = n => at(notation.expand(s, n)) >= 0;
			let lo = 0, hi = 1;
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
			s = notation.expand(s, hi);
		}
		return null;
	}

	static convertToNotation(value) {
		if (!value) return "∅";
		const t = notation.toOrdinal(notation.fromString(value));
		if (!notation.aliases) return value;
		return value + " = " + OrdinalSyntax.show(t, notation);
	}
};
