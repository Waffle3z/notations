let BMS_aliases = {
	["(0,0)(1,1)(1,0)"]: "ε₀·ω",
	["(0,0)(1,1)(1,0)(1,0)"]: "ε₀·ω^2",
	["(0,0)(1,1)(1,0)(2,0)"]: "ε₀·ω^ω",
	["(0,0)(1,1)(1,0)(2,1)"]: "ε₀^2",
	["(0,0)(1,1)(1,0)(2,1)(1,0)"]: "ε₀^2·ω",
	["(0,0)(1,1)(1,0)(2,1)(2,0)"]: "ε₀^ω",
	["(0,0)(1,1)(1,1)"]: "ε₁",
	["(0,0)(1,1)(2,0)"]: "ε_ω",
	["(0,0)(1,1)(2,0)(1,1)"]: "ε_{ω+1}",
	["(0,0)(1,1)(2,0)(1,1)(2,0)"]: "ε_{ω·2}",
	["(0,0)(1,1)(2,0)(2,0)"]: "ε_{ω²}",
	["(0,0)(1,1)(2,1)(1,0)"]: "ζ₀·ω",
	["(0,0)(1,1)(2,1)(1,1)"]: "ε_{ζ₀+1}",
	["(0,0)(1,1)(2,1)(2,0)"]: "ζ_ω",
	["(0,0)(1,1)(2,1)(2,1)(2,0)"]: "η_ω",
	["(0,0)(1,1)(2,1)(3,0)"]: "ϕ(ω,0)",
	["(0,0)(1,1)(2,1)(3,0)(2,0)"]: "ϕ(ω,ω)",
	["(0,0)(1,1)(2,1)(3,0)(2,1)"]: "ϕ(ω+1,0)",
	["(0,0)(1,1)(2,1)(3,0)(3,0)"]: "ϕ(ω²,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,0)"]: "ϕ(ω^ω,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)"]: "ϕ(ε₀,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)(4,1)"]: "ϕ(ε₁,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)(5,0)"]: "ϕ(ε_ω,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)(5,1)"]: "ϕ(ζ₀,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)(5,1)(5,1)"]: "ϕ(η₀,0)",
	["(0,0)(1,1)(2,1)(3,0)(4,1)(5,1)(6,0)"]: "ϕ(ϕ(ω,0),0)",
	["(0,0)(1,1)(2,1)(3,1)(1,0)"]: "Γ₀·ω",
	["(0,0)(1,1)(2,1)(3,1)(1,1)"]: "ε_{Γ₀+1}",
	["(0,0)(1,1)(2,1)(3,1)(1,1)(2,1)(3,1)"]: "Γ₁",
	["(0,0)(1,1)(2,1)(3,1)(2,0)"]: "Γ_ω",
	["(0,0)(1,1)(2,1)(3,1)(2,1)"]: "ϕ(1,1,0)",
	["(0,0)(1,1)(2,1)(3,1)(2,1)(3,1)"]: "ϕ(2,0,0)",
	["(0,0)(1,1)(2,1)(3,1)(2,1)(3,1)(2,1)(3,1)"]: "ϕ(3,0,0)",
	["(0,0)(1,1)(2,1)(3,1)(3,0)"]: "ϕ(ω,0,0)",
	["(0,0)(1,1)(2,1)(3,1)(3,1)"]: "ϕ(1,0,0,0)",
	["(0,0)(1,1)(2,2)"]: "BHO",
	["(0,0)(1,1)(2,2)(2,2)"]: "ψ₀(Ω₂·2)",
	["(0,0)(1,1)(2,2)(3,0)"]: "ψ₀(Ω₂·ω)",
	["(0,0)(1,1)(2,2)(3,1)"]: "ψ₀(Ω₂·Ω)",
	["(0,0)(1,1)(2,2)(3,2)"]: "ψ₀(Ω₂^2)",
	["(0,0)(1,1)(2,2)(3,3)"]: "ψ₀(Ω₃)",
	["(0,0)(1,1)(2,2)(3,3)(4,4)"]: "ψ₀(Ω₄)",
	["(0,0)(1,1)(2,2)(3,3)(4,4)(5,5)"]: "ψ₀(Ω₅)",
	["(0,0,0)(1,1,1)"]: "ψ₀(Ω_ω)",
	["(0,0,0)(1,1,1)(1,0,0)"]: "ψ₀(Ω_ω+1)",
	["(0,0,0)(1,1,1)(1,1,0)"]: "ψ₀(Ω_ω+Ω)",
	["(0,0,0)(1,1,1)(1,1,1)"]: "ψ₀(Ω_ω·2)",
	["(0,0,0)(1,1,1)(2,0,0)"]: "ψ₀(Ω_ω·ω)",
	["(0,0,0)(1,1,1)(2,1,0)"]: "ψ₀(Ω_ω·Ω)",
	["(0,0,0)(1,1,1)(2,1,0)(3,2,0)"]: "TFBO",
	["(0,0,0)(1,1,1)(2,1,0)(3,2,1)"]: "ψ₀(Ω_{ω·2})",
	["(0,0,0)(1,1,1)(2,1,1)"]: "ψ₀(Ω_{ω²})",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)"]: "ψ₀(Ω_Ω)",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(2,0,0)"]: "EBO",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(2,1,0)"]: "ψ(I+ψ(I,Ω))",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(2,1,1)"]: "ψ(I·ω)",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(3,0,0)"]: "ψ(I^ω)",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(4,0,0)"]: "ψ(I^I^ω)",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(4,2,0)"]: "ψ(Ω_{I+1})",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(4,2,1)"]: "ψ(Ω_{I+ω})",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,1)"]: "ψ(I_ω)",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,0)(4,2,1)(5,2,1)(6,2,0)"]: "ψ(Ω_Ω_{I+1})",
	["(0,0,0)(1,1,1)(2,1,1)(3,1,1)(3,1,0)(4,2,0)"]: "Rathjen's ordinal",
	["(0,0,0)(1,1,1)(2,2,0)"]: "1st Back Gear Ordinal",
	["(0,0,0)(1,1,1)(2,2,1)(3,0,0)"]: "Small Dropping Ordinal",
	["(0,0,0)(1,1,1)(2,2,1)(3,3,0)"]: "2nd Back Gear ordinal",
	["(0,0,0)(1,1,1)(2,2,1)(3,3,1)(4,4,1)"]: "3rd Back Gear ordinal",
	["(0,0,0)(1,1,1)(2,2,1)(3,3,1)(4,4,1)(5,5,1)"]: "4th Back Gear ordinal",
	["(0,0,0)(1,1,1)(2,2,2)"]: "Small Bashicu ordinal",
	["(0,0,0,0)(1,1,1,1)"]: "lim(TSS)",
	["(0,0,0,0,0)(1,1,1,1,1)"]: "lim(QSS)",
};

