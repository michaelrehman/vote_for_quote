function enableBtn(btn, doEnable) {
	if (doEnable) {
		btn.removeAttribute('disabled');
		btn.classList.remove('disabled');
	} else {
		btn.setAttribute('disabled', '');
		btn.classList.add('disabled');
	}
};
let form;
document.addEventListener('DOMContentLoaded', () => {
	// Floating buttons
	const floatingBtns = document.querySelectorAll('.fixed-action-btn');
	M.FloatingActionButton.init(floatingBtns);
	// Modals
	const modals = document.querySelectorAll('.modal');
	M.Modal.init(modals, { dismissible: false });

	form = document.querySelector('form');
	if (form) {
		const subBtn = form.querySelector('button[type="submit"]');
		// enable/disable the submit button if inputs are empty
		form.addEventListener('keyup', function() {
			let isButtonEnabled = true;
			for (const input of this.elements) {
				if (input.tagName === 'BUTTON') { continue; }
				else if (!input.value) { isButtonEnabled = false; }
			}
			enableBtn(subBtn, isButtonEnabled);
		});
	}

	// Replace spaces with '_' as the user types
	const usernameInput = document.getElementById('i_username');
	if (usernameInput) {
		usernameInput.addEventListener('keyup', function (event) {
			if (event.key === ' ') {
				this.value = this.value.replace(/\s/g, '_');
			}
		});
	}

	// Close alerts
	document.querySelectorAll('.alert button').forEach((closeBtn) => {
		closeBtn.addEventListener('click', function() {
			this.parentNode.classList.add('fade-out');
			setTimeout(() => {
				this.parentNode.remove();
			}, 500);
		});
	});
});