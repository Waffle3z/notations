// Upgrading TBMS (UTBMS): TBMS (TBMS/core.js) where a BMS copy can grow. In copy c,
// a copied column that ascends in row 0 has its last run length raised when that length is a
// nonrecursive term whose level reaches the bad root's depth (at least its row-0 entry + 1): the level
// rises by c·Δ₀, or (c-1)·Δ₀ for the bad root's image when that comes from the cut column. Rows added
// this way stay children of the run's parent (value = parent's value + 1). This is BBMS's label shift
// in value form, with levels written as numbers. Terms are written as matrices.
// requires: TBMS/core.js

const UTBMS = (() => {
	const T = makeTBMS({onCopies: (out, copies, step) => upgrade(out, copies, step)});
	const {isNum, isZero, lt, cmpOrd, addOrd, subOrd, times, level, relevel, normCol, colHeight, pieces, colValues, parents} = T;

	function upgrade(out, copies, {r, P: P0, kd, val, asc, d}) {
		if (isZero(d[0])) return;
		const thr = addOrd(val[r][0], 1);
		const raise = (l, c) => isNum(l) || !lt(0, level(l)) || lt(level(l), thr) ? l : relevel(l, addOrd(level(l), times(d[0], c)));
		// parents in the unraised term, by row piece
		const {P} = pieces(out, []);
		const op = parents(out.map(col => colValues(col, P)));
		for (const {c, j, at} of copies) {
			if (!asc[j][0]) continue;
			const col = out[at], last = col.at(-1);
			if (!last) continue;
			// the bad root's image below row δ comes from the cut column, which is copy c - 1
			const mult = j == r && cmpOrd(colHeight(col), P0[kd]) <= 0 ? c - 1 : c;
			const l2 = raise(last[1], mult);
			if (cmpOrd(l2, last[1]) == 0) continue;
			const H = colHeight(col), H2 = addOrd(subOrd(last[1], H), l2); // the raised height
			// the last run's parent: the row piece just below H
			const k = Math.max(0, P.findIndex(p => cmpOrd(p, H) >= 0) - 1);
			const p = op[k][at];
			if (p < 0) continue;
			// rows [H, H2): the parent's values there, plus 1
			const ext = [];
			let x = H, h = 0;
			for (const [v, l] of out[p]) {
				const e = addOrd(h, l);
				if (lt(x, e) && lt(x, H2)) { const end = lt(e, H2) ? e : H2; ext.push([addOrd(v, 1), subOrd(x, end)]); x = end; }
				h = e;
			}
			if (lt(x, H2)) ext.push([1, subOrd(x, H2)]);
			out[at] = normCol([...col, ...ext]);
		}
	}

	return T;
})();

class notation {
	static title = "UTBMS";
	static header = "Upgrading TBMS";
	static parameters = [];

	static toString = m => UTBMS.show(m, {matrices: true});
	static fromString = s => UTBMS.parse(s);
	static isSuccessor = m => UTBMS.isSuccessor(m);
	static lessOrEqual = (a, b) => UTBMS.cmpMat(a, b) <= 0;
	static expand = (m, n) => UTBMS.expand(m, n);
	static expandLimit = n => UTBMS.limitTerm(n);
	static convertToNotation = value => UTBMS.parse(value).length == 0 ? "∅" : value;
}
