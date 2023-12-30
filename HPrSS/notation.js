class notation {
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
		function p(n) {
			if (n === 0) return 0;
			let r = n;
			while (a[r] >= a[n]) r--;
			return r;
		}
		let r = p(a.length-1);
		if (a[r] == a[a.length-1]-1) return [...a.slice(0, r), ...Array(n).fill(a.slice(r, -1)).flat()];

		let t = a.map((v, i) => v - a[p(i)]); // differential sequence
		let q = [];
		for (let i = 0; i < a.length; i++) {
			if (t[i] < t[a.length-1]) q.push(i);
		}
		let k = [a.length-1];
		while (k[k.length-1] != 0) k.push(p(k[k.length-1]));
		r = Math.max(...q.filter((v) => k.includes(v)));

		let d = a[a.length-1] - a[r] - 1;
		let o = a.slice(0, r);
		for (let i = 0; i < n; i++) {
			o = o.concat(a.slice(r, -1).map((j) => j + d * i));
		}

		return o;
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