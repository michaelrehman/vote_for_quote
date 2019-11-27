document.addEventListener('DOMContentLoaded', () => {
	// Handle the quote submission, max character length, and cancel
	const maxLength = form['i_quote'].getAttribute('maxlength'); // inital value set in html on page load (200)
	// max length
	form['i_quote'].addEventListener('keyup', function() {
		if (this.getAttribute('maxlength') !== maxLength) {
			this.setAttribute('maxlength', maxLength);
		}
		const charLimit = form.querySelector('span.helper-text');
		charLimit.textContent = maxLength - this.value.length;
	});
	// submission
	const subBtn = form[2];
	form.addEventListener('submit', async function(event) {
		event.preventDefault();
		let quote = form['i_quote'].value.trim();
		if (quote.length > 0 && quote.length <= maxLength) {
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
			enableBtn(subBtn, false);
		}
	});
	// cancel
	form.querySelector('button[type="button"]').addEventListener('click', () => {
		form.querySelector('span.helper-text').textContent = maxLength;
		form['i_quote'].value = '';
		enableBtn(subBtn, false);
	});
	// override enter inserting new line
	form['i_quote'].addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			// TODO: submitting through the enter key now bypasses all frontend checks, fix it
			if (!subBtn.disabled) { form.submit(); }
		}
	});
});