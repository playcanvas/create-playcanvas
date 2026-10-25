import { setupApp } from './App';
import './counter.css';
import './starter.css';

let count = 0;

document.body.insertAdjacentHTML('beforeend', `<p id="counter" class="counter">Click count: ${count}</p>`);

const counterElement = document.getElementById('counter')!;

const increment = () => {
    count++;
    counterElement.textContent = `Click count: ${count}`;
};

setupApp(document.getElementById('application-canvas') as HTMLCanvasElement, increment);
