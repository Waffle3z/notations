let selectedButton = null;

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
	let matrix = PMSexpand(PMStomatrix(str), n);
	if (PMSisSuccessor(matrix)) {
		return PMSsimplify(matrix.slice(0, -1));
	}
	return matrix;
}

function unexpand(button) {
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

function expand(button) {
	const children = getChildren(button);
	if (!children) return;
	if (!children.classList.contains("expanded")) {
		children.classList.toggle("expanded");
		button.classList.remove("button-collapsed");
		button.classList.add("button-expanded");
	}
	let str = button.innerText;
	let index = children.children.length + 1;
	if (str == "Root") {
		let label = "("+Array(index).fill(0).join(",")+")("+Array(index).fill(1).join(",")+")";
		return createButton(label, children);
	}
	
	let matrix = expandstr(str, index);
	let current = button;
	let firstString = PMStostring(expandstr(str, 1));
	while (true) {
		let sibling = getButtonNextSibling(current);
		let child = getButtonLastChild(current);
		if (current != button && child && child.innerText == firstString || (sibling && (sibling.innerText == firstString))) {
			matrix = expandstr(str, index + 1);
			break;
		}
		if (current == document.getElementById("root")) break;
		current = getButtonParent(current);
	}
	
	let isSuccessor = PMSisSuccessor(matrix);
	return createButton(PMStostring(matrix), children, isSuccessor);
}

function createButton(label, parent, isLeaf) {
	const childItem = document.createElement("li");
	const button = document.createElement("button");
	childItem.appendChild(button);
	button.classList.add("node");
	if (!isLeaf) {
		button.classList.add("button-collapsed");
		const childrenList = document.createElement("ul");
		childrenList.classList.add("children");
		childItem.appendChild(childrenList);
	}
	button.innerText = label;
	parent.prepend(childItem);
	return button;
}

function moveSelectionDown() {
	if (firstChild = getButtonFirstChild(selectedButton)) {
		selectButton(firstChild);
	} else if (nextSibling = getButtonNextSibling(selectedButton)) {
		selectButton(nextSibling);
	} else if (parentButton = getButtonParent(selectedButton)) {
		while (parentButton && !getButtonNextSibling(parentButton)) {
			parentButton = getButtonParent(parentButton);
		}
		if (parentButton && (parentSibling = getButtonNextSibling(parentButton))) {
			selectButton(parentSibling);
		}
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

document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("tree");
	selectButton(document.getElementById("root"));
	
	container.addEventListener("click", (event) => {
		const targetNode = event.target.closest(".node");
		if (targetNode) {
			event.preventDefault();
			expand(targetNode);
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
			if (!unexpand(selectedButton)) {
				moveSelectionUp();
			}
		} else if (event.key === "Enter") {
			event.preventDefault();
			let button = selectedButton;
			for (let i = 0; i < 1000; i++) {
				button = expand(button);
				if (!button) break;
			}
		} else if (event.key === " ") {
			event.preventDefault();
			expand(selectedButton);
		}
	});
});
