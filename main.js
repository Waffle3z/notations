let selectedButton = null;
let settings = {
	indentation: "expansion",
	aliases: false
};

function selectButton(button) {
	if (selectedButton) {
		selectedButton.classList.remove("selected");
	}
	selectedButton = button;
	selectedButton.classList.add("selected");
	selectedButton.focus();
}

function getChildren(button) {
	return button.parentElement.querySelector(".children");
}
function getButtonParent(button) {
	if (button != document.getElementById("root")) {
		return button.parentElement.parentElement.parentElement.querySelector(".node");
	}
}
function getButtonFirstChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.firstElementChild)) return;
	return li.querySelector(".node");
}
function getButtonLastChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.lastElementChild)) return;
	return li.querySelector(".node");
}
function getButtonNextSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.nextElementSibling;
	if (sibling) return sibling.querySelector(".node");
}
function getButtonPreviousSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.previousElementSibling;
	if (sibling) return sibling.querySelector(".node");
}

function expandstr(str, n) {
	if (str == "Root") {
		return notation.expandLimit(n);
	}
	return notation.expand(notation.fromString(str), n);
}

function unexpandButton(button) {
	const children = getChildren(button);
	if (!children) return;
	if (children.classList.contains("expanded")) {
		if (children.firstElementChild.contains(selectedButton)) selectButton(button);
		children.removeChild(children.firstElementChild);
		if (!children.firstElementChild) {
			children.classList.toggle("expanded");
			button.parentElement.querySelector(".collapse").classList.add("hidden");
		}
		return true;
	}
}

