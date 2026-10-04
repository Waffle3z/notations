// The PSS value map: pair sequences (two-row Bashicu matrices) to EBOCF terms (ordinals/bocf.js).
//
// At depth r, a column (r,u) is a summand ψ_u whose argument is the deeper columns after it, read at
// depth r+1, and this is Buchholz's ψ except for bridges: inside ψ_(q-1), a first summand ψ_q(y),
// with P the leading summands of y with subscripts above q, stands for y if y = P and for P + ψ_q(y)
// otherwise. This maps the standard sequences onto the terms below ψ₀(Ω_ω) in order.

const PSSMap = (() => {

// the raw term of the columns at depth r: [[u, argument], ...]
function raw(s, r = 0) {
	const t = [];
	for (let i = 0, j; i < s.length; i = j) {
		for (j = i + 1; j < s.length && s[j][0] > r; j++);
		t.push([s[i][1], raw(s.slice(i + 1, j), r + 1)]);
	}
	return t;
}

// the Buchholz term of a raw term inside ψ_(q-1) (q = 0: the top level)
function read(q, t) {
	let out = [];
	t.forEach(([u, b], i) => {
		const y = read(u + 1, b);
		if (i || u != q || !q) return out.push([u, y]);
		const k = y.findIndex(([v]) => v <= q);
		out = y.length && k < 0 ? y : [...y.slice(0, k), [q, y]];
	});
	return out;
}

const toBOCF = t => t.map(([u, b]) => [BOCF.nat(u), toBOCF(b)]);

const values = new Map();

// the EBOCF term of a pair sequence [[a, b], ...]
function value(s) {
	const key = JSON.stringify(s);
	if (!values.has(key)) values.set(key, toBOCF(read(0, raw(s))));
	return values.get(key);
}

// for a sequence with a single root column (0,0): the term of the columns after it as the root's
// argument, before the bridge inside ψ₀ (so value(s) = ψ₀ of the bridged form of it); null otherwise
function argument(s) {
	const top = raw(s);
	return top.length == 1 ? toBOCF(top[0][1].map(([u, b]) => [u, read(u + 1, b)])) : null;
}

return {raw, read, value, argument};

})();
