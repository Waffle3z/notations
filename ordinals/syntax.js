// The ordinal syntax setting shared by explorers that write EBOCF terms (ordinals/bocf.js and
// ordinals/veblen.js): Buchholz ψ, ω^/ε/ζ/η, or Veblen, with an option for Cantor normal form.
// A notation spreads parameters() into its own parameters and reads its settings `syntax` and
// `cnf` back through show(t, notation).

const OrdinalSyntax = (() => {

// the parameter entries; visibleIf (optional) applies to both
function parameters({visibleIf, veblen = "Veblen below ψ(Ω₂)", cnf = "Cantor normal form"} = {}) {
	return [
		{legend: "Ordinal syntax:", visibleIf, inputs: [
			{type: "radio", id: "syntax", value: "psi", label: "Buchholz ψ"},
			{type: "radio", id: "syntax", value: "named", label: "ω^, ε, ζ, η"},
			{type: "radio", id: "syntax", value: "veblen", label: veblen},
		]},
		{type: "checkbox", id: "cnf", visibleIf, label: cnf},
	];
}

// the printing options for settings {syntax, cnf}, with extra options passed through
const options = (s, extra = {}) => ({cnf: s.cnf, named: s.syntax == "named", ...extra});

// str, or null if the setting is not Buchholz ψ and str needs ψ
const strict = (str, s) => str != null && s.syntax != "psi" && str.includes("ψ") ? null : str;

// t written in the chosen syntax; with extra.strict, null where another syntax than Buchholz ψ
// would fall back to ψ form
function show(t, s, {strict: isStrict, ...extra} = {}) {
	const str = (s.syntax == "psi" ? BOCF.show : Veblen.show)(t, options(s, extra));
	return isStrict ? strict(str, s) : str;
}

return {parameters, show, strict};

})();
