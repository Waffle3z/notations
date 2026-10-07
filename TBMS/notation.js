// Transfinitary BMS (TBMS): BMS whose columns are transfinite sequences. The terms, expansion and pure
// form are in TBMS/core.js; this file adds the explorer's display names.
//
// Display: names are applied after, from ordinal values; the pure form is matrices. Recursive terms
// below lim(PSS) are named through the PSS map (ordinals/pss.js), nonrecursive terms of level 1
// through X = Ω·r (omegaValue), both written in the shared ordinal syntax (ordinals/syntax.js); and
// three limits are named.
// requires: TBMS/core.js ordinals/bocf.js ordinals/veblen.js ordinals/pss.js ordinals/syntax.js

const TBMS = (() => {
	const C = makeTBMS();
	const {isNum, isZero, norm, row0, cmpOrd, subOrd, terms, cmpMat, normCol, pieces, colValues, parents} = C;

	// terms below lim(PSS): the pair sequence of a recursive term of finite height <= 2, else null
	function pssPairs(m) {
		if (isNum(m) || m.length && m[0].length) return null;
		const out = [];
		for (const c of m) {
			const col = [];
			for (const [v, l] of c) {
				if (!isNum(v) || !isNum(l) || col.length + l > 2) return null;
				for (let i = 0; i < l; i++) col.push(v);
			}
			out.push([col[0] ?? 0, col[1] ?? 0]);
		}
		return out;
	}
	const libraries = () => typeof BOCF != "undefined" && typeof PSSMap != "undefined";
	// names use ψ only in the Buchholz setting (OrdinalSyntax strict): elsewhere such a name is not given

	// opts: {display, syntax ("psi", "named", "veblen"), cnf}
	function pssName(m, opts) {
		if (!opts.display || !libraries()) return null;
		const pairs = pssPairs(m);
		return pairs ? OrdinalSyntax.show(PSSMap.value(pairs), opts, {strict: true}) : null;
	}

	// A nonrecursive term X of level 1 with at most two rows has value Ω·r, where r is the term of
	// X's columns as the argument of the (0) in (0)X, before the PSS map's bridge inside ψ₀ (which
	// writes a leading ψ₁(y) as y or P+ψ₁(y)), multiplied by Ω (BOCF.mulOmega). So
	// (1)(2)(2) = Ω·ω², (1,1)(2,1) = Ω·ψ₁(Ω) = Ω³, (1,1)(2,2) = ψ₁(Ω₂) = ε_(Ω+1), (1,1)(2,2)(2,2) =
	// ψ₁(Ω₂·2) = ε_(Ω+2), (1,1)(2,2)(2) = ψ₁(Ω₂+1) = ε_(Ω+1)·ω. (It does not continue to three rows:
	// (0)(1,1,1) = ψ₀(Ω_ω), while (1,1,1) = Ω₂.)
	function omegaValue(t) {
		if (!libraries() || isNum(t) || !isNum(row0(t[0])) || row0(t[0]) != 1) return null;
		const pairs = pssPairs([[], ...t]);
		const r = pairs && PSSMap.argument(pairs);
		return r && BOCF.mulOmega(r, BOCF.ONE);
	}
	function omegaName(t, opts) {
		return opts.display ? OrdinalSyntax.strict(omegaNameRaw(t, opts), opts) : null;
	}
	function omegaNameRaw(t, opts) {
		const show1 = x => OrdinalSyntax.show(x, opts, {relative: true});
		const x = omegaValue(t);
		if (x) return show1(x);
		// wider: put a two-row stand-in ψ₀(Ω_(7+i)) for each countable epsilon block, then its name
		const sub = epsilonBlocks(t, opts);
		const y = sub && omegaValue(sub.t);
		if (!y) return null;
		let str = show1(y);
		sub.names.forEach((nm, i) => {
			str = str.split("ψ(Ω" + BOCF.subscriptDigits(7 + i) + ")").join(BOCF.wrap(nm, "+·^"));
		});
		return /Ω[₇-₉]|Ω₁[0-9]/.test(str) ? null : str;
	}

	// Countable blocks of a level-1 term: a column (c) of height 1 with c >= 2, or the root (1),
	// followed by the
	// columns above it in row 0 whose entries above row 0 all hang inside the block. Such a block is
	// the countable α = (0)(the rest lowered by c); when α is an epsilon number it can stand in any
	// position like ε₀, so (1,1)(2,2)(2)(3,1^x) reads as ε_(Ω+1)·α with α = (0)(1^(1+x)).
	function epsilonBlocks(t, opts) {
		const {P} = pieces(t, [1]);
		const val = t.map(c => colValues(c, P)), par = parents(val);
		// first pass: the epsilon blocks [j, k) and their α; stand-ins are ordered like the α's
		const blocks = [];
		let j = 0;
		while (j < t.length) {
			const c = row0(t[j]);
			if (blocks.length < 3 && t[j].length == 1 && t[j][0][1] === 1 && isNum(c) && (j == 0 ? c == 1 : c >= 2)) {
				let k = j + 1;
				while (k < t.length && isNum(row0(t[k])) && row0(t[k]) > c) k++;
				let inside = k > j + 1;
				for (let i = j + 1; i < k && inside; i++)
					for (let q = 1; q < P.length - 1; q++) if (!isZero(val[i][q]) && par[q][i] < j) inside = false;
				if (inside) {
					const a = norm([[], ...t.slice(j + 1, k).map(col => lowerRow0By(col, c))]);
					const f = factorInfo(a, opts);
					if (f.eps && !pssPairs(a)) {
						blocks.push({j, k, c, a, name: f.s});
						j = k;
						continue;
					}
				}
			}
			j++;
		}
		if (!blocks.length) return null;
		const alphas = [];
		for (const b of blocks) if (!alphas.some(a => cmpMat(a, b.a) == 0)) alphas.push(b.a);
		alphas.sort(cmpMat);
		const names = alphas.map(a => blocks.find(b => cmpMat(b.a, a) == 0).name);
		const out = [];
		let i = 0;
		for (const b of blocks) {
			out.push(...t.slice(i, b.j));
			const m = 7 + alphas.findIndex(a => cmpMat(a, b.a) == 0);
			out.push([[b.c, 1]]);
			for (let r = 1; r <= m; r++) out.push(normCol([[b.c + r, 1], [r, 1]]));
			i = b.k;
		}
		out.push(...t.slice(i));
		return {t: out, names};
	}
	function lowerRow0By(c, d) {
		const [[v, l], ...rest] = c;
		return normCol([[v - d, 1], [v, subOrd(1, l)], ...rest]);
	}

	// for a recursive term a = (0)D: when no entry of D above row 0 hangs from the root, a = ω^β with
	// β = D with row 0 lowered by 1 (as in Cantor normal form, (0)(1) = ω^1), and a may be
	// non-standard: (0)(1)(2,1^x) = ω^((0)(1^(1+x))). {s, eps}: the name (ω^β, or β when it is an
	// epsilon number), and whether the value is an epsilon number.
	function factorInfo(a, opts) {
		if (isNum(a)) return {s: String(a), eps: false};
		if (a.length < 2 || hangsFromRoot(a)) return {s: ordInfo(a, opts).s, eps: isEpsilon(a)};
		const b = norm(a.slice(1).map(c => lowerRow0By(c, 1)));
		if (isNum(b) && b == 1) return {s: "ω", eps: false};
		const bi = factorInfo(b, opts);
		return bi.eps ? bi : {s: "ω^" + (/^ω\d/.test(bi.s) ? "(" + bi.s + ")" : BOCF.wrap(bi.s)), eps: false};
	}
	// some entry of a's columns above row 0 has the first column as its parent
	function hangsFromRoot(a) {
		const {P} = pieces(a, [1]);
		const val = a.map(c => colValues(c, P)), par = parents(val);
		for (let k = 1; k < P.length - 1; k++)
			for (let j = 1; j < a.length; j++) if (par[k][j] == 0) return true;
		return false;
	}
	// a standard single-term β = (0)E is an epsilon number when every row-0 child of the root also
	// hangs from it in row 1: (0)(1,1^x), (0)(1,1)(2), (0)(1,1)(1,1), but not (0)(1,1)(1) = ε₀·ω
	function isEpsilon(b) {
		if (isNum(b) || b.length < 2 || terms(b).length != 1) return false;
		const {P} = pieces(b, [1, 2]);
		const k1 = P.findIndex(p => cmpOrd(p, 1) == 0);
		const val = b.map(c => colValues(c, P)), par = parents(val);
		for (let j = 1; j < b.length; j++) if (par[0][j] == 0 && par[k1][j] != 0) return false;
		return true;
	}

	// display names of limits beyond lim(PSS): [term, name, name with Buchholz ψ]
	const LIMITS = [[[[], [[1, 3]]], "lim(PSS)", "ψ₀(Ω_ω)"], [[[], [[1, 4]]], "lim(TSS)"],
		[[[], [[1, [[], [[1, 1]]]]]], "lim(BMS)"]];
	function limitName(t, opts) {
		for (const [u, name, psi] of LIMITS) if (cmpMat(t, u) == 0) return opts.syntax == "psi" && psi || name;
		return null;
	}

	// the core asks these for names when opts.display is set
	const NAMES = {whole: pssName, term: (t, opts) => pssName(t, opts) ?? omegaName(t, opts) ?? limitName(t, opts)};
	const named = (opts = {}) => opts.display && !opts.names ? {...opts, names: NAMES} : opts;
	const ordInfo = (a, opts) => C.ordInfo(a, named(opts));

	return {...C, ordInfo, ordName: (a, opts) => ordInfo(a, opts).s, showCol: (c, opts) => C.showCol(c, named(opts)),
		show: (m, opts) => C.show(m, named(opts)), pssPairs, pssName, omegaValue, omegaName, factorInfo};
})();

