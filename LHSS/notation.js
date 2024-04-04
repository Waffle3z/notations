class notation {
	static title = "LHSS";
	static header = "Large Hyper Sequence System";

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

	// https://discord.com/channels/206932820206157824/925849203790458950/1225288098880028742
	static expand(M, n) {
		if (M.length === 0) return [];
		let out = [...M];
		let cutNode = out.pop();
		if (cutNode === 0) return out;
		let p = M.findLastIndex(x => x < cutNode);
		let r = p;
		while (r > 0) {
			if (M[r] > M[p]) {
				r--;
				continue;
			}
			if (M[r - 1] < M[p]) break;
			if (r != p) {
				let h = M.findLastIndex((x, i) => x > M[p] && i > r);
				if (M.slice(r, h + 1) < M.slice(p)) {
					break;
				}
			}
			r--;
		}
		let badPart = out.slice(r);
		if (badPart < [0,0,1]) badPart = [0];
		let increment = cutNode - M[r] - 1;
		for (let i = 1; i <= n; i++) {
			out.push(...badPart.map(j => j + increment * i));
		}
		if (out.at(-1) === 0) out.pop();
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

	static convertToNotation(value) {
		if (value === "") return "∅";
		return value;
	}
};