// convert PrSS to CNF
function PrSStoCNF(s) {
	let out = "";
	let lastterm = "";
	let coefficient = 1;
	let root = 0;

	for (let i = 0; i <= s.length; i++) {
		if ((s[i + 1] === s[0]) || (i + 1 >= s.length)) {
			let branches = 0;
			for (let j = root+1; j <= i; j++) {
				branches += s[j] === s[root+1] ? 1 : 0;
			}

			let term = ["1", "ω"][i - root] || (branches === 1 ? "ω^x" : "ω^(x)").replace("x", PrSStoCNF(s.slice(root+1, i+1))).replace(/\((\d+)\)/g, "$1");
			if (term === lastterm && i !== s.length) {
				coefficient += 1;
			} else {
				if (lastterm) {
					out += " + " + (coefficient === 1 ? lastterm : lastterm === "1" ? coefficient : lastterm + (lastterm === "ω" ? "" : "·") + coefficient);
				}
				lastterm = term;
				coefficient = 1;
			}
			root = i + 1;
		}
	}

	return out.substring(3);
}

function toSuperscript(n) {
	let s = "⁰¹²³⁴⁵⁶⁷⁸⁹";
	return n.toString().replace(/\d/g, function(x) {
		return s[parseInt(x)];
	});
}

// convert PSS expressions below BHO to Buchholz's OCF
function Buchholz(s) {
	let matrix = stringToMatrix(s);
	let subscripts = "₀₁";
	let expression = "ψ₀(0";
	let depth = 0;
	for (let i = 1; i < matrix.length; i++) {
		let level = matrix[i][0];
		let subscript = subscripts[matrix[i][1]];
		if (level > depth) {
			depth = depth + 1
			expression += "+ψ"+subscript+"(0";
		} else {
			expression += ")".repeat(depth-level+1);
			depth = level;
			expression += "+ψ"+subscript+"(0";
		}
	}
	expression = (expression+")".repeat(depth+1)).replace(/0\+/g, "");
	expression = expression.replace(/ψ₁\(0\)/g, "Ω");
	expression = expression.replace(/ψ₀\(0\)/g, "1");
	expression = expression.replace(/1\+[1+]*1/g, function(x) {
		return (x.length+1)/2;
	});
	expression = expression.replace(/ψ₁\(([Ω+]+)\)/g, function(_, x) {
		return "Ω"+toSuperscript((x.length+1)/2+1);
	});
	expression = expression.replace(/Ω\+[Ω+]*Ω/g, function(x) {
		return "Ω·"+((x.length+1)/2);
	});
	expression = expression.replace(/ψ₀\(Ω\)/g, "ε₀");
	expression = expression.replace(/ψ₀\(Ω²\)/g, "ζ₀");
	expression = expression.replace(/ψ₀\(Ω³\)/g, "η₀");
	expression = expression.replace(/ψ₁\(1\)/g, "Ω·ω");
	expression = expression.replace(/ψ₁\(Ω²\)/g, "Ω^Ω");
	expression = expression.replace(/ψ₀\(Ω\^Ω\)/g, "Γ₀");
	while (true) {
		let old = expression;
		expression = expression.replace(/ψ₁\((Ω\^[Ω\^]*Ω)\)/g, (_, x) => "Ω^"+x);
		if (expression == old) break;
	}
	expression = expression.replace(/ψ₀\(Ω\^Ω\^ω\)/g, "SVO");
	expression = expression.replace(/ψ₀\(Ω\^Ω\^Ω\)/g, "LVO");
	return expression;
}

function findAlias(PMSstring) {
	let PMSmatrix = stringToMatrix(PMSstring);
	let matrix = PMStoBMS(PMSmatrix);
	let BMSstring = matrixToString(matrix);
	if (BMS_aliases[BMSstring]) {
		return BMS_aliases[BMSstring];
	}
	
	if (matrixLessThan(matrix, stringToMatrix("(0,0)(1,1)"))) { // CNF
		let array = matrix.map(x => x[0]);
		return PrSStoCNF(array);
	} else {
		let terms = [];
		for (let i = 1; i < matrix.length; i++) {
			let isZero = true;
			for (let j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] !== 0) {
					isZero = false;
					break;
				}
			}
			if (isZero) {
				let a = findAlias(matrixToString(matrixReduce(PMSmatrix.slice(0, i))));
				let b = findAlias(matrixToString(matrixReduce(PMSmatrix.slice(i))));
				if (a && b) {
					return a + " + " + b;
				}
			}
		}
	}
	if (matrixLessThan(matrix, stringToMatrix("(0,0)(1,1)(2,2)"))) { // Buchholz's OCF below BHO
		let alias = Buchholz(BMSstring);
		if (alias) {
			return alias;
		}
	}
}