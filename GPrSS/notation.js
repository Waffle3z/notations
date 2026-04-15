function compareSequences(seqA, seqB) {
	const len = Math.min(seqA.length, seqB.length);
	for (let i = 0; i < len; i++) {
		if (seqA[i].value !== seqB[i].value) return seqA[i].value < seqB[i].value ? -1 : 1;
		if (seqA[i].starred !== seqB[i].starred) return seqA[i].starred ? 1 : -1;
	}
	if (seqA.length < seqB.length) return -1;
	if (seqA.length > seqB.length) return 1;
	return 0;
}

function getSegmentsByStar(arr) {
	const n = arr.length;
	const used = new Array(n).fill(false);
	const segmentsList = [];
	let i = n - 1;
	while (i >= 0) {
		const item = arr[i];
		if (!item.starred) {
			if (!used[i]) {
				used[i] = true;
				segmentsList.push({ start: i, segment: [arr[i]] });
			}
			i--;
		} else {
			let cur = i;
			while (true) {
				let left = -1;
				for (let k = cur - 1; k >= 0; k--) { if (arr[k].value < arr[cur].value) { left = k; break; } }
				if (left === -1) break;
				if (!arr[left].starred) {
					if (!used[left]) {
						const seg = arr.slice(left, i + 1);
						used[left] = true;
						segmentsList.push({ start: left, segment: seg });
					}
					break;
				} else { cur = left; }
			}
			i--;
		}
	}
	segmentsList.sort((a,b) => a.start - b.start);
	const segments = segmentsList.map(s => s.segment);
	const startIndices = segmentsList.map(s => s.start);
	return { segments, startIndices };
}

function computeLeftLess(values) {
	const n = values.length;
	const leftLess = new Array(n).fill(-1);
	const stack = [];
	for (let i = 0; i < n; i++) {
		while (stack.length && values[stack[stack.length-1]] >= values[i]) stack.pop();
		leftLess[i] = stack.length ? stack[stack.length-1] : -1;
		stack.push(i);
	}
	return leftLess;
}

function getParentChain(values, leftLess) {
	const chain = [];
	let idx = values.length - 1;
	while (idx !== -1) {
		chain.push(idx);
		idx = leftLess[idx];
	}
	return chain;
}

function getSubsegmentByOrder(values, chain, l, n) {
	if (n > l) return [];
	const startIdx = chain[l - n];
	return values.slice(startIdx);
}

function compareSegmentsByOrder(segA, segB) {
	if (segA.length === 1 && segB.length === 1) return 0;
	if (segA.length === 1) return -1;
	if (segB.length === 1) return 1;
	const valsA = segA.map(x => x.value - segA[0].value);
	const valsB = segB.map(x => x.value - segB[0].value);
	const leftLessA = computeLeftLess(valsA);
	const leftLessB = computeLeftLess(valsB);
	const chainA = getParentChain(valsA, leftLessA);
	const chainB = getParentChain(valsB, leftLessB);
	const lA = chainA.length - 1;
	const lB = chainB.length - 1;
	if (lA === lB) {
		const n = lA - 1;
		if (n < 0) return 0;
		const subA = getSubsegmentByOrder(valsA, chainA, lA, n);
		const subB = getSubsegmentByOrder(valsB, chainB, lB, n);
		for (let i = 0; i < Math.min(subA.length, subB.length); i++) {
			if (subA[i] < subB[i]) return -1;
			if (subA[i] > subB[i]) return 1;
		}
		if (subA.length < subB.length) return -1;
		if (subA.length > subB.length) return 1;
		return 0;
	} else {
		const m = Math.min(lA, lB);
		const subA = getSubsegmentByOrder(valsA, chainA, lA, m);
		const subB = getSubsegmentByOrder(valsB, chainB, lB, m);
		for (let i = 0; i < Math.min(subA.length, subB.length); i++) {
			if (subA[i] < subB[i]) return -1;
			if (subA[i] > subB[i]) return 1;
		}
		if (subA.length < subB.length) return -1;
		if (subA.length > subB.length) return 1;
		return 0;
	}
}

