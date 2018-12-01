export default function refetch () {
    let currentElement = this;

    // Generate selector array
    let selectors = [];
    do {
        selectors.push(currentElement.selector);
        currentElement = currentElement.parent || {};
    } while (currentElement.elementId);
    // Iterator is currently set to Browser
    selectors.reverse();

    // Chain elements through the array
    return selectors.reduce( (elementPromise, selector) =>
        elementPromise.then((element) => element.$(selector)), Promise.resolve(currentElement));
}
