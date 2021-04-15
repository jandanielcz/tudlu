const closest = (node, selector) => {
    let current = node;
    while(true) {
        if (current.matches === undefined) {
            return undefined
        }
        if (current.matches(selector)) {
            return current
        }
        current = current.parentNode
    }
}

export {closest}