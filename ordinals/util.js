// Small helpers shared by several explorers. A notation that uses them lists ordinals/util.js on
// its "// requires:" line, before any library that needs it.

const Util = (() => {

// a < b for sequences of numbers in lexicographic order, a proper prefix being smaller
function lexLess(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return false;
		if (a[i] != b[i]) return a[i] < b[i];
	}
	return a.length < b.length;
}

// compares matrix columns: -1 if a < b, 0 if a == b, 1 if a > b
function arrayCompare(a, b) {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (a[i] != b[i]) return (a[i] || 0) < (b[i] || 0) ? -1 : 1;
	}
	return a.length < b.length ? -1 : a.length == b.length ? 0 : 1;
}

return {lexLess, arrayCompare};

})();