function getValidRawWithEnd(seg, start, rawSeq) {
	const firstValSeg = seg[0].value;
	const segLen = seg.length;
	let legalEnd = start + segLen;
	while (legalEnd < rawSeq.length && rawSeq[legalEnd].value > firstValSeg) {
		legalEnd++;
	}
	let targetIdx = legalEnd;
	let minVal = Infinity;
	for (let i = start + segLen; i < legalEnd; i++) {
		const item = rawSeq[i];
		if (!item.starred && item.value > firstValSeg) {
			if (item.value < minVal) {
				minVal = item.value;
				targetIdx = i;
			}
		}
	}
	const validRaw = rawSeq.slice(start, targetIdx);
	return { raw: validRaw, endIdx: targetIdx };
}

function extendAndNormalize(rawSeq, start, segment) {
	const firstVal = segment[0].value;
	const normalized = segment.map(item => ({ value: item.value - firstVal, starred: item.starred }));
	let idx = start + segment.length;
	while (idx < rawSeq.length && rawSeq[idx].value > firstVal) {
		normalized.push({ value: rawSeq[idx].value - firstVal, starred: rawSeq[idx].starred });
		idx++;
	}
	return normalized;
}

function completeAndNormalize(rawSeq, start, segment, startToSegment) {
	const firstVal = segment[0].value;
	let resultNorm = [];
	let currentEndIdx;

	const { raw: firstRaw, endIdx: firstEnd } = getValidRawWithEnd(segment, start, rawSeq);
	for (const item of firstRaw) {
		resultNorm.push({ value: item.value - firstVal, starred: item.starred });
	}
	currentEndIdx = firstEnd;

	while (true) {
		if (currentEndIdx >= rawSeq.length) break;
		const nextItem = rawSeq[currentEndIdx];
		if (nextItem.starred || nextItem.value <= firstVal) break;
		const nextSeg = startToSegment.get(currentEndIdx);
		if (!nextSeg) break;

		const { raw: nextRaw, endIdx: nextEnd } = getValidRawWithEnd(nextSeg, currentEndIdx, rawSeq);
		if (nextRaw.length === 0) break;

		const nextNorm = nextRaw.map(item => ({ value: item.value - firstVal, starred: item.starred }));
		const cmp = compareCompletedWithTail(
			resultNorm, start, segment,
			nextNorm, currentEndIdx, nextSeg,
			rawSeq
		);

		if (cmp > 0) {
			resultNorm.push(...nextNorm);
			currentEndIdx = nextEnd;
		} else {
			break;
		}
	}

	return { normalized: resultNorm };
}

function compareCompletedWithTail(compA, startA, segA, compB, startB, segB, rawSeq) {
	const firstValA = segA[0].value;
	const firstValB = segB[0].value;

	function addTailStar(seq, start, firstVal) {
		const newSeq = seq.slice();
		let weak = false;
		const endPos = start + newSeq.length;
		if (endPos < rawSeq.length && !rawSeq[endPos].starred && rawSeq[endPos].value > firstVal) {
			newSeq.push({ value: rawSeq[endPos].value - firstVal, starred: true });
			weak = true;
		}
		return { seq: newSeq, weak };
	}

	function compareRecursive(seqA, startA, firstValA, seqB, startB, firstValB) {
		const { seq: extA, weak: weakA } = addTailStar(seqA, startA, firstValA);
		const { seq: extB, weak: weakB } = addTailStar(seqB, startB, firstValB);

		let idxA = -1;
		for (let i = extA.length - 1; i >= 0; i--) {
			if (!extA[i].starred) {
				let ok = true;
				for (let j = i+1; j < extA.length; j++) if (extA[i].value >= extA[j].value) { ok = false; break; }
				if (ok) { idxA = i; break; }
			}
		}
		if (idxA === -1) idxA = 0;
		let idxB = -1;
		for (let i = extB.length - 1; i >= 0; i--) {
			if (!extB[i].starred) {
				let ok = true;
				for (let j = i+1; j < extB.length; j++) if (extB[i].value >= extB[j].value) { ok = false; break; }
				if (ok) { idxB = i; break; }
			}
		}
		if (idxB === -1) idxB = 0;

		const trimmedA = extA.slice(idxA);
		const trimmedB = extB.slice(idxB);
		const cmp = compareSegmentsByOrder(trimmedA, trimmedB);
		if (cmp !== 0) return cmp;
		if (weakA !== weakB) return weakA ? -1 : 1;
		if (idxA === 0 && idxB !== 0) return -1;
		if (idxA !== 0 && idxB === 0) return 1;
		const prefixA = extA.slice(0, idxA);
		const prefixB = extB.slice(0, idxB);
		if (prefixA.length === 0 && prefixB.length === 0) return 0;
		if (prefixA.length === 0) return -1;
		if (prefixB.length === 0) return 1;
		return compareRecursive(prefixA, startA, firstValA, prefixB, startB, firstValB);
	}
	return compareRecursive(compA, startA, firstValA, compB, startB, firstValB);
}

