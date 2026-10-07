// Core of Transfinitary BMS (TBMS), shared by the TBMS explorer and its variants: terms, ordinal
// arithmetic on run lengths, comparison, expansion, parsing and the pure (matrix) form. Display names
// are not here; the TBMS explorer adds them (TBMS/notation.js).
//
// A column is a list of runs [value, length]: value >= 1, length an ordinal >= 1, adjacent values
// distinct, trailing zeros omitted, so (2,1^{ω+1}) is [[2,1],[1,ω+1]] and has height 1+ω+1 = ω+1.
// A run length written as an ordinal is in braces unless it is a single symbol: 1^ω, 1^{ω+1}; one
// written as a matrix is not: 1^(1)(2). On display a named entry with a transfinite run is in
// braces too: ({ω}^ω), unlike ((ω)^ω), whose entry is the matrix (ω), and 1^{ω^ω}. The parser also
// reads 1^ω+1 without braces.
// An ordinal is a natural number (a JS number) or an infinite TBMS matrix (an array of columns);
// run lengths are therefore TBMS terms themselves, smaller than the term they occur in.
//
// Rows are indexed by ordinals. The row-0 parent of a column is the last earlier column with a
// smaller row-0 entry; for α > 0 the row-α parent is the nearest column with a smaller row-α entry
// among the columns that are its ancestors in every row β < α. Cut the rows at every boundary of
// every run: inside one piece all entries are constant, and so is the parent relation (a row and the
// next one with the same entries choose the same parents). The expansion is therefore BMS on the
// finitely many pieces, each piece carrying its ordinal length:
// - last column (0): remove it;
// - last column of limit height (its last run has limit length λ): replace λ by λ[n];
// - last column of successor height δ+1: BMS expansion at row δ (bad root = row-δ parent,
//   ascension by the difference to the bad root in rows below δ, for entries whose ancestor in
//   that row is the bad root).
// Below (0)(1^ω) every column is finite and this is BMS.
//
// Nonrecursive TBMS: run lengths may be nonrecursive terms, whose first column is (1), (2), ...
// The level of a term is its row-0 entry in the first column (0 for recursive terms). For
// example (1) = Ω = ω₁^CK, (1)(1) = Ω·2, (1,1) = Ω², (1,1)(2,1)(3,1) = Ω^Ω, (1,1,1) = Ω₂.
// A term starts at every column without a row-0 parent.
// Diagonalizers: if the last nonzero entry (row δ) of a term's last column has no parent, and has
// value L, the term's FS α[ζ] is indexed by terms ζ of level L-1. One BMS copy of ζ replaces the
// last column: ζ's first column becomes that column without row δ, and entries attached to it
// rise by the difference below δ. So Ω[ξ] = ξ, (Ω·2)[ξ] = Ω+ξ, Ω²[(0)(1^X)] = (1)(2,1^X), and
// (2)[ζ] = ζ. A term of level below L whose last run has such a length λ collapses, as ψ_μ(α)
// with cof α = Ω_L in Buchholz's ψ: T[0] = T{λ := λ[s]} (s = 0, or the column (L-1)), and
// T[n+1] = T{λ := λ[ζ_n]} where ζ_n is T[n] from the last column's nearest row-0 ancestor of
// level <= L-1, raised to level L-1 (bocf.js climbs and shifts the same way; (2^X) is the level-2
// analogue of (1^X)). (0)(1^(1,1)) gives (0)(1^(1)(2,1^(1)(2,1^...))), (0)(1^(2)) gives
// (0)(1^(1^(1^...))), (0)(1^(2,2)) gives (0)(1^(2,1^(2,1^...))), (0)(1^(3)) gives
// (0)(1^(2^(2^...))); (0)(1^(2^(3))) has the same sequence and is not standard.
//
// Entries may be ordinals, written as matrices: ((0)(1)) is the column with entry ω, ((1)) the
// column with entry Ω. Ascension and re-levelling use ordinal arithmetic as bocf.js does,
// x -> root + d·c + (-root + x). An entry whose value L is a limit expands through L, as
// Ω_ω[n] = Ω_n and Ω_Ω[ξ] = Ω_ξ: (ω)[n] = (n), ((1))[ξ] = (ξ). The root runs (0)(1^(1)),
// (0)(1^((1))), (0)(1^(((1)))), ... towards (0)(1^((((...))))).
//
// Variants: option onCopies(out, copies, step) is called after a BMS step has written its copies, and
// may rewrite them in place. out is the new term; copies lists {c, j, at}: out[at] is copy c of
// column j; step is {r, P, kd, val, par, asc, d}: the bad root, the row pieces P, the piece kd of row
// δ, piece values and parents, which entries ascend, and the differences d to the bad root.
//
// Display names: show(m, {names}) asks names.whole(a, opts) for a whole run length or entry and
// names.term(t, opts) for each additive term; unnamed run lengths below ε₀ are written in Cantor
// normal form, others as matrices. {matrices: true} writes every length as a matrix.