function expandButton(button) {
	const children = getChildren(button);
	if (!children) return;
	if (!children.classList.contains("expanded")) {
		children.classList.toggle("expanded");
		button.parentElement.querySelector(".collapse").classList.remove("hidden");
	}
	let str = button.getAttribute("value") || "Root";
	
	let index = 0;
	if (notation.isSuccessor(expandstr(str, 0)) && !notation.isSuccessor(expandstr(str, 1))) {
		index++; // avoid cases where a limit of limits expands into a successor at index 0
	}
	let compare = nextButtonDown(button);
	if (compare) {
		let compareTerm = notation.fromString(compare.getAttribute("value"));
		let low = index;
		let high = index + 1;
		while (notation.lessOrEqual(expandstr(str, high), compareTerm)) {
			low = high;
			high *= 2;
			if (high > 10000) throw new Error("index is too high");
		}
		while (low < high) { // binary search
			const mid = Math.floor((low + high) / 2);
			if (notation.lessOrEqual(expandstr(str, mid), compareTerm)) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		index = low;
	}
	
	let term = expandstr(str, index);
	return createButton(notation.toString(term), children, notation.isSuccessor(term));
}

function expandButtonRecursively(button) {
	const ms = Date.now();
	for (let i = 0; i < 1000; i++) {
		button = expandButton(button);
		if (!button) break;
		if (Date.now() - ms > 200) break;
	}
}

function indentli(li, index) {
	if (settings.indentation == "expansion") {
		li.style.marginLeft = `calc(25px * ${index})`;
	} else if (settings.indentation == "noindent") {
		li.style.marginLeft = ``;
	} else if (settings.indentation == "FS") {
		li.style.marginLeft = `25px`;
	}
}

function createButton(value, parent, isLeaf) {
	const childItem = document.createElement("li");
	indentli(childItem, parent.children.length);

	const button = document.createElement("button");
	button.classList.add("node");

	const collapse = document.createElement("button");
	collapse.classList.add("toggle");
	collapse.classList.add("collapse")
	collapse.classList.add("hidden");
	collapse.innerText = "<";
	childItem.appendChild(collapse);
	collapse.addEventListener("click", () => unexpandButton(button));

	const expand = document.createElement("button");
	expand.classList.add("toggle");
	if (isLeaf) expand.classList.add("hidden");
	expand.innerText = "+";
	childItem.appendChild(expand);
	expand.addEventListener("click", () => expandButtonRecursively(button));

	childItem.appendChild(button);
	if (!isLeaf) {
		const childrenList = document.createElement("ul");
		childrenList.classList.add("children");
		childItem.appendChild(childrenList);
	}
	
	if (value !== null) {
		button.setAttribute("value", value);
		if (notation.convertToNotation) {
			button.innerText = notation.convertToNotation(value);
		} else {
			button.innerText = value;
		}
	} else { // root node
		button.innerText = notation.rootText || "Limit";
	}
	parent.prepend(childItem);
	return button;
}

function nextButtonDown(button) {
	if (firstChild = getButtonFirstChild(button)) {
		return firstChild;
	} else if (nextSibling = getButtonNextSibling(button)) {
		return nextSibling;
	} else if (parentButton = getButtonParent(button)) {
		while (parentButton && !getButtonNextSibling(parentButton)) {
			parentButton = getButtonParent(parentButton);
		}
		if (parentButton && (parentSibling = getButtonNextSibling(parentButton))) {
			return parentSibling;
		}
	}
}

function moveSelectionDown() {
	if (nextButton = nextButtonDown(selectedButton)) {
		selectButton(nextButton);
	}
}

function moveSelectionUp() {
	if (selection = getButtonPreviousSibling(selectedButton)) {
		while (getButtonLastChild(selection)) {
			selection = getButtonLastChild(selection);
		}
		selectButton(selection);
	} else if (parentButton = getButtonParent(selectedButton)) {
		selectButton(parentButton);
	}
}

function refreshIndentation() {
	let stack = [document.getElementById("root")];
	while (stack.length > 0) {
		let button = stack.pop();
		let current = getButtonLastChild(button);
		let index = 0;
		while (current) {
			indentli(current.parentElement, index);
			stack.push(current);
			index++;
			current = getButtonPreviousSibling(current);
		}
	}
}

function refreshTerms() {
	let stack = [document.getElementById("root")];
	while (stack.length > 0) {
		let button = stack.pop();
		let current = getButtonLastChild(button);
		while (current) {
			current.innerText = notation.convertToNotation(current.getAttribute("value"));
			stack.push(current);
			current = getButtonPreviousSibling(current);
		}
	}
}

function setIndentation(newIndentation) {
	settings.indentation = newIndentation;
	refreshIndentation();
}


function initialize() {
	let titleElement = document.head.querySelector("title");
	if (!titleElement) {
		titleElement = document.createElement("title");
		document.head.appendChild(titleElement);
	}
	let headerElement = document.body.querySelector("h2");
	if (!headerElement) {
		headerElement = document.createElement("h2");
		document.body.insertBefore(headerElement, document.body.firstChild);
	}
	if (notation.title) {
		titleElement.textContent = notation.title;
		headerElement.textContent = notation.header || notation.title;
	} else if (notation.missing) {
		titleElement.textContent = "404 🧇";
		headerElement.textContent = "404 notation not found, here's worm instead"
	}
	let container = document.getElementById("container");
	if (!container) {
		container = document.createElement("div");
		container.setAttribute("id", "container");
		document.body.appendChild(container);
	}

	let tree = document.getElementById("tree");
	if (!tree) {
		tree = document.createElement("div");
		tree.setAttribute("id", "tree");
		container.appendChild(tree);
	}

	let rootButton = document.getElementById("root");
	if (!rootButton) {
		rootButton = createButton(null, tree, false)
		rootButton.setAttribute("id", "root");
	}
	selectButton(rootButton);

	let settingsContainer = document.getElementById("settings");
	if (!settingsContainer) {
		settingsContainer = document.createElement("div");
		settingsContainer.setAttribute("id", "settings");
		container.appendChild(settingsContainer);
	}

	let indentationContainer = settingsContainer.querySelector("#indentationContainer");
	if (!indentationContainer) {

		indentationContainer = document.createElement("fieldset");
		indentationContainer.setAttribute("id", "indentationContainer");
		settingsContainer.appendChild(indentationContainer);
		indentationContainer.innerHTML = `
		<legend>Indentation:</legend>
		<div>
			<input type="radio" id="expansion" value="expansion" name="indentation" checked />
			<label for="expansion">Align recursive expansion</label>
		</div>
		<div>
			<input type="radio" id="FS" value="FS" name="indentation" />
			<label for="FS">Align fundamental sequence</label>
		</div>
		<div>
			<input type="radio" id="noindent" value="noindent" name="indentation" />
			<label for="noindent">None</label>
		</div>`;
	}
	indentationContainer.querySelectorAll('input[name="indentation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setIndentation(radioInput.value);
		});
	});

	if (notation.hasAliases) {
		settings.aliases = true;

		let aliasesContainer = settingsContainer.querySelector("#aliasesContainer");
		if (!aliasesContainer) {
			aliasesContainer = document.createElement("div");
			aliasesContainer.setAttribute("id", "aliasesContainer");
			settingsContainer.appendChild(aliasesContainer);
			aliasesContainer.innerHTML = `
			<input type="checkbox" id="aliases" checked />
			<label for="aliases">Show ordinal names</label>`;
		}

		const aliasesCheckbox = aliasesContainer.querySelector("#aliases");
		settings.aliases = aliasesCheckbox.checked;
		aliasesCheckbox.addEventListener('change', function() {
			settings.aliases = aliasesCheckbox.checked;
			refreshTerms();
		});
	}

	let footer = document.getElementById("footer");
	if (!footer) {
		footer = document.createElement("div");
		footer.setAttribute("id", "footer");
		if (notation.footer) {
			footer.innerHTML = notation.footer + " | ";
		}
		const indexLink = document.createElement("a");
		indexLink.textContent = "Index";
		let indexHref = "..";
		const baseEl = document.querySelector("base");
		if (baseEl && baseEl.href) {
			indexHref = baseEl.href;
		}
		indexLink.setAttribute("href", indexHref);
		footer.appendChild(indexLink);
		document.body.appendChild(footer);
	}
	
	document.addEventListener("mousedown", (event) => {
		const targetNode = event.target.closest(".node");
		if (targetNode) {
			event.preventDefault();
			expandButton(targetNode);
			selectButton(targetNode);
		}
	});

	document.addEventListener("mouseup", (event) => {
		const tree = document.getElementById("tree");
		if (tree.contains(event.target) || event.target == document.body) {
			selectedButton.focus();
		}
	});

	document.addEventListener("keydown", (event) => {
		const tree = document.getElementById("tree");
		if (event.target != tree && event.target != document.body && !tree.contains(event.target)) return;

		let handled = true;
		if (event.key === "ArrowDown") {
			moveSelectionDown();
		} else if (event.key === "ArrowUp") {
			moveSelectionUp();
		} else if (event.key === "Backspace" || event.key === "ArrowLeft") { // unexpand
			if (!unexpandButton(selectedButton)) {
				moveSelectionUp(); // move up if there was nothing to unexpand
			}
		} else if (event.key === "Enter") { // expand recursively
			expandButtonRecursively(selectedButton);
		} else if (event.key === " ") { // expand once
			expandButton(selectedButton);
		} else if (event.key === "ArrowRight") { // expand and move selection down
			expandButton(selectedButton);
			moveSelectionDown();
		} else {
			handled = false;
		}

		if (handled) {
			event.preventDefault();
		}
	});
}

if (document.readyState === 'complete') {
	initialize();
} else {
	window.addEventListener("load", initialize);
}