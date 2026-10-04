// T OCF: a strong 2-shifted Buchholz ψ_j over the collapsing regular T_(j+1) at every level, telescoped
// (ordinals/tocf.js). ψ_j(0) = T_j; ψ(T·(1+x)) = Ω_(1+x), ψ(T²) = I, ψ(T^T) = M, ψ(T^T^T) = K; every ψ_j is shifted the
// same way over T_(j+1): ψ_j(T_(j+1)) = Ω_(T_j+1), ψ_j(Ω_(T_j+1)) = ε_(T_j+1). The argument of ψ_j stays below
// Ω_(T_(j+1)+1), so the levels nest as ψ(ψ(ψ₁(ψ₁(ψ₂(ψ₂(…)))))), and that chain's sup is the limit.
// The untelescoped form, as in Buchholz's ψ, where ψ₀(Ω₂+β) is the telescoped ψ₀(ψ₁(Ω₂)+β). Here
// ψ_j(X+S+β), X the part of the argument of level at least j+2 and S its strong ψ_(j+1)-values, stands for the telescoped
// ψ_j(ψ_(j+1)(ψ_(j+1)(X)+S)+β): ψ(ψ(T₂)) = ψ(ψ(ψ₁(ψ₁(T₂)))), ψ(ψ(T₂+Ω_(T+1)·T)) = ψ(ψ(ψ₁(Ω_(T+1)·T))), and the chain
// is ψ(ψ(T_n)). The two forms are spellings of one notation: a ψ_j whose argument reaches Ω_(T_(j+1)+1) is untelescoped, any
// other is telescoped. Terms are kept telescoped; input may use either form (or both), and the display can show the
// telescoped form, the untelescoped form, or for each collapse the shorter of the two.
// requires: ordinals/tocf.js

