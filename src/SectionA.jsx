import React, { useState, useEffect, useRef } from "react";
import "./SectionA.css";

// Importar os arquivos de som
import lineClearSound from "/test.mp3";
import lockSound from "/test.mp3";
import backgroundMusic from "/tetris-phonk-1080-ytshorts.savetube.me.mp4";
import gameOverMusic from "/gameover.mp4"; // Som que toca quando o jogo acaba

// Importar as imagens das peças
import iPieceImage from "/sol.jpg";
import oPieceImage from "/dog.jpg";
import tPieceImage from "/images.png";
import zPieceImage from "/Elon-Musk.webp";
import sPieceImage from "/trump.jpg";
import lPieceImage from "/Tesla-Cybertruck.webp";
import jPieceImage from "/MA7F4.jpg";

// Definir constantes para ajustar a velocidade
const INITIAL_SPEED = 300; // Velocidade inicial em milissegundos
const SPEED_INCREMENT = 30; // Incremento de velocidade por nível
const MIN_SPEED = 30; // Velocidade mínima em milissegundos
const LEVEL_UP_TIME = 10; // Tempo em segundos para aumentar de nível

const ROWS = 20; // Total de linhas no jogo
const COLS = 10; // Total de colunas no jogo
const CELL_SIZE = 30; // Tamanho de cada célula em pixels

// Associar tipos de peças às formas e imagens
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    image: iPieceImage,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    image: oPieceImage,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    image: tPieceImage,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    image: zPieceImage,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    image: sPieceImage,
  },
  L: {
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    image: lPieceImage,
  },
  J: {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    image: jPieceImage,
  },
};

const TETROMINO_TYPES = Object.keys(TETROMINOS);

const randomTetromino = () => {
  const randTetromino =
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return {
    type: randTetromino,
    shape: TETROMINOS[randTetromino].shape,
    image: TETROMINOS[randTetromino].image,
  };
};

