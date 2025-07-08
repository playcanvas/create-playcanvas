export function setupCounter(element: HTMLButtonElement) {
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      element.innerHTML = `count is ${counter}`
    }
    setCounter(0)
    const increment = () => setCounter(counter + 1);
    return increment;
}