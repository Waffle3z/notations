// Veblen functions on EBOCF terms (ordinals/bocf.js), below ψ(Ω₂) = BHO for countable values.
//
// Dimensional Veblen: an array of entries α@X, where the position X is itself an array, read as
// the ordinal Σ Ω^Y·β over its entries β@Y. For countable coefficients,
//   φ(..., α@X, ..., γ@0) = Φ_E(γ),  E = Σ Ω^(-1+X)·α over the entries with X > 0,
// with Φ_E(γ) = ψ(Ω^E·(1+γ)) when nothing in the array is too large: φ(a,b) = φ(a@1, b@0),
// φ(1@2) = φ(1,0,0) = ψ(Ω^Ω) = Γ₀, φ(1@ω) = ψ(Ω^Ω^ω) = SVO, φ(1@(1,0)) = ψ(Ω^Ω^Ω) = LVO, and
// φ(1@(1@(1@...))) approaches ψ(Ω₂).
// In general ψ(U + Ω^E·a), with X = ψ(U) and U's exponents above E, is Φ_E(X+a) if X is a fixed
// point of Φ_E (φ(1, ζ₀+1) = ψ(Ω²+Ω)), Φ_E(a) if X = Φ_E(0) (Γ₀ = φ(Γ₀,0), so φ(Γ₀,1) =
// ψ(Ω^Ω + Ω^Γ₀); y = φ(2,0,0) = φ(1,y,0)), and Φ_E(-1+a) if Φ_E(0) > X (φ(1,y+1,0) =
// ψ(Ω^(Ω·2) + Ω^(Ω+y+1))).
// With coefficients below Ω_(ν+1), some at least Ω_ν, the same holds for ψ_ν in base Ω_(ν+1),
// starting from the fixed point X = Ω_ν: φ(1, Ω) = Ω, φ(1, Ω+1) = ε_(Ω+1) = ψ₁(Ω₂).

