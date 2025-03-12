"use strict";

const EMPTY_SLOT = 0;
const random = n => Math.floor(Math.random() * n);

function Player(name, mark, color="blue") {
    let code;
    const getName = () => name;
    const getMark = () => mark;
    const setCode = c => code = c;
    const getCode = () => code; 
    const getColor = () => color;
    return { getName, getMark, setCode, getCode };
}

function Cell() {
    let code = EMPTY_SLOT;
    const addCode = player => code = player.getCode();
    const getCode = () => code;
    const reset = () => code = 0;
    return {getCode, addCode, reset};
}

function GameBoard() {
    const rows = 3;
    const cols = 3;
    const board = [];
    for (let i=0; i<rows;i++) {
        board.push([]);
        for (let j=0;j<cols;j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeCode = (i, j, player) => board[i][j].addCode(player);

    const getRow = i => board[i];

    const getColumn = function(j) {
        const col = [];
        for (let i=0;i<rows;i++) {col.push(board[i][j])}
        return col;
    }

    const getDiag = n => n === 0 ? [board[0][0], board[1][1], board[2][2]] : [board[0][2], board[1][1], board[2][0]];



    const reset = function () {
        for (let i=0;i<rows;i++) {
            for (let j=0;j<cols;j++) {
                board[i][j].reset();
            }
        }
    }

    const toString = function() {
        let str = "";
        for (let i=0;i<rows;i++) {
            str += board[i].map(cell => cell.getCode()).join(" | ") + "\n" + "-".repeat(10) + "\n"; 
        }
        return str;
    }

    const isFull = function() {
        for (let i=0;i<rows;i++) {
            // console.log(i, board.map(cell => cell.getCode()))
            if (board[i].map(cell => cell.getCode()).some(value => value === EMPTY_SLOT)) return false;
        }
        return true;
    }

    return {getBoard, placeCode, getRow, getColumn, getDiag, reset, toString, isFull};

}

function GameController(player1 = Player("p1", "x"), player2 = Player("p2", "O")) {
    const board = GameBoard();
    const players = [player1, player2];
    let activePlayer;
    const setActivePlayer = () => activePlayer = players[random(2)];
    setActivePlayer();
    players[0].setCode(1);
    players[1].setCode(2);

    
    const getPlayers = () => players;
    const getActivePlayer = () => activePlayer;
    const switchActivePlayer = () => activePlayer = activePlayer === players[0] ? players[1] : players[0];
    const getPlayerMark = code => code === 0 ? "" : players[code - 1].getMark();
    
    const printBoard = () => console.log(board.toString());

    const playRound = function(i, j) {
        board.placeCode(i, j, activePlayer);
        printBoard();
        let winner = getWinner(i, j);
        if (winner != null) return winner;
        switchActivePlayer();
        return null;
    }

    const check = function(sequence) {
        let values = sequence.map(cell => cell.getCode());
        if (values.every(value => value === 1) || values.every(value => value === 2)) return activePlayer;
        return null;
    }

    const getWinner = function(i, j) {
        let winner = null;
        for (let sequence of [board.getRow(i), board.getColumn(j), board.getDiag(0), board.getDiag(1)]) {
            winner = check(sequence);
            if (winner != null) {
                console.log(winner.getName());
                return winner;
            }
            
            if (board.isFull()) return false;
        } return null;
    }

    return { playRound, getPlayerMark, getBoard : board.getBoard, getPlayerMark, getActivePlayer, setActivePlayer, getPlayers, reset: board.reset};
}

const ScreenController = function() {
    let game;
    let p1Score = 0;
    let p2Score = 0;
    // const game = GameController();
    const startMenuDiv = document.querySelector(".start-menu-container");
    const gameBoardDiv = document.querySelector(".game-board");
    const resultsMenuDiv = document.querySelector(".results-menu-container");
    const activePlayerDiv = document.querySelector(".active-player");
    const playBtn = document.querySelector(".play-button");
    const playAgainBtn = document.querySelector(".play-again-button");
    const endGameBtn = document.querySelector(".end-game-button");

    const [p1NameInp, p2NameInp] = Array.from(document.querySelectorAll(".player-name-input"));
    const [p1MarkInp, p2MarkInp] = Array.from(document.querySelectorAll(".player-mark-input"));
    const [p1ColorInp, p2ColorInp] = Array.from(document.querySelectorAll(".player-color-input"));


    const cellButtons = [];

    function playButtonHandler() {
        game = GameController(
            Player(p1NameInp.value, p1MarkInp.value),
            Player(p2NameInp.value, p2MarkInp.value)
        );

        activePlayerDiv.innerText = game.getActivePlayer().getName();
        startMenuDiv.style.display = "none";
        gameBoardDiv.style.display = "grid";
        game.getBoard().forEach( (row, i) => row.forEach( (cell, j) => {
            const cellButton = document.createElement("button");
            cellButton.classList.add("cell");
            [cellButton.dataset.i, cellButton.dataset.j] = [i, j];
            gameBoardDiv.appendChild(cellButton);
            cellButtons.push(cellButton);
        }));
    }

    const updateScreen = function() {
        let cell;
        let i;
        let j;
        activePlayerDiv.innerText = game.getActivePlayer().getName();
        for (let cellButton of cellButtons) {
            [i, j] = [cellButton.dataset.i, cellButton.dataset.j];
            cell = game.getBoard()[i][j];
            if (cell.getCode() === 1) cellButton.style.color = p1ColorInp.value;
            else if (cell.getCode() === 2) cellButton.style.color = p2ColorInp.value;
            cellButton.innerText = game.getPlayerMark(cell.getCode());
        }
    };

    const gameBoardClickHandler = function(e) {
        const cellButton = e.target.closest("button");
        if (cellButton.innerText != "") return;
        let winner = game.playRound(cellButton.dataset.i, cellButton.dataset.j);
        if (winner != null) {
            gameBoardDiv.style.display = "none";
            resultsMenuDiv.style.display = "flex";
            if (!winner) {
                resultsMenuDiv.firstElementChild.innerText = `DRAW!`;
            } else {
                resultsMenuDiv.firstElementChild.innerText = `The winner of the last round is ${winner.getName()}`;
            }
            if (winner === game.getPlayers()[0]) p1Score++;
            else if (winner === game.getPlayers()[1]) p2Score++;
            resultsMenuDiv.children[1].innerText = `${game.getPlayers()[0].getName()} : ${p1Score} Vs ${p2Score} : ${game.getPlayers()[1].getName()}`;
        }
        updateScreen();
    };

    const playAgainButtonHandler = function() {
        game.reset();
        game.setActivePlayer();
        resultsMenuDiv.style.display = "none";
        gameBoardDiv.style.display = "grid";
        updateScreen();
    };

    const endGameButtonHandler = function() {
        resultsMenuDiv.style.display = "none";
        gameBoardDiv.style.display = "none";
        startMenuDiv.style.display = "flex";
        gameBoardDiv.innerHTML = "";
        p1Score = 0;
        p2Score = 0;
    };
    
    gameBoardDiv.addEventListener("click", gameBoardClickHandler);
    playBtn.addEventListener("click", playButtonHandler);
    playAgainBtn.addEventListener("click", playAgainButtonHandler);
    endGameBtn.addEventListener("click", endGameButtonHandler);

}

ScreenController();