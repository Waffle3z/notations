class notation {
	static title = "x-Y sequence";
	static header = "CatIsFluffy's x-Y sequence";
	static footer = "<a href='https://discord.com/channels/206932820206157824/614633397649670145/1215386303139545128'>Definition</a> by CatIsFluffy";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [1, n+2];
	}

	static expand(s, n) {
		if (n == 0) {
			return s.slice(0, -1);
		}
		let current = [...s];
		for (let i = 0; i < n; i++) {
			current = extend(current);
		}
		return current.slice(0, -1);
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 1;
	}

	static toString(array) {
		return JSON.stringify(array).slice(1,-1);
	}

	static fromString(s) {
		return JSON.parse("["+s+"]");
	}
}

var memo={}
function wy(seq,el){
	if(!memo[seq+","+el]){
		var seq2=seq.slice()
		for(var i=0;i<el;i++){
			seq2=extend2(thing2(seq2)[0])
		}
		seq2.pop()
		memo[seq+","+el]=seq2
	}
	return memo[seq+","+el]
}
rowseq=wy
function prsssplitterms(seq){
	var ret=[]
	var term
	for(var i of seq){
		if(i==1){
			term=[]
			ret.push(term)
		}else{
			term.push(i)
		}
	}
	return ret
}
splitterms=prsssplitterms
function prssjointerms(seq){
	var ret=[]
	for(var i of seq){
		ret.push(1)
		ret=ret.concat(i)
	}
	return ret
}
jointerms=prssjointerms
// a+(-b+c) for b<c
function addunadd(a,b,c){
	var as=splitterms(a)
	var bs=splitterms(b)
	var cs=splitterms(c)
	var bcs=[]
	// terms removed from c by b
	var drops=0
	for(var i=0;i<bs.length;i++){
		if(comparearrays(bs[i],cs[i])<0){
			break
		}
		drops++
	}
	bcs=cs.slice(drops)
	if(bcs.length==0){
		return a
	}
	var ret=[]
	for(var i=0;i<as.length;i++){
		if(comparearrays(as[i],bcs[0])<0){
			break
		}
		ret.push(as[i])
	}
	return jointerms(ret.concat(bcs))
}
function parseseq(seq){
	var ret=seq.split(",").map(x=>parseInt(x))
	return ret
}
function comparearrays(a,b){
	for(var i=0;i<Math.min(a.length,b.length);i++){
		if(a[i]>b[i]){
			return 1
		}
		if(a[i]<b[i]){
			return -1
		}
	}
	return (a.length>b.length)-(a.length<b.length)
}
function maxrowbelow(mountain,column,row,inclusive){
	var lastrow=[]
	for(var i in mountain[column]){
		var ai=parseseq(i)
		// lexicographic compare ai and row
		// todo: use comparearrays
		// return lastrow if ai>row
		var checklens=1
		for(var j=0;j<Math.min(ai.length,row.length);j++){
			if(ai[j]>row[j]){
				return lastrow
			}else if(ai[j]<row[j]){
				checklens=0
				break
			}
		}
		if(checklens){
			if(ai.length>row.length){
				return lastrow
			}
			if(ai.length==row.length&&!inclusive){
				return lastrow
			}
		}
		lastrow=ai
	}
	// console.log("mrb",mountain,column,row,inclusive,lastrow)
	return lastrow
}
function minrowabove(mountain,column,row,inclusive){
	for(var i in mountain[column]){
		var ai=parseseq(i)
		if(comparearrays(ai,row)>0){
			return ai
		}
	}
	// nothing found
	return [2]
}
function parent(mountain,column,row){
	var checkcol=column
	var checkrow=row
	while(mountain[checkcol][checkrow][0]>=mountain[column][row][0]){
		checkcol=mountain[checkcol][checkrow][1]
		if(checkcol<0){
			throw "checkcol<0";
		}
		checkrow=maxrowbelow(mountain,checkcol,checkrow,true)
		if(checkrow.length==0){
			// console.log(mountain,column,row,checkcol,checkrow)
			throw "checkrow is []";
		}
	}
	return [checkcol,checkrow]
}
function diffrow(currow,parentrow){
	if(parentrow+""==currow+""){
		var nextrow=currow.slice()
		nextrow.push(1)
		return nextrow
	}else{
		// yto's rule
		// new row is largest row with fs elem
		// in (parentrow,currow]
		var tryrow=[1,currow[1]+1]
		var lastrow=[1,currow[1]+2]
		if(tryrow[1]>10){
			throw "tryrow too high"
		}
		var tries=0
		while(comparearrays(tryrow,currow)>0){
			lastrow=tryrow
			// maybe this should be 0
			var nextelem=0
			do{
				tryrow=rowseq(lastrow,nextelem)
				nextelem++
				if(nextelem>100){
					throw "nextelem sus"
				}
			}while(comparearrays(tryrow,parentrow)<=0)
			// console.log(tryrow)
			if(tries++>10000){
				throw "tries sus"
			}
		}
		return lastrow
	}
}
gmountain=[]
gusedrows2=[]
function thing2(sequence){
	for(var i of sequence){
		if(i!=i)return;
	}
	// console.log(sequence)
	// build mountain
	// array of maps from row to [value,leftleg]
	var mountain=[]
	// rows that occur in the mountain
	// map from rows to themselves
	var usedrows={}
	for(var i=0;i<sequence.length;i++){
		// column of mountain
		var newcol={"1":[sequence[i],i-1]}
		mountain.push(newcol)
		usedrows[[1]]=[1]
		// until current value is 1
		// find parent
		// new entry with value=current-parent, leftleg=parent
		// row is row+1 if parent row=row, else yto's rule
		var curvalue=sequence[i]
		var currow=[1]
		while(curvalue>1){
			var parentcol,parentrow
			[parentcol,parentrow]=parent(mountain,i,currow)
			var nextrow=diffrow(currow,parentrow)
			curvalue-=mountain[parentcol][parentrow][0]
			newcol[nextrow]=[curvalue,parentcol]
			usedrows[nextrow]=nextrow
			currow=nextrow
		}
	}
	// console.log(mountain)
	// display mountain
	var usedrows2=[]
	for(var i in usedrows){
		usedrows2.push(usedrows[i])
	}
	usedrows2.sort(comparearrays)
	return [mountain,usedrows2]
}
// extend^n and deleting last column=x->x[n]
// eg 1,2->1,1,2, 1,3->1,2,5, etc
function extend2(mountain){
	var cutnodetop
	var badroot
	// extending [] does nothing
	if(mountain.length==0){
		return
	}
	for(var i in mountain.at(-1)){
		badroot=mountain.at(-1)[i][1]
		cutnodetop=i
	}
	cutnodetop=parseseq(cutnodetop)
	// row of the left leg of the cut node top
	var badrootrow=maxrowbelow(mountain,badroot,cutnodetop,false)
	// extending successors does nothing
	if(badrootrow.length==0){
		return
	}
	var newmountain=mountain.slice()
	newmountain[newmountain.length-1]=Object.assign({},newmountain.at(-1))
	// fix cut node
	delete newmountain.at(-1)[cutnodetop]
	for(var i in newmountain.at(-1)){
		newmountain.at(-1)[i]=[newmountain.at(-1)[i][0]-1,newmountain.at(-1)[i][1]]
	}
	// copy bad root entries above badrootrow
	for(var i in mountain[badroot]){
		if(comparearrays(parseseq(i),badrootrow)>0){
			newmountain.at(-1)[i]=mountain[badroot][i]
		}
	}
	// copy columns
	for(var i=badroot+1;i<mountain.length;i++){
		var newcol={}
		for(var j in mountain[i]){
			var aj=parseseq(j)
			var leftleg=mountain[i][j][1]
			if(leftleg>=badroot){
				leftleg+=mountain.length-badroot-1
			}
			var newrow
			// move left while staying high
			var checkcol=i
			var checkrow=aj
			while(checkcol>badroot){
				var checkvalue=mountain[checkcol][checkrow][0]
				if(checkvalue>1){
					[checkcol,checkrow]=parent(mountain,checkcol,checkrow)
				}else{
					// left leg
					checkcol=mountain[checkcol][checkrow][1]
					checkrow=maxrowbelow(mountain,checkcol,checkrow,false)
				}
			}
			// erupt?
			// weak magma: comparearrays(checkrow,aj)<0
			// medium magma: comparearrays(checkrow,aj)<=0
			if(checkcol==badroot&&comparearrays(checkrow,aj)<0&&comparearrays(checkrow,cutnodetop)<0){
				var reftop=minrowabove(mountain,badroot,aj,false)
				if(comparearrays(aj,badrootrow)>=0){
					reftop=cutnodetop
				}
				var reference=maxrowbelow(mountain,mountain.length-1,reftop,false)
				// console.log(i,reference,checkrow,aj)
				newrow=addunadd(reference,checkrow,aj)
				// console.log(newrow)
			}else{
				newrow=j
			}
			newcol[newrow]=[0,leftleg]
		}
		newmountain.push(newcol)
	}
	// drop magma
	var usedrows={}
	for(var i of gusedrows2){
		usedrows[i]=i
	}
	for(var i=mountain.length;i<newmountain.length;i++){
		var newcol={}
		var currow=[]
		for(var j in newmountain[i]){
			var aj=parseseq(j)
			var curparent=newmountain[i][j][1]
			if(comparearrays(currow,aj)>=0){
				console.log("squash",currow,aj)
			}
			while(comparearrays(currow,aj)<0){
				// console.log("a",i,currow,maxrowbelow(newmountain,curparent,currow,true))
				var nextrow=diffrow(currow,maxrowbelow(newmountain,curparent,currow,true))
				if(comparearrays(nextrow,aj)>0){
					console.log("squish",nextrow,aj)
					break
				}
				currow=nextrow
				// console.log("b",i,currow)
				newcol[currow]=[0,curparent]
				usedrows[currow]=currow
			}
		}
		newmountain[i]=newcol
	}
	var usedrows2=[]
	for(var i in usedrows){
		usedrows2.push(usedrows[i])
	}
	usedrows2.sort(comparearrays)
	// fix values
	for(var i=mountain.length;i<newmountain.length;i++){
		var keys=Object.keys(newmountain[i])
		keys.reverse()
		newmountain[i][keys[0]][0]=1
		var curvalue=1
		var lastleftleg=newmountain[i][keys[0]][1]
		keys.shift()
		for(var j of keys){
			// console.log(i,parseseq(j))
			// var [parentcol,parentrow]=parent(newmountain,i,parseseq(j))
			// curvalue+=newmountain[parentcol][parentrow][0]
			var leftlegrow=maxrowbelow(newmountain,lastleftleg,parseseq(j),true)
			curvalue+=newmountain[lastleftleg][leftlegrow][0]
			newmountain[i][j][0]=curvalue
			lastleftleg=newmountain[i][j][1]
		}
	}
	// drawmountain(newmountain,usedrows2)
	// generate sequence
	var seq=[]
	for(var i of newmountain){
		seq.push(i[[1]][0])
	}
	return seq
}

