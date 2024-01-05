settings.notation = "BMS";
settings.simplify = false;

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
});