function findBadRootForLength1(rawSeq, lastValue) {
	for (let i = rawSeq.length - 2; i >= 0; i--) {
		if (rawSeq[i].value < lastValue) {
			return i;
		}
	}
	return 0;
}

function getBadRoot(rawSeq, segments, startIndices, startToSegment, lastValue) {
	const lastIdx = rawSeq.length - 1;
	let lastSegIndex = -1;
	for (let idx = 0; idx < segments.length; idx++) {
		const seg = segments[idx];
		const segStart = startIndices[idx];
		const segEnd = segStart + seg.length - 1;
		if (segEnd === lastIdx) { lastSegIndex = idx; break; }
	}
	if (lastSegIndex === -1) lastSegIndex = segments.length - 1;
	const lastSegment = segments[lastSegIndex];
	const pendingRoots = [startIndices[lastSegIndex]];

	let currentSegIndex = lastSegIndex;
	let currentSeg = lastSegment;
	let targetSeg = lastSegment;
	let targetStart = startIndices[lastSegIndex];
	let targetExt = extendAndNormalize(rawSeq, targetStart, targetSeg);
	let targetComp = completeAndNormalize(rawSeq, targetStart, targetSeg, startToSegment);

	let found = false;
	let badRoot = null;

	for (let i = lastSegIndex - 1; i >= 0; i--) {
		const candSeg = segments[i];
		const candStart = startIndices[i];
		const valCurr = currentSeg[0].value;
		const valCand = candSeg[0].value;

		if (valCand > valCurr) {
			continue;
		}

		pendingRoots.push(candStart);
		const candExt = extendAndNormalize(rawSeq, candStart, candSeg);
		const candComp = completeAndNormalize(rawSeq, candStart, candSeg, startToSegment);
		const extLess = compareSequences(candExt, targetExt) < 0;
		const strengthLess = compareCompletedWithTail(
			candComp.normalized, candStart, candSeg,
			targetComp.normalized, targetStart, targetSeg,
			rawSeq
		) < 0;
		const condition = extLess && strengthLess;

		if (valCand < valCurr) {
			if (condition) {
				badRoot = pendingRoots.length >= 2 ? pendingRoots[pendingRoots.length-2] : pendingRoots[0];
				found = true;
				break;
			} else {
				if (extLess && !strengthLess) {
					targetSeg = candSeg;
					targetStart = candStart;
					targetExt = candExt;
					targetComp = candComp;
				}
				currentSegIndex = i;
				currentSeg = candSeg;
			}
		}
	}
	if (!found) {
		badRoot = pendingRoots[pendingRoots.length-1];
	}
	return badRoot;
}

