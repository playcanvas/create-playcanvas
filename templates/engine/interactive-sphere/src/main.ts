import './style.css';
import { setupApp } from './App';

let count = 0;

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
    <canvas id="application-canvas"></canvas>
    <p id="counter" class="counter">Click count: ${count}</p>
`;

const counterElement = document.getElementById('counter')!;

const increment = () => {
    count++;
    counterElement.textContent = `Click count: ${count}`;
};

setupApp(document.getElementById('application-canvas') as HTMLCanvasElement, increment);
