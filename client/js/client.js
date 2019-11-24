// Initialize Meterialize objects
document.addEventListener('DOMContentLoaded', () => {
	// Floating buttons
	const floatingBtns = document.querySelectorAll('.fixed-action-btn');
	M.FloatingActionButton.init(floatingBtns, {
		toolbarEnabled: false
	});
	// Modals
	const modals = document.querySelectorAll('.modal');
	M.Modal.init(modals);
});

// Disable submit button if all inputs are empty
const form = document.querySelector('form');
if (form) {
	form.addEventListener('keyup', function (event) {
		let isButtonEnabled = true;
		const subBtn = form.querySelector('button[type="submit"]');
		for (const input of this.elements) {
			if (input.tagName === 'BUTTON') {
				continue;
			} else if (!input.value) {
				isButtonEnabled = false;
			}
		}
		if (isButtonEnabled) {
			subBtn.removeAttribute('disabled');
			subBtn.classList.remove('disabled');
		} else {
			subBtn.setAttribute('disabled', '');
			subBtn.classList.add('disabled');
		}
	});
	if (location.pathname === '/quotes') {
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const quote = form['i_quote'].value.trim();
			if (quote) {
				const resp = await fetch('/quotes', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'text/html'
					},
					body: JSON.stringify({ quote }),
					redirect: 'follow'
				});
				// Because fetch does follow the redirect
				// but doesn't change the URL.
				window.location = resp.url;
			} else {
				document.querySelector('a[href="#submitQuote"]').click();
				M.toast({ html: 'Cannot submit empty quotes.' });
			}
		});
	}
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
	closeBtn.addEventListener('click', function () {
		this.parentNode.classList.add('fade-out');
		setTimeout(() => {
			this.parentNode.remove();
		}, 500);
	});
});