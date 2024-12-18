import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import HealthBar from './components/HealthBar';
import { EventBus } from './game/EventBus';

function App() {
    const phaserRef = useRef();
    const [currentScene, setCurrentScene] = useState(null);

    useEffect(() => {
        const handleSceneChange = (scene) => {
            setCurrentScene(scene);
        };

        EventBus.on('scene-change', handleSceneChange);

        return () => {
            EventBus.off('scene-change', handleSceneChange);
        };
    }, []);

    return (
        <div id="app">
            <div id="game-container">
                <PhaserGame ref={phaserRef} />
                {(currentScene === 'Game' || currentScene === 'DebugGame') && <HealthBar />}
            </div>
        </div>
    );
}

export default App;