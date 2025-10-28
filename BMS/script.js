settings.notation = "BMS";
settings.simplify = false;
settings.compress = false;

function setNotation(newNotation) {
	settings.notation = newNotation;
	refreshTerms();
	const compressCheckbox = document.getElementById("compressContainer");
	if (newNotation === "BMS" || newNotation === "AMS" || newNotation === "PMS") {
		compressCheckbox.style.display = "block";
	} else {
		compressCheckbox.style.display = "none";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('input[name="notation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setNotation(radioInput.value);
		});
	});

	const simplifyCheckbox = document.getElementById("simplify");
	settings.simplify = simplifyCheckbox.checked;
	simplifyCheckbox.addEventListener('change', function() {
		settings.simplify = simplifyCheckbox.checked;
		refreshTerms();
	});

	const compressCheckbox = document.getElementById("compress");
	settings.compress = compressCheckbox.checked;
	compressCheckbox.addEventListener('change', function() {
		settings.compress = compressCheckbox.checked;
		refreshTerms();
	});
});
