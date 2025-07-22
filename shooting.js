class ShootingGame {
    constructor() {
        this.canvas = document.getElementById('shootingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 게임 상태
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // 플레이어 우주선
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 40,
            height: 30,
            speed: 5,
            color: '#00ff00'
        };
        
        // 총알 배열
        this.bullets = [];
        this.bulletSpeed = 7;
        this.bulletSize = 3;
        
        // 적 배열
        this.enemies = [];
        this.enemySpeed = 2;
        this.enemySpawnRate = 60; // 프레임당 적 생성 확률
        this.enemySpawnCounter = 0;
        
        // 폭발 효과
        this.explosions = [];
        
        // 키보드 입력
        this.keys = {};
        
        // 게임 루프
        this.lastTime = 0;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        // 키보드 이벤트 리스너
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) {
                    this.shoot();
                }
            }
            
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 버튼 이벤트 리스너
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        
        // 초기 화면 그리기
        this.draw();
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.score = 0;
            this.level = 1;
            this.lives = 3;
            this.bullets = [];
            this.enemies = [];
            this.explosions = [];
            this.enemySpawnCounter = 0;
            
            this.updateDisplay();
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
            }
        }
    }
    
    restart() {
        this.gameRunning = false;
        this.start();
    }
    
    update(timestamp) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateExplosions();
        this.checkCollisions();
        this.spawnEnemies();
        
        this.draw();
        
        if (this.gameRunning) {
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }
    
    updatePlayer() {
        // 좌우 이동
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed;
        }
        
        // 화면 경계 체크
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.width - this.player.width) {
            this.player.x = this.width - this.player.width;
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            // 화면 밖으로 나간 총알 제거
            if (bullet.y < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;
            
            // 화면 밖으로 나간 적 제거
            if (enemy.y > this.height) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateDisplay();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life--;
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    spawnEnemies() {
        this.enemySpawnCounter++;
        
        if (Math.random() < this.enemySpawnRate / 100) {
            const enemy = {
                x: Math.random() * (this.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: this.enemySpeed + Math.random() * 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            };
            
            this.enemies.push(enemy);
            this.enemySpawnCounter = 0;
        }
        
        // 레벨에 따른 난이도 증가
        if (this.score > this.level * 1000) {
            this.level++;
            this.enemySpeed += 0.5;
            this.enemySpawnRate += 5;
            this.updateDisplay();
        }
    }
    
    checkCollisions() {
        // 총알과 적 충돌 체크
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    // 충돌 발생
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // 폭발 효과 추가
                    this.addExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    
                    // 점수 증가
                    this.score += 100;
                    this.updateDisplay();
                    break;
                }
            }
        }
        
        // 플레이어와 적 충돌 체크
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.checkCollision(this.player, enemy)) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateDisplay();
                
                // 플레이어 폭발 효과
                this.addExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    addExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            life: 10,
            maxLife: 10
        });
    }
    
    shoot() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - this.bulletSize / 2,
            y: this.player.y,
            width: this.bulletSize,
            height: this.bulletSize * 2,
            speed: this.bulletSpeed,
            color: '#ffff00'
        };
        
        this.bullets.push(bullet);
    }
    
    draw() {
        // 배경 그리기
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 별 배경 그리기
        this.drawStars();
        
        // 플레이어 그리기
        this.drawPlayer();
        
        // 총알 그리기
        this.drawBullets();
        
        // 적 그리기
        this.drawEnemies();
        
        // 폭발 효과 그리기
        this.drawExplosions();
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width;
            const y = (i * 73) % this.height;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 우주선 디테일
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 30, 20);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 20, 10);
    }
    
    drawBullets() {
        this.ctx.fillStyle = '#ffff00';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 적 디테일
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 20, 20);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 14, 14);
        }
    }
    
    drawExplosions() {
        for (const explosion of this.explosions) {
            const alpha = explosion.life / explosion.maxLife;
            const size = (explosion.maxLife - explosion.life) * 3;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ff6600';
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
}

// 모바일 컨트롤을 위한 전역 함수들
function moveLeft() {
    if (shootingGame && shootingGame.gameRunning && !shootingGame.gamePaused) {
        shootingGame.player.x -= shootingGame.player.speed;
        if (shootingGame.player.x < 0) shootingGame.player.x = 0;
    }
}

function moveRight() {
    if (shootingGame && shootingGame.gameRunning && !shootingGame.gamePaused) {
        shootingGame.player.x += shootingGame.player.speed;
        if (shootingGame.player.x > shootingGame.width - shootingGame.player.width) {
            shootingGame.player.x = shootingGame.width - shootingGame.player.width;
        }
    }
}

function shoot() {
    if (shootingGame && shootingGame.gameRunning && !shootingGame.gamePaused) {
        shootingGame.shoot();
    }
}

// 게임 초기화
let shootingGame;
document.addEventListener('DOMContentLoaded', () => {
    shootingGame = new ShootingGame();
}); 