class notation {
	static title = "TBMS";
	static header = "Transfinitary BMS";
	static syntax = "veblen";
	static cnf = true;
	static matrices = false;
	static showOrdinal = true;

	static parameters = [
		...OrdinalSyntax.parameters({visibleIf: () => !notation.matrices || notation.showOrdinal}),
		{type: "checkbox", id: "matrices", label: "Write run lengths as matrices"},
		{type: "checkbox", id: "showOrdinal", label: "Show ordinal"},
	];

	static displayOpts = () => ({display: true, matrices: notation.matrices, syntax: notation.syntax, cnf: notation.cnf});

	// the stored value is all matrices, which always parse back; names are only for display
	static toString = m => TBMS.show(m, {matrices: true});
	static fromString = s => TBMS.parse(s);
	static isSuccessor = m => TBMS.isSuccessor(m);
	static lessOrEqual = (a, b) => TBMS.cmpMat(a, b) <= 0;
	static expand = (m, n) => TBMS.expand(m, n);
	static expandLimit = n => TBMS.limitTerm(n);

	static convertToNotation(value) {
		const m = TBMS.parse(value);
		if (m.length == 0) return "∅";
		const opts = notation.displayOpts();
		let str = TBMS.show(m, opts);
		if (notation.showOrdinal) {
			const named = TBMS.pssName(m, opts);
			if (named) str += " = " + named;
		}
		return str;
	}
}