function expandSequence(rawSeq, m) {
	const lastItem = rawSeq[rawSeq.length-1];
	const lastValue = lastItem.value;
	if (lastValue === 0) {
		return rawSeq.slice(0, -1);
	}

	const { segments, startIndices } = getSegmentsByStar(rawSeq);
	if (segments.length === 0) return rawSeq;

	const startToSegment = new Map();
	for (let i = 0; i < startIndices.length; i++) {
		startToSegment.set(startIndices[i], segments[i]);
	}

	const lastIdx = rawSeq.length - 1;
	let lastSegment = null, lastSegLen = 0, lastSegIndex = null;
	for (let idx = 0; idx < segments.length; idx++) {
		const segStart = startIndices[idx];
		const segEnd = segStart + segments[idx].length - 1;
		if (segEnd === lastIdx) { lastSegment = segments[idx]; lastSegLen = segments[idx].length; lastSegIndex = idx; break; }
	}
	if (lastSegment === null) { lastSegment = segments[segments.length - 1]; lastSegLen = lastSegment.length; lastSegIndex = segments.length - 1;}

	let badRootIndex;
	if (lastSegLen === 1) {
		badRootIndex = findBadRootForLength1(rawSeq, lastValue);
	} else {
		badRootIndex = getBadRoot(rawSeq, segments, startIndices, startToSegment, lastValue);
	}
	const badRootVal = rawSeq[badRootIndex].value;

	const G = rawSeq.slice(0, badRootIndex);
	const B0 = rawSeq.slice(badRootIndex, rawSeq.length - 1);
	let d;
	if (lastSegLen === 1) { d = lastValue - badRootVal - 1; }
	else { d = lastValue - badRootVal; }

	let resultSeq = [...G];
	for (let n = 0; n <= m; n++) {
		const offset = n * d;
		const Bn = B0.map(item => ({ value: item.value + offset, starred: item.starred }));
		resultSeq = resultSeq.concat(Bn);
	}

	return resultSeq;
}

function toPsi(seq) {
	let out = "";
	seq.forEach((x, i) => {
		let v = 0;
		out += x.starred ? "1" : "0";
		if (i+1 < seq.length) {
			let n = seq[i+1].value - x.value;
			if (n < 0) {
				out += ")".repeat(-n) + "+";
			} else if (n == 0) {
				out += "+";
			} else {
				out += "(";
			}
		} else {
			out += ")".repeat(x.value);
		}
	});
	return out;
}

class notation {
	static title = "GPrSS-UPS";
	static header = "Grouped PrSS - Upper Projection Sequence";
	static footer = "<a href='https://discord.com/channels/206932820206157824/209051725741424641/1494037672291991703'>Definition</a> by alice_52892";

	static lessOrEqual(a, b) {
		return compareSequences(a, b) <= 0;
	}

	static expandLimit(n) {
		if (notation.offset) {
			let seq = [{ value: 0, starred: false }];
			for (let i = 1; i <= n; i++) {
				seq.push({ value: i, starred: true });
			}
			return seq;
		}
		let seq = [{ value: 0, starred: false }, { value: 1, starred: false }];
		for (let i = 2; i <= n; i++) {
			seq.push({ value: i, starred: true });
		}
		return seq;
	}

	static expand(seq, n) {
		return expandSequence(seq, n);
	}

	static isSuccessor(seq) {
		if (seq.length === 0) return true;
		return seq[seq.length - 1].value === 0;
	}

	static toString(seq) {
		if (seq.length === 0) return "∅";
		return seq.map(item => item.starred ? item.value + '*' : item.value).join(',');
	}

	static fromString(s) {
		if (!s.trim() || s === "∅") return [];
		const parts = s.split(',').map(s => s.trim());
		return parts.map(part => {
			let starred = false;
			if (part.endsWith('*')) { starred = true; part = part.slice(0, -1); }
			const value = parseInt(part, 10);
			if (isNaN(value)) throw new Error(`Invalid number: ${part}`);
			return { value, starred };
		});
	}

	static convertToNotation(value) {
		const seq = notation.fromString(value);
		if (seq.length === 0) return "∅";
		if (notation.psi) return toPsi(seq);
		const sep = notation.commas ? (notation.spaced ? ', ' : ',') : ' ';
		return seq.map(item => item.starred ? item.value + '*' : item.value).join(sep);
	}

	static spaced = true;
	static commas = true;
	static psi = false;
	static offset = false;

	static parameters = [
		{type: "checkbox", label: "Commas", id: "commas", visibleIf: () => !notation.psi},
		{type: "checkbox", label: "Spaced", id: "spaced", visibleIf: () => notation.commas && !notation.psi},
		{type: "checkbox", label: "Psi", id: "psi"},
		{type: "checkbox", label: "Offset", id: "offset", url: true},
	]
};