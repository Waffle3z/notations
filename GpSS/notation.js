let maxAncestors = 2;
let version = "default";
const ancestorsChangedEvent = new Event("ancestorsChanged");
document.addEventListener("DOMContentLoaded", () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const requestedAncestors = Number(urlParams.get("ancestors"));
	if (urlParams.get("ancestors") != null && !isNaN(requestedAncestors) && requestedAncestors >= 1) {
		maxAncestors = requestedAncestors;
		document.dispatchEvent(ancestorsChangedEvent);
	}
});

document.addEventListener("ancestorsChanged", () => {
	const headerElement = document.body.querySelector("h2");
	if (!headerElement) return;
	if (maxAncestors == 1) {
		headerElement.innerText = "Large Primitive Sequence System";
	} else {
		headerElement.innerText = ("Great ").repeat(maxAncestors - 2) + "Grandparent Sequence System";
	}
});

class notation {
	static title = "Grandparent Sequence System";
	static footer = "<a href='viewer.html'>Row Viewer</a>";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		let sequence = [0];
		for (let add = 1; add < maxAncestors; add++) {
			sequence.push(sequence.at(-1) + add);
		}
		sequence.push(n + maxAncestors);
		return sequence;
	}

	static expand(a, n) {
		if (a.length == 1) return a;
		let out = [...a];
		let cutNode = out.pop();
		let ancestry = [a.length-1];
		while (true) {
			let current = ancestry.at(-1);
			let parent = a.findLastIndex((v, i) => i < current && v < a[current]);
			if (parent == -1) break;
			ancestry.push(parent);
		}
		if (ancestry.length == 1) {
			return out;
		}
		let parentDifference = cutNode - a[ancestry[1]];
		let root = ancestry[Math.min(maxAncestors, parentDifference)];
		let increment = cutNode - a[root] - 1;
		let badPart = out.slice(root);
		for (let i = 1; i <= n; i++) {
			out.push(...badPart.map(v => v + increment * i));
		}
		return out;
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return JSON.stringify(array).slice(1,-1);
	}

	static fromString(s) {
		return JSON.parse("["+s+"]");
	}
};