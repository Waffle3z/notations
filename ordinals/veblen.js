// Veblen functions on EBOCF terms (ordinals/bocf.js), below ψ(Ω₂) = BHO.
//
// Dimensional Veblen: an array of entries α@X, where the position X is itself an array, read as
// the ordinal Σ Ω^Y·β over its entries β@Y. Then
//   φ(..., α@X, ..., γ@0) = ψ(Ω^E·(1+γ)),  E = Σ Ω^(-1+X)·α over the entries with X > 0,
// so φ(a,b) = φ(a@1, b@0), φ(1@2) = φ(1,0,0) = ψ(Ω^Ω) = Γ₀, φ(1@ω) = ψ(Ω^Ω^ω) = SVO,
// φ(1@(1,0)) = ψ(Ω^Ω^Ω) = LVO, and φ(1@(1@(1@...))) approaches ψ(Ω₂).
// Past the first digit, ψ(U + Ω^E·a) with X = ψ(U) is Φ_E(γ₀ + (-1+a)), where γ₀ is the least γ
// with Φ_E(γ) > X: γ₀ = X+1 when X is a fixed point of Φ_E (φ(1, ζ₀+1) = ψ(Ω²+Ω)), but e.g.
// Γ₀ = φ(Γ₀,0) gives φ(Γ₀,1) = ψ(Ω^Ω + Ω^Γ₀) and φ(Γ₀+1,0) = ψ(Ω^Ω + Ω^(Γ₀+1)).

const Veblen = (() => {

const {ONE, isNat, cmp, add, sub, log, omega, digits, undigits, subscriptDigits, wrap, principal, runs} = BOCF;

// the ψ₀-arguments occurring in t
function psiArgs(t, out = []) {
	for (const [u, b] of t) {
		if (!u.length && b.length) out.push(b);
		psiArgs(u, out);
		psiArgs(b, out);
	}
	return out;
}

// β with s = Φ_E(β), or null
function rangeIndex(s, E) {
	const v = veblenOf(s);
	if (!v) return null;
	const c = cmp(v.E, E);
	if (c == 0) return v.arg;
	if (c < 0) return null;
	// s is a fixed point of Φ_E when E is built below it, and Φ_E(0) = s when E = s (φ(Γ₀,0) = Γ₀)
	if (psiArgs(E).every(p => cmp(p, s[1]) < 0)) return [s];
	return cmp(E, [s]) ? null : [];
}

// the least γ with Φ_E(γ) > β
function above(beta, E) {
	if (!beta.length) return [];
	const s = beta[0], i = rangeIndex(s, E);
	if (i) return add(i, ONE);
	const v = veblenOf(s);
	return v && cmp(v.E, E) < 0 ? above(v.arg, E) : []; // otherwise Φ_E(0) > s
}

// Φ_E(β) = ψ(Ω^E·(1+β)), Φ_0(β) = ω^β: the (1+β)-th common fixed point of Φ_F for F < E.
// ψ's argument starts with the digits above E of the largest ψ-argument in E and β, so that
// the term is standard.
function Phi(E, beta) {
	if (!E.length) return omega(beta);
	const args = psiArgs([[E, beta]]);
	const M = args.reduce((m, p) => cmp(p, m) > 0 ? p : m, []);
	const d = digits(M, ONE) ?? [];
	for (let k = d.filter(([F]) => cmp(F, E) > 0).length; k >= 0; k--) {
		const U = undigits(d.slice(0, k), ONE);
		const g = U.length ? above([[[], U]], E) : [];
		if (cmp(beta, g) >= 0) return [[[], add(U, undigits([[E, add(ONE, sub(beta, g))]], ONE))]];
		const i = rangeIndex([[], U], E);
		if (i && !cmp(i, beta)) return [[[], U]];
	}
	return [[[], undigits([[E, add(ONE, beta)]], ONE)]];
}

const phi = (a, b) => Phi(a, b);

// φ of an array of entries [α, X] (the α@X), X ≥ 0
function dimensional(entries) {
	const sorted = entries.filter(([a]) => a.length).sort((x, y) => cmp(y[1], x[1]));
	const E = undigits(sorted.filter(([, X]) => X.length).map(([a, X]) => [sub(X, ONE), a]), ONE);
	return Phi(E, sorted.find(([, X]) => !X.length)?.[0] ?? []);
}

// a countable summand s as Φ_E(β): {E, arg: β}, or null at or above ψ(Ω₂)
function veblenOf(s) {
	const d = !s[0].length && digits(s[1], ONE);
	if (!d) return null;
	const last = d.at(-1);
	if (!last?.[0].length) return {E: [], arg: log(s)};
	const U = undigits(d.slice(0, -1), ONE);
	return {E: last[0], arg: add(U.length ? above([[[], U]], last[0]) : [], sub(last[1], ONE))};
}

// the entries [α, X] of s = φ(...), or null
function entriesOf(s) {
	const v = veblenOf(s);
	return v && [...digits(v.E, ONE).map(([F, a]) => [a, add(ONE, F)]), [v.arg, []]];
}

// whether t is written entirely in Veblen form (with named, entirely with ω^, ε, ζ, η)
function fits(t, named) {
	const coefs = X => digits(X, ONE).every(([F, a]) => fits(a, named) && coefs(F));
	return t.every(s => {
		const v = veblenOf(s);
		return v && (!named || isNat(v.E) && v.E.length <= 3) && fits(v.arg, named) && coefs(v.E);
	});
}

// printing: φ(a,b,c) for up to 4 finite positions, α@X otherwise, and ω^, ε, ζ, η, Γ;
// with opts.named, only ω^, ε, ζ, η; a summand that doesn't fit stays in ψ form

function show(t, opts = {}) {
	return BOCF.show(t, {...opts, countable: t => countableStr(t, opts)});
}

function countableStr(t, opts) {
	const str = x => show(x, opts);
	const arrayStr = entries => { // [α, X] in decreasing X
		const finite = entries.every(([, X]) => isNat(X) && X.length < 4);
		if (finite) {
			const args = Array(entries[0][1].length + 1).fill("0");
			for (const [a, X] of entries) args[args.length - 1 - X.length] = str(a);
			return args.join(",");
		}
		return entries.filter(([a]) => a.length).map(([a, X]) => X.length ? wrap(str(a)) + "@" + posStr(X) : str(a)).join(",");
	};
	const posStr = X => X.every(([u]) => !u.length) ? str(X) : `(${arrayStr(digits(X, ONE).map(([F, a]) => [a, F]))})`;
	const phiStr = s => {
		if (!fits([s], opts.named)) return principal(s, {...opts, countable: x => countableStr(x, opts)});
		const {E, arg} = veblenOf(s);
		const name = (letter, x) => letter + (isNat(x) ? subscriptDigits(x.length) : "_" + wrap(str(x), "+·^"));
		if (!E.length) return !arg.length ? "1" : !cmp(arg, ONE) ? "ω" : "ω^" + wrap(str(arg));
		if (isNat(E) && E.length <= 3) return name("εζη"[E.length - 1], arg);
		if (!cmp(E, [[ONE, []]])) return name("Γ", arg);
		return `φ(${arrayStr(entriesOf(s))})`;
	};
	return runs(t).map(([s, k]) => {
		const p = phiStr(s);
		return k == 1 ? p : p == "1" ? String(k) : p + "·" + k;
	}).join("+") || "0";
}

return {Phi, phi, dimensional, veblenOf, entriesOf, show};

})();
