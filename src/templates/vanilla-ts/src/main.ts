import './style.css'
import typescriptLogo from './assets/typescript.svg'
import playcanvasLogo from './assets/playcanvas.png'
import { setupApp } from './App'
import { setupCounter } from './counter'

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
        <div class="card">
          <button id="counter" type="button"></button>
        </div>
        <p class="read-the-docs">
          Click on the Vite and TypeScript logos to learn more
        </p>
      </div>
    </div>
  </div>
`

const increment = setupCounter(document.getElementById('counter') as HTMLButtonElement);

setupApp(document.getElementById('application-canvas') as HTMLCanvasElement, () => increment());