const Veblen = (() => {

const {ONE, isNat, cmp, add, sub, log, omega, digits, undigits, subscriptDigits, wrap, principal, runs} = BOCF;

const succ = v => add(v, ONE);
const level = t => t[0]?.[0] ?? [];

// positions are read in base Ω; at level ν they are written in base Ω_(ν+1)
const lift = (X, v) => !cmp(v, ONE) ? X : undigits(digits(X, ONE).map(([F, k]) => [lift(F, v), k]), v);
const unlift = (X, v) => !cmp(v, ONE) ? X : undigits(digits(X, v).map(([F, k]) => [unlift(F, v), k]), ONE);

// the coefficients of E in base Ω_v, and of its exponents
const components = (E, v) => digits(E, v).flatMap(([F, k]) => [k, ...components(F, v)]);

// How X = ψ_ν(U), with U's exponents above E, sits against Φ_E: "fixed" if Φ_E(X) = X,
// "first" if Φ_E(0) = X, "below" if Φ_E(0) > X.
function relation(E, X, v) {
	const lt = c => cmp(c, X) < 0, le = c => cmp(c, X) <= 0;
	if (components(E, v).every(lt)) return "fixed";
	// X is a common fixed point of the functions defining Φ_E: those that lower the last entry
	// α@P to some ξ < α and put the argument at a position below P
	const d = digits(E, v), [F, alpha] = d.at(-1);
	const first = components(undigits(d.slice(0, -1), v), v).every(lt) && le(alpha) &&
		components(F, v).every(cmp(alpha, ONE) ? lt : le);
	return first ? "first" : "below";
}

// the leading part of b whose digits in base Ω_v are above Ω_v^E; summands not below ε_(Ω_v+1)
// are above every E (e.g. φ(ψ(Ω₂+1), 0) = ψ(Ω₂+1))
function above(b, E, v) {
	let i = 0;
	while (i < b.length && (cmp(b[i][0], v) > 0 || !cmp(b[i][0], v) && !BOCF.below(b[i][1], v))) i++;
	return [...b.slice(0, i), ...undigits(digits(b.slice(i), v).filter(([F]) => cmp(F, E) > 0), v)];
}

// φ of an array of entries [α, X] (the α@X), X ≥ 0
function dimensional(entries) {
	entries = entries.filter(([a]) => a.length).sort((x, y) => cmp(y[1], x[1]));
	const beta = entries.find(([, X]) => !X.length)?.[0] ?? [];
	const hi = entries.filter(([, X]) => X.length);
	if (!hi.length) return omega(beta);
	const nu = entries.map(([a]) => level(a)).reduce((m, u) => cmp(u, m) > 0 ? u : m), v = succ(nu);
	const E = undigits(hi.map(([a, X]) => [lift(sub(X, ONE), v), a]), v);
	// the largest ψ_ν(U) at most γ or a component, with U's exponents above E
	let X = nu.length ? [[nu, []]] : null;
	for (const c of [beta, ...components(E, v)]) {
		const U = c.length && !cmp(level(c), nu) ? above(c[0][1], E, v) : [];
		if (U.length && (!X || cmp([[nu, U]], X) > 0)) X = [[nu, U]];
	}
	const rel = X ? relation(E, X, v) : "below";
	const a = rel == "fixed" ? sub(beta, X) : rel == "first" ? beta : add(ONE, beta);
	if (!a.length) return X; // φ is not in normal form: its value is X
	return [[nu, add(X?.[0][1] ?? [], undigits([[E, a]], v))]];
}

const phi = (a, b) => dimensional([[a, ONE], [b, []]]);

// Φ_E(β) for an exponent E in base Ω (countable coefficients)
const Phi = (E, beta) => dimensional([...digits(E, ONE).map(([F, a]) => [a, add(ONE, F)]), [beta, []]]);

// s as Φ_E(β) at level ν: {E (in base Ω_(ν+1)), arg: β, v}, or null if s is Ω_ν or too large
function decompose([nu, xi]) {
	const v = succ(nu), d = digits(xi, v);
	if (!d || nu.length && !xi.length) return null;
	if (!d.at(-1)?.[0].length) return {E: [], arg: log([nu, xi]), v};
	let X = nu.length ? [[nu, []]] : null, arg;
	d.forEach(([E, a], i) => {
		const rel = X ? relation(E, X, v) : "below";
		arg = rel == "fixed" ? add(X, a) : rel == "first" ? a : sub(a, ONE);
		X = [[nu, undigits(d.slice(0, i + 1), v)]];
	});
	return {E: d.at(-1)[0], arg, v};
}

// a countable summand s as Φ_E(β): {E, arg: β}, or null at or above ψ(Ω₂)
const veblenOf = s => s[0].length ? null : decompose(s);

// the entries [α, X] of s = φ(...), or null; at level ν > 0 an exponent digit whose own digits
// have coefficients above Ω would need a position array outside base-Ω normal form
function entriesOf(s) {
	const p = decompose(s);
	if (!p) return null;
	const d = digits(p.E, p.v), hi = d.map(([F, a]) => [a, add(ONE, unlift(F, p.v))]);
	if (hi.some(([, X], i) => !digits(X, ONE) || cmp(lift(sub(X, ONE), p.v), d[i][0]))) return null;
	return [...hi, [p.arg, []]];
}

// whether t is written entirely in Veblen form (with named, entirely with ω^, ε, ζ, η)
function fits(t, named) {
	return t.every(s => {
		const v = veblenOf(s);
		return v && (!named || isNat(v.E) && v.E.length <= 3) && fits(v.arg, named) && components(v.E, ONE).every(c => fits(c, named));
	});
}

// printing: φ(a,b,c) for up to 4 finite positions, α@X otherwise, and ω^, ε, ζ, η, Γ;
// with opts.named, only ω^, ε, ζ, η, and with opts.plain, only φ; a summand that doesn't fit stays in ψ form.
// With opts.relative, terms between Ω and Ω₂ are written the same way relative to Ω (see relativeStr).

function show(t, opts = {}) {
	if (opts.relative && !BOCF.countable(t) && t.every(([u]) => cmp(u, ONE) <= 0)) return relativeStr(t, opts);
	return BOCF.show(t, {...opts, countable: t => countableStr(t, opts)});
}

// Terms below Ω₂ in the style ε_(Ω+1)·ω, ζ_(Ω+1), Ω^Ω: a fixed point by its entries (entriesOf
// works at level 1), as ε, ζ, η (with opts.named, otherwise Γ and φ too; a summand that doesn't fit
// stays in ψ form); an ω-power ω^(E·δ+β), with E the largest epsilon above Ω at most its leading
// exponent summand, as E^δ·ω^β (ε_(Ω+1)·Ω, ε_(Ω+1)², ε_(Ω+1)^ε_(Ω+1)); below ε_(Ω+1), base-Ω
// Cantor normal form (Ω^3·ω, Ω^Ω).
function relativeStr(t, opts) {
	return runs(t).map(([s, k]) => {
		if (BOCF.isOne(s)) return String(k);
		const p = relativeSummand(s, opts);
		return k == 1 ? p : p + "·" + k;
	}).join("+") || "0";
}

const aboveEps = s => !BOCF.countable([s]) && !BOCF.below(s[1], ONE);
const sub1 = x => wrap(x, "+·^") == x ? "_" + x : "_{" + x + "}";

function relativeSummand(s, opts) {
	const named = opts.named;
	if (!aboveEps(s)) return show([s], {...opts, relative: false, cnf: true});
	const e = entriesOf(s);
	if (!e) return BOCF.show([s], {});
	const hi = e.filter(([, X]) => X.length), arg = e.find(([, X]) => !X.length)?.[0] ?? [];
	const argStr = relativeStr(arg, opts);
	if (hi.length == 1 && isNat(hi[0][0]) && isNat(hi[0][1])) {
		const a = hi[0][0].length, X = hi[0][1].length;
		if (X == 1 && a <= 3) return "εζη"[a - 1] + sub1(argStr);
		if (X == 2 && a == 1 && !named) return "Γ" + sub1(argStr);
	}
	if (hi.length && named) return BOCF.show([s], {cnf: true});
	if (hi.length && hi.every(([, X]) => isNat(X))) { // φ(a_n, ..., a_1, arg)
		const args = Array(Math.max(...hi.map(([, X]) => X.length)) + 1).fill("0");
		for (const [a, X] of hi) args[args.length - 1 - X.length] = relativeStr(a, opts);
		args[args.length - 1] = argStr;
		return "φ(" + args.join(",") + ")";
	}
	if (hi.length) return "φ(" + hi.map(([a, X]) => wrap(relativeStr(a, opts)) + "@" + wrap(relativeStr(X, opts))).join(",") + "," + argStr + ")";
	const E = arg[0] && epsilonUnder(arg[0]);
	if (!E) return "ω^" + wrap(argStr);
	let delta = [], beta = [];
	for (const a of arg) {
		const la = log(a);
		if (cmp(la, [E]) >= 0) delta = add(delta, omega(sub(la, [E])));
		else beta = add(beta, [a]);
	}
	const d = !cmp(delta, ONE) ? "" : "^" + wrap(relativeStr(delta, opts));
	return relativeSummand(E, opts) + d + (beta.length ? "·" + wrap(relativeStr(omega(beta), opts)) : "");
}

// the largest epsilon number above Ω at most the summand s (ε_(Ω+1)² gives ε_(Ω+1)), or null
function epsilonUnder(s) {
	if (!aboveEps(s)) return null;
	if (entriesOf(s)?.some(([, X]) => X.length)) return s;
	const l = log(s);
	return l.length ? epsilonUnder(l[0]) : null;
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
		if (!E.length && !arg.length) return "1";
		if (opts.plain) return `φ(${arrayStr(entriesOf(s))})`;
		if (!E.length) return !cmp(arg, ONE) ? "ω" : "ω^" + wrap(str(arg));
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
