import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Container, Button } from 'react-bootstrap';

function Square({ value, onSquareClick }) {
  return <button className="square" onClick={onSquareClick}>{value}</button>
}

class TicTacToe {
  constructor() {
    this.board = Array(9).fill(0); // 0 means "empty"
    this.moves = [];
    this.isWin = this.isDraw = false;
    this.difficulty = 'hard'; // 'easy' or 'hard'
  }
  get turn() { // returns 1 or 2
    return 1 + this.moves.length % 2;
  }
  get validMoves() {
    return [...this.board.keys()].filter(i => !this.board[i])
  }
  play(move) { // move is an index in this.board
    if (this.board[move] !== 0 || this.isWin) return false; // invalid move
    this.board[move] = this.turn; // 1 or 2
    this.moves.push(move);
    // Use regular expression to detect any 3-in-a-row
    this.isWin = /^(?:...)*([12])\1\1|^.?.?([12])..\2..\2|^([12])...\3...\3|^..([12]).\4.\4/.test(this.board.join(""));
    this.isDraw = !this.isWin && this.moves.length === this.board.length;
    return true;
  }
  takeBack() {
    if (this.moves.length === 0) return false; // cannot undo
    this.board[this.moves.pop()] = 0;
    this.isWin = this.isDraw = false;
    return true;
  }
  minimax() {
    if (this.isWin) return { value: -10 };
    if (this.isDraw) return { value: 0 };
    let best = { value: -Infinity };
    for (let move of this.validMoves) {
      this.play(move);
      let { value } = this.minimax();
      this.takeBack();
      // Reduce magnitude of value (so shorter paths to wins are prioritised) and negate it
      value = value ? (Math.abs(value) - 1) * Math.sign(-value) : 0;
      if (value >= best.value) {
        if (value > best.value) best = { value, moves: [] };
        best.moves.push(move); // keep track of equally valued moves
      }
    }
    return best;
  }
  goodMove() {
    if (this.difficulty === 'easy') {
      const validMoves = this.validMoves;
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    let { moves } = this.minimax();
    // Pick a random move when there are choices:
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [computerEnabled, setComputerEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('hard');

  const ticTacToeRef = useRef(new TicTacToe());

  const handleClick = useCallback((i) => {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    ticTacToeRef.current.play(i);
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }, [squares, xIsNext]);

  useEffect(() => {
    ticTacToeRef.current.difficulty = difficulty;
    if (!xIsNext && computerEnabled) {
      const move = ticTacToeRef.current.goodMove();
      if (move !== undefined) {
        handleClick(move);
      }
    }
  }, [xIsNext, computerEnabled, handleClick, difficulty]);

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <Container className="game d-flex align-items-center justify-content-around mx-5">
        <Container className="scores">
          <h2>Scores : </h2>
          <h4>Player : 0</h4>
          <h4>Computer : 0</h4>
        </Container>

        <Container className="board mx-5">
          <Container className="status mb-4">{status}</Container>

          <div className="board-row d-flex">
            <div><Square value={squares[0]} onSquareClick={() => handleClick(0)} /></div>
            <div><Square value={squares[1]} onSquareClick={() => handleClick(1)} /></div>
            <div><Square value={squares[2]} onSquareClick={() => handleClick(2)} /></div>
          </div>

          <div className="board-row d-flex">
            <div><Square value={squares[3]} onSquareClick={() => handleClick(3)} /></div>
            <div><Square value={squares[4]} onSquareClick={() => handleClick(4)} /></div>
            <div><Square value={squares[5]} onSquareClick={() => handleClick(5)} /></div>
          </div>

          <div className="board-row d-flex">
            <div><Square value={squares[6]} onSquareClick={() => handleClick(6)} /></div>
            <div><Square value={squares[7]} onSquareClick={() => handleClick(7)} /></div>
            <div><Square value={squares[8]} onSquareClick={() => handleClick(8)} /></div>
          </div>
        </Container>

        <Container className="settings-container d-flex flex-column align-items-center mx-5">
          <Container className="d-flex justify-content-center my-4">
            <Button className="restart-button" onClick={() => {
              setSquares(Array(9).fill(null));
              ticTacToeRef.current = new TicTacToe();
              setXIsNext(true);
            }}>Restart</Button>
          </Container>

          <Container className='computer-settings d-flex flex-column align-items-center my-4'>
            <h4>Computer Strength</h4>
            <div className="d-flex justify-content-center">
              <Button className="easy-button me-2" variant="success" onClick={() => setDifficulty('easy')}>Easy</Button>
              <Button className="hard-button ms-2" variant="danger" onClick={() => setDifficulty('hard')}>Impossible</Button>
            </div>
          </Container>

          <Container className="d-flex justify-content-center my-4">
            <div><Button variant='warning' onClick={() => setComputerEnabled(!computerEnabled)}>
              {computerEnabled ? "Disable Computer" : "Enable Computer"}
            </Button></div>
          </Container>
        </Container>
      </Container>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
