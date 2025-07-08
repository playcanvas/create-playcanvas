import { Application } from "@playcanvas/react";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import playcanvasLogo from './assets/playcanvas.png'
import './App.css'
import Scene from "./Scene";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="full-bleed">
        <Application className="playcanvas-app">
          <Scene onClick={() => setCount((count) => count + 1)}/>
        </Application>
      </div>
      <div className="absolute overlay">
        <div className="grow">
          <header>
            <h1>PlayCanvas + React</h1>
            <a href="https://playcanvas-react.vercel.app/docs" target="_blank">
              <img src={playcanvasLogo} className="playcanvas-logo logo" alt="PlayCanvas logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </header>
        </div>
        <div>
          <span className="pill">
            count is {count}
          </span>
          <p>
            Edit <code>src/Scene.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the PlayCanvas and React logos to learn more
        </p>
      </div>
    </>
  )
}

export default App