function makeTBMS({onCopies} = {}) {
	const isNum = x => typeof x === "number";

	// ---------- ordinals ----------
	const norm = m => m.every(c => c.length == 0) ? m.length : m;
	const toMat = a => isNum(a) ? Array.from({length: a}, () => []) : a;

	function cmpOrd(a, b) {
		if (isNum(a) && isNum(b)) return Math.sign(a - b);
		if (isNum(a)) return -1;
		if (isNum(b)) return 1;
		return cmpMat(a, b);
	}

	// entries are ordinals too
	const lt = (a, b) => cmpOrd(a, b) < 0;
	const isZero = v => isNum(v) && v == 0;
	const times = (a, k) => { let r = 0; for (let j = 0; j < k; j++) r = addOrd(r, a); return r; };

	// additive terms: a new term starts at each column without a row-0 parent
	const row0 = c => c.length ? c[0][0] : 0;
	function terms(m) {
		const ts = [];
		let low = null;
		for (const c of m) {
			if (low === null || cmpOrd(row0(c), low) <= 0) { ts.push([c]); low = row0(c); }
			else ts.at(-1).push(c);
		}
		return ts;
	}

	function addOrd(a, b) {
		if (isNum(b)) return isNum(a) ? a + b : b == 0 ? a : a.concat(toMat(b));
		if (isNum(a)) return b;
		const ta = terms(a), tb = terms(b);
		while (ta.length && cmpMat(ta.at(-1), tb[0]) < 0) ta.pop();
		return ta.flat().concat(b);
	}

	// the c with a + c = b, for a <= b
	function subOrd(a, b) {
		if (isNum(b)) return b - a;
		if (isNum(a)) return b;
		const ta = terms(a), tb = terms(b);
		let i = 0;
		while (i < ta.length && i < tb.length && cmpMat(ta[i], tb[i]) == 0) i++;
		return norm(tb.slice(i).flat());
	}

	// level of a term: row 0 of its first column (0 recursive, 1 for (1)..., Ω for ((1))...)
	const level = a => isNum(a) ? 0 : row0(a[0]);
	// cofinality: "0", "s" (successor), "w" (FS indexed by n), or {L} for a successor level L >= 1:
	// FS α[ζ] indexed by terms ζ of level L-1 (L = 1: recursive ζ, as for Ω = (1); L = 2: (1...))
	// terms are never mutated after construction, so results are cached on the arrays
	const cofCache = new WeakMap(), cmpCache = new WeakMap();
	const isLevel = k => typeof k == "object";
	function cof(a) {
		if (isNum(a)) return a == 0 ? "0" : "s";
		if (!cofCache.has(a)) cofCache.set(a, cofRaw(a));
		return cofCache.get(a);
	}
	function cofRaw(a) {
		if (a.at(-1).length == 0) return "s";
		const sl = slot(a);
		if (sl.kind == "bms") return "w";
		if (sl.kind == "base") return {L: sl.x};
		if (sl.k == "w") return "w";
		return cmpOrd(sl.k.L, level(a)) <= 0 ? sl.k : "w";
	}
	// where a limit term's FS acts: the last run's length if that is a limit ("length"), else the
	// last entry: with a parent, BMS expansion ("bms"); parentless with a limit value ("entry");
	// parentless with a successor value L, a diagonalizer of level L ("base")
	function slot(a) {
		const C = a.at(-1), l = C.at(-1)[1];
		const kl = cof(l);
		if (kl == "w" || isLevel(kl)) return {kind: "length", x: l, k: kl};
		const {root, kd, val, L} = analyse(a);
		if (root >= 0) return {kind: "bms"};
		const x = val[L][kd], kx = cof(x);
		return kx == "s" ? {kind: "base", x} : {kind: "entry", x, k: kx};
	}
	function setSlot(a, sl, y) {
		const C = a.at(-1), [v, l] = C.at(-1);
		const runs = sl.kind == "length" ? [...C.slice(0, -1), [v, y]] : [...C.slice(0, -1), [v, predOrd(l)], [y, 1]];
		return a.slice(0, -1).concat([normCol(runs)]);
	}
	const predOrd = a => isNum(a) ? a - 1 : norm(a.slice(0, -1));

	// ---------- columns and matrices ----------
	function cmpCol(c, d) {
		let i = 0, j = 0, lc = c[0]?.[1], ld = d[0]?.[1];
		while (i < c.length && j < d.length) {
			const kv = cmpOrd(c[i][0], d[j][0]);
			if (kv) return kv;
			const k = cmpOrd(lc, ld);
			if (k <= 0) {
				if (k < 0) ld = subOrd(lc, ld); else ld = d[++j]?.[1];
				lc = c[++i]?.[1];
			} else {
				lc = subOrd(ld, lc);
				ld = d[++j]?.[1];
			}
		}
		return i < c.length ? 1 : j < d.length ? -1 : 0;
	}

	function cmpMat(a, b) {
		if (a === b) return 0;
		let m = cmpCache.get(a);
		if (!m) cmpCache.set(a, m = new WeakMap());
		if (!m.has(b)) m.set(b, cmpMatRaw(a, b));
		return m.get(b);
	}
	function cmpMatRaw(a, b) {
		for (let i = 0; i < a.length && i < b.length; i++) {
			const k = cmpCol(a[i], b[i]);
			if (k) return k;
		}
		return Math.sign(a.length - b.length);
	}

	// merge equal neighbours, drop empty runs and trailing zeros
	function normCol(runs) {
		const out = [];
		for (const [v, l] of runs) {
			if (cmpOrd(l, 0) == 0) continue;
			if (out.length && cmpOrd(out.at(-1)[0], v) == 0) out.at(-1)[1] = addOrd(out.at(-1)[1], l);
			else out.push([v, l]);
		}
		while (out.length && isZero(out.at(-1)[0])) out.pop();
		return out;
	}

	const colHeight = c => c.reduce((h, [, l]) => addOrd(h, l), 0);

	// ---------- expansion ----------
	function expand(m, n) {
		const C = m.at(-1);
		if (!C) return [];
		if (C.length == 0) return m.slice(0, -1);
		const sl = slot(m);
		if (sl.kind == "bms") return bmsStep(m, n);
		if (sl.kind == "base" || isLevel(sl.k) && cmpOrd(sl.k.L, level(m)) <= 0)
			throw new Error("FS indexed by ordinals, not n: " + show(m));
		if (sl.k == "w") return setSlot(m, sl, norm(expand(sl.x, n)));
		// collapse, as ψ_μ(α) with cof α = Ω_L in Buchholz's ψ: ζ ranges over level L-1 and the
		// next ζ is the term from the last column's nearest row-0 ancestor of level <= L-1
		// (the whole term for L = 1, (1^...) in (0)(1^(2))), raised to level L-1
		const L = sl.k.L, L1 = predOrd(L), j = levelAncestor(m, L1);
		let t = setSlot(m, sl, fsAt(sl.x, cmpOrd(L, 1) == 0 ? 0 : [[[L1, 1]]]));
		for (let i = 0; i < n; i++) t = setSlot(m, sl, fsAt(sl.x, relevel(t.slice(j), L1)));
		return t;
	}

	// raise a nested copy to level v, as bocf.js shifts the bad part: (1^X) at level 2 is (2^X)
	function relevel(y, v) {
		const r0 = row0(y[0]);
		if (cmpOrd(r0, v) == 0) return norm(y);
		const sh = subOrd(r0, v);
		const up = a => isZero(a) ? a : lt(a, r0) ? addOrd(a, sh) : addOrd(v, subOrd(r0, a));
		return norm(y.map(c => normCol(c.map(([a, l]) => [up(a), l]))));
	}

	// the last column or its nearest row-0 ancestor with row-0 entry <= v
	function levelAncestor(m, v) {
		let j = m.length - 1;
		while (j > 0 && lt(v, row0(m[j]))) {
			let i = j - 1;
			while (i > 0 && !lt(row0(m[i]), row0(m[j]))) i--;
			j = i;
		}
		return j;
	}

	// α[ζ] for α of cofinality level L and ζ of level L-1. At a diagonalizer entry (parentless,
	// successor value L): one BMS copy of ζ replaces the last column; ζ's first column (the bad
	// root) becomes that column without its last row, and the entries attached to it rise by the
	// same difference in the rows below. Otherwise the FS acts on the slot.
	function fsAt(m, zeta) {
		const sl = slot(m);
		if (sl.kind == "length" || sl.kind == "entry") return norm(setSlot(m, sl, fsAt(sl.x, zeta)));
		const C = m.at(-1), l = C.at(-1)[1];
		const L = m.length - 1, delta = predOrd(colHeight(C));
		const below = normCol([...C.slice(0, -1), [C.at(-1)[0], predOrd(l)]]); // C without row δ
		const X = toMat(zeta);
		if (X.length == 0) return norm(cmpOrd(delta, 0) == 0 ? m.slice(0, L) : m.slice(0, L).concat([below]));
		const {P, len} = pieces([C, ...X], [delta]);
		const kd = P.findIndex(p => cmpOrd(p, delta) == 0);
		const lift = colValues(below, P);
		const val = X.map(c => colValues(c, P));
		const par = parents(val);
		const out = X.map((col, j) => normCol(val[j].map((v, k) => {
			let i = j;
			while (i > 0) i = par[k][i];
			const rises = k < kd && i == 0 && (j == 0 || par[k][j] >= 0);
			return [rises ? addOrd(lift[k], subOrd(val[0][k], v)) : v, len[k]];
		})));
		return norm(m.slice(0, L).concat(out));
	}

	// pieces of the rows: P[k] <= row < P[k+1], with the length of each piece
	function pieces(m, extra) {
		const pts = [0, ...extra];
		for (const c of m) {
			let p = 0;
			for (const [, l] of c) pts.push(p = addOrd(p, l));
		}
		pts.sort(cmpOrd);
		const P = pts.filter((p, i) => i == 0 || cmpOrd(pts[i - 1], p) != 0);
		const len = P.slice(0, -1).map((p, k) => subOrd(p, P[k + 1]));
		return {P, len};
	}

	function colValues(c, P) {
		const vals = [];
		let r = 0, end = c[0]?.[1];
		for (let k = 0; k < P.length - 1; k++) {
			while (r < c.length && cmpOrd(P[k], end) >= 0) end = addOrd(end, c[++r]?.[1] ?? 0);
			vals.push(r < c.length ? c[r][0] : 0);
		}
		return vals;
	}

	// row-piece parents: par[k][j], -1 if none
	function parents(val) {
		const N = val.length, R = val[0]?.length ?? 0, par = [];
		for (let k = 0; k < R; k++) {
			par[k] = [];
			for (let j = 0; j < N; j++) {
				let p = -1;
				if (!isZero(val[j][k])) {
					if (k == 0) {
						for (let i = j - 1; i >= 0; i--) if (lt(val[i][0], val[j][0])) { p = i; break; }
					} else {
						for (let i = par[k - 1][j]; i >= 0; i = par[k - 1][i]) if (lt(val[i][k], val[j][k])) { p = i; break; }
					}
				}
				par[k][j] = p;
			}
		}
		return par;
	}

	function analyse(m) {
		const L = m.length - 1, C = m[L];
		const delta = predOrd(colHeight(C)); // the last nonzero row
		const {P, len} = pieces(m, [delta]);
		const kd = P.findIndex(p => cmpOrd(p, delta) == 0);
		const val = m.map(c => colValues(c, P));
		const par = parents(val);
		return {L, P, len, kd, val, par, root: par[kd][L]};
	}

	function bmsStep(m, n) {
		const {L, P, len, kd, val, par, root: r} = analyse(m);
		if (r < 0) throw new Error("no bad root: " + show(m));
		if (n == 0) return m.slice(0, r);
		const d = val[L].map((v, k) => k < kd ? subOrd(val[r][k], v) : 0);
		const asc = [];
		for (let j = r; j < L; j++) asc[j] = d.map((_, k) => {
			if (j == r) return true;
			let i = par[k][j];
			while (i > r) i = par[k][i];
			return i == r;
		});
		const out = m.slice(0, L), copies = [];
		for (let c = 1; c < n; c++)
			for (let j = r; j < L; j++) {
				out.push(normCol(val[j].map((v, k) => [asc[j][k] && !isZero(d[k])
					? addOrd(addOrd(val[r][k], times(d[k], c)), subOrd(val[r][k], v)) : v, len[k]])));
				copies.push({c, j, at: out.length - 1});
			}
		if (onCopies) onCopies(out, copies, {r, P, kd, val, par, asc, d});
		return out;
	}

	const isSuccessor = m => m.length == 0 || m.at(-1).length == 0;

	// ---------- printing ----------
	// The pure form writes run lengths below ε₀ in Cantor normal form (1^{ω+1}) and everything else as
	// matrices; opts.names adds display names (see the header), opts.matrices writes only matrices.
	const rowZeroOnly = m => m.every(c => c.length == 0 || (c.length == 1 && c[0][1] === 1 && isNum(c[0][0])));
	// the name of one additive term, or null
	function termName(t, opts) {
		const n = opts.names?.term(t, opts);
		if (n != null) return n;
		// the pure form: Cantor normal form below ε₀
		if (row0(t[0]) != 0 || !rowZeroOnly(t)) return null;
		const e = norm(t.slice(1).map(c => c[0][0] == 1 ? [] : [[c[0][0] - 1, 1]]));
		if (isNum(e) && e <= 1) return e == 0 ? "1" : "ω";
		const en = ordName(e, opts);
		return en.startsWith("(") ? null : "ω^" + paren(en);
	}

	// names for an ordinal, term by term; an unnamed additive term is written as its matrix.
	// {s, matrix}: matrix if nothing was named (then s is exactly the matrix)
	function ordInfo(a, opts = {}) {
		if (isNum(a)) return {s: String(a), matrix: false};
		if (opts.matrices) return {s: show(a, opts), matrix: true};
		const wn = opts.names?.whole(a, opts);
		if (wn != null) return {s: wn, matrix: false};
		const parts = [];
		let named = false;
		for (const t of terms(a)) {
			let s = termName(t, opts);
			if (s == null) s = show(t, opts); else named = true;
			if (parts.length && parts.at(-1).s == s) parts.at(-1).k++;
			else parts.push({s, k: 1});
		}
		if (!named) return {s: parts.map(({s, k}) => s.repeat(k)).join(""), matrix: true};
		return {s: parts.map(({s, k}) => k == 1 ? s : s == "1" ? String(k) : s == "ω" ? "ω" + k : s + "·" + k)
			.reduce((acc, p) => {
				if (/^\d+$/.test(p) && /^\d+$/.test(acc.at(-1) ?? "")) acc[acc.length - 1] = String(+acc.at(-1) + +p);
				else acc.push(p);
				return acc;
			}, []).join("+"), matrix: false};
	}
	const ordName = (a, opts) => ordInfo(a, opts).s;
	const paren = s => /[+·]|^ω\d|^\(/.test(s) ? "(" + s + ")" : s;

	function showCol(c, opts = {}) {
		if (c.length == 0) return "(0)";
		const parts = [];
		for (const [v, l] of c) {
			// entries are matrices (parsable); on display a named entry is written in braces when it has a
			// transfinite run, {ω}^ω, or its name would read as runs or several entries ({ω^2}, {φ(1,0)})
			const info = isNum(v) || !opts.names ? null : ordInfo(v, opts);
			const vs = isNum(v) ? String(v) : !info || info.matrix ? (info ? info.s : show(v, opts))
				: !isNum(l) || /[,^]/.test(info.s) ? "{" + info.s + "}" : info.s;
			if (isNum(l)) for (let i = 0; i < l; i++) parts.push(vs);
			else {
				const li = ordInfo(l, opts);
				parts.push(vs + "^" + (li.matrix ? li.s : brace(li.s)));
			}
		}
		return "(" + parts.join(",") + ")";
	}
	// a run length written as an ordinal is in braces unless it is a single symbol: 1^ω, 1^{ω+1},
	// 1^{Ω·ω}; a matrix delimits itself: 1^(1)(2)
	const brace = s => /^(\d+|[ωΩ]|ε[₀-₉]+)$/.test(s) ? s : "{" + s + "}";
	const show = (m, opts) => m.map(c => showCol(c, opts)).join("");

	// ---------- parsing ----------
	function parse(s) {
		let i = 0;
		const ws = () => { while (/\s/.test(s[i] ?? "")) i++; };
		const err = msg => { throw new Error(`${msg} at ${i} in ${s}`); };
		const expect = ch => { ws(); if (s[i] != ch) err(`expected ${ch}`); i++; };
		const int = () => {
			ws();
			const m = /^\d+/.exec(s.slice(i));
			if (!m) err("expected a number");
			i += m[0].length;
			return +m[0];
		};
		function matrix() {
			const cols = [];
			ws();
			while (s[i] == "(") { cols.push(column()); ws(); }
			return cols;
		}
		function column() {
			expect("(");
			const runs = [];
			for (;;) {
				ws();
				let v;
				if (s[i] == "{") { i++; ws(); v = s[i] == "(" ? norm(matrix()) : sum(); expect("}"); }
				else v = s[i] == "(" ? norm(matrix()) : int();
				ws();
				let l = 1;
				if (s[i] == "^") {
					i++; ws();
					const braced = s[i] == "{";
					if (braced) { i++; ws(); }
					l = s[i] == "(" ? norm(matrix()) : sum();
					if (braced) expect("}");
				}
				runs.push([v, l]);
				ws();
				if (s[i] == ",") { i++; continue; }
				expect(")");
				return normCol(runs);
			}
		}
		// Cantor normal form names below ε₀ and ε₀ itself: 3, ω, ω+1, ω2, ω·2, ω^2·3, ω^(ω+1), ε₀
		function sum() {
			let a = term();
			for (ws(); s[i] == "+"; ws()) { i++; a = addOrd(a, term()); }
			return a;
		}
		function coef() {
			ws();
			if (/[·⋅*]/.test(s[i] ?? "")) { i++; return int(); }
			return /\d/.test(s[i] ?? "") ? int() : 1;
		}
		function term() {
			ws();
			if (/\d/.test(s[i])) return int();
			if (s.startsWith("ε₀", i) || s.startsWith("ε_0", i)) {
				i += s.startsWith("ε₀", i) ? 2 : 3;
				return times(EPS0, coef());
			}
			return times(omegaPow(), coef());
		}
		function omegaPow() {
			ws();
			if (s[i] != "ω" && s[i] != "w") err("expected ω");
			i++;
			ws();
			if (s[i] != "^") return OMEGA;
			i++;
			return omegaTo(atom());
		}
		function atom() {
			ws();
			if (/\d/.test(s[i])) return int();
			if (s[i] == "(") { i++; const a = sum(); expect(")"); return a; }
			return omegaPow();
		}
		const m = matrix();
		ws();
		if (i < s.length) err("unexpected character");
		return m;
	}

	// ω^a for a below ε₀ (a row-0 matrix)
	function omegaTo(a) {
		const m = toMat(a);
		if (!m.every(c => c.length == 0 || (c.length == 1 && c[0][1] === 1))) throw new Error("ω^a needs a < ε₀");
		return norm([[], ...m.map(c => [[(c[0]?.[0] ?? 0) + 1, 1]])]);
	}
	const OMEGA = [[], [[1, 1]]];
	const EPS0 = [[], [[1, 2]]];

	// the explorer's root: (0)(1^(1)), (0)(1^((1))), (0)(1^(((1)))), ... -> (0)(1^((((...)))))
	function limitTerm(n) {
		let e = 1;
		for (let i = 0; i <= n; i++) e = [[[e, 1]]];
		return [[], [[1, e]]];
	}

	return {isNum, isZero, norm, toMat, row0, lt, cmpOrd, addOrd, subOrd, predOrd, times, terms, level, cof, slot,
		cmpCol, cmpMat, normCol, colHeight, pieces, colValues, parents, analyse, expand, bmsStep, fsAt, relevel,
		levelAncestor, isSuccessor, ordInfo, ordName, showCol, show, brace, parse, limitTerm};
}
