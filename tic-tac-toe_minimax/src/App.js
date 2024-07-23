import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Container, Button } from 'react-bootstrap';

function Square({ value, func }) {
  return <button className="square" onClick={func}>{value}</button>
}

class TicTacToe {
  constructor() {
    this.board = Array(9).fill(0);
    this.moves = [];
    this.isWin = this.isDraw = false;
    this.difficulty = 'hard';
  }
  get turn() {
    return 1 + this.moves.length % 2;
  }
  get validMoves() {
    return [...this.board.keys()].filter(i => !this.board[i])
  }
  play(move) { 
    if (this.board[move] !== 0 || this.isWin || this.isDraw) return false; 
    this.board[move] = this.turn;
    this.moves.push(move);
    
    this.isWin = /^(?:...)*([12])\1\1|^.?.?([12])..\2..\2|^([12])...\3...\3|^..([12]).\4.\4/.test(this.board.join(""));
    this.isDraw = !this.isWin && this.moves.length === this.board.length;
    return true;
  }
  takeBack() {
    if (this.moves.length === 0) return false;
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
      
      value = value ? (Math.abs(value) - 1) * Math.sign(-value) : 0;
      if (value >= best.value) {
        if (value > best.value) best = { value, moves: [] };
        best.moves.push(move);
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
    if (squares[i] || ticTacToeRef.current.isWin || ticTacToeRef.current.isDraw) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    ticTacToeRef.current.play(i);
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }, [squares, xIsNext]);

  useEffect(() => {
    if (difficulty && ticTacToeRef.current.difficulty !== difficulty) {
      ticTacToeRef.current.difficulty = difficulty;
    }
    if (!xIsNext && computerEnabled && !ticTacToeRef.current.isWin && !ticTacToeRef.current.isDraw) {
      const move = ticTacToeRef.current.goodMove();
      if (move !== undefined) {
        handleClick(move);
      }
    }
  }, [xIsNext, computerEnabled, handleClick, difficulty]);

  const winner = ticTacToeRef.current.isWin ? (xIsNext ? "O" : "X") : null;
  const isDraw = ticTacToeRef.current.isDraw

  
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    ticTacToeRef.current = new TicTacToe();
    setXIsNext(true);
  };
  
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
            <div><Square value={squares[0]} func={() => handleClick(0)} /></div>
            <div><Square value={squares[1]} func={() => handleClick(1)} /></div>
            <div><Square value={squares[2]} func={() => handleClick(2)} /></div>
          </div>

          <div className="board-row d-flex">
            <div><Square value={squares[3]} func={() => handleClick(3)} /></div>
            <div><Square value={squares[4]} func={() => handleClick(4)} /></div>
            <div><Square value={squares[5]} func={() => handleClick(5)} /></div>
          </div>

          <div className="board-row d-flex">
            <div><Square value={squares[6]} func={() => handleClick(6)} /></div>
            <div><Square value={squares[7]} func={() => handleClick(7)} /></div>
            <div><Square value={squares[8]} func={() => handleClick(8)} /></div>
          </div>
        </Container>

        <Container className="settings-container d-flex flex-column align-items-center mx-5">
          <Container className="d-flex justify-content-center my-4">
            <Button className="restart-button" onClick={resetGame}>Restart</Button>
          </Container>

          <Container className='computer-settings d-flex flex-column align-items-center my-4'>
            <h4>Computer Strength</h4>
            <div className="d-flex justify-content-center">
              <Button className={`difficulty-button me-2 ${difficulty === 'easy' ? 'active' : ''}`} variant="success" onClick={() => setDifficulty('easy')}>Easy</Button>
              <Button className={`difficulty-button ms-2 ${difficulty === 'hard' ? 'active' : ''}`} variant="danger" onClick={() => setDifficulty('hard')}>Impossible</Button>
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

