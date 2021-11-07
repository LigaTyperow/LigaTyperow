const personalToken = "06900aadf8064cdab4775b8b1c19db88"
const url = "https://api.football-data.org/v2/matches"

export const getData = () => {
    return fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': personalToken
    }}).then(resp => resp.json());
}

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