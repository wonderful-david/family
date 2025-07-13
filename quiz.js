// 퀴즈 데이터 (난이도별 포인트 시스템 추가)
const quizData = [
    {
        question: "1 + 1 = ?",
        answer: "2",
        type: "multiple_choice",
        options: ["1", "2", "3", "4"],
        difficulty: "easy",
        points: 1
    },
    {
        question: "한국의 수도는?",
        answer: "서울",
        type: "multiple_choice",
        options: ["부산", "서울", "대구", "인천"],
        difficulty: "easy",
        points: 1
    },
    {
        question: "태양계에서 가장 큰 행성은?",
        answer: "목성",
        type: "multiple_choice",
        options: ["지구", "화성", "목성", "토성"],
        difficulty: "easy",
        points: 1
    },
    {
        question: "사과 영어로?",
        answer: "apple",
        type: "text",
        difficulty: "easy",
        points: 1
    },
    {
        question: "15 × 7 = ?",
        answer: "105",
        type: "multiple_choice",
        options: ["95", "100", "105", "110"],
        difficulty: "medium",
        points: 2
    },
    {
        question: "세계에서 가장 큰 대륙은?",
        answer: "아시아",
        type: "multiple_choice",
        options: ["아프리카", "아시아", "북아메리카", "남아메리카"],
        difficulty: "medium",
        points: 2
    },
    {
        question: "인체의 뼈는 총 몇 개인가요?",
        answer: "206",
        type: "multiple_choice",
        options: ["200", "206", "210", "216"],
        difficulty: "medium",
        points: 2
    },
    {
        question: "원주율(π)의 값은?",
        answer: "3.14",
        type: "text",
        difficulty: "hard",
        points: 3
    },
    {
        question: "DNA의 이중나선 구조를 발견한 과학자는?",
        answer: "왓슨과 크릭",
        type: "text",
        difficulty: "hard",
        points: 3
    },
    {
        question: "세계에서 가장 깊은 바다는?",
        answer: "마리아나 해구",
        type: "text",
        difficulty: "hard",
        points: 3
    },
    {
        question: "2의 10제곱은?",
        answer: "1024",
        type: "multiple_choice",
        options: ["512", "1024", "2048", "4096"],
        difficulty: "hard",
        points: 3
    }
];

// 난이도별 색상
const difficultyColors = {
    easy: "#4CAF50",
    medium: "#FF9800",
    hard: "#F44336"
};

// 난이도별 한글 이름
const difficultyNames = {
    easy: "쉬움",
    medium: "보통",
    hard: "어려움"
};

// 퀴즈 히스토리
let quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];

// DOM 요소들
// quizForm, quizQuestion, quizOptions, quizAnswer, quizResult, quizHistoryContainer 삭제

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    displayQuiz();
    displayQuizHistory();
    
    // 필터 버튼 이벤트
    document.getElementById('filter-all').addEventListener('click', () => filterHistory('all'));
    document.getElementById('filter-correct').addEventListener('click', () => filterHistory('correct'));
    document.getElementById('filter-incorrect').addEventListener('click', () => filterHistory('incorrect'));
});

// 오늘의 퀴즈 반환
function getTodayQuiz() {
    const today = new Date();
    const idx = today.getFullYear() + today.getMonth() + today.getDate();
    return quizData[idx % quizData.length];
}

// 랜덤 퀴즈 반환
function getRandomQuiz() {
    const idx = Math.floor(Math.random() * quizData.length);
    return quizData[idx];
}

// 오늘 퀴즈를 이미 풀었는지 확인
function isTodayQuizSolved() {
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const today = new Date().toDateString();
    return quizHistory.some(q => q.date === today);
}

// 다음 퀴즈까지 남은 시간 계산
function getNextQuizTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
}

