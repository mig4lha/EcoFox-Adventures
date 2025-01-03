import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import HealthBar from './components/HealthBar';
import CollectableBar from './components/CollectableBar';
import InteractionOverlay from './components/InteractionOverlay';
import TimerDisplay from './components/TimerDisplay';
import NameInputForm from './components/NameInputForm';
import { EventBus } from './game/EventBus';
import { GAME_SETTINGS } from './game/Config';
import Leaderboard from './components/Leaderboard';
import { db, addPlayerScore } from './firebase';

function App() {
    const phaserRef = useRef();
    const [currentScene, setCurrentScene] = useState(null);
    const [fadeState, setFadeState] = useState('fade-in');
    const [showNameInput, setShowNameInput] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const isGameScene = currentScene === 'Game' || currentScene === 'DebugGame';

    // Ref to prevent duplicate submissions
    const hasSubmitted = useRef(false);

    useEffect(() => {
        const handleSceneChange = (scene) => {
            if (scene !== 'Game' && scene !== 'DebugGame') {
                setFadeState('fade-out');
            } else {
                setFadeState('fade-in');
            }
            setCurrentScene(scene);
        };

        const handleFadeIn = () => {
            setFadeState('fade-in');
        };

        const handleFadeOut = () => {
            setFadeState('fade-out');
        };

        const handleGameDone = () => {
            setShowNameInput(true);
        };

        const handleShowLeaderboard = () => {
            setShowLeaderboard(true);
        };

        const handleNameSubmitted = async (playerName) => {
            if (hasSubmitted.current) return; // Prevent duplicate submissions
            hasSubmitted.current = true;
      
            try {
              // Update Config or handle the player name as needed
              setShowNameInput(false);
      
              GAME_SETTINGS.playerName = playerName;
      
              // Add the player's score to the leaderboard
              await addPlayerScore(
                GAME_SETTINGS.playerName,
                GAME_SETTINGS.totalScore,
                GAME_SETTINGS.totalTimeTaken
              );
      
              // Emit event to navigate to Main Menu
              EventBus.emit('navigateToMainMenu');
            } catch (error) {
              console.error('Failed to submit player score:', error);
              // Optionally, handle the error in the UI (e.g., show a notification)
              hasSubmitted.current = false; // Reset the flag if submission fails
            }
          };

        EventBus.on('fade-in', handleFadeIn);
        EventBus.on('fade-out', handleFadeOut);
        EventBus.on('scene-change', handleSceneChange);
        EventBus.on('gameDone', handleGameDone);
        EventBus.on('nameSubmitted', handleNameSubmitted);
        EventBus.on('showLeaderboard', handleShowLeaderboard);

        return () => {
            EventBus.off('scene-change', handleSceneChange);
            EventBus.off('fade-out', handleFadeOut);
            EventBus.off('fade-in', handleFadeIn);
            EventBus.off('gameDone', handleGameDone);
            EventBus.off('nameSubmitted', handleNameSubmitted);
            EventBus.off('showLeaderboard', handleShowLeaderboard);
        };
    }, []);

    // Inform Phaser about overlay state
    useEffect(() => {
        if (phaserRef.current) {
            const phaserGame = phaserRef.current.game; // Adjust based on your PhaserGame implementation
            if (showLeaderboard) {
                phaserGame.input.enabled = false; // Disable Phaser input
            } else {
                phaserGame.input.enabled = true; // Enable Phaser input
            }
        }
    }, [showLeaderboard]);

    return (
        <div id="app">
            <div id="game-container">
                <PhaserGame ref={phaserRef} />
                {(isGameScene || fadeState === 'fade-out') && (
                    <div className={`ui-components ${fadeState}`}>
                        <HealthBar />
                        <TimerDisplay />
                        <CollectableBar
                            collectableAsset={`${import.meta.env.BASE_URL}assets/collectables/berry_gray.png`}
                            collectedAsset={`${import.meta.env.BASE_URL}assets/collectables/berry.png`}
                        />
                        <InteractionOverlay />
                    </div>
                )}
                {showNameInput && <NameInputForm />}
                {showLeaderboard && (
                    <Leaderboard onClose={() => setShowLeaderboard(false)} />
                )}
            </div>
        </div>
    );
}

export default App;