let selectedButton = null;

function selectButton(button) {
	if (selectedButton) {
		selectedButton.classList.remove("selected");
	}
	selectedButton = button;
	selectedButton.classList.add("selected");
	selectedButton.focus();
}

function selectli(li) {
	selectButton(li.firstElementChild);
}

function unexpand(button) {
	const children = button.nextElementSibling;
	if (!children) return;
	if (children.classList.contains("expanded")) {
		children.removeChild(children.firstElementChild);
		if (!children.firstElementChild) {
			children.classList.toggle("expanded");
			button.classList.remove("button-expanded");
			button.classList.add("button-collapsed");
		}
	}
}

function expand(button) {
	const children = button.nextElementSibling;
	if (!children) return;
	if (!children.classList.contains("expanded")) {
		children.classList.toggle("expanded");
		button.classList.remove("button-collapsed");
		button.classList.add("button-expanded");
	}
	let str = button.innerText;
	if (str == "Root") {
		let size = children.children.length + 1;
		let label = "("+Array(size).fill(0).join(",")+")("+Array(size).fill(1).join(",")+")";
		return createButton(label, children);
	}
	let matrix = PMSexpand(PMStomatrix(str), children.children.length);
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
	let li = selectedButton.parentElement;
	let parent = li.parentElement.parentElement;
	if (selectedButton.nextElementSibling && selectedButton.nextElementSibling.firstElementChild) {
		selectli(selectedButton.nextElementSibling.firstElementChild);
	} else if (li.nextElementSibling) {
		selectli(li.nextElementSibling);
	} else if (parent) {
		while (parent && !parent.nextElementSibling)
		{
			parent = parent.parentElement.parentElement;
		}
		if (parent && parent.nextElementSibling && parent != document.getElementById("tree")) {
			selectli(parent.nextElementSibling);
		}
	}
}

function moveSelectionUp() {
	let li = selectedButton.parentElement;
	if (li.previousElementSibling) {
		selectli(li.previousElementSibling);
		while (selectedButton.nextElementSibling && selectedButton.nextElementSibling.lastElementChild) {
			selectli(selectedButton.nextElementSibling.lastElementChild);
		}
	} else if (li != document.getElementById("tree")) {
		selectli(li.parentElement.parentElement);
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
			unexpand(selectedButton);
		} else if (event.key === "Enter") {
			event.preventDefault();
			let button = selectedButton;
			for (let i = 0; i < 10; i++) {
				button = expand(button);
				if (!button) break;
			}
		} else if (event.key === " ") {
			event.preventDefault();
			expand(selectedButton);
		}
	});
});
