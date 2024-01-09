let offset = 0;
let version = "default";
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(function() { // hack in an optional offset parameter
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const requestedOffset = Number(urlParams.get("offset"));
		let title = document.head.querySelector("title");
		let h2 = document.body.querySelector("h2");
		if (requestedOffset) {
			offset = requestedOffset;
			if (title) title.innerText = `MSS ${offset}`;
			if (h2) h2.innerText = `MSS (offset: ${offset})`;
		}
		const requestedVersion = urlParams.get("version");
		if (requestedVersion) {
			version = requestedVersion;
			if (title) title.innerText = `MSS ${version} ${offset}`;
			if (h2) h2.innerText = `MSS (version: ${version} offset: ${offset})`;
		}
	}, 1);
});


class notation {
	static title = "MSS";
	static header = "Mean Sequence System";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0, n+1];
	}

	static expand(a, n) {
		function parent(ind) {
			return a.findLastIndex((v, i) => (i < ind || i == 0) && (v == 0 || v < a[ind]));
		}
		let root = parent(a.length - 1);
		let cutNode = a.pop();
		let lastDifference = cutNode - a[root];
		let lastDistance = a.length - root;
		if (version == "default") {
			while (root > 0) {
				let p = parent(root);
				let difference = cutNode - a[p];
				let distance = a.length - p;
				// difference/distance < lastDifference/lastDistance
				if (difference*(lastDistance+offset) < lastDifference*(distance+offset)) break;
				root = p;
			}
		} else if (version == "parent") {
			while (root > 0) {
				let p = parent(root);
				let difference = cutNode - a[p];
				let distance = root - p;
				// difference/distance < lastDifference/lastDistance
				if (difference*(lastDistance+offset) < lastDifference*(distance+offset)) break;
				root = p;
				lastDifference = difference;
				lastDistance = distance;
			}
		}
		let delta = cutNode - a[root] - 1;
		let badPart = a.slice(root);
		for (let i = 1; i <= n; i++) {
			a = a.concat(badPart.map(v => v + delta*i));
		}
		return a;
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return array.join(",");
	}

	static fromString(s) {
		return JSON.parse("["+s+"]");
	}
};