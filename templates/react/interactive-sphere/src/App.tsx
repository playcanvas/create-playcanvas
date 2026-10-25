import { Application } from '@playcanvas/react';
import { useState } from 'react';

import './counter.css';
import Scene from './Scene';
import './starter.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <Application className="playcanvas-app">
                <Scene onClick={() => setCount((count) => count + 1)} />
            </Application>
            <p className="counter">Click count: {count}</p>
        </>
    );
}

export default App;
