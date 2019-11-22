// Floating buttons
const floatingBtns = document.querySelectorAll('.fixed-action-btn');
M.FloatingActionButton.init(floatingBtns, { toolbarEnabled: false });
// Modals
const modals = document.querySelectorAll('.modal');
M.Modal.init(modals);
// Form validation (typically done on the backend, but the modal closes with every submit)
