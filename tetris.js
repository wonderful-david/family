class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // 캔버스 크기 설정
        this.canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
        this.canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;
        
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // 보드 초기화
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        // 테트로미노 정의
        this.tetrominoes = {
            I: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00f5ff'
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#ffff00'
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#a000f0'
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00f000'
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#f00000'
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0000f0'
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#f0a000'
            }
        };

        this.pieceTypes = Object.keys(this.tetrominoes);
        this.spawnPiece();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

                    document.getElementById('startBtn').addEventListener('click', () => this.start());
            document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
            document.getElementById('restartBtn').addEventListener('click', () => this.restart());

            // 모바일 컨트롤 버튼 이벤트
            document.getElementById('leftBtn').addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) {
                    this.movePiece(-1, 0);
                }
            });
            
            document.getElementById('rightBtn').addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) {
                    this.movePiece(1, 0);
                }
            });
            
            document.getElementById('downBtn').addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) {
                    this.movePiece(0, 1);
                }
            });
            
            document.getElementById('rotateBtn').addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) {
                    this.rotatePiece();
                }
            });
            
            document.getElementById('dropBtn').addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) {
                    this.hardDrop();
                }
            });

            // 터치 이벤트 추가 (모바일에서 더 부드럽게)
            const mobileButtons = document.querySelectorAll('.control-btn-mobile');
            mobileButtons.forEach(button => {
                // 터치 이벤트
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    button.style.transform = 'scale(0.95)';
                });
                
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    button.style.transform = 'scale(1)';
                });
                
                button.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    button.style.transform = 'scale(1)';
                });
                
                // 클릭 이벤트도 추가 (터치가 안 될 때를 대비)
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    button.style.transform = 'scale(0.95)';
                });
                
                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    button.style.transform = 'scale(1)';
                });
            });

            // 모바일에서 터치 이벤트가 제대로 작동하도록 추가 설정
            document.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
            
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.createPiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // 게임 오버 체크
        if (this.isCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.gameOver();
        }
        
        this.updateNextPieceDisplay();
    }

    createPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        return {
            type: type,
            shape: this.tetrominoes[type].shape,
            color: this.tetrominoes[type].color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.tetrominoes[type].shape[0].length / 2),
            y: 0
        };
    }

    movePiece(dx, dy) {
        if (!this.isCollision(this.currentPiece.x + dx, this.currentPiece.y + dy, this.currentPiece.shape)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    rotateMatrix(matrix) {
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                rotated[j][N - 1 - i] = matrix[i][j];
            }
        }
        return rotated;
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.placePiece();
    }

    isCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = this.currentPiece.x + col;
                    const y = this.currentPiece.y + row;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.type;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                row++; // 같은 행을 다시 체크
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }

    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.dropTime += 16; // 60fps 기준
        
        if (this.dropTime >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = 0;
        }
        
        this.draw();
        this.updateDisplay();
    }

    draw() {
        // 캔버스 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 보드 그리기
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.board[row][col]);
                }
            }
        }
        
        // 현재 조각 그리기
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
            this.drawGhostPiece();
        }
        
        // 그리드 라인 그리기 (선택사항)
        this.drawGrid();
    }

    drawBlock(x, y, type) {
        this.ctx.fillStyle = this.tetrominoes[type].color;
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }

    drawPiece(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    this.drawBlock(piece.x + col, piece.y + row, piece.type);
                }
            }
        }
    }

    drawGhostPiece() {
        if (!this.currentPiece) return;
        
        let ghostY = this.currentPiece.y;
        while (!this.isCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
            ghostY++;
        }
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    this.ctx.fillRect(
                        (this.currentPiece.x + col) * this.BLOCK_SIZE,
                        (ghostY + row) * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                }
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 세로 라인
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // 가로 라인
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    updateNextPieceDisplay() {
        const container = document.getElementById('nextPiece');
        container.innerHTML = '';
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape;
            const rows = shape.length;
            const cols = shape[0].length;
            
            // 4x4 그리드에 맞춰 중앙 정렬
            const startRow = Math.floor((4 - rows) / 2);
            const startCol = Math.floor((4 - cols) / 2);
            
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'next-cell';
                    
                    // 실제 블록이 있는 위치인지 확인
                    const shapeRow = row - startRow;
                    const shapeCol = col - startCol;
                    
                    if (shapeRow >= 0 && shapeRow < rows && 
                        shapeCol >= 0 && shapeCol < cols && 
                        shape[shapeRow][shapeCol]) {
                        cell.style.backgroundColor = this.nextPiece.color;
                        cell.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    }
                    
                    container.appendChild(cell);
                }
            }
        }
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }

    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            document.getElementById('pauseBtn').textContent = this.gamePaused ? '계속' : '일시정지';
        }
    }

    restart() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;
        
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseBtn').textContent = '일시정지';
        
        this.init();
        this.start();
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    gameLoop() {
        if (this.gameRunning) {
            this.update();
            setTimeout(() => this.gameLoop(), 16); // 60fps로 고정
        }
    }
}

// 게임 시작
let tetrisGame;
document.addEventListener('DOMContentLoaded', () => {
    tetrisGame = new Tetris();
}); 