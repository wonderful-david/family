class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
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

        // 게임 모드 버튼
        const pvpBtn = document.getElementById('pvp-btn');
        const aiBtn = document.getElementById('ai-btn');
        
        pvpBtn.addEventListener('click', () => {
            this.setGameMode('pvp');
        });
        
        aiBtn.addEventListener('click', () => {
            this.setGameMode('ai');
        });
    }

    makeMove(index) {
        // AI 모드에서 AI 차례일 때는 클릭 무시
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            return;
        }
        
        if (this.board[index] === '' && this.gameActive) {
            this.board[index] = this.currentPlayer;
            this.renderBoard();
            
            if (this.checkWinner()) {
                this.handleGameEnd('win');
            } else if (this.checkDraw()) {
                this.handleGameEnd('draw');
            } else {
                this.switchPlayer();
                
                // AI 모드에서 AI 차례인 경우
                if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
                    this.makeAIMove();
                }
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
            
            // AI 모드에서 AI 차례일 때는 셀 비활성화
            if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
                cell.style.cursor = 'not-allowed';
                cell.style.opacity = '0.6';
            } else {
                cell.style.cursor = 'pointer';
                cell.style.opacity = '1';
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

    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        
        // 버튼 스타일 업데이트
        const pvpBtn = document.getElementById('pvp-btn');
        const aiBtn = document.getElementById('ai-btn');
        
        pvpBtn.classList.toggle('active', mode === 'pvp');
        aiBtn.classList.toggle('active', mode === 'ai');
        
        // AI 모드이고 AI가 먼저 시작하는 경우
        if (mode === 'ai' && this.currentPlayer === 'O') {
            this.makeAIMove();
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;
        
        // AI가 생각하는 중 표시
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'AI가 생각 중... 🤔';
        statusElement.classList.add('ai-thinking');
        
        // 셀 비활성화 (AI 차례임을 시각적으로 표시)
        this.renderBoard();
        
        // 약간의 지연으로 자연스러운 느낌
        setTimeout(() => {
            const bestMove = this.findBestMove();
            if (bestMove !== -1) {
                this.board[bestMove] = 'O';
                this.renderBoard();
                
                if (this.checkWinner()) {
                    this.handleGameEnd('win');
                } else if (this.checkDraw()) {
                    this.handleGameEnd('draw');
                } else {
                    this.switchPlayer();
                }
            }
            
            statusElement.classList.remove('ai-thinking');
        }, 500);
    }

    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        // 종료 조건
        if (this.checkWinnerForAI(board)) {
            return isMaximizing ? -1 : 1;
        }
        
        if (this.checkDrawForAI(board)) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinnerForAI(board) {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return true;
            }
        }
        return false;
    }

    checkDrawForAI(board) {
        return board.every(cell => cell !== '');
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