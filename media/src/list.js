'use strict'

let lastTodos;

const todoTemplate = (todo) => {
    return `
        <g data-id="${todo.id}" class="${(todo.done) ? 'done ' : ''}">
            <text class="todoCheck" x="0" y="0" transform="${positionToTranslate(todo.position)}">[<tspan>X</tspan>]</text>
            <text class="todoText" x="30" y="0" transform="${positionToTranslate(todo.position)}">${todo.text}</text>
        </g>
    `
}

const renderTodos = (todos) => {
    let box = document.getElementById('Holder')
    let count = 0;

    todos = todos.map(one => {
        one.position = count
        count++
        return one
    })
    let todoGroups = todos.map(todoTemplate)
    box.insertAdjacentHTML('beforeend', todoGroups.join(''))
    return todos
}

const positionToY = (position) => {
    const height = 20
    return (position + 1) * height
}

const positionToTranslate = (position) => {
    const height = 20
    return `translate(0, ${(position + 1) * height})`
}

const changeTodos = (todos, lastTodos) => {
    console.log(lastTodos)
    let box = document.getElementById('Holder')
    let count = 0;

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
        if (rendered.position !== newTodo.position) {
            let group = box.querySelector(`[data-id="${newTodo.id}"]`)
            let texts = Array.from(group.querySelectorAll('text'))
            texts.forEach((text) => {
                text.setAttribute('transform', positionToTranslate(newTodo.position));
            })
        }
        console.log(rendered.done)
        console.log(newTodo.done)
        if (rendered.done !== newTodo.done) {
            let group = box.querySelector(`[data-id="${newTodo.id}"]`)
            group.classList.remove('done')
            group.classList.add((newTodo.done) ? 'done': 'undone');
        }
    })

}

const adjustSvgSize = () => {
    let box = document.getElementById('Holder')
    let parent = box.parentNode;
    box.setAttribute('width', parent.getBoundingClientRect().width.toString())
}

const hideLoading = () => {
    document.getElementById('InitialLoading').classList.add('hidden');
}

const showError = (text) => {
    alert(text)
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
                showError('Error saving todo!')
            }
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
            showError('Error saving todo!')
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
        if (event.target.matches('.todoCheck')) {
            let g = event.target.parentNode
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

    adjustSvgSize()
})