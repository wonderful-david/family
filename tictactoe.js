class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        this.initializeGame();
        this.loadScores();
    }

    initializeGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.updateStatus();
        this.renderBoard();
        this.addEventListeners();
    }

    addEventListeners() {
        // 셀 클릭 이벤트
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.makeMove(index);
            });
        });

        // 새 게임 버튼
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }

    makeMove(index) {
        if (this.board[index] === '' && this.gameActive) {
            this.board[index] = this.currentPlayer;
            this.renderBoard();
            
            if (this.checkWinner()) {
                this.handleGameEnd('win');
            } else if (this.checkDraw()) {
                this.handleGameEnd('draw');
            } else {
                this.switchPlayer();
            }
        }
    }

    checkWinner() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 가로
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 세로
            [0, 4, 8], [2, 4, 6] // 대각선
        ];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return true;
            }
        }
        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            this.scores[this.currentPlayer]++;
            this.updateStatus(`${this.currentPlayer} 승리! 🎉`);
            this.highlightWinner();
        } else {
            this.scores.draw++;
            this.updateStatus('무승부! 🤝');
        }
        
        this.saveScores();
        this.updateScoreDisplay();
        
        // 2초 후 자동으로 새 게임 시작
        setTimeout(() => {
            this.resetGame();
        }, 2000);
    }

    highlightWinner() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                const cells = document.querySelectorAll('.cell');
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        if (this.gameActive) {
            statusElement.textContent = `${this.currentPlayer} 차례입니다!`;
        }
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            if (this.board[index] === 'X') {
                cell.classList.add('x');
            } else if (this.board[index] === 'O') {
                cell.classList.add('o');
            }
        });
    }

    resetGame() {
        this.initializeGame();
    }

    updateScoreDisplay() {
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
        document.getElementById('score-draw').textContent = this.scores.draw;
    }

    saveScores() {
        localStorage.setItem('tictactoe-scores', JSON.stringify(this.scores));
    }

    loadScores() {
        const savedScores = localStorage.getItem('tictactoe-scores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.getElementById('reset-btn').click();
    }
}); 