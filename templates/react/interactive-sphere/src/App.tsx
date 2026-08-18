import { Application } from '@playcanvas/react';
import { useState } from 'react';

import './App.css';
import Scene from './Scene';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div className="full-bleed">
                <Application className="playcanvas-app">
                    <Scene onClick={() => setCount((count) => count + 1)} />
                </Application>
            </div>
            <p className="counter">Click count: {count}</p>
        </>
    );
}

export default App;
