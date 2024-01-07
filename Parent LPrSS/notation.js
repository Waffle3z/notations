function flatten(x) {
	let a = [];
	function recurse(x) {
		for (let i = 0; i < x.length; i++) {
			if (typeof(x[i]) == "number") {
				a.push(x[i]);
			} else {
				recurse(x[i]);
			}
		}
	}
	recurse(x);
	return a;
}

class notation {
	static title = "Parent Sequence";

	static lessOrEqual(a, b) {
		a = flatten(a);
		b = flatten(b);
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0, n+1];
	}

	static expand(tree, n) {
		let copy = JSON.parse(JSON.stringify(tree));
		let a = [];
		let parents = [copy];
		function recurse(x, y) {
			for (let i = 0; i < x.length; i++) {
				if (typeof(x[i]) == "number") {
					a.push(x[i]);
				} else {
					if (y && i == x.length-1) {
						parents.push(x[i]);
						recurse(x[i], true);
					} else {
						recurse(x[i], false);
					}
				}
			}
		}
		recurse(copy, true);
		function parent(ind) {
			return a.findLastIndex((v, i) => (i < ind || i == 0) && (v == 0 || v < a[ind]));
		}
		let root = parent(a.length - 1);
		let cutNode = a.pop();
		let diff = cutNode - a[root];
		for (let i = 1; i < diff; i++) {
			root = parent(root);
			if (root == 0) break;
		}
		let delta = cutNode - a[root] - 1;
		let badPart = a.slice(root);
		parents.at(-1).pop();
		while (parents.at(-1).length == 0) {
			parents.pop();
			parents.at(-1).pop();
		}
		for (let i = 1; i <= n; i++) {
			let next = badPart.map(v => v + delta*i);
			a = a.concat(next);
			parents.at(-1).push(next);
		}
		return copy;
	}

	static isSuccessor(tree) {
		let array = flatten(tree);
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(tree) {
		return JSON.stringify(tree);
	}

	static fromString(s) {
		return JSON.parse(s);
	}

	static convertToNotation(value) {
		let tree = notation.fromString(value);
		if (!settings.advanced) {
			return flatten(tree).join(",");
		}
		return value;
	}
};

settings.advanced = true;

document.addEventListener("DOMContentLoaded", () => {
	const advancedCheckbox = document.getElementById("advanced");
	advancedCheckbox.addEventListener('change', function() {
		settings.advanced = advancedCheckbox.checked;
		refreshTerms();
	});
});