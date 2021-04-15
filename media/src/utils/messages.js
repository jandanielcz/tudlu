const boxId = 'Messages';

const showMessage = (text, id, type = 'info') => {
    hideMessage(id)
    document.getElementById(boxId).insertAdjacentHTML(
        'afterbegin',
        `<p class="${type}" id="Message${id}">${text}</p>`
        )
    setTimeout(() => {
        hideMessage(id)
    },3000);
}

const hideMessage = (id) => {
    let message = document.querySelector(`#Message${id}`);
    if (message) {
        message.remove()
    }
}

export {showMessage, hideMessage}