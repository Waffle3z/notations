// Compare notations in a table. Rows are ordinals (EBOCF terms) in decreasing order; each
// column writes them in one notation with its own display settings. Clicking a cell inserts
// the next element of that notation's fundamental sequence below the row, shift-click keeps
// expanding. A notation takes part through toOrdinal(seq) and fromOrdinal(term) (null if the
// ordinal is out of its range), a static limit term if its limit is below EBO, and a static
// ebo sequence for EBO if its limit is above.

const {countable, isOne, cmp} = BOCF;

// the extended notations stand in for the plain ones: HPrSS is collapsing HPrSS, LPrSS transfinite LPrSS
const SOURCES = {HPrSS: "../CHPrSS/notation.js", LPrSS: "../TLPrSS/notation.js", "? sequence": "../QSeq/notation.js", "T? sequence": "../TQSeq/notation.js"};
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
		static parameters = [
			{legend: "Syntax:", inputs: [
				{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
				{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
				{type: "radio", id: "syntax", value: "veblen", label: "Veblen"},
			]},
			{type: "checkbox", id: "cnf", label: "Cantor normal form"},
		];
		static toOrdinal = t => t;
		static fromOrdinal = t => countable(t) ? t : null;
		static expand = (t, n) => CH.toOrdinal(CH.expand(CH.fromOrdinal(t), n));
		static expandLimit = n => CH.toOrdinal(CH.expandLimit(n));
		static isSuccessor = t => !t.length || isOne(t.at(-1));
		static toString = t => JSON.stringify(t);
		static convertToNotation(s) {
			const opts = {cnf: this.cnf, named: this.syntax == "named"};
			return (this.syntax == "psi" ? BOCF.show : Veblen.show)(JSON.parse(s), opts);
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
let rows = [{term: null}]; // term null is the EBO row
let nextId = 0;

function cellText(col, term) {
	const limit = col.N.limit;
	if (!term) return limit ? {text: null} : col.N.ebo ? {text: col.N.toString(col.N.ebo), seq: col.N.ebo} : {text: "Limit", limit: true};
	if (limit && !cmp(term, limit)) return {text: "Limit", limit: true};
	const key = JSON.stringify(term);
	if (!col.cache.has(key)) {
		const seq = col.N.fromOrdinal(term);
		const text = !seq ? null : col.N.convertToNotation ? col.N.convertToNotation(col.N.toString(seq)) : col.N.toString(seq);
		col.cache.set(key, {text, seq});
	}
	return col.cache.get(key);
}

// the next fundamental sequence element of the row in col's notation above `below`, as in main.js
function step(col, term, below) {
	const N = col.N, {seq, limit} = cellText(col, term);
	if (!limit && (!seq || !seq.length)) return null;
	const at = n => N.toOrdinal(limit ? N.expandLimit(n) : N.expand(seq, n));
	const isSucc = t => !t.length || isOne(t.at(-1));
	const above = t => !below || cmp(t, below) > 0;
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
	let term = rows[i].term, at = i + 1;
	for (let k = 0; k < 1000; k++) {
		let next = null;
		try {
			next = step(col, term, rows[at]?.term);
		} catch (e) { // e.g. an index so large that the expansion nests too deeply
			console.warn(e);
		}
		if (!next) break;
		rows.splice(at, 0, {term: next});
		term = next;
		at++;
		if (!repeat || Date.now() - start > 200) break;
	}
	render();
}

// the display settings a column offers (not "show ordinal", which the table already does)
const settings = col => (col.N.parameters ?? []).filter(p => !p.url && p.id != "aliases");

function settingsPanel(col) {
	const panel = document.createElement("div");
	panel.className = "settings";
	for (const param of settings(col)) {
		const group = document.createElement("div");
		if (param.legend) group.append(param.legend);
		for (const input of param.inputs ?? [param]) {
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
		if (row.term) first.append(button("×", "remove row", () => { rows.splice(i, 1); render(); }));
		for (const col of columns) {
			const td = tr.insertCell();
			const {text} = cellText(col, row.term);
			td.textContent = text == null ? "—" : text || "∅";
			td.className = text == null ? "cell out" : "cell";
			if (text != null) td.onclick = e => expandRow(col, i, e.shiftKey);
		}
	});
}

async function addColumn(name, values = {}) {
	const N = await makeNotation(name);
	Object.assign(N, values);
	columns.push({name, N, cache: new Map(), id: nextId++});
	if (N.limit && !rows.some(r => r.term && !cmp(r.term, N.limit))) { // a row for this notation's limit
		const i = rows.findIndex(r => r.term && cmp(r.term, N.limit) < 0);
		rows.splice(i < 0 ? rows.length : i, 0, {term: N.limit});
	}
	render();
}

(async () => {
	await addColumn("Ordinal", {syntax: "named", cnf: true});
	await addColumn("Ordinal", {syntax: "veblen"});
	await addColumn("HPrSS");
	await addColumn("LPrSS");
	await addColumn("? sequence");
	await addColumn("T? sequence");
})();
