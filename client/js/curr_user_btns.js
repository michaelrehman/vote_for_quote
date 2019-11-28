document.addEventListener('DOMContentLoaded', () => {
	// Edit buttons
	document.querySelectorAll('.edit-btn').forEach((editBtn) => {});
	// Delete buttons
	document.querySelectorAll('.del-btn').forEach((delBtn, index) => {
		delBtn.addEventListener('click', async function() {
			const qid = userQuotes[index].qid;
			const resp = await fetch(`/quotes/${qid}`, {
				method: 'DELETE',
				headers: { Accept: 'text/plain' }
			});
			if (resp.status === 204) {
				M.toast({ html: 'Quote successfully deleted.', classes: 'green' });
				this.parentNode.parentNode.parentNode.remove();
			}
			else if (resp.status === 401) { M.toast({ html: 'You are not signed in.', classes: 'blue darken-2' }); }
			else { M.toast({ html: await resp.text(), classes: 'red accent-4' }); }
		});
	});
});