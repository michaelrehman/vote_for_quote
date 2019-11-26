document.addEventListener('DOMContentLoaded', () => {
	// Edit buttons
	document.querySelectorAll('.editBtn').forEach((editBtn) => {});
	// Delete buttons
	document.querySelectorAll('.delBtn').forEach((delBtn, index) => {
		delBtn.addEventListener('click', async function() {
			const qid = quotes[index].qid;
			const resp = await fetch(`/quotes/${qid}`, {
				method: 'DELETE',
				headers: { Accept: 'text/plain' }
			});
			if (resp.status == 200) { this.parentNode.parentNode.parentNode.remove(); }
			else { M.toast({ html: 'Could not delete quote.' }); }
		});
	});
});