const TOCFPage = (() => {
	const T = TOCF;
	// ψ(ψ(ψ₁(ψ₁(… ψ_n(ψ_n(T_(n+1))) …)))): ε₀, ψ(ψ(ε_(T+1))), ψ(ψ(ψ₁(ψ₁(ε_(T₂+1))))), ...
	function top(n) {
		let x = T.TT(n + 1);
		for (let j = n; j >= 0; j--) x = T.mkPsi(j, T.mkPsi(j, x));
		return x;
	}
	const SUB = "₀₁₂₃₄₅₆₇₈₉", sub = n => String(n).replace(/\d/g, d => SUB[d]);
	const NAMES = {p: "ψ", W: "Ω", w: "ω", L: "Λ", e0: "ε₀", E: "ε_{T+1}", E2: "ε_{T·2}", P1: "φ(T,1)",
		S1: "ψ₁(Ω_{T+1}^T·ε_{T·2})"};
	function word(w) {
		if (NAMES[w]) return NAMES[w];
		let m;
		if ((m = /^p(\d+)$/.exec(w))) return "ψ" + sub(m[1]);
		if ((m = /^T(\d+)$/.exec(w))) return "T" + sub(m[1]);
		if ((m = /^W(\d+)$/.exec(w))) return m[1] === "1" ? "Ω_{T+1}" : "Ω_{T" + sub(m[1]) + "+1}";
		return w;
	}
	// the ASCII spelling of the engine with ψ, Ω, ω, ·, subscripts and the named ordinals
	const pretty = s => s.replace(/[A-Za-z][A-Za-z0-9]*/g, word).replace(/\*/g, "·");

	const isFin = e => e.every(T.isOneM);
	// g with T_b·g = a (a made of T_b-monomials and atoms of level b), or null
	function divT(b, a) {
		if (!a.length || !a.every(q => q.k === "P" ? q.b === b : T.atomB(q) && q.j === b)) return null;
		const g = a.map(q => q.k === "P" ? T.mkPow(b, isFin(q.e) ? q.e.slice(1) : q.e, q.c) : q);
		return T.key(T.mul(T.TT(b), g)) === T.key(a) ? g : null;
	}
	// k with Ω_(T_j+1)·k = α (α made of strong ψ_j-values at the regular Ω_(T_j+1)), or null
	function divU(j, a) {
		const U = T.U(j), k = [];
		for (const q of a) {
			if (!T.strong(q) || q.j !== j) return null;
			const v = T.rview(q);
			if (v.atom || T.cmpM(v.R, U) !== 0) return null;
			const u1 = isFin(v.u) ? v.u.slice(1) : v.u;
			k.push(...T.mulR(U, u1, [v.p]));
		}
		return T.key(T.mul([U], k)) === T.key(a) ? k : null;
	}
	// a string with a top-level +, * or ^ (outside brackets) needs brackets as a subscript, exponent or factor
	function topOp(s, ops) {
		let depth = 0;
		for (const c of s) {
			if (c === "(" || c === "{") depth++;
			else if (c === ")" || c === "}") depth--;
			else if (!depth && ops.includes(c)) return true;
		}
		return false;
	}
	const sh = s => topOp(s, "+*^") ? "{" + s + "}" : s;                  // Ω_Ω_Ω, Ω_{ω^2}, ε_{T+1}
	const par = (s, ops) => topOp(s, ops) ? "(" + s + ")" : s;
	// the largest atom of level b at most the principal q (an ε-number above T_b, with T_b^a = a)
	const maxAtomB = (q, b) => q.k === "S" && q.j === b && T.atomB(q) ? q : q.k === "P" && q.b === b && q.e.length ? maxAtomB(q.e[0], b) : null;
	// T_b^e·c in base a, the largest atom at most T_b^e: e = a·x + r (r below a) gives a^x·T_b^r·c, as ε_(T+1)^2 for
	// T^(ε_(T+1)·2) and ε_(T+1)·T for T^(ε_(T+1)+1)
	function baseAtom(m, show) {
		const a = maxAtomB(m.e[0], m.b);
		if (!a) return null;
		let i = 0;
		while (i < m.e.length && T.cmpM(m.e[i], a) >= 0) i++;
		let x = [];
		for (const q of m.e.slice(0, i)) {                                    // q/a: q = a, or q = T_b^f·c with f ≥ a
			if (!T.cmpM(q, a)) x = T.add(x, T.ONE);
			else { const f = !T.cmpM(q.e[0], a) ? q.e.slice(1) : q.e; x = T.add(x, [T.mkPow(m.b, f.length ? f : T.ONE, q.c)].flatMap(p => f.length ? [p] : [q.c])); }
		}
		const r = m.e.slice(i), tb = m.b === 1 ? "T" : "T" + m.b;
		let s = par(show([a]), "+*^");
		if (!T.isOne(x)) s += "^" + par(show(x), "+*");
		if (r.length) s += "*" + (T.isOne(r) ? tb : tb + "^" + par(show(r), "+*"));
		if (!T.isOneM(m.c)) s += "*" + par(show([m.c]), "+");
		return s;
	}
	// a strong ψ_j-value in Cantor normal form to the base of its regular R: R^u·p (factors bracketed only for a sum)
	function baseRegular(m, show) {
		const v = T.rview(m);
		if (v.atom || (T.isOne(v.u) && T.isOneM(v.p))) return null;
		const R = v.R, Rt = R.a.length === 1 && R.a[0].k === "P" && R.a[0].b === R.j + 1 && T.isOne(R.a[0].e) && T.isOneM(R.a[0].c);
		let s = Rt ? (R.j ? "W" + R.j : "W") : par(show([R]), "+*^");
		if (!T.isOne(v.u)) s += "^" + par(show(v.u), "+*");
		if (!T.isOneM(v.p)) s += "*" + par(show([v.p]), "+");
		return s;
	}
	// the untelescoped argument of ψ_j(y), j = 0 or a strong ψ_j, as a list of principals. A = ψ_(j+1)(s+S), s = ψ_(j+1)(b)
	// strong, the largest such atom at most y's leading summand (inside T_(j+1)-exponents too: ε_(T+1)·T = T^(ε_(T+1)+1)),
	// gives X + S + β: X the part of b's untelescoped argument of level at least j+2 (S absorbs ψ_(j+1)(X) when b has a lower
	// part), and β = y without A when A leads y, y itself otherwise. Inverse: X+S+β ↦ ψ_(j+1)(ψ_(j+1)(X)+S)+β.
	const isAtomJ = (q, j) => q.k === "S" && q.j === j && T.atomB(q) && q.a.length && q.a[0].k === "S" && q.a[0].j === j && T.strong(q.a[0]);
	const maxAtom = (q, j) => isAtomJ(q, j) ? q : q.k === "P" && q.b === j && q.e.length ? maxAtom(q.e[0], j) : null;
	function untel(m) {
		const y = m.a, j = m.j, A = y.length && maxAtom(y[0], j + 1);
		if (!A) return y;
		const sa = untel(A.a[0]);
		let i = 0;
		while (i < sa.length && T.lev(sa[i]) >= j + 2) i++;
		return [...sa.slice(0, i), ...(i === sa.length ? A.a.slice(1) : A.a), ...(A === y[0] ? y.slice(1) : y)];
	}
	// the inverse: an untelescoped argument X + S + β of ψ_j (X of level ≥ j+2, S strong ψ_(j+1)-values) is telescoped
	// ψ_(j+1)(ψ_(j+1)(X) + S) + β
	const strongOf = (q, j) => q.k === "S" && q.j === j && T.strong(q);
	function tel(j, x) {
		let i = 0;
		while (i < x.length && T.lev(x[i]) >= j + 2) i++;
		if (!i) return x;
		let k = i;
		while (k < x.length && strongOf(x[k], j + 1)) k++;
		const s0 = T.mkPsi(j + 1, tel(j + 1, x.slice(0, i)));
		return T.add(T.mkPsi(j + 1, T.add(s0, x.slice(i, k))), x.slice(k));
	}
	// a term in either form (or mixed): every ψ_j whose argument reaches Ω_(T_(j+1)+1) is read untelescoped
	function normalize(t) {
		let out = [];
		for (const m of t) {
			let q;
			if (m.k === "P") q = T.mul(T.pow(T.TT(m.b), normalize(m.e)), normalize([m.c]));
			else { const a = normalize(m.a); q = T.mkPsi(m.j, T.cmp(a, [T.U(m.j + 1)]) >= 0 ? tel(m.j, a) : a); }
			out = T.add(out, q);
		}
		return out;
	}
	const parse = s => normalize(T.parse(s.replace(/φ\(T,1\)/g, "P1")));
	// the display options as a naming hook for the engine's show: a name only when its index is below the ordinal
	function hook(o) {
		const f = (m, show) => {
			if (o.form !== "tel" && m.k === "S" && (m.j === 0 || T.strong(m))) {
				const x = untel(m);
				if (x !== m.a) {
					const name = m.j ? "p" + m.j : "p", u = name + "(" + show(x) + ")";
					if (o.form === "untel") return u;
					const t = g(m, show) || name + "(" + show(m.a) + ")";          // the shorter spelling, telescoped on a tie
					return pretty(u).length < pretty(t).length ? u : t;
				}
			}
			return g(m, show);
		};
		const g = (m, show) => {
			if (o.om && m.k === "S" && (m.j === 0 || T.strong(m))) {         // ψ_j(T_(j+1)·x) = Ω_(T_j+x) (Ω_x at level 0)
				const g = divT(m.j + 1, m.a);
				const idx = g && (m.j ? T.add(T.TT(m.j), g) : g);
				if (idx && T.cmp(idx, [m]) < 0) {
					const n = idx.every(T.isOneM) ? idx.length : -1;
					return n === 1 ? "W" : n > 1 ? "Ω" + sub(n) : "Ω_" + sh(show(idx));
				}
				{                                                              // ψ_j(Q+T_(j+1)·g) = Ω_(X+g), X = ψ_j(Q) a level
					let i = m.a.length;
					while (i && m.a[i - 1].k === "P" && m.a[i - 1].b === m.j + 1 && T.isOne(m.a[i - 1].e)) i--;
					const Q = m.a.slice(0, i), g2 = i < m.a.length ? divT(m.j + 1, m.a.slice(i)) : null;
					if (Q.length && g2 && Q.every(q => T.lev(q) === m.j + 1)) {
						const idx = T.add(T.mkPsi(m.j, Q), g2);
						// not when g absorbs the level X (Ω_g would read as ψ_j(T_(j+1)·g))
						if (T.cmp(idx, [m]) < 0 && T.cmp(idx, g2) !== 0) return "Ω_" + sh(show(idx));
					}
				}
			}
			if (m.k === "P") return baseAtom(m, show);
			// ψ(a) = ω^a for a below Ω (ψ(2) = ω^2)
			if (m.j === 0 && m.a.length && !T.isOne(m.a) && T.cmp(m.a, [T.U(0)]) < 0) return "w^" + par(show(m.a), "+*");
			if (T.strong(m)) { const b = baseRegular(m, show); if (b) return b; }
			if (o.eps && T.atomB(m) && m.j >= 1) {                           // ψ_j(Ω_(T_j+1)·k) = ε_(T_j+k)
				const k = divU(m.j, m.a);
				if (k) {
					const idx = T.add(T.TT(m.j), k);
					if (T.cmp(idx, [m]) < 0) return "ε_" + sh(show(idx));
				}
			}
			return null;
		};
		f.noNames = !o.names;
		return f;
	}
	return {T, top, pretty, hook, parse, normalize};
})();

