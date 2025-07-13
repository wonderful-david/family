// 메인 페이지 기능
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    loadUpcomingBirthdays();
    loadTodayQuiz();
    
    // 매 초마다 시간 업데이트
    setInterval(updateDateTime, 1000);
});

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateTimeElement = document.getElementById('current-datetime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

function loadUpcomingBirthdays() {
    const birthdays = JSON.parse(localStorage.getItem('familyBirthdays') || '[]');
    const today = new Date();
    const upcomingBirthdays = birthdays.filter(birthday => {
        const birthdayDate = new Date(birthday.birthdate);
        const nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30;
    }).sort((a, b) => {
        const aDate = new Date(a.birthdate);
        const bDate = new Date(b.birthdate);
        const aNext = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate());
        const bNext = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
        
        if (aNext < today) aNext.setFullYear(today.getFullYear() + 1);
        if (bNext < today) bNext.setFullYear(today.getFullYear() + 1);
        
        return aNext - bNext;
    });

    const upcomingElement = document.getElementById('upcoming-birthdays');
    if (upcomingElement) {
        if (upcomingBirthdays.length === 0) {
            upcomingElement.textContent = '다가오는 생일이 없습니다';
        } else {
            const nextBirthday = upcomingBirthdays[0];
            const birthdayDate = new Date(nextBirthday.birthdate);
            const nextBirthdayDate = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
            
            if (nextBirthdayDate < today) {
                nextBirthdayDate.setFullYear(today.getFullYear() + 1);
            }
            
            const daysUntil = Math.ceil((nextBirthdayDate - today) / (1000 * 60 * 60 * 24));
            upcomingElement.textContent = `${nextBirthday.name}의 생일까지 ${daysUntil}일 남았습니다`;
        }
    }
}

function loadTodayQuiz() {
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const today = new Date().toDateString();
    const todayQuiz = quizHistory.find(quiz => quiz.date === today);
    
    const quizElement = document.getElementById('today-quiz');
    if (quizElement) {
        if (todayQuiz) {
            quizElement.textContent = `오늘의 퀴즈를 완료했습니다! (${todayQuiz.points}점 획득)`;
        } else {
            quizElement.textContent = '오늘의 퀴즈를 풀어보세요!';
        }
    }
} 