class notation {
	static title = "TωMN";
	static header = "Transfinite ω Mountain Notation";
	static address = false;
	
	static parameters = [
		{type: "checkbox", id: "address", label: "Address notation"},
	]
	
	static lessOrEqual(a, b) {
		if (!a || a.length === 0) return true;
		return mountain_compare(a, b) <= 0;
	}

	static expandLimit(n) {
		return n > 0 ? [[], [[1, this.expandLimit(n - 1)]]] : [[]];
	}

	static expand(a, n) {
		if (!a || a.length === 0) return [];
		return expand(a, n);
	}

	static isSuccessor(array) {
		if (!array || array.length === 0) return true;
		return !mountain_is_limit(array);
	}
 
	static toString(array) {
		return JSON.stringify(array);
	}

	static fromString(s) {
		return JSON.parse(s);
	}

	static convertToNotation(s) {
		return mountain_display(notation.fromString(s), notation.address);
	}
}
