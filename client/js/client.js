// Initialize Meterialize objects
document.addEventListener('DOMContentLoaded', () => {
	// Floating buttons
	const floatingBtns = document.querySelectorAll('.fixed-action-btn');
	M.FloatingActionButton.init(floatingBtns);
	// Modals
	const modals = document.querySelectorAll('.modal');
	M.Modal.init(modals, { dismissible: false });
});

const form = document.querySelector('form');
if (form) {
	const subBtn = form.querySelector('button[type="submit"]');
	const enableSubBtn = (doEnable) => {
		if (doEnable) {
			subBtn.removeAttribute('disabled');
			subBtn.classList.remove('disabled');
		} else {
			subBtn.setAttribute('disabled', '');
			subBtn.classList.add('disabled');
		}
	};
	// enable/disable the submit button if inputs are empty
	form.addEventListener('keyup', function() {
		let isButtonEnabled = true;
		for (const input of this.elements) {
			if (input.tagName === 'BUTTON') { continue; }
			else if (!input.value) { isButtonEnabled = false; }
		}
		enableSubBtn(isButtonEnabled);
	});
	// Handle the quote submission, max character length, and cancel
	if (location.pathname === '/quotes') {
		let maxLength = form['i_quote'].getAttribute('maxlength');	// inital value set in html on page load
		// max length
		form['i_quote'].addEventListener('keyup', function() {
			if (this.getAttribute('maxlength') !== '200') {
				// in case someone modifes the markup
				// quote is only submitted on the backend if length (0, 200]
				this.setAttribute('maxlength', '200');
				maxLength = 200;
			}
			const charLimit = form.querySelector('span.helper-text');
			charLimit.textContent = maxLength - this.value.length;
		});
		// submission
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			let quote = form['i_quote'].value.trim();
			if (quote.length > 0 && quote.length <= 140) {
				const resp = await fetch('/quotes', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'text/html'
					},
					body: JSON.stringify({ quote }),
					redirect: 'follow'
				});
				// Because fetch does follow the
				// redirect but doesn't change the URL.
				window.location = resp.url;
			} else if (quote.length > maxLength) {
				M.toast({ html: `Quote cannot exceed ${maxLength} characters.` });
			} else {
				M.toast({ html: 'Cannot submit empty quotes.' });
				form['i_quote'].value = '';
				enableSubBtn(false);
			}
		});
		// cancel
		form.querySelector('button[type="button"]').addEventListener('click', () => {
			form.querySelector('span.helper-text').textContent = maxLength;
			form['i_quote'].value = '';
			enableSubBtn(false);
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
	closeBtn.addEventListener('click', function() {
		this.parentNode.classList.add('fade-out');
		setTimeout(() => {
			this.parentNode.remove();
		}, 500);
	});
});

class Person {
	constructor() {
		this.value = 'lame'
	}
}

const obj = new Person();