function thing(s){
	var sequence=s;
	for(var i of sequence){
		if(i!=i)return;
	}
	// console.log(sequence)
	// build mountain
	// array of maps from row to [value,leftleg]
	var mountain=[]
	// rows that occur in the mountain
	// map from rows to themselves
	var usedrows={}
	for(var i=0;i<sequence.length;i++){
		// column of mountain
		var newcol={"1":[sequence[i],i-1]}
		mountain.push(newcol)
		usedrows[[1]]=[1]
		// until current value is 1
		// find parent
		// new entry with value=current-parent, leftleg=parent
		// row is row+1 if parent row=row, else yto's rule
		var curvalue=sequence[i]
		var currow=[1]
		while(curvalue>1){
			var parentcol,parentrow
			[parentcol,parentrow]=parent(mountain,i,currow)
			var nextrow=diffrow(currow,parentrow)
			curvalue-=mountain[parentcol][parentrow][0]
			newcol[nextrow]=[curvalue,parentcol]
			usedrows[nextrow]=nextrow
			currow=nextrow
		}
	}
	// console.log(mountain)
	// display mountain
	var usedrows2=[]
	for(var i in usedrows){
		usedrows2.push(usedrows[i])
	}
	usedrows2.sort(comparearrays)
	gmountain=mountain
	gusedrows2=usedrows2
}
// extend^n and deleting last column=x->x[n]
// eg 1,2->1,1,2, 1,3->1,2,5, etc
function extend(s){
	thing(s)
	var mountain=gmountain
	var cutnodetop
	var badroot
	// extending [] does nothing
	if(mountain.length==0){
		return
	}
	for(var i in mountain.at(-1)){
		badroot=mountain.at(-1)[i][1]
		cutnodetop=i
	}
	cutnodetop=parseseq(cutnodetop)
	// row of the left leg of the cut node top
	var badrootrow=maxrowbelow(mountain,badroot,cutnodetop,false)
	// extending successors does nothing
	if(badrootrow.length==0){
		return
	}
	var newmountain=mountain.slice()
	newmountain[newmountain.length-1]=Object.assign({},newmountain.at(-1))
	// fix cut node
	delete newmountain.at(-1)[cutnodetop]
	for(var i in newmountain.at(-1)){
		newmountain.at(-1)[i]=[newmountain.at(-1)[i][0]-1,newmountain.at(-1)[i][1]]
	}
	// copy bad root entries above badrootrow
	for(var i in mountain[badroot]){
		if(comparearrays(parseseq(i),badrootrow)>0){
			newmountain.at(-1)[i]=mountain[badroot][i]
		}
	}
	// copy columns
	for(var i=badroot+1;i<mountain.length;i++){
		var newcol={}
		for(var j in mountain[i]){
			var aj=parseseq(j)
			var leftleg=mountain[i][j][1]
			if(leftleg>=badroot){
				leftleg+=mountain.length-badroot-1
			}
			var newrow
			// move left while staying high
			var checkcol=i
			var checkrow=aj
			while(checkcol>badroot){
				var checkvalue=mountain[checkcol][checkrow][0]
				if(checkvalue>1){
					[checkcol,checkrow]=parent(mountain,checkcol,checkrow)
				}else{
					// left leg
					checkcol=mountain[checkcol][checkrow][1]
					checkrow=maxrowbelow(mountain,checkcol,checkrow,false)
				}
			}
			// erupt?
			// weak magma: comparearrays(checkrow,aj)<0
			// medium magma: comparearrays(checkrow,aj)<=0
			if(checkcol==badroot&&comparearrays(checkrow,aj)<0&&comparearrays(checkrow,cutnodetop)<0){
				var reftop=minrowabove(mountain,badroot,aj,false)
				if(comparearrays(aj,badrootrow)>=0){
					reftop=cutnodetop
				}
				var reference=maxrowbelow(mountain,mountain.length-1,reftop,false)
				// console.log(i,reference,checkrow,aj)
				newrow=addunadd(reference,checkrow,aj)
				// console.log(newrow)
			}else{
				newrow=j
			}
			newcol[newrow]=[0,leftleg]
		}
		newmountain.push(newcol)
	}
	// drop magma
	var usedrows={}
	for(var i of gusedrows2){
		usedrows[i]=i
	}
	for(var i=mountain.length;i<newmountain.length;i++){
		var newcol={}
		var currow=[]
		for(var j in newmountain[i]){
			var aj=parseseq(j)
			var curparent=newmountain[i][j][1]
			if(comparearrays(currow,aj)>=0){
				console.log("squash",currow,aj)
			}
			while(comparearrays(currow,aj)<0){
				// console.log("a",i,currow,maxrowbelow(newmountain,curparent,currow,true))
				var nextrow=diffrow(currow,maxrowbelow(newmountain,curparent,currow,true))
				if(comparearrays(nextrow,aj)>0){
					console.log("squish",nextrow,aj)
					break
				}
				currow=nextrow
				// console.log("b",i,currow)
				newcol[currow]=[0,curparent]
				usedrows[currow]=currow
			}
		}
		newmountain[i]=newcol
	}
	var usedrows2=[]
	for(var i in usedrows){
		usedrows2.push(usedrows[i])
	}
	usedrows2.sort(comparearrays)
	// fix values
	for(var i=mountain.length;i<newmountain.length;i++){
		var keys=Object.keys(newmountain[i])
		keys.reverse()
		newmountain[i][keys[0]][0]=1
		var curvalue=1
		var lastleftleg=newmountain[i][keys[0]][1]
		keys.shift()
		for(var j of keys){
			// console.log(i,parseseq(j))
			// var [parentcol,parentrow]=parent(newmountain,i,parseseq(j))
			// curvalue+=newmountain[parentcol][parentrow][0]
			var leftlegrow=maxrowbelow(newmountain,lastleftleg,parseseq(j),true)
			curvalue+=newmountain[lastleftleg][leftlegrow][0]
			newmountain[i][j][0]=curvalue
			lastleftleg=newmountain[i][j][1]
		}
	}
	// drawmountain(newmountain,usedrows2)
	// generate sequence
	var seq=[]
	for(var i of newmountain){
		seq.push(i[[1]][0])
	}
	return seq;
}