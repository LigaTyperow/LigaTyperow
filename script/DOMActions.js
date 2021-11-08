export const createDOMElement = (tagName, className, innerText, src) => {
    const tag = document.createElement(tagName);
    tag.classList = className;

    if (innerText) {
        tag.innerText = innerText;
    }

    if (src) {
        tag.src = src;
    }
    return tag;
}