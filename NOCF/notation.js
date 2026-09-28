// Nothing OCF: extended Buchholz ψ without + in the closure. A term is its address
// (u1,…,uk) = ψ_{u1}(ψ_{u2}(…ψ_{uk}(0))), with entries written by their values, so 0,Ω = Γ₀ and
// 0,Ω,ω = BHO; the limit is EBO. Its fundamental sequences are SSS expansion (ordinals/nocf.js).
// requires: ordinals/bocf.js ordinals/veblen.js ordinals/nocf.js

const zeros = t => t.every(u => !u.length);
const nested = t => zeros(t) ? String(t.length) : `(${t.map(nested).join(",")})`;

// "(0,(1),2)": a number n is the address of n zeros
function parse(s) {
	let i = 0;
	const term = () => {
		if (s[i] != "(") {
			const j = i;
			while (/\d/.test(s[i])) i++;
			return Array.from({length: +s.slice(j, i)}, () => []);
		}
		i++;
		const out = [];
		while (s[i] != ")") {
			out.push(term());
			if (s[i] == ",") i++;
		}
		i++;
		return out;
	};
	return s ? term() : [];
}

const addresses = new Map();

// the term with value t
function address(t) {
	const key = JSON.stringify(t);
	if (!addresses.has(key)) addresses.set(key, NOCF.decode(NOCF.fromValue(t)));
	return addresses.get(key);
}

class notation {
	static title = "NOCF";
	static header = "Nothing OCF";
	static address = false;
	static entries = "ordinal";
	static aliases = true;
	static psi = "nocf";
	static named = true;
	static veblen = true;
	static cnf = true;

	static parameters = [
		{legend: "Entries:", inputs: [
			{type: "radio", id: "entries", value: "ordinal", label: "Ordinal 0,Ω,ω"},
			{type: "radio", id: "entries", value: "nested", label: "Nested 0,(1),(0,1)"},
		]},
		{legend: "Ordinal syntax:", inputs: [
			{type: "radio", id: "psi", value: "nocf", label: "NOCF ψ"},
			{type: "radio", id: "psi", value: "ebocf", label: "EBOCF ψ"},
		]},
		{type: "checkbox", id: "named", label: "ω^, ε, ζ, η"},
		{type: "checkbox", id: "veblen", label: "Veblen below ψ(Ω₂)"},
		{type: "checkbox", id: "cnf", label: "Cantor normal form"},
		{type: "checkbox", id: "aliases", label: "Show ordinal"},
		{type: "checkbox", id: "address", label: "Address notation"},
	]

	static lessOrEqual(a, b) {
		return NOCF.cmp(a, b) <= 0;
	}

	// the SSS tops [0,0,2][n]: 2, ω, (0,ω), (0,Ω_ω), ... = (0,Ω_Ω_...)
	static expandLimit(n) {
		return NOCF.decode(NOCF.fundamental(NOCF.EBO, n + 1));
	}

	static expand(a, n) {
		return a.length ? NOCF.decode(NOCF.fundamental(NOCF.encode(a), n)) : [];
	}

	static isSuccessor(a) {
		return !a.at(-1)?.length;
	}

	static toString(a) {
		return nested(a);
	}

	static fromString(s) {
		return parse(s);
	}

	// conversion to and from EBOCF terms (for Compare/)
	static toOrdinal(a) {
		return NOCF.value(a);
	}

	static fromOrdinal(t) {
		const s = NOCF.fromValue(t);
		return s && NOCF.decode(s);
	}

	static convertToNotation(value) {
		const a = notation.fromString(value);
		const nocf = notation.psi == "nocf";
		const opts = {cnf: notation.cnf, named: !notation.veblen, plain: !notation.named,
			psi: nocf ? s => BOCF.countable([s]) && psiOrd(address([s])) : undefined};
		const show = x => (notation.named || notation.veblen ? Veblen.show : BOCF.show)(x, opts);
		// the value of a term, with NOCF ψ for Ω_u and the uncountable ψ terms
		const ord = t => !nocf || BOCF.countable(NOCF.value(t)) ? show(NOCF.value(t)) :
			t.length > 1 ? psiOrd(t) : "Ω" + (t[0].length == 1 && zeros(t[0]) ? "" : sub(t[0], ord));
		const entry = u => notation.entries == "nested" ? (notation.address ? nested(u) : psi(u)) : ord(u);
		// the subscript of ψ_u: left out for 0, in digits for n, and in braces only for a sum, product or power
		function sub(u, f) {
			if (!u.length) return "";
			if (zeros(u)) return BOCF.subscriptDigits(u.length);
			const e = f(u);
			return "_" + (BOCF.wrap(e, "+·^") == e ? e : `{${e}}`);
		}
		// ψ_u1(ψ_u2(…ψ_uk(0))) for the notation, and ψ_u1(x) with x the value of the rest for ordinals
		const psi = t => t.reduceRight((arg, u) => `ψ${sub(u, entry)}(${arg})`, "0");
		const psiOrd = t => `ψ${sub(t[0], ord)}(${ord(t.slice(1))})`;
		const str = !notation.address ? psi(a) : zeros(a) ? nested(a) : a.map(notation.entries == "nested" ? nested : entry).join(",");
		return notation.aliases ? str + " = " + show(NOCF.value(a)) : str;
	}
};