class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.cells = document.querySelectorAll('[data-cell]');
        this.statusDisplay = document.getElementById('status');
        this.restartButton = document.getElementById('restartButton');
        this.difficultySelect = document.getElementById('difficulty');
        this.winningLine = document.querySelector('.winning-line');

        this.initializeGame();
    }

    initializeGame() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e), { once: true });
        });

        this.restartButton.addEventListener('click', () => this.restartGame());
        this.difficultySelect.addEventListener('change', () => this.restartGame());
    }

    handleCellClick(e) {
        const cell = e.target;
        const index = Array.from(this.cells).indexOf(cell);

        if (this.board[index] !== '' || !this.gameActive) return;

        this.makeMove(index);
        
        if (this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());

        if (this.checkWin()) {
            this.gameActive = false;
            const isPlayerWin = this.currentPlayer === 'X';
            this.statusDisplay.textContent = isPlayerWin ? "You win!" : "Bot wins!";
            this.showWinningLine();
            return;
        }

        if (this.checkDraw()) {
            this.gameActive = false;
            this.statusDisplay.textContent = "It's a draw!";
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.statusDisplay.textContent = `${this.currentPlayer}'s turn`;
    }

    showWinningLine() {
        const winningCombination = this.winningCombinations.find(combination => {
            return combination.every(index => this.board[index] === this.currentPlayer);
        });

        if (winningCombination) {
            winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });

            this.winningLine.className = 'winning-line';

            if (winningCombination[0] === 0 && winningCombination[2] === 2) {
                this.winningLine.classList.add('horizontal');
                this.winningLine.style.top = '16.66%';
            } else if (winningCombination[0] === 3 && winningCombination[2] === 5) {
                this.winningLine.classList.add('horizontal');
                this.winningLine.style.top = '50%';
            } else if (winningCombination[0] === 6 && winningCombination[2] === 8) {
                this.winningLine.classList.add('horizontal');
                this.winningLine.style.top = '83.33%';
            } else if (winningCombination[0] === 0 && winningCombination[2] === 6) {
                this.winningLine.classList.add('vertical');
                this.winningLine.style.left = '16.66%';
            } else if (winningCombination[0] === 1 && winningCombination[2] === 7) {
                this.winningLine.classList.add('vertical');
                this.winningLine.style.left = '50%';
            } else if (winningCombination[0] === 2 && winningCombination[2] === 8) {
                this.winningLine.classList.add('vertical');
                this.winningLine.style.left = '83.33%';
            } else if (winningCombination[0] === 0 && winningCombination[2] === 8) {
                this.winningLine.classList.add('diagonal', 'forward');
            } else if (winningCombination[0] === 2 && winningCombination[2] === 6) {
                this.winningLine.classList.add('diagonal', 'reverse');
            }

            this.winningLine.classList.add('active');
        }
    }

    makeAIMove() {
        const difficulty = this.difficultySelect.value;
        let move;

        switch (difficulty) {
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
        }

        this.makeMove(move);
    }

    getEasyMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    getMediumMove() {
        if (Math.random() < 0.7) {
            return this.getHardMove();
        }
        return this.getEasyMove();
    }

    getHardMove() {
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        const forkMove = this.findForkMove();
        if (forkMove !== null) {
            return forkMove;
        }

        const blockForkMove = this.blockOpponentFork();
        if (blockForkMove !== null) {
            return blockForkMove;
        }

        if (this.board[4] === '') return 4;

        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(edge => this.board[edge] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }

        return this.getEasyMove();
    }

    findForkMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);

        for (const index of emptyCells) {
            this.board[index] = 'O';
            const winningPaths = this.countWinningPaths('O');
            this.board[index] = '';

            if (winningPaths >= 2) {
                return index;
            }
        }
        return null;
    }

    blockOpponentFork() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);

        for (const index of emptyCells) {
            this.board[index] = 'X';
            const winningPaths = this.countWinningPaths('X');
            this.board[index] = '';

            if (winningPaths >= 2) {
                return index;
            }
        }
        return null;
    }

    countWinningPaths(player) {
        let count = 0;
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] === player && this.board[b] === player && this.board[c] === '') count++;
            if (this.board[a] === player && this.board[c] === player && this.board[b] === '') count++;
            if (this.board[b] === player && this.board[c] === player && this.board[a] === '') count++;
        }
        return count;
    }

    checkWin() {
        return this.winningCombinations.some(combination => {
            return combination.every(index => {
                return this.board[index] === this.currentPlayer;
            });
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.statusDisplay.textContent = "Your turn!";
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
            cell.addEventListener('click', (e) => this.handleCellClick(e), { once: true });
        });

        this.winningLine.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 