// Vulcaniz (vz): a translation of the definition by vopenka_cardinal, https://github.com/nyxneptune/vz-rs
// (public domain). A term is a sequence of columns, written like "0 1 21 3" with one base-36 digit per
// entry, and the limit is sup of 0 1 21 321 4321 ... (the diagonals).
//
// Sequence form: column i's entries e_0, e_1, ... name its parents, p_0 = the last earlier column whose
// first entry is below e_0, and p_(k+1) = the last column before p_k whose first entry is below e_(k+1);
// its value is 1 plus the values of its parents. So 0 1 21 3 = 1,2,4,5 (lim BMS) and 0 1 21 321 = 1,2,4,8.

const VZ = (() => {

// ---------------------------------------------------------------- basics
// lexicographic order on numbers and nested lists, a proper prefix being smaller
function cmp(a, b) {
	if (!Array.isArray(a)) return a - b;
	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		const c = cmp(a[i], b[i]);
		if (c) return c;
	}
	return a.length - b.length;
}

const eq = (a, b) => !cmp(a, b);
const clone = x => Array.isArray(x) ? x.map(clone) : x;
const range = (a, b) => Array.from({length: Math.max(0, b - a)}, (_, i) => a + i);

function sub(a, b) {
	if (a < b) throw new Error("negative difference");
	return a - b;
}

const diagonal = n => n ? range(1, n + 1).reverse() : [0];
const limit = n => range(0, n).map(diagonal);
const copyN = (v, i) => range(0, i).flatMap(() => clone(v));

// ---------------------------------------------------------------- root finding
function ancestors(parents, i) {
	const out = [];
	for (let j = i; parents[j] != null;) out.push(j = parents[j]);
	return out;
}

const refine = (parents, values) => values.map((_, i) => ancestors(parents, i).find(p => values[p] < values[i]) ?? null);

const parentsOf = values => values.map((_, i) => range(0, i).reverse().find(p => values[p] < values[i]) ?? null);

const descendsFrom = (parents, root, i) => i == root || ancestors(parents, i).includes(root);

function terminalAnchor(m) {
	for (let i = m.length - 2; i >= 0; i--) if (m[i].length == 1 && cmp(m[i], m.at(-1)) < 0) return i;
	return null;
}

function borrowed(m, i) {
	const cut = terminalAnchor(m), s = source(m, i), fs = scalarFields(s);
	return fs.length > 0 && fs.every(f => eq(f.index, [[0]])) && i + s.columns.length == cut && eq(m[cut], [head(s) + 2]);
}

function entry(m, i, depth) {
	if (!depth) return m[i][0];
	const cut = terminalAnchor(m);
	if (i == cut) return m[cut + depth][1];
	const fs = scalarFields(source(m, i));
	return borrowed(m, i) && depth > fs.length ? fs.at(-1).payload[0] : value(fs, finite(depth - 1));
}

function strongParent(m, i, depth) {
	const cut = terminalAnchor(m);
	const candidates = !depth ? range(0, cut + 1).filter(j => m[j].length == 1).reverse() : lineage(m, i, depth - 1);
	for (const p of candidates) if (p < i && entry(m, p, depth) < entry(m, i, depth)) return p;
	return null;
}

function lineage(m, i, depth) {
	const out = [];
	for (let j = strongParent(m, i, depth); j != null; j = strongParent(m, j, depth)) out.push(j);
	return out;
}

// ---------------------------------------------------------------- blocks
const block = (start, columns) => ({start, columns});
const head = b => b.columns[0][0];

function blocks(m) {
	const out = [];
	let start = 0;
	for (let i = 0; i < m.length; i++) {
		if (i == start) {
			if (m[i].length > 1) {
				out.push(block(i, [m[i]]));
				start = i + 1;
			}
			continue;
		}
		const h = m[start][0];
		if (m[i].length == 1 && (m[i][0] <= h + 1 || m[i - 1].length >= 3) || m[i].length > 1 && m[i][0] <= h) {
			out.push(block(start, m.slice(start, i)));
			start = i;
			if (m[i].length > 1) {
				out.push(block(i, [m[i]]));
				start = i + 1;
			}
		}
	}
	if (start < m.length) out.push(block(start, m.slice(start)));
	return out;
}

function shift(m, top, lower) {
	return m.map(c => {
		const cp = [...c];
		cp[0] += top;
		if (cp.length > 1) cp[1] += lower;
		return cp;
	});
}

function boundary(m, b, n) {
	if (b.length < 2) return null;
	const parent = b.at(-2), terminal = b.at(-1);
	if (head(terminal) != head(parent) + 1 || !eq(terminal.columns.at(-1), [head(terminal) + 1, 1]) || parent.columns[0].length != 1) return null;
	const f = fields(terminal).slice(0, -1), earlier = fields(parent);
	if (!f.length || ![...f, ...earlier].every(x => x.payload.length > 1 ? x.payload[0] >= 1 : eq(x.payload, [1])) ||
		!f.some(x => x.payload.length > 1 || x.rooted)) return null;
	const seed = terminal.columns.slice(0, -1), result = m.slice(0, parent.start);
	let blk, copies;
	if (parent.columns.length == 1) {
		if (n > 0) result.push(...parent.columns);
		blk = seed;
		copies = n > 0 ? n - 1 : 0;
	} else {
		blk = [...parent.columns, ...seed];
		copies = n;
	}
	for (let k = 0; k < copies; k++) result.push(...shift(blk, k, k));
	return result;
}

const source = (m, i) => blocks(m.slice(i, terminalAnchor(m)))[0];

// ---------------------------------------------------------------- fields
// a field is {payload, index, rooted, columns}; a position is a list of [principal, count]
const makeField = (payload, index, rooted, columns) => ({payload, index, rooted, columns});

function fields(b) {
	if (b.columns[0].length != 1) throw new Error("a structured block root has no scalar profile");
	const out = [];
	for (const c of b.columns.slice(1)) {
		if (c[0] <= head(b)) throw new Error("profile column is below its anchor");
		const cp = [...c];
		cp[0] -= head(b);
		if (c.length > 1) out.push(makeField(cp.slice(1), limit(cp[0]), cp[0] > 1, [cp]));
		else if (out.length) {
			const old = out.at(-1);
			out[out.length - 1] = makeField(old.payload, [...old.index, [cp[0] - 1]], old.rooted, [...old.columns, cp]);
		} else throw new Error("bare repetition marker has no seed");
	}
	return out;
}

function add(left, right) {
	const terms = [...left];
	for (const [principal, count] of right) {
		while (terms.length && cmp(terms.at(-1)[0], principal) < 0) terms.pop();
		const c = terms.length && eq(terms.at(-1)[0], principal) ? count + terms.pop()[1] : count;
		terms.push([principal, c]);
	}
	return terms;
}

function length(index) {
	let result = [], component = [];
	for (const c of index) {
		if (eq(c, [0]) && component.length) {
			result = add(result, [[component, 1]]);
			component = [];
		}
		if (!eq(c, [0]) && !component.length) throw new Error("a constant field's index must begin with zero");
		component.push(c);
	}
	return component.length ? add(result, [[component, 1]]) : result;
}

function field(v, len) {
	if (!v) throw new Error("the computed profile needs an interior zero");
	const index = len.flatMap(([name, count]) => copyN(name, count));
	const columns = index.map(c => {
		if (eq(c, [0])) return [1, v];
		if (c.length == 1) return [c[0] + 1];
		if (eq(c, diagonal(c[0]))) return [c[0] + 1, v];
		throw new Error("no raw spelling specified for this cut remainder");
	});
	return makeField([v], index, false, columns);
}

function scalarFields(b) {
	const result = [];
	for (const f of fields(b)) {
		if (f.payload.length != 1) throw new Error("this cut enters a structured payload");
		if (f.rooted && result.length && eq(result.at(-1).index, [[0]])) result[result.length - 1] = field(result.at(-1).payload[0], length(f.index));
		result.push(f);
	}
	return result;
}

function intervals(fs) {
	const out = [];
	let start = [];
	for (const f of fs) {
		const end = add(start, length(f.index));
		out.push([start, end, f.payload[0]]);
		start = end;
	}
	return out;
}

const finite = n => n ? [[[[0]], n]] : [];

function predecessor(position) {
	if (!position.length || !eq(position.at(-1)[0], [[0]])) throw new Error("the selected profile has no last scalar position");
	return [...position.slice(0, -1), ...finite(position.at(-1)[1] - 1)];
}

function after(total, prefix) {
	if (cmp(prefix, total) > 0) throw new Error("cut lies beyond the constant field");
	const left = [...prefix], right = [...total];
	while (left.length && right.length && eq(left[0], right[0])) {
		left.shift();
		right.shift();
	}
	if (left.length && right.length && eq(left[0][0], right[0][0])) right[0] = [right[0][0], sub(right[0][1], left[0][1])];
	return right;
}

function split(fs, position) {
	let start = [];
	const prefix = [];
	for (let i = 0; i < fs.length; i++) {
		if (cmp(position, start) <= 0) return [prefix, fs.slice(i)];
		const end = add(start, length(fs[i].index));
		prefix.push([start, cmp(position, end) < 0 ? position : end, fs[i].payload[0]]);
		if (cmp(position, end) < 0) return [prefix, [field(fs[i].payload[0], after(end, position)), ...fs.slice(i + 1)]];
		start = end;
	}
	if (cmp(start, position) < 0) prefix.push([start, position, 0]);
	return [prefix, []];
}

function value(fs, position) {
	const hit = intervals(fs).find(([a, b]) => cmp(a, position) <= 0 && cmp(position, b) < 0);
	return hit ? hit[2] : 0;
}

const emit = fs => fs.flatMap(f => f.columns);

function emitIntervals(list) {
	const merged = [];
	for (const [a, b, v] of list) {
		const last = merged.at(-1);
		if (last && eq(last[1], a) && last[2] == v) merged[merged.length - 1] = [last[0], b, v];
		else merged.push([a, b, v]);
	}
	while (merged.length && merged.at(-1)[2] == 0) merged.pop();
	return emit(merged.filter(([a, b]) => cmp(a, b) < 0).map(([a, b, v]) => field(v, after(b, a))));
}

// ---------------------------------------------------------------- expansion rules
function scalarCut(m, b, n) {
	const fs = b.map(scalarFields);
	const cut = predecessor(intervals(fs.at(-1)).at(-1)[1]);
	const initial = parentsOf(b.map(head));
	const pts = new Map([[JSON.stringify([]), []], [JSON.stringify(cut), cut]]);
	for (const f of fs) for (const [a, bb] of split(f, cut)[0]) {
		pts.set(JSON.stringify(a), a);
		pts.set(JSON.stringify(bb), bb);
	}
	const points = [...pts.values()].sort(cmp);
	let parents = initial;
	const history = new Map();
	for (const point of points) {
		parents = refine(parents, fs.map(f => value(f, point)));
		history.set(JSON.stringify(point), parents);
	}
	const root = history.get(JSON.stringify(cut)).at(-1);
	if (root == null) throw new Error("the last scalar position has no surviving parent");
	const result = m.slice(0, b[root].start);
	for (let k = 0; k < n; k++) for (let i = root; i < b.length - 1; i++) {
		if (!k) {
			result.push(...b[i].columns);
			continue;
		}
		let h = head(b[i]);
		if (descendsFrom(initial, root, i)) h += k * sub(head(b.at(-1)), head(b[root]));
		const changed = [];
		for (let j = 0; j + 1 < points.length; j++) {
			const a = points[j];
			let v = value(fs[i], a);
			if (cmp(a, cut) < 0 && descendsFrom(history.get(JSON.stringify(a)), root, i)) v += k * sub(value(fs.at(-1), a), value(fs[root], a));
			changed.push([a, points[j + 1], v]);
		}
		const suffix = emit(split(fs[i], cut)[1]);
		const prefix = i == root && k == 1 ? emit(fs.at(-1).slice(0, -1)) : emitIntervals(changed);
		result.push([h], ...shift([...prefix, ...suffix], h, 0));
	}
	return result;
}

function unitExtension(m, n) {
	if (!(m.length >= 3 && eq(m[0], [0]) && eq(m[1], [1]) && m.at(-1).length == 2 && m.at(-1)[1] == 1 &&
		m.every(c => c.length == 1 || c.length == 2 && c[1] == 1))) return null;
	const out = n ? [[0]] : [];
	for (let k = 0; k < n - 1; k++) out.push(...shift(m.slice(1, -1), (m.at(-1)[0] - 1) * k, k));
	return out;
}

function exposedCut(m, n) {
	const cut = terminalAnchor(m);
	if (cut == null || m.slice(cut + 1).some(c => c.length != 2 || c[0] != m[cut][0] + 1)) return null;
	const ds = range(0, m.length - cut).filter(d => strongParent(m, cut, d) != null);
	if (!ds.length) throw new Error("the exposed front has no surviving parent");
	const active = Math.max(...ds), root = strongParent(m, cut, active);
	const retained = blocks(m.slice(0, cut)).every(b => b.start != root) ? 1 : 0;
	const out = m.slice(0, root);
	for (let k = 0; k < n + retained; k++) for (const blk of blocks(m.slice(root, cut))) {
		const i = root + blk.start;
		if (!k) {
			out.push(...blk.columns);
			continue;
		}
		let h = head(blk);
		const body = scalarFields(source(m, i));
		if (borrowed(m, i) && active > body.length) body[body.length - 1] = field(body.at(-1).payload[0], length(limit(2)));
		if (active > 0 && (i == root || lineage(m, i, 0).includes(root))) h += k * sub(entry(m, cut, 0), entry(m, root, 0));
		for (let j = 0; j < active - 1; j++) {
			const amount = i == root || lineage(m, i, j + 1).includes(root) ? k * sub(entry(m, cut, j + 1), entry(m, root, j + 1)) : 0;
			if (j == body.length) body.push(makeField([0], [[0]], false, [[1, 0]]));
			body[j] = field(body[j].payload[0] + amount, length(body[j].index));
		}
		while (body.length && eq(body.at(-1).payload, [0])) body.pop();
		out.push([h], ...shift(emit(body), h, 0));
	}
	return out;
}

function rowCut(m, n) {
	const history = [parentsOf(m.map(c => c[0]))];
	for (let depth = 1; depth < m.at(-1).length; depth++) history.push(refine(history.at(-1), m.map(c => depth < c.length ? c[depth] : 0)));
	const ds = range(0, history.length).filter(d => history[d].at(-1) != null);
	if (!ds.length) throw new Error("the terminal column has no surviving parent");
	const active = Math.max(...ds), root = history[active].at(-1);
	const out = m.slice(0, root);
	for (let k = 0; k < n; k++) for (let i = root; i < m.length - 1; i++) {
		const values = [...m[i], ...Array(Math.max(0, active - m[i].length)).fill(0)];
		for (let depth = 0; depth < active; depth++) if (descendsFrom(history[depth], root, i)) {
			const base = depth < m[root].length ? m[root][depth] : 0;
			values[depth] += k * sub(m.at(-1)[depth], base);
		}
		while (values.length > 1 && values.at(-1) == 0) values.pop();
		out.push(values);
	}
	return out;
}

function candidate(m, n) {
	if (!m.length) return [[], "zero"];
	const last = m.at(-1);
	if (eq(last, [0])) return [m.slice(0, -1), "succ"];
	if (last.length == 1) {
		const r = parentsOf(m.map(x => x[0])).at(-1);
		if (r == null) throw new Error("last column is prss but has no parent");
		return [[...m.slice(0, r), ...copyN(m.slice(r, -1), n)], "prss"];
	}
	if (m.length >= 3 && eq(m, limit(m.length))) {
		const result = m.slice(0, n ? -2 : -3);
		for (let k = 0; k < n - 1; k++) result.push(m.at(-2).map(v => v + k));
		return [result, "dbms"];
	}
	if (m.length >= 3 && m.at(-2).length == 1 && eq(last, [m.at(-2)[0] + 1, 1]) && eq(m.at(-3), [m.at(-2)[0] - 1])) {
		return [[...m.slice(0, -3), ...range(0, n).map(k => [m.at(-3)[0] + k])], "eps0"];
	}
	let height = 0;
	while (height < m.length && eq(m[height], diagonal(height))) height++;
	if (!height) throw new Error("first entry of m is nonzero");
	height--;
	if (height >= 3 && m.slice(height + 1).every(x => eq(x, diagonal(height)))) {
		const result = n ? m.slice(0, height - 1) : [];
		for (let k = 0; k < n - 1; k++) result.push(...m.slice(height - 1, -1).map(c => c.map(v => v + k)));
		return [result, "dbms full-ascend"];
	}
	const b = blocks(m), terminal = b.at(-1);
	if (terminal.columns.length > 1 && last[0] == head(terminal) + 1 && last.length == 2) {
		const bd = boundary(m, b, n);
		return bd ? [bd, "protected boundary"] : [scalarCut(m, b, n), "scalar cut"];
	}
	const cut = terminalAnchor(m), unit = unitExtension(m, n);
	const innerUnit = b.every(bl => cut != bl.start) && m.length > cut + 2 && m.slice(cut + 1).every(v => eq(v, [m[cut][0] + 1, 1]));
	if (innerUnit && unit) return [unit, "unit extension"];
	const exposed = exposedCut(m, n);
	if (exposed) return [exposed, "exposed cut"];
	return unit ? [unit, "unit extension"] : [rowCut(m, n), "row cut"];
}

function expandWithRule(m, n) {
	const [result, rule] = candidate(m, n);
	if (m.length && cmp(result, m) >= 0) throw new Error(`${rule} at n = ${n}: candidate does not descend`);
	return [result, rule];
}

const expand = (m, n) => expandWithRule(m, n)[0];

// ---------------------------------------------------------------- sequence form
function parentSets(m) {
	return m.map((c, i) => {
		const out = [];
		let j = i;
		for (const e of c) {
			j = m.findLastIndex((v, z) => z < j && v[0] < e);
			if (j < 0) break;
			out.push(j);
		}
		return out;
	});
}

// exact, as the values grow exponentially
function sequence(m) {
	const values = [];
	parentSets(m).forEach((ps, i) => values[i] = ps.reduce((v, p) => v + values[p], 1n));
	return values;
}

return {cmp, limit, diagonal, copyN, expand, expandWithRule, sequence};

})();

