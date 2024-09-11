class notation {
	static title = "TrSS worm";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		let sequence = [0, n+1];
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
		let delta = Math.max(0, parentDifference - ancestry.length + 1);
		if (delta == 0) {
			let root = a[ancestry[1]];
			let increment = parentDifference - 1;
			for (let i = 1; i <= n; i++) {
				out.push(root + increment * i);
			}
		} else {
			out.push(cutNode - 1);
			let ancestryLength = 0;
			let currentAncestor = out.length - 1;
			while (currentAncestor > 0) {
				ancestryLength++;
				currentAncestor = out.findLastIndex((v, i) => i < currentAncestor && v < out[currentAncestor]);
			}
			for (let i = 1; i < n; i++) {
				out.push(out.at(-1) + ancestryLength + i + delta - 1);
			}
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