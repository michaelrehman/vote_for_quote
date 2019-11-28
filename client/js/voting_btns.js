document.addEventListener('DOMContentLoaded', () => {
	// helper functions
	const sendRequest = async ({ qid, author, vote }) => {
		return await fetch(`/quotes/${qid}`, {
			method: 'PATCH',
			body: JSON.stringify({ author, vote }),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'text/plain'
			}
		});
	}
	const updateValue = (elem, value) => {
		elem.textContent = Number(elem.textContent) + value;
	};
	// upvote
	document.querySelectorAll('.upvote-btn').forEach((upvoteBtn, index) => {
		upvoteBtn.addEventListener('click', async function() {
			const { qid, author } = nonUserQuotes[index];
			const resp = await sendRequest({ qid, author, vote: 1 });
			if (resp.status === 204) { updateValue(this.nextElementSibling, 1); }
		});
	});
	// downbvote
	document.querySelectorAll('.downvote-btn').forEach((downvoteBtn, index) => {
		downvoteBtn.addEventListener('click', async function() {
			const { qid, author } = nonUserQuotes[index];
			const resp = await sendRequest({ qid, author, vote: -1 });
			if (resp.status === 204) { updateValue(this.previousElementSibling, -1); }
		});
	});
});