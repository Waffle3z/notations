// LOCF: TrialPurpleCube's "Definition of LOCF" (the idea is Eryx Jayakari's), corrected and extended; the definition
// and its implementation are in ordinals/locf.js.
// requires: ordinals/tocf.js ordinals/locf.js

class notation {
	static title = "LOCF";
	static lessOrEqual(a, b) {
		return LOCF.le(a, b);
	}

	// 1, ψ(L), ψ(L_L), ψ(L_L_L), ...: Ω[[n]]
	static expandLimit(n) {
		return LOCF.fs2(LOCF.OM, n);
	}

	static expand(a, n) {
		return a.length ? LOCF.fs2(a, n) : a;
	}

	static isSuccessor(a) {
		return !a.length || LOCF.isSucc(a);
	}

	static toString(a) {
		return LOCF.show(a, LOCF.CANON);
	}

	static fromString(s) {
		return LOCF.parse(s);
	}

	static om = true;
	static psi = true;
	static d = true;
	static omx = true;
	static coef = true;
	static cnf = true;

	static parameters = [
		{type: "checkbox", id: "om", label: "Ω = ψ_L(0)"},
		{type: "checkbox", id: "psi", label: "ψ(x) = ψ_Ω(x)"},
		{type: "checkbox", id: "d", label: "d = Ω_{L+1}"},
		{type: "checkbox", id: "omx", label: "Ω₂ = ψ_L(1), below fixed points"},
		{type: "checkbox", id: "coef", visibleIf: () => !notation.cnf, label: "Coefficients (L+L = L·2)"},
		{type: "checkbox", id: "cnf", label: "Cantor normal form (L^L)"},
	]

	static convertToNotation(value) {
		return LOCF.show(LOCF.parse(value), {om: notation.om, psi: notation.psi, d: notation.d, omx: notation.omx, coef: notation.coef, cnf: notation.cnf});
	}
};