// 카운트다운 표시
function updateCountdown() {
    const countdownElement = document.getElementById('quiz-countdown');
    if (!countdownElement) return;
    
    const timeLeft = getNextQuizTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    countdownElement.textContent = `다음 퀴즈까지 ${hours}시간 ${minutes}분 ${seconds}초`;
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 퀴즈 표시 (quiz 파라미터가 있으면 해당 퀴즈, 없으면 오늘의 퀴즈)
function displayQuiz(quiz) {
    if (!quiz) quiz = getTodayQuiz();
    const quizContainer = document.getElementById('quiz-container');
    const solved = isTodayQuizSolved();
    
    // 난이도 배지 추가
    const difficultyBadge = `
        <div class="difficulty-badge" style="background-color: ${difficultyColors[quiz.difficulty]};">
            ${difficultyNames[quiz.difficulty]} (${quiz.points}점)
        </div>
    `;
    
    quizContainer.innerHTML = `
        <div class="quiz-header">
            <h2>오늘의 퀴즈</h2>
            ${difficultyBadge}
        </div>
        <div class="quiz-question">
            <h3>${quiz.question}</h3>
        </div>
        <div class="quiz-options" id="quiz-options">
            ${quiz.type === 'multiple_choice' && quiz.options ? 
                quiz.options.map(option => `
                    <div class="quiz-option" tabindex="0">${option}</div>
                `).join('') : 
                `<input type="text" id="quiz-answer" placeholder="정답을 입력하세요" class="quiz-input">`
            }
        </div>
        <div class="quiz-actions">
            <button id="submit-answer" class="btn btn-primary" ${solved ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>정답 제출</button>
        </div>
        ${solved ? `
            <div class="quiz-info-msg">오늘의 퀴즈는 하루에 한 번만 풀 수 있습니다.</div>
            <div class="quiz-countdown" id="quiz-countdown"></div>
        ` : ''}
    `;
    
    if (!solved) {
        setupQuizEventListeners(quiz);
    } else {
        // 카운트다운 시작
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
}

function setupQuizEventListeners(quiz) {
    const submitBtn = document.getElementById('submit-answer');
    const quizOptions = document.getElementById('quiz-options');
    const quizAnswer = document.getElementById('quiz-answer');

    // 객관식 옵션 클릭
    if (quiz.type === 'multiple_choice' && quiz.options) {
        quizOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });

        // 키보드 네비게이션
        quizOptions.addEventListener('keydown', (e) => {
            const options = document.querySelectorAll('.quiz-option');
            const currentIndex = Array.from(options).findIndex(opt => opt.classList.contains('selected'));
            
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % options.length;
                options[currentIndex]?.classList.remove('selected');
                options[nextIndex].classList.add('selected');
                options[nextIndex].focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                options[currentIndex]?.classList.remove('selected');
                options[prevIndex].classList.add('selected');
                options[prevIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (e.target.classList.contains('quiz-option')) {
                    document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
                    e.target.classList.add('selected');
                }
            }
        });
    }

    // 정답 제출
    submitBtn.addEventListener('click', () => {
        let userAnswer = '';
        
        if (quiz.type === 'multiple_choice' && quiz.options) {
            const selected = document.querySelector('.quiz-option.selected');
            if (selected) userAnswer = selected.textContent.trim();
        } else {
            userAnswer = quizAnswer.value.trim();
        }

        if (!userAnswer) {
            showNotification('정답을 입력해주세요!', 'warning');
            return;
        }

        checkAnswer(userAnswer, quiz);
    });

    // 엔터키로 제출
    if (quizAnswer) {
        quizAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
}

function checkAnswer(userAnswer, quiz) {
    const isCorrect = userAnswer.toLowerCase() === quiz.answer.toLowerCase();
    const points = isCorrect ? quiz.points : 0;
    
    // 퀴즈 히스토리에 저장
    const today = new Date().toDateString();
    const quizResult = {
        date: today,
        question: quiz.question,
        userAnswer: userAnswer,
        correctAnswer: quiz.answer,
        isCorrect: isCorrect,
        points: points,
        difficulty: quiz.difficulty,
        difficultyName: difficultyNames[quiz.difficulty]
    };
    
    // localStorage에서 현재 히스토리 가져오기
    let currentHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    // 오늘 퀴즈가 이미 있으면 업데이트, 없으면 추가
    const existingIndex = currentHistory.findIndex(q => q.date === today);
    if (existingIndex >= 0) {
        currentHistory[existingIndex] = quizResult;
    } else {
        currentHistory.push(quizResult);
    }
    
    // localStorage에 저장
    localStorage.setItem('quizHistory', JSON.stringify(currentHistory));
    
    // 전역 변수 업데이트
    quizHistory = currentHistory;
    
    // 결과 표시
    showQuizResult(isCorrect, points, quiz);
}

function showQuizResult(isCorrect, points, quiz, isRandom = false) {
    const quizContainer = document.getElementById('quiz-container');
    const resultClass = isCorrect ? 'correct' : 'incorrect';
    const resultIcon = isCorrect ? '✅' : '❌';
    const resultMessage = isCorrect ? 
        `정답입니다! ${points}점을 획득했습니다!` : 
        `틀렸습니다. 정답은 "${quiz.answer}"입니다.`;
    quizContainer.innerHTML = `
        <div class="quiz-result ${resultClass}">
            <div class="result-icon">${resultIcon}</div>
            <h3>${resultMessage}</h3>
            <div class="result-details">
                <p><strong>난이도:</strong> ${difficultyNames[quiz.difficulty]}</p>
                <p><strong>획득 포인트:</strong> ${points}점</p>
            </div>
            <div class="quiz-info-msg">오늘의 퀴즈는 하루에 한 번만 풀 수 있습니다.</div>
        </div>
    `;
    showNotification(resultMessage, isCorrect ? 'success' : 'error');
}

// 퀴즈 히스토리 저장
// saveQuizHistory, renderQuizHistory 함수 전체 삭제

// 퀴즈 히스토리 렌더링
function displayQuizHistory() {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const historyContainer = document.getElementById('quiz-history');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">퀴즈 기록이 없습니다.</p>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyHTML = sortedHistory.map(quiz => {
        const resultClass = quiz.isCorrect ? 'correct' : 'incorrect';
        const resultIcon = quiz.isCorrect ? '✅' : '❌';
        
        return `
            <div class="history-item ${resultClass}">
                <div class="history-header">
                    <span class="history-date">${formatDate(quiz.date)}</span>
                    <span class="history-difficulty" style="background-color: ${difficultyColors[quiz.difficulty]};">
                        ${quiz.difficultyName} (${quiz.points}점)
                    </span>
                </div>
                <div class="history-question">
                    <strong>문제:</strong> ${quiz.question}
                </div>
                <div class="history-answer">
                    <strong>내 답:</strong> ${quiz.userAnswer}
                </div>
                <div class="history-result">
                    ${resultIcon} ${quiz.isCorrect ? '정답' : `오답 (정답: ${quiz.correctAnswer})`}
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = historyHTML;
}

function filterHistory(filter) {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const historyContainer = document.getElementById('quiz-history');
    
    // 필터 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">퀴즈 기록이 없습니다.</p>';
        return;
    }
    
    // 필터링
    let filteredHistory = history;
    if (filter === 'correct') {
        filteredHistory = history.filter(quiz => quiz.isCorrect);
    } else if (filter === 'incorrect') {
        filteredHistory = history.filter(quiz => !quiz.isCorrect);
    }
    
    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">해당하는 기록이 없습니다.</p>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyHTML = sortedHistory.map(quiz => {
        const resultClass = quiz.isCorrect ? 'correct' : 'incorrect';
        const resultIcon = quiz.isCorrect ? '✅' : '❌';
        
        return `
            <div class="history-item ${resultClass}">
                <div class="history-header">
                    <span class="history-date">${formatDate(quiz.date)}</span>
                    <span class="history-difficulty" style="background-color: ${difficultyColors[quiz.difficulty]};">
                        ${quiz.difficultyName} (${quiz.points}점)
                    </span>
                </div>
                <div class="history-question">
                    <strong>문제:</strong> ${quiz.question}
                </div>
                <div class="history-answer">
                    <strong>내 답:</strong> ${quiz.userAnswer}
                </div>
                <div class="history-result">
                    ${resultIcon} ${quiz.isCorrect ? '정답' : `오답 (정답: ${quiz.correctAnswer})`}
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = historyHTML;
}

// 퀴즈 폼 이벤트 연결
// quizForm 삭제
// 