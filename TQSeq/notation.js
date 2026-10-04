// T? sequence: sequences starting 1,2, limit sup [1,2,n].
// It is ? sequence except forthe bad-root search when the last entry is at least 2 above its parent
// Below [1,2,4,6] = EBO it is extended Buchholz ψ with subscripts in Cantor normal form: a child
// at r+1 is an argument summand, a child at r+2 a subscript summand ω^e whose children spell e,
//   enc(ψ_ν(α), r) = r, (r+2, enc(e, r+3) for each ω^e in ν), enc(α, r+1)
// requires: ordinals/util.js ordinals/bocf.js

const {log, omega} = BOCF;
const {lexLess} = Util;

const norm = (m, k) => m.slice(k).map(v => v - m[k]);
const lastBelow = (m, i, c) => m.findLastIndex((v, j) => j < i && v < c);

function expand(s, n) {
	if (s.at(-1) == Math.min(...s)) return s.slice(0, -1);
	const m = [s[0] - 2, s[0] - 1, ...s], last = m.at(-1);
	let br = lastBelow(m, m.length - 1, last);
	if (last - m[br] > 1) {
		// the entries not above the running minimum whose own step is smaller than the last one's
		const psis = [];
		let a = last;
		for (let i = m.length - 2; i > 0; i--) {
			if (a < m[i]) continue;
			a = m[i];
			const p = lastBelow(m, i, m[i]);
			if (m[i] - m[p] < last - m[br]) psis.push([p, i]);
		}
		br = psis[0][1];
		let cbr = br;
		for (const [p, i] of psis) {
			if (lexLess(norm(m, i), norm(m, br))) {
				br = cbr;
				break;
			}
			cbr = p + 1;
			while (cbr < br && m[cbr] > Math.min(...m.slice(cbr + 1))) cbr++;
		}
	}
	const out = m.slice(0, br), d = last - m[br] - 1;
	for (let i = 0; i < n; i++) out.push(...m.slice(br, -1).map(q => q + d * i));
	return out.slice(2);
}

// EBOCF terms (ordinals/bocf.js) <-> sequences
const enc = (t, r = 1) => t.flatMap(([u, a]) => [r, ...u.flatMap(p => [r + 2, ...enc(log(p), r + 3)]), ...enc(a, r + 1)]);

function dec(s, r = 1) {
	const t = [];
	for (let i = 0, j; i < s.length; i = j) {
		for (j = i + 1; j < s.length && s[j] > r; j++);
		const body = s.slice(i + 1, j);
		let k = 0;
		while (k < body.length && body[k] >= r + 2) k++;
		const u = [];
		for (let a = 0, b; a < k; a = b) {
			for (b = a + 1; b < k && body[b] > r + 2; b++);
			u.push(...omega(dec(body.slice(a + 1, b), r + 3)));
		}
		t.push([u, dec(body.slice(k), r + 1)]);
	}
	return t;
}

class notation {
	static title = "T? sequence";
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
		return !a.length || a.at(-1) == Math.min(...a);
	}

	static toString(a) {
		return a.join(",");
	}

	static fromString(s) {
		return s ? s.split(",").map(Number) : [];
	}

	// conversion to and from EBOCF terms (for Compare/), below EBO = 1,2,4,6
	static ebo = [1, 2, 4, 6];

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
