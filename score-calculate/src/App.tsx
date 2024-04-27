import {useState} from "react";
import "./App.css";

interface Player {
id: number;
name: string;
score: number;
}

export const App: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [totalScore, setTotalScore] = useState<number>(0);
    const [resetConfirmation, setResetConfirmation] = useState<boolean>(false);
    const [newPlayerName, setNewPlayerName] = useState<string>("");
    const [scoreInputs, setScoreInputs] = useState<string[]>([]);

    const handleAddPlayer = () => {
      if (newPlayerName.trim() === "") {
        alert("プレイヤー名を入力してください。");
        return;
      }

      if (players.length < 6) {
        const newPlayer: Player = {
          id: players.length + 1,
          name: newPlayerName.trim(),
          score: 0
        };
        setPlayers([...players, newPlayer]);
        setScoreInputs([...scoreInputs, ""]);
        setNewPlayerName(""); // プレイヤーが追加された後、入力フィールドを空にする
      }
    };

    const handleScoreChange = (playerId: number, change: number) => {
      const updatedPlayers = players.map((player) =>
        player.id === playerId ? { ...player, score: player.score + change } : player
      );
      setPlayers(updatedPlayers);
      const updatedTotalScore = updatedPlayers.reduce((acc, player) => acc + player.score, 0);
      setTotalScore(updatedTotalScore);
    };

    const handleApplyScore = (playerId: number, inputIndex: number) => {
      const playerToUpdate = players.find((player) => player.id === playerId);
      if (playerToUpdate && !isNaN(parseInt(scoreInputs[inputIndex]))) {
        const change = parseInt(scoreInputs[inputIndex]);
        const updatedPlayers = players.map((player) =>
          player.id === playerId ? { ...player, score: player.score + change } : player
        );
        setPlayers(updatedPlayers);
        const updatedTotalScore = updatedPlayers.reduce((acc, player) => acc + player.score, 0);
        setTotalScore(updatedTotalScore);

        // 入力欄を空にする
        const updatedScoreInputs = [...scoreInputs];
        updatedScoreInputs[inputIndex] = "";
        setScoreInputs(updatedScoreInputs);
      }
    };

    const handleReset = () => {
      setResetConfirmation(true);
    };

    const confirmReset = () => {
      setPlayers([]);
      setTotalScore(0);
      setScoreInputs([]);
      setResetConfirmation(false);
    };

    const cancelReset = () => {
      setResetConfirmation(false);
    };

    const isWarning = totalScore !== 0;

    return (
      <div className="app-container">
        <h1 className="app-title">スコアトラッカー</h1>
        <div className={`total-score ${isWarning ? "warning" : ""}`}>
          合計スコア: {totalScore}
          {isWarning && <span className="warning-message">警告: 合計スコアが0ではありません！</span>}
        </div>
        <div className="add-player">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="プレイヤー名を入力してください"
            className="input-field"
          />
          <button className="add-button" onClick={handleAddPlayer}>
            プレイヤー追加
          </button>
        </div>
        <button className="reset-button" onClick={handleReset}>
          スコアリセット
        </button>
        {resetConfirmation && (
          <div className="reset-confirmation">
            全てのスコアをリセットしますか？
            <button className="confirm-button" onClick={confirmReset}>
              はい
            </button>
            <button className="cancel-button" onClick={cancelReset}>
              いいえ
            </button>
          </div>
        )}
        <hr className="divider" />
        {players.map((player, index) => (
          <div key={player.id} className="player-card">
            <h2 className="player-name">{player.name}</h2>
            <div className="score-section">
              <div className="score-display">スコア: {player.score}</div>
              <input
                type="number"
                value={scoreInputs[index]}
                onChange={(e) => {
                  const updatedScoreInputs = [...scoreInputs];
                  updatedScoreInputs[index] = e.target.value;
                  setScoreInputs(updatedScoreInputs);
                }}
                className="score-input"
              />
              <button
                className="apply-button"
                onClick={() => handleApplyScore(player.id, index)}
              >
                適用
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };