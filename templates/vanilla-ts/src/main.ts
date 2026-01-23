import './style.css'
import typescriptLogo from './assets/typescript.svg'
import playcanvasLogo from './assets/playcanvas.png'
import { setupApp } from './App'

let count = 0;

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <div>
    <canvas id="application-canvas"></canvas>
    <div class="absolute overlay">
      <div class="grow">
        <header>
          <h1>PlayCanvas + TypeScript</h1>
          <a href="https://developer.playcanvas.com" target="_blank">
            <img src="${playcanvasLogo}" class="playcanvas-logo logo" alt="PlayCanvas logo" />
          </a>
          <a href="https://www.typescriptlang.org/" target="_blank">
            <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
          </a>
        </header>
      </div>
      <div>
        <span id="counter" class="pill">
          Click Count: ${count}
        </span>
        <p>
          Edit <code>src/App.ts</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the PlayCanvas and TypeScript logos to learn more
      </p>
    </div>
  </div>
`

const counterElement = document.getElementById('counter')!;

const increment = () => {
  count++;
  counterElement.textContent = `Click Count: ${count}`;
};

setupApp(document.getElementById('application-canvas') as HTMLCanvasElement, increment);