class notation {
	static title = "T OCF";
	static lessOrEqual(a, b) {
		return TOCFPage.T.cmp(a, b) <= 0;
	}

	static expandLimit(n) {
		return TOCFPage.top(n);
	}

	static expand(a, n) {
		const d = TOCFPage.T.domT(a);
		return d.t === "zero" ? a : d.t === "succ" ? TOCFPage.T.fsT(a) : TOCFPage.T.fsT(a, d.t === "reg" ? TOCFPage.T.num(n) : n);
	}

	static isSuccessor(a) {
		const d = TOCFPage.T.domT(a).t;
		return d === "zero" || d === "succ";
	}

	static toString(a) {
		return TOCFPage.T.show(a);
	}

	static fromString(s) {
		return TOCFPage.parse(s);
	}

	static om = true;
	static eps = true;
	static names = true;
	static form = "short";

	static parameters = [
		{type: "checkbox", id: "om", label: "Ω_x = ψ(T·x), Ω_{T+x} = ψ₁(T₂·x)"},
		{type: "checkbox", id: "eps", label: "ε_{T+x} = ψ₁(Ω_{T+1}·x)"},
		{type: "checkbox", id: "names", label: "Named ordinals (I, M, K, Λ, ε₀)"},
		{legend: "Arguments:", inputs: [
			{type: "radio", id: "form", value: "tel", label: "Telescoped: ψ(ψ(ψ₁(ψ₁(T₂)))), ψ(ε_{T·2})"},
			{type: "radio", id: "form", value: "untel", label: "Untelescoped: ψ(ψ(T₂)), ψ(T₂+Ω_{T+1}·T)"},
			{type: "radio", id: "form", value: "short", label: "Shorter of the two, per collapse"},
		]},
	]

	static convertToNotation(value) {
		const T = TOCFPage.T;
		return TOCFPage.pretty(T.show(T.parse(value), TOCFPage.hook({om: notation.om, eps: notation.eps, names: notation.names, form: notation.form})));
	}
};
