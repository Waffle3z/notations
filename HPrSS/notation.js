class notation {
	static title = "HPrSS";
	
	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0,n+1];
	}

	static expand(a, n) {
		function parent(n) {
			if (a[n] === 0) return 0;
			let r = n;
			while (a[r] >= a[n]) r--;
			return r;
		}

		let root = parent(a.length-1);
		if (a[root] == a[a.length-1]-1) {
			let out = a.slice(0, root);
			let badPart = a.slice(root, -1);
			for (let i = 0; i < n; i++) {
				out = out.concat(badPart);
			}
			return out;
		}

		let differences = a.map((v, i) => v - a[parent(i)]);

		let q = [];
		for (let i = 0; i < a.length; i++) {
			if (differences[i] < differences[a.length-1]) q.push(i);
		}
		root = a.length-1;
		while (root != 0 && !q.includes(root)) root = parent(root);

		let diff = a[a.length-1] - a[root] - 1;
		let out = a.slice(0, root);
		let badPart = a.slice(root, -1);
		for (let i = 0; i < n; i++) {
			out = out.concat(badPart.map((j) => j + diff * i));
		}

		return out;
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return "("+JSON.stringify(array).slice(1,-1)+")";
	}

	static fromString(s) {
		return JSON.parse("["+s.slice(1,-1)+"]");
	}
};