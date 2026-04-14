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

function prepareSegment(seg, start, rawSeq) {
	const firstVal = seg[0].value;
	let extendedSeg = seg.slice();
	let isWeak = false;
	const nextIdx = start + seg.length;
	if (nextIdx < rawSeq.length && !rawSeq[nextIdx].starred && rawSeq[nextIdx].value > firstVal) {
		extendedSeg = extendedSeg.concat([{ value: rawSeq[nextIdx].value, starred: true }]);
		isWeak = true;
	}
	return { segment: extendedSeg, isWeak };
}

function compareSegmentsWithTailPreparation(segA, startA, segB, startB, rawSeq) {
	const prepA = prepareSegment(segA, startA, rawSeq);
	const prepB = prepareSegment(segB, startB, rawSeq);
	const cmp = compareSegmentsByOrder(prepA.segment, prepB.segment);
	if (cmp !== 0) return cmp;
	if (prepA.isWeak && !prepB.isWeak) return -1;
	if (!prepA.isWeak && prepB.isWeak) return 1;
	return 0;
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
	const normalized = segment.map(item => ({ value: item.value - firstVal, starred: item.starred }));
	let pos = start + segment.length;
	let lastStart = start;
	let lastSeg = segment;
	while (true) {
		const nextSeg = startToSegment.get(pos);
		if (!nextSeg) break;
		if (nextSeg[0].value <= firstVal) break;
		const cmp = compareSegmentsWithTailPreparation(nextSeg, pos, lastSeg, lastStart, rawSeq);
		if (cmp <= 0) {
			for (const item of nextSeg) {
				normalized.push({ value: item.value - firstVal, starred: item.starred });
			}
			lastStart = pos;
			lastSeg = nextSeg;
			pos += nextSeg.length;
		} else {
			break;
		}
	}
	return { normalized, endPos: pos };
}

function compareCompletedWithTail(compA, startA, segA, compB, startB, segB, rawSeq) {
	const firstValA = segA[0].value;
	const firstValB = segB[0].value;
	const endPosA = startA + compA.length;
	const endPosB = startB + compB.length;

	let extendedA = compA.slice();
	let extendedB = compB.slice();
	let weakA = false, weakB = false;

	if (endPosA < rawSeq.length && !rawSeq[endPosA].starred && rawSeq[endPosA].value > firstValA) {
		extendedA.push({ value: rawSeq[endPosA].value - firstValA, starred: true });
		weakA = true;
	}
	if (endPosB < rawSeq.length && !rawSeq[endPosB].starred && rawSeq[endPosB].value > firstValB) {
		extendedB.push({ value: rawSeq[endPosB].value - firstValB, starred: true });
		weakB = true;
	}

	const cmp = compareSegmentsByOrder(extendedA, extendedB);
	if (cmp !== 0) return cmp;
	if (weakA && !weakB) return -1;
	if (!weakA && weakB) return 1;
	return 0;
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

class notation {
	static title = "GPrSS-UPS";
	static header = "Grouped PrSS - Upper Projection Sequence";
	static footer = "<a href='https://discord.com/channels/206932820206157824/209051725741424641/1493680618762932355'>Definition</a> by alice_52892";

	static lessOrEqual(a, b) {
		return compareSequences(a, b) <= 0;
	}

	static expandLimit(n) {
		const seq = [{ value: 0, starred: false }];
		for (let i = 1; i <= n; i++) {
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
		return seq.map(item => item.starred ? item.value + '*' : item.value).join(', ');
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
		return notation.toString(notation.fromString(value));
	}
};