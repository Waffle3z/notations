settings.notation = "BMS";
settings.simplify = false;
settings.aliases = true;

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

function setNotation(newNotation) {
	settings.notation = newNotation;
	refreshTerms();
}

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('input[name="notation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setNotation(radioInput.value);
		});
	});

	const simplifyCheckbox = document.getElementById("simplify");
	simplifyCheckbox.addEventListener('change', function() {
		settings.simplify = simplifyCheckbox.checked;
		refreshTerms();
	});

	const aliasesCheckbox = document.getElementById("aliases");
	aliasesCheckbox.addEventListener('change', function() {
		settings.aliases = aliasesCheckbox.checked;
		refreshTerms();
	});
});
