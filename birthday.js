// 생일 데이터를 저장할 배열
let birthdays = JSON.parse(localStorage.getItem('familyBirthdays')) || [];

// DOM 요소들
const birthdayForm = document.getElementById('birthdayForm');
const birthdayList = document.getElementById('birthdayList');
const upcomingList = document.getElementById('upcomingList');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const filterButtons = document.querySelectorAll('.filter-btn');

// 현재 필터 상태
let currentFilter = 'all';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    renderBirthdayList();
    renderUpcomingBirthdays();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 생일 추가 폼
    birthdayForm.addEventListener('submit', addBirthday);
    
    // 필터 버튼
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateFilterButtons();
            renderBirthdayList();
        });
    });
    
    // 모달 관련
    document.querySelector('.close').addEventListener('click', closeModal);
    document.querySelector('.btn-cancel').addEventListener('click', closeModal);
    editForm.addEventListener('submit', updateBirthday);
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });
}

// 생일 추가 함수
function addBirthday(e) {
    e.preventDefault();
    
    const formData = new FormData(birthdayForm);
    const birthday = {
        id: Date.now(),
        name: formData.get('name'),
        birthdate: formData.get('birthdate'),
        relationship: formData.get('relationship'),
        memo: formData.get('memo')
    };
    
    birthdays.push(birthday);
    saveToLocalStorage();
    renderBirthdayList();
    renderUpcomingBirthdays();
    
    // 폼 초기화
    birthdayForm.reset();
    
    // 성공 메시지
    showNotification('생일이 성공적으로 추가되었습니다!', 'success');
}

// 생일 수정 함수
function editBirthday(id) {
    const birthday = birthdays.find(b => b.id === id);
    if (!birthday) return;
    
    // 모달에 데이터 채우기
    document.getElementById('editId').value = birthday.id;
    document.getElementById('editName').value = birthday.name;
    document.getElementById('editBirthdate').value = birthday.birthdate;
    document.getElementById('editRelationship').value = birthday.relationship;
    document.getElementById('editMemo').value = birthday.memo;
    
    // 모달 열기
    editModal.style.display = 'block';
}

// 생일 업데이트 함수
function updateBirthday(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editId').value);
    const birthdayIndex = birthdays.findIndex(b => b.id === id);
    
    if (birthdayIndex === -1) return;
    
    birthdays[birthdayIndex] = {
        id: id,
        name: document.getElementById('editName').value,
        birthdate: document.getElementById('editBirthdate').value,
        relationship: document.getElementById('editRelationship').value,
        memo: document.getElementById('editMemo').value
    };
    
    saveToLocalStorage();
    renderBirthdayList();
    renderUpcomingBirthdays();
    closeModal();
    
    showNotification('생일 정보가 수정되었습니다!', 'success');
}

// 생일 삭제 함수
function deleteBirthday(id) {
    if (confirm('정말로 이 생일을 삭제하시겠습니까?')) {
        birthdays = birthdays.filter(b => b.id !== id);
        saveToLocalStorage();
        renderBirthdayList();
        renderUpcomingBirthdays();
        
        showNotification('생일이 삭제되었습니다.', 'info');
    }
}

// 생일 목록 렌더링
function renderBirthdayList() {
    let filteredBirthdays = [...birthdays];
    
    // 필터 적용
    switch (currentFilter) {
        case 'upcoming':
            filteredBirthdays = getUpcomingBirthdays();
            break;
        case 'this-month':
            filteredBirthdays = getThisMonthBirthdays();
            break;
    }
    
    // 날짜순으로 정렬
    filteredBirthdays.sort((a, b) => {
        const dateA = new Date(a.birthdate);
        const dateB = new Date(b.birthdate);
        return dateA - dateB;
    });
    
    if (filteredBirthdays.length === 0) {
        birthdayList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>생일이 없습니다</h3>
                <p>${currentFilter === 'all' ? '가족의 생일을 추가해보세요!' : '조건에 맞는 생일이 없습니다.'}</p>
            </div>
        `;
        return;
    }
    
    birthdayList.innerHTML = filteredBirthdays.map(birthday => {
        const daysUntil = getDaysUntilBirthday(birthday.birthdate);
        const isToday = daysUntil === 0;
        const isUpcoming = daysUntil > 0 && daysUntil <= 30;
        
        let statusClass = '';
        if (isToday) statusClass = 'today';
        else if (isUpcoming) statusClass = 'upcoming';
        
        return `
            <div class="birthday-item ${statusClass}">
                <div class="birthday-header">
                    <div class="birthday-name">${birthday.name}</div>
                    <div class="birthday-relationship">${birthday.relationship}</div>
                </div>
                <div class="birthday-date">
                    <i class="fas fa-calendar"></i> ${formatDate(birthday.birthdate)}
                    ${isToday ? '<span style="color: #51cf66; font-weight: bold;"> (오늘!)</span>' : ''}
                    ${isUpcoming && !isToday ? `<span style="color: #ff6b6b;"> (${daysUntil}일 후)</span>` : ''}
                </div>
                ${birthday.memo ? `<div class="birthday-memo"><i class="fas fa-sticky-note"></i> ${birthday.memo}</div>` : ''}
                <div class="birthday-actions">
                    <button class="btn-edit" onclick="editBirthday(${birthday.id})">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="btn-delete" onclick="deleteBirthday(${birthday.id})">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 다가오는 생일 렌더링
function renderUpcomingBirthdays() {
    const upcoming = getUpcomingBirthdays().slice(0, 4); // 최대 4개만 표시
    
    if (upcoming.length === 0) {
        upcomingList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>다가오는 생일이 없습니다</h3>
                <p>앞으로 30일 내에 생일이 있는 가족이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    upcomingList.innerHTML = upcoming.map(birthday => {
        const daysUntil = getDaysUntilBirthday(birthday.birthdate);
        const isToday = daysUntil === 0;
        
        return `
            <div class="upcoming-item">
                <h3>${birthday.name} (${birthday.relationship})</h3>
                <div class="days-left">
                    ${isToday ? '오늘!' : `${daysUntil}일 후`}
                </div>
                <div class="date">${formatDate(birthday.birthdate)}</div>
            </div>
        `;
    }).join('');
}

// 다가오는 생일 가져오기 (30일 이내)
function getUpcomingBirthdays() {
    return birthdays.filter(birthday => {
        const daysUntil = getDaysUntilBirthday(birthday.birthdate);
        return daysUntil >= 0 && daysUntil <= 30;
    });
}

// 이번 달 생일 가져오기
function getThisMonthBirthdays() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return birthdays.filter(birthday => {
        const birthDate = new Date(birthday.birthdate);
        return birthDate.getMonth() === currentMonth;
    });
}

// 생일까지 남은 일수 계산
function getDaysUntilBirthday(birthdate) {
    const today = new Date();
    const birthday = new Date(birthdate);
    
    // 올해 생일
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    // 내년 생일
    const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
    
    // 올해 생일이 지났으면 내년 생일까지 계산
    const targetBirthday = thisYearBirthday < today ? nextYearBirthday : thisYearBirthday;
    
    const diffTime = targetBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    return `${monthNames[month - 1]} ${day}일`;
}

// 필터 버튼 업데이트
function updateFilterButtons() {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// 모달 닫기
function closeModal() {
    editModal.style.display = 'none';
}

// 로컬 스토리지에 저장
function saveToLocalStorage() {
    localStorage.setItem('familyBirthdays', JSON.stringify(birthdays));
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 간단한 알림 생성
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3초 후 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 