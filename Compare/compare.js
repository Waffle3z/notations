// Compare notations in a table. Rows are ordinals in decreasing order; each column writes them in
// one notation with its own display settings. Clicking a cell inserts the next element of that
// notation's fundamental sequence below the row, shift-click keeps expanding.
//
// Below EBO a row is an EBOCF term; from EBO = ?[1,2,5] up to the limit of ?, a ? sequence. A
// notation takes part through toOrdinal(seq) and fromOrdinal(term) (null if the ordinal is out of
// its range), a static limit term if its limit is below EBO, and a static ebo sequence for EBO if
// its limit is above. Beyond EBO it takes part through toQ(seq) and fromQ(q), converting to and
// from ? sequences, and qLimit if its limit is ?'s; without them its cells there are "?".

const {countable, isOne, cmp} = BOCF;

// the extended notations stand in for the plain ones: HPrSS is collapsing HPrSS, LPrSS transfinite LPrSS
const SOURCES = {HPrSS: "../CHPrSS/notation.js", PSS: "../PSS/notation.js", LPrSS: "../TLPrSS/notation.js", "? sequence": "../QSeq/notation.js", "T? sequence": "../TQSeq/notation.js",
	"Nothing OCF": "../NOCF/notation.js", SSS: "../SSS/notation.js", DoR: "../DoR/notation.js"};
const texts = {};

// a fresh copy of a notation class, so each column keeps its own settings
async function load(name) {
	texts[name] ??= await (await fetch(SOURCES[name])).text();
	return new Function(texts[name] + "\nreturn notation;")();
}

// the ordinal itself, expanded with Buchholz's fundamental sequences (which CHPrSS computes)
function ordinalNotation(CH) {
	return class {
		static title = "Ordinal";
		static syntax = "psi";
		static cnf = false;
		static parameters = OrdinalSyntax.parameters({veblen: "Veblen"});
		static toOrdinal = t => t;
		static fromOrdinal = t => countable(t) ? t : null;
		static expand = (t, n) => CH.toOrdinal(CH.expand(CH.fromOrdinal(t), n));
		static expandLimit = n => CH.toOrdinal(CH.expandLimit(n));
		static isSuccessor = t => !t.length || isOne(t.at(-1));
		static toString = t => JSON.stringify(t);
		static convertToNotation(s) {
			return OrdinalSyntax.show(JSON.parse(s), this);
		}
	};
}

async function makeNotation(name) {
	if (name == "Ordinal") return ordinalNotation(await load("HPrSS"));
	const N = await load(name);
	N.aliases = false; // the table already shows the ordinal
	return N;
}

const columns = []; // {name, N, cache}
let Q; // the ? sequence, the reference from EBO on
let nextId = 0;

// row keys: {t} an EBOCF term below EBO, {q} a ? sequence from EBO on, {top} the limit of ?
const EBO_Q = [1, 2, 5];
let rows = [{key: {top: true}}, {key: {q: EBO_Q}}];
const qcmp = (a, b) => BOCF.lex(a, b, (x, y) => x - y);
const rank = k => k.top ? 2 : k.q ? 1 : 0;
const cmpKey = (a, b) => rank(a) - rank(b) || (a.q ? qcmp(a.q, b.q) : a.t ? cmp(a.t, b.t) : 0);
const isSuccKey = k => k.t ? !k.t.length || isOne(k.t.at(-1)) : !k.top && Q.isSuccessor(k.q);
const isEBO = k => k.q && !qcmp(k.q, EBO_Q);

// the row key of a sequence in col's notation, or null if it can't be placed
function keyOf(N, seq) {
	const t = N.toOrdinal(seq);
	if (t) return {t};
	const q = N.toQ?.(seq);
	return q ? {q} : null;
}

function cellText(col, key) {
	const N = col.N, show = seq => N.convertToNotation ? N.convertToNotation(N.toString(seq)) : N.toString(seq);
	const unknown = N.ebo ? {text: "?", unknown: true} : {text: null};
	if (key.top) return N.qLimit ? {text: "Limit", limit: true} : unknown;
	if (isEBO(key)) return N.limit ? {text: null} : N.ebo ? {text: show(N.ebo), seq: N.ebo} : {text: "Limit", limit: true};
	if (key.q && !N.fromQ) return unknown;
	if (key.t && N.limit && !cmp(key.t, N.limit)) return {text: "Limit", limit: true};
	const id = JSON.stringify(key);
	if (!col.cache.has(id)) {
		const seq = key.q ? N.fromQ(key.q) : N.fromOrdinal(key.t);
		col.cache.set(id, {text: !seq ? null : show(seq), seq});
	}
	return col.cache.get(id);
}

