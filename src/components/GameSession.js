import React, { useEffect, useState, useRef } from 'react';

const GameSession = () => {
  const [gameLogs, setGameLogs] = useState([]);
  const [currentTasks, setCurrentTasks] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:3001');

      wsRef.current.onopen = () => {
        console.log('Connected to game server');

        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'initial':
            setCurrentTasks(data.tasks);
            setGameLogs(data.logs);
            break;

          case 'taskUpdate':
            setCurrentTasks(data.tasks);
            break;

          case 'logsUpdate':
            setGameLogs(prevLogs => {
              const newLogs = [...prevLogs, ...data.logs];
              return newLogs.slice(-150);
            });
            break;

          case 'pong':
            console.log('Received pong from server');
            break;
        }
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from game server');

        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 20000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {currentTasks.map(task => (
          <div key={task.id} className="minecraft-panel">
            <h3 className="minecraft-text-green font-bold">{task.userName}</h3>
            <p className="minecraft-text">{task.taskName}</p>
            <p className="minecraft-text-gray">{task.status}</p>
          </div>
        ))}
      </div>

      <div className="minecraft-panel">
        <h3 className="minecraft-text-green font-bold mb-2">Game Logs</h3>
        <div className="h-[500px] overflow-y-auto custom-scrollbar" style={{ cursor: 'inherit' }}>
          {gameLogs.map((log, index) => (
            <div key={index} className="minecraft-text py-1" style={{ cursor: 'inherit' }}>
              <span className={`${log.userName === "MineTard_AI" ? "minecraft-text-green" : "minecraft-text-blue"}`}>
                {log.userName}
              </span>: {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default GameSession;