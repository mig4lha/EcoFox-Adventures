import React, { useEffect, useState } from 'react';
import { fetchLeaderboard, onSnapshotLeaderboard } from '../firebase'; // Import the real-time listener

const Leaderboard = ({ onClose }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getLeaderboard = async () => {
            try {
                const data = await fetchLeaderboard();
                setPlayers(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load leaderboard. Please try again later.');
                setLoading(false);
            }
        };

        getLeaderboard();

        // Set up a real-time listener
        const unsubscribe = onSnapshotLeaderboard((data) => {
            setPlayers(data);
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div 
            className="leaderboard-overlay" 
            onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
        >
            <div 
                className="leaderboard-container" 
                onClick={(e) => e.stopPropagation()} // Prevent clicks within the container
            >
                <h2 className="leaderboard-title">Leaderboard</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player Name</th>
                                <th>Total Score</th>
                                <th>Total Time (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr key={player.id}>
                                    <td>
                                        {index + 1 <= 3 ? (
                                            <img 
                                                src={`${import.meta.env.BASE_URL}assets/ui/medal${index + 1}.png`} 
                                                alt={`Rank ${index + 1}`} 
                                                width="32" 
                                                height="32" 
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </td>
                                    <td>{player.playerName}</td>
                                    <td>{player.totalScore}</td>
                                    <td>{player.totalTimeTaken}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;