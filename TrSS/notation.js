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
	static title = "Triangular Sequence System";
	static footer = "<a href='viewer.html'>Row Viewer</a>";

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
		let parents = [copy];
		while (typeof(parents.at(-1).at(-1)) != "number") {
			parents.push(parents.at(-1).at(-1));
		}
		parents.at(-1).pop();
		while (parents.at(-1).length == 0) {
			parents.pop();
			if (parents.length == 0) return [0];
			parents.at(-1).pop();
		}
		if (n == 0) return copy;

		let a = flatten(tree);
		function parent(ind) {
			return a.findLastIndex((v, i) => (i < ind || i == 0) && (v == 0 || v < a[ind]));
		}
		let cutNode = a.at(-1);
		let root = a.length - 1;
		let diff = cutNode - a[parent(a.length - 1)];
		let delta = 0;
		for (let i = 0; i < diff; i++) {
			if (a[root] == 0) {
				delta++;
			} else {
				root = parent(root);
			}
		}
		let badPart = a.slice(root, -1);
		let increment = cutNode - a[root] - 1;
		if (delta == 0) {
			for (let i = 1; i <= n; i++) {
				parents.at(-1).push(badPart.map(v => v + increment*i));
			}
		} else {
			parents.at(-1).push(badPart.map(v => v + increment));
			for (let i = 2; i <= n; i++) {
				let array = flatten(parents);
				let ancestors = [array.length - 1];
				while (true) {
					let last = ancestors.at(-1);
					let p = array.findLastIndex((x, j) => j < last && x < array[last]);
					if (p == -1) break;
					ancestors.push(p);
				}
				let offset = array[array.length - 1] + ancestors.length + (delta - 1);
				parents.at(-1).push(badPart.map(v => v + offset));
			}
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