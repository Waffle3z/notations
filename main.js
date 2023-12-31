let selectedButton = null;
let settings = {
	indentation: "expansion",
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
	return button.nextElementSibling;
}
function getButtonParent(button) {
	if (button != document.getElementById("root")) {
		return button.parentElement.parentElement.previousElementSibling;
	}
}
function getButtonFirstChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.firstElementChild)) return;
	return li.firstElementChild;
}
function getButtonLastChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.lastElementChild)) return;
	return li.firstElementChild;
}
function getButtonNextSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.nextElementSibling;
	if (sibling) return sibling.firstElementChild;
}
function getButtonPreviousSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.previousElementSibling;
	if (sibling) return sibling.firstElementChild;
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
		children.removeChild(children.firstElementChild);
		if (!children.firstElementChild) {
			children.classList.toggle("expanded");
			button.classList.remove("button-expanded");
			button.classList.add("button-collapsed");
		}
		return true;
	}
}

function expandButton(button) {
	const children = getChildren(button);
	if (!children) return;
	if (!children.classList.contains("expanded")) {
		children.classList.toggle("expanded");
		button.classList.remove("button-collapsed");
		button.classList.add("button-expanded");
	}
	let str = button.getAttribute("value") || "Root";
	
	let index = 0;
	if (notation.isSuccessor(expandstr(str, 0)) && !notation.isSuccessor(expandstr(str, 1))) {
		index++; // avoid cases where a limit of limits expands into a successor at index 0
	}
	let compare = nextButtonDown(button);
	if (compare) {
		let compareTerm = notation.fromString(compare.getAttribute("value"));
		while (notation.lessOrEqual(expandstr(str, index), compareTerm)) {
			index++;
		}
	}
	
	let term = expandstr(str, index);
	return createButton(notation.toString(term), children, notation.isSuccessor(term));
}

function indentli(li, index) {
	if (settings.indentation == "expansion") {
		li.style.marginLeft = `calc(40px * ${index} - 40px)`;
	} else if (settings.indentation == "noindent") {
		li.style.marginLeft = `-40px`;
	} else if (settings.indentation == "FS") {
		li.style.marginLeft = ``;
	}
}

function createButton(value, parent, isLeaf) {
	const childItem = document.createElement("li");
	indentli(childItem, parent.children.length);
	const button = document.createElement("button");
	childItem.appendChild(button);
	button.classList.add("node");
	if (!isLeaf) {
		button.classList.add("button-collapsed");
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
			index++
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
		headerElement.textContent = notation.title;
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
		let ul = document.createElement("ul");
		ul.setAttribute("style", "style='padding:0px; margin:0px'");
		tree.appendChild(ul);
		rootButton = createButton(null, ul, false)
		rootButton.setAttribute("id", "root");
	}
	selectButton(rootButton);

	let footer = document.getElementById("footer");
	if (!footer) {
		footer = document.createElement("div");
		footer.setAttribute("id", "footer");
		if (notation.footer) {
			footer.innerHTML = notation.footer + " | ";
		}
		footer.innerHTML += "<a href='https://waffle3z.github.io/notations/'>Index</a>";
		document.body.appendChild(footer);
	}
	
	container.addEventListener("click", (event) => {
		const targetNode = event.target.closest(".node");
		if (targetNode) {
			event.preventDefault();
			expandButton(targetNode);
			selectButton(targetNode);
		}
	});

	container.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveSelectionDown();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			moveSelectionUp();
		} else if (event.key === "Backspace") {
			event.preventDefault();
			if (!unexpandButton(selectedButton)) {
				moveSelectionUp();
			}
		} else if (event.key === "Enter") {
			event.preventDefault();
			let button = selectedButton;
			const ms = Date.now();
			for (let i = 0; i < 1000; i++) {
				button = expandButton(button);
				if (!button) break;
				if (Date.now() - ms > 10) break;
			}
		} else if (event.key === " ") {
			event.preventDefault();
			expandButton(selectedButton);
		}
	});
	
	document.querySelectorAll('input[name="indentation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setIndentation(radioInput.value);
		});
	});
}

document.addEventListener("DOMContentLoaded", initialize);