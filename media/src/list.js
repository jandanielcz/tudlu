'use strict'

import {closest} from "./utils/dom"
import {hideMessage, showMessage} from "./utils/messages"

let lastTodos;

const todoTemplate = (todo) => {
    return `
        <div data-id="${todo.id}" style="top:${positionToY(todo.position)}" class="oneTodo ${(todo.done) ? 'done ' : ''}">
            <div class="todoCheck">[<span>X</span>]</div>
            <div class="todoText">${todo.text}</div>
        </div>
    `
}

const renderTodos = (todos) => {
    let box = document.getElementById('Holder')
    let count = 0;
    todos = sortTodos(todos)
    todos = todos.map(one => {
        one.position = count
        count++
        return one
    })
    let todoGroups = todos.map(todoTemplate)
    box.insertAdjacentHTML('beforeend', todoGroups.join(''))
    adjustHolderSize()
    return todos
}


const positionToY = (position) => {
    const height = 2.5
    return `${(position + 1) * height}ch`
}

const sortTodos = (todos) => {
    todos = todos.sort((a, b) => {
        console.log(a)
        console.log(b)
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

const changeTodos = (todos, lastTodos) => {
    let box = document.getElementById('Holder')
    let count = 0;
    todos = sortTodos(todos)
    todos = todos.map(one => {
        one.position = count
        count++
        return one
    })
    todos.forEach(newTodo => {
        let rendered = lastTodos.find((lastTodo) => {
            return (lastTodo.id === newTodo.id)
        })
        if (rendered === undefined) {
            box.insertAdjacentHTML('afterbegin',todoTemplate(newTodo))
            return;
        }
        let group = box.querySelector(`[data-id="${newTodo.id}"]`)
        if (rendered.position !== newTodo.position) {
            group.style.top = positionToY(newTodo.position)
        }
        if (rendered.done !== newTodo.done) {
            group.classList.remove('done')
            group.classList.add((newTodo.done) ? 'done': 'undone');
        }
    })
    adjustHolderSize()

}

const adjustHolderSize = () => {
    let box = document.getElementById('Holder')
    let h = Array.from(box.querySelectorAll('.oneTodo')).reduce((sum, todo) => {
        return (sum + todo.getBoundingClientRect().width)
    }, 0)
    box.style.height = `${h}px`
}

const hideLoading = () => {
    document.getElementById('InitialLoading').classList.add('hidden');
}

const reloadTodos = () => {
    fetch('/api/todo')
        .then((res) => res.json())
        .then((res) => {
                changeTodos(res, lastTodos)
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