function SectionA() {
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [currentTetromino, setCurrentTetromino] = useState(randomTetromino());
  const [position, setPosition] = useState({
    row: 0,
    col: Math.floor(COLS / 2) - 1,
  });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Usar a constante INITIAL_SPEED para a velocidade inicial
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const [level, setLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Refs para armazenar o estado atual
  const currentTetrominoRef = useRef(currentTetromino);
  const positionRef = useRef(position);
  const gridRef = useRef(grid);

  // Atualiza as refs sempre que o estado muda
  useEffect(() => {
    currentTetrominoRef.current = currentTetromino;
  }, [currentTetromino]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const rotateTetromino = (tetromino) => {
    const transposed = tetromino.shape[0].map((_, colIndex) =>
      tetromino.shape.map((row) => row[colIndex])
    );
    return {
      ...tetromino,
      shape: transposed.map((row) => row.reverse()),
    };
  };

  const canMove = (offsetRow, offsetCol, tetromino, pos, grd) => {
    return tetromino.shape.every((row, i) =>
      row.every((cell, j) => {
        const newRow = pos.row + i + offsetRow;
        const newCol = pos.col + j + offsetCol;

        if (cell === 0) return true;

        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
          const gridCell = grd[newRow][newCol];
          return gridCell === 0 || gridCell.value === 0;
        } else {
          return false;
        }
      })
    );
  };

  const clearFullRows = (grd) => {
    const rowsToRemove = [];
    grd.forEach((row, index) => {
      if (row.every((cell) => cell.value === 1 || cell === 1)) {
        rowsToRemove.push(index);
      }
    });

    if (rowsToRemove.length === 0) {
      return { newGrid: grd, numRowsCleared: 0 };
    }

    // Aplicar animação às linhas que serão removidas
    const gridWithAnimation = grd.map((row, index) => {
      if (rowsToRemove.includes(index)) {
        return row.map(() => 2); // Marca células para animação
      }
      return row;
    });

    // Atualizar o grid temporariamente para mostrar a animação
    setGrid(gridWithAnimation);

    // Tocar o som de remoção de linha
    lineClearAudio.current.currentTime = 0;
    lineClearAudio.current.play().catch((error) => {
      console.error("Erro ao reproduzir o som de remoção de linha:", error);
    });

    // Usar setTimeout para esperar a animação terminar (0.5s)
    setTimeout(() => {
      let newGrid = grd.filter((_, index) => !rowsToRemove.includes(index));
      const numRowsCleared = rowsToRemove.length;

      for (let i = 0; i < numRowsCleared; i++) {
        newGrid.unshift(Array(COLS).fill(0)); // Adicionar linha vazia no topo
      }

      setGrid(newGrid); // Atualizar o grid após remover as linhas
    }, 500);

    return { newGrid: grd, numRowsCleared: rowsToRemove.length };
  };

  const calculateScore = (numRowsCleared) => {
    switch (numRowsCleared) {
      case 1:
        return 100;
      case 2:
        return 300;
      case 3:
        return 500;
      case 4:
        return 800;
      default:
        return 0;
    }
  };

  const placeTetromino = (grd, tetromino, pos) => {
    let newGrid = grd.map((row) => row.slice());
    tetromino.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const newRow = pos.row + i;
          const newCol = pos.col + j;
          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            // Marcar a célula com um objeto que indica que está fixada
            newGrid[newRow][newCol] = {
              value: 1,
              isFixed: true,
              type: tetromino.type,
            };
          }
        }
      });
    });

    // Verificar e remover linhas completas
    const { newGrid: clearedGrid, numRowsCleared } = clearFullRows(newGrid);

    // Atualizar a pontuação se linhas foram removidas
    if (numRowsCleared > 0) {
      setScore((prevScore) => prevScore + calculateScore(numRowsCleared));
    }

    return clearedGrid;
  };

  // Sons do jogo
  const lineClearAudio = useRef(new Audio(lineClearSound));
  lineClearAudio.current.volume = 0; // Volume dos efeitos sonoros

  const lockAudio = useRef(new Audio(lockSound)); // Som para quando a peça se encaixa
  lockAudio.current.volume = 0;

  // Música de fundo
  const backgroundAudio = useRef(new Audio(backgroundMusic));
  backgroundAudio.current.loop = true;
  backgroundAudio.current.volume = 0.1; // Volume da música de fundo

  // Música de game over
  const gameOverAudio = useRef(new Audio(gameOverMusic));
  gameOverAudio.current.volume = 0.5;

  const moveDown = () => {
    const tetromino = currentTetrominoRef.current;
    const pos = positionRef.current;
    const grd = gridRef.current;

    if (canMove(1, 0, tetromino, pos, grd)) {
      setPosition((prevPosition) => ({
        row: prevPosition.row + 1,
        col: prevPosition.col,
      }));
    } else {
      // Tocar o som de encaixe da peça
      lockAudio.current.currentTime = 0;
      lockAudio.current.play().catch((error) => {
        console.error("Erro ao reproduzir o som de encaixe:", error);
      });

      setGrid((prevGrid) => {
        const newGrid = placeTetromino(prevGrid, tetromino, pos);
        return newGrid;
      });
      createNewTetromino();
    }
  };

  const createNewTetromino = () => {
    const newTetromino = randomTetromino();
    const newPosition = { row: 0, col: Math.floor(COLS / 2) - 1 };

    const grd = gridRef.current;

    if (canMove(0, 0, newTetromino, newPosition, grd)) {
      setCurrentTetromino(newTetromino);
      setPosition(newPosition);
    } else {
      setGameOver(true);
    }
  };

  const handleKeyDown = (event) => {
    if (gameOver) return;

    const tetromino = currentTetrominoRef.current;
    const pos = positionRef.current;
    const grd = gridRef.current;

    if (
      event.key === "ArrowLeft" ||
      event.key === "a" ||
      event.key === "A"
    ) {
      if (canMove(0, -1, tetromino, pos, grd)) {
        setPosition((prevPosition) => ({
          row: prevPosition.row,
          col: prevPosition.col - 1,
        }));
      }
    } else if (
      event.key === "ArrowRight" ||
      event.key === "d" ||
      event.key === "D"
    ) {
      if (canMove(0, 1, tetromino, pos, grd)) {
        setPosition((prevPosition) => ({
          row: prevPosition.row,
          col: prevPosition.col + 1,
        }));
      }
    } else if (event.key === "R" || event.key === "r") {
      const rotatedTetromino = rotateTetromino(tetromino);
      if (canMove(0, 0, rotatedTetromino, pos, grd)) {
        setCurrentTetromino(rotatedTetromino);
      }
    }
  };

  const resetGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setCurrentTetromino(randomTetromino());
    setPosition({ row: 0, col: Math.floor(COLS / 2) - 1 });
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setTimeElapsed(0);

    // Reiniciar a velocidade para a velocidade inicial definida na constante
    setSpeed(INITIAL_SPEED);

    // Reiniciar a música de fundo
    backgroundAudio.current.currentTime = 0;
    backgroundAudio.current.play().catch((error) => {
      console.error("Erro ao reproduzir a música de fundo:", error);
    });

    // Parar a música de game over
    gameOverAudio.current.pause();
    gameOverAudio.current.currentTime = 0;
  };

  const startGame = () => {
    setGameStarted(true);
    backgroundAudio.current.currentTime = 0;
    backgroundAudio.current.play().catch((error) => {
      console.error("Erro ao reproduzir a música de fundo:", error);
    });
  };

  // Contador de tempo
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000); // Incrementa a cada segundo

    return () => clearInterval(timer);
  }, [gameOver, gameStarted]);

  // Atualizar nível e velocidade
  useEffect(() => {
    if (gameOver) return;

    // Usar a constante LEVEL_UP_TIME para determinar quando subir de nível
    const newLevel = Math.floor(timeElapsed / LEVEL_UP_TIME) + 1;
    setLevel(newLevel);

    // Calcular a nova velocidade usando as constantes definidas
    const newSpeed = Math.max(
      MIN_SPEED,
      INITIAL_SPEED - (newLevel - 1) * SPEED_INCREMENT
    );
    setSpeed(newSpeed);
  }, [timeElapsed, gameOver]);

  useEffect(() => {
    if (!gameStarted) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const fallInterval = setInterval(() => {
      moveDown();
    }, speed);

    return () => clearInterval(fallInterval);
  }, [gameOver, speed, gameStarted]);

  // Pausar a música quando o jogo acaba
  useEffect(() => {
    if (gameOver) {
      backgroundAudio.current.pause();

      // Tocar música de game over
      gameOverAudio.current.currentTime = 0;
      gameOverAudio.current.play().catch((error) => {
        console.error("Erro ao reproduzir a música de game over:", error);
      });
    }
  }, [gameOver]);

  // Pausar a música quando o componente for desmontado
  useEffect(() => {
    return () => {
      backgroundAudio.current.pause();
      gameOverAudio.current.pause();
    };
  }, []);

  const renderGridWithTetromino = () => {
    const tempGrid = grid.map((row) => row.slice());
    currentTetromino.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const newRow = position.row + i;
          const newCol = position.col + j;
          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            tempGrid[newRow][newCol] = {
              value: 1,
              isFixed: false,
              type: currentTetromino.type,
            }; // Peça atual não está fixada
          }
        }
      });
    });
    return tempGrid;
  };

  return (
    <div
      className="tetris-container"
      style={{
        backgroundImage: `url('/hqdefault.jpg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        minHeight: '100vh',
      }}
    >
      {!gameStarted ? (
        <div className="start-screen">
          <button onClick={startGame}><p>START GAME</p></button>
        </div>
      ) : (
        <>
          <div className="score">
            <span className="score-text">SCORE: {score}</span>
            <span className="score-space"></span>
            <span className="level-text">LEVEL: {level}</span>
          </div>
          {gameOver ? (
            // Somente exibe o Game Over e o placar
            <div className="game-over">
              <div>GAME OVER</div>
              <button onClick={resetGame}><h1>RESTART</h1></button>
            </div>
          ) : (
            // Exibe o restante do jogo quando não é Game Over
            <div className="game-area">
              <div className="buttons-container">
                <div className="nametoken">TROLL TETRIS</div>
                <a
                  href="https://t.me/trolltetris"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="social-button"><h1>Telegram</h1></button>
                </a>
                <a
                  href="https://x.com/trolltetris"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="social-button"><h2>Twitter</h2></button>
                </a>
                <a
                  href="https://pump.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="social-button"><h3>Pump.fun</h3></button>
                </a>
              </div>
              <div className="tetris">
                {renderGridWithTetromino().map((row, i) => (
                  <div key={i} className="row">
                    {row.map((cell, j) => {
                      let cellClass = "cell";
                      let style = {};

                      if (cell) {
                        if (cell.value === 1 || cell === 1) {
                          cellClass += " filled";
                          if (cell.isFixed) {
                            cellClass += " fixed";
                          }
                          if (cell.type && TETROMINOS[cell.type]) {
                            style.backgroundImage = `url(${TETROMINOS[cell.type].image})`;
                            style.backgroundSize = "cover";
                            style.backgroundRepeat = "no-repeat";
                            style.backgroundPosition = "center";
                          }
                        } else if (cell === 2) {
                          cellClass += " clearing";
                        }
                      }

                      return (
                        <div key={j} className={cellClass} style={style}></div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="how-to-play">
                <h2>How to Play</h2>
                <p>
                  Use the left and right arrow keys or the 'A' and 'D' keys to move the piece.<br />
                  Press 'R' to rotate the piece.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SectionA;