class notation {
	static title = "Vulcaniz";

	static form = "matrix";
	static compressed = true;

	static parameters = [
		{legend: "Form:", inputs: [
			{type: "radio", id: "form", value: "matrix", label: "Matrix (0)(1)(2,1)(3)"},
			{type: "radio", id: "form", value: "sequence", label: "Sequence 1,2,4,5"},
		]},
		{type: "checkbox", id: "compressed", label: "Compressed 0 1 21 3", visibleIf: () => notation.form == "matrix"},
	]

	static lessOrEqual(a, b) {
		return VZ.cmp(a, b) <= 0;
	}

	// 0 1 ; 0 1 21 ; 0 1 21 321 ; ...
	static expandLimit(n) {
		return VZ.limit(n + 2);
	}

	static expand(a, n) {
		return VZ.expand(a, n);
	}

	static isSuccessor(a) {
		return !a.length || a.at(-1).length == 1 && a.at(-1)[0] == 0;
	}

	// one base-36 digit per entry with columns separated by spaces, or (a,b)(c) once an entry reaches 36
	static toString(a) {
		if (a.some(c => c.some(x => x >= 36))) return a.map(c => `(${c})`).join("");
		return a.map(c => c.map(x => x.toString(36).toUpperCase()).join("")).join(" ");
	}

	static fromString(s) {
		s = s.trim();
		if (s.includes("(")) return s.match(/\([^()]*\)/g).map(c => c.slice(1, -1).split(",").map(Number));
		return s ? s.split(/\s+/).map(c => [...c].map(d => parseInt(d, 36))) : [];
	}

	static convertToNotation(value) {
		const a = notation.fromString(value);
		if (!a.length) return "∅";
		if (notation.form == "sequence") return VZ.sequence(a).join(",");
		return notation.compressed ? notation.toString(a) : a.map(c => `(${c})`).join("");
	}
};