// the next fundamental sequence element of the row in col's notation above `below`, as in main.js
function step(col, key, below) {
	const N = col.N, {seq, limit} = cellText(col, key);
	if (!limit && (!seq || !seq.length)) return null;
	const at = n => keyOf(N, limit ? N.expandLimit(n) : N.expand(seq, n));
	const isSucc = k => !k || isSuccKey(k);
	const above = k => !below || k && cmpKey(k, below) > 0;
	if (!limit && N.isSuccessor(seq)) return above(at(0)) ? at(0) : null;
	let low = !limit && isSucc(at(0)) && !isSucc(at(1)) ? 1 : 0;
	if (below) {
		let high = low + 1;
		while (!above(at(high))) {
			low = high;
			high *= 2;
			if (high > 10000) return null;
		}
		while (low < high) {
			const mid = Math.floor((low + high) / 2);
			if (above(at(mid))) high = mid;
			else low = mid + 1;
		}
	}
	return at(low);
}

function expandRow(col, i, repeat) {
	const start = Date.now();
	let key = rows[i].key, at = i + 1;
	for (let k = 0; k < 1000; k++) {
		let next = null;
		try {
			next = step(col, key, rows[at]?.key);
		} catch (e) { // e.g. an index so large that the expansion nests too deeply
			console.warn(e);
		}
		if (!next || cmpKey(next, key) >= 0) break;
		rows.splice(at, 0, {key: next});
		key = next;
		at++;
		if (!repeat || Date.now() - start > 200) break;
	}
	render();
}

// the display settings a column offers (not "show ordinal", which the table already does, nor the
// ones hidden by visibleIf, as in main.js)
const shown = p => !p.url && (!p.visibleIf || p.visibleIf());
const settings = col => (col.N.parameters ?? []).filter(p => shown(p) && p.id != "aliases" && (p.inputs ?? [p]).some(shown));

function settingsPanel(col) {
	const panel = document.createElement("div");
	panel.className = "settings";
	for (const param of settings(col)) {
		const group = document.createElement("div");
		if (param.legend) group.append(param.legend);
		for (const input of (param.inputs ?? [param]).filter(shown)) {
			const label = document.createElement("label");
			const inp = document.createElement("input");
			inp.type = input.type;
			if (input.type == "radio") {
				inp.name = col.id + "-" + input.id;
				inp.checked = col.N[input.id] === input.value;
				inp.onchange = () => { col.N[input.id] = input.value; col.cache.clear(); render(); };
			} else {
				inp.checked = !!col.N[input.id];
				inp.onchange = () => { col.N[input.id] = inp.checked; col.cache.clear(); render(); };
			}
			label.append(inp, " " + input.label);
			group.append(label);
		}
		panel.append(group);
	}
	return panel;
}

function button(text, title, onclick) {
	const b = document.createElement("button");
	b.className = "small";
	b.textContent = text;
	b.title = title;
	b.onclick = onclick;
	return b;
}

function render() {
	const table = document.getElementById("table");
	table.replaceChildren();
	const head = table.createTHead().insertRow();
	head.insertCell();
	for (const col of columns) {
		const th = document.createElement("th");
		const title = document.createElement("div");
		title.className = "title";
		title.append(col.name + " ");
		if (settings(col).length) title.append(button("⚙", "display settings", () => { col.open = !col.open; render(); }));
		title.append(button("×", "remove column", () => { columns.splice(columns.indexOf(col), 1); render(); }));
		th.append(title);
		if (col.open) th.append(settingsPanel(col));
		head.append(th);
	}
	const add = document.createElement("select");
	add.append(new Option("+ column", ""), ...["Ordinal", ...Object.keys(SOURCES)].map(n => new Option(n, n)));
	add.onchange = () => add.value && addColumn(add.value);
	head.insertCell().append(add);
	const body = table.createTBody();
	rows.forEach((row, i) => {
		const tr = body.insertRow();
		const first = tr.insertCell();
		if (!row.key.top && !isEBO(row.key)) first.append(button("×", "remove row", () => { rows.splice(i, 1); render(); }));
		for (const col of columns) {
			const td = tr.insertCell();
			const {text, unknown} = cellText(col, row.key);
			td.textContent = text == null ? "—" : text || "∅";
			td.className = text == null || unknown ? "cell out" : "cell";
			if (text != null && !unknown) td.onclick = e => expandRow(col, i, e.shiftKey);
		}
	});
}

async function addColumn(name, values = {}) {
	const N = await makeNotation(name);
	Object.assign(N, values);
	columns.push({name, N, cache: new Map(), id: nextId++});
	if (N.limit && !rows.some(r => r.key.t && !cmp(r.key.t, N.limit))) { // a row for this notation's limit
		const key = {t: N.limit}, i = rows.findIndex(r => cmpKey(r.key, key) < 0);
		rows.splice(i < 0 ? rows.length : i, 0, {key});
	}
	render();
}

(async () => {
	Q = await load("? sequence");
	await addColumn("Ordinal", {syntax: "named", cnf: true});
	await addColumn("Ordinal", {syntax: "veblen"});
	await addColumn("HPrSS");
	await addColumn("PSS");
	await addColumn("LPrSS");
	await addColumn("? sequence");
	await addColumn("T? sequence");
	await addColumn("Nothing OCF");
	await addColumn("SSS");
	await addColumn("DoR");
})();
