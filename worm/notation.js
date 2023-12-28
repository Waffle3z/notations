function arrayLessOrEqual(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return false;
		if (a[i] != b[i]) return a[i] < b[i];
	}
	return a.length <= b.length;
}

function expandRoot(n) {
	return [n+1];
}

function expandArray(s, n) {
	s = [...s];
	s.push(...Array(n).fill(s.pop()-1));
	return s;
}

function arrayIsSuccessor(array) {
	return array.length == 0 || array.at(-1) == 0;
}

function arrayToString(array) {
	return "("+JSON.stringify(array).slice(1,-1)+")";
}

function stringToArray(s) {
	return JSON.parse("["+s.slice(1,-1)+"]");
}