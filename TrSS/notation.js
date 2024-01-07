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
			parents.at(-1).pop();
		}

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
		let increment = cutNode - a[root] - 1;
		let badPart = a.slice(root, -1);
		let badPartHeight = 1;
		let bottom = badPart.length - 1;
		while (bottom > 0) {
			bottom = badPart.findLastIndex((v, i) => i < bottom && v < badPart[bottom]);
			badPartHeight++;
		}

		for (let i = 1; i <= n; i++) {
			if (delta == 0) {
				parents.at(-1).push(badPart.map(v => v + increment*i));
			} else {
				let offset = increment;
				if (i > 1) {
					let last = flatten(copy).at(-1);
					offset = last + delta + badPartHeight * (i - 1);
				}
				parents.at(-1).push(badPart.map(v => v + offset));
				increment += i + delta;
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