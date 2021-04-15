'use strict'

import {closest} from "./utils/dom"
import {hideMessage, showMessage} from "./utils/messages"

let lastTodos;

const todoTemplate = (todo) => {
    return `
        <div data-id="${todo.id}" class="oneTodo ${(todo.done) ? 'done ' : ''}">
            <div class="todoCheck">[<span>X</span>]</div>
            <div class="todoText">${todo.text}</div>
        </div>
    `
}

const renderTodos = (todos) => {
    let box = document.getElementById('Holder')
    box.innerText = ''
    box.insertAdjacentHTML('beforeend', sortTodos(todos).map(todoTemplate).join(''))
}

const sortTodos = (todos) => {
    todos = todos.sort((a, b) => {
        if (!a.hasOwnProperty('done') && !b.hasOwnProperty('done')) {
            return b.changed - a.changed
        }
        if (a.hasOwnProperty('done') && b.hasOwnProperty('done')) {
            return b.changed - a.changed
        }
        if (a.hasOwnProperty('done')) {
            return 1;
        }
        return -1;
    })
    return todos
}

const hideLoading = () => {
    document.getElementById('InitialLoading').classList.add('hidden');
}

const reloadTodos = () => {
    fetch('/api/todo')
        .then((res) => res.json())
        .then((res) => {
                renderTodos(res)
            }
        )
}

const doInsert = (text) => {
    let messageId = Date.now()
    showMessage('Saving todo&hellip;', messageId, 'info')
    fetch('/api/todo', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({text: text})
    }).then((res) => {
            if(res.status === 201) {
                // todo: not ideal place
                document.querySelector('#text').value = ''
                reloadTodos()
            } else {
                showMessage('Error saving todo!', 'ErrorSaving', 'error')
            }
            hideMessage(messageId)
    })
}

const doDoneChange = (id, done) => {
    let messageId = Date.now()
    showMessage('Saving todo&hellip;', messageId, 'info')
    fetch(`/api/todo/${id}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({done: done})
    }).then((res) => {
        if(res.status === 202) {
            reloadTodos()
        } else {
            showMessage('Error saving todo!', 'ErrorSaving', 'error')
        }
        hideMessage(messageId)
    })
}

document.addEventListener('DOMContentLoaded', () => {

    let form = document.querySelector('#Insert form')
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let text = event.target.querySelector('#text').value
        console.log(text)
        doInsert(text)
    })

    document.addEventListener('click', (event) => {
        if (event.target.matches('.todoCheck') || event.target.matches('.todoCheck span')) {
            let g = closest(event.target, '.oneTodo')
            let id = g.getAttribute('data-id')
            let isDone = g.classList.contains('done')
            doDoneChange(id, !isDone)
        }

    })


    fetch('/api/todo')
        .then((res) => res.json())
        .then((res) => {
            lastTodos = renderTodos(res)
            hideLoading()
        }
    )


})