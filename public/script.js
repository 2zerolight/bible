class BibleViewer {
    constructor() {
        this.currentBook = null;
        this.currentChapter = null;
        this.books = [];
        this.settings = {
            baptismType: '세례'
        };
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadBooks();
        await this.loadSettings();
        await this.loadDailyVerse();
        this.updateStats();
    }

    bindEvents() {
        // 로고 클릭 시 홈으로 이동
        document.querySelector('.logo').addEventListener('click', () => this.goHome());

        // 검색 기능
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // 검색 초기화
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());

        // 뒤로가기 버튼
        document.getElementById('backToBook').addEventListener('click', () => this.showBookInfo());

        // 설정 관련 이벤트
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

        // 모달 외부 클릭 시 닫기
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });

        // 오늘의 말씀 읽기 버튼
        document.getElementById('readDailyVerse').addEventListener('click', () => this.readDailyVerse());
    }

    async loadBooks() {
        try {
            this.showLoading();
            const response = await fetch('/api/bible/books');
            const data = await response.json();
            
            if (data.success) {
                this.books = data.data;
                this.renderBookList();
                this.hideLoading();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('책 목록을 불러오는 중 오류:', error);
            this.hideLoading();
            this.showError('책 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    renderBookList() {
        const oldTestamentBooks = document.getElementById('oldTestamentBooks');
        const newTestamentBooks = document.getElementById('newTestamentBooks');
        
        oldTestamentBooks.innerHTML = '';
        newTestamentBooks.innerHTML = '';

        this.books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.dataset.bookId = book.id;
            
            bookItem.innerHTML = `
                <div class="book-item-header">
                    <div class="book-name">${book.name}</div>
                    <div class="book-chapters">${book.chapters}장</div>
                </div>
            `;

            bookItem.addEventListener('click', () => this.selectBook(book.id));
            
            if (book.testament === 'old') {
                oldTestamentBooks.appendChild(bookItem);
            } else {
                newTestamentBooks.appendChild(bookItem);
            }
        });
    }

    async selectBook(bookId) {
        try {
            this.showLoading();
            
            // 활성 상태 업데이트
            document.querySelectorAll('.book-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeBook = document.querySelector(`[data-book-id="${bookId}"]`);
            if (activeBook) {
                activeBook.classList.add('active');
            }

            // 책 정보 로드
            const response = await fetch(`/api/bible/books/${bookId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentBook = data.data;
                this.showBookInfo();
                this.hideLoading();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('책 정보를 불러오는 중 오류:', error);
            this.hideLoading();
            this.showError('책 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    async showBookInfo() {
        if (!this.currentBook) return;

        // UI 상태 업데이트
        this.hideAllContent();
        document.getElementById('bookInfo').classList.remove('hidden');

        // 책 정보 표시
        document.getElementById('bookTitle').textContent = this.currentBook.name;
        document.getElementById('bookTestament').textContent = this.currentBook.testament === 'old' ? '구약' : '신약';
        document.getElementById('bookTestament').className = `testament-badge ${this.currentBook.testament}`;
        document.getElementById('bookChapters').textContent = `${this.currentBook.chapters}장`;

        // 장 목록 로드
        await this.loadChapters();
    }

    async loadChapters() {
        try {
            const response = await fetch(`/api/bible/books/${this.currentBook.id}/chapters`);
            const data = await response.json();
            
            if (data.success) {
                this.renderChapterList(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('장 목록을 불러오는 중 오류:', error);
            this.showError('장 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    renderChapterList(chapters) {
        const chapterList = document.getElementById('chapterList');
        chapterList.innerHTML = '';

        chapters.forEach(chapter => {
            const chapterItem = document.createElement('div');
            chapterItem.className = 'chapter-item';
            chapterItem.textContent = chapter.chapterId;
            chapterItem.addEventListener('click', () => this.selectChapter(chapter.chapterId));
            chapterList.appendChild(chapterItem);
        });
    }

    async selectChapter(chapterId) {
        try {
            this.showLoading();
            this.currentChapter = chapterId;
            
            // 장 내용 로드
            const response = await fetch(`/api/bible/books/${this.currentBook.id}/chapters/${chapterId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showChapterContent(data.data);
                this.hideLoading();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('장 내용을 불러오는 중 오류:', error);
            this.hideLoading();
            this.showError('장 내용을 불러오는 중 오류가 발생했습니다.');
        }
    }

    showChapterContent(verses) {
        // UI 상태 업데이트
        this.hideAllContent();
        document.getElementById('chapterContent').classList.remove('hidden');

        // 장 제목 업데이트
        document.getElementById('chapterTitle').textContent = `${this.currentBook.name} ${this.currentChapter}장`;

        // 절 내용 렌더링
        const versesContainer = document.getElementById('versesContainer');
        versesContainer.innerHTML = '';

        verses.forEach(verse => {
            const verseElement = document.createElement('div');
            verseElement.className = 'verse';
            verseElement.setAttribute('data-verse-id', verse.verseId);
            verseElement.innerHTML = `
                <span class="verse-number">${verse.verseId}.</span>
                <span class="verse-content">${verse.content}</span>
            `;
            versesContainer.appendChild(verseElement);
        });
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
            this.showError('검색어를 입력해주세요.');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`/api/bible/search?query=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            
            if (data.success) {
                // 장절 검색 결과인 경우
                if (data.type === 'reference' && data.data.length === 1) {
                    this.showReferenceSearchResult(data.data[0]);
                } else {
                    this.showSearchResults(data.data, query);
                }
                this.hideLoading();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('검색 중 오류:', error);
            this.hideLoading();
            this.showError('검색 중 오류가 발생했습니다.');
        }
    }

    showSearchResults(results, query) {
        // UI 상태 업데이트
        this.hideAllContent();
        document.getElementById('searchResults').classList.remove('hidden');

        // 검색 결과 렌더링
        const resultsList = document.getElementById('searchResultsList');
        resultsList.innerHTML = '';

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>"${query}"에 대한 검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="search-result-header">
                    <div class="search-result-reference">${result.bookName} ${result.chapterId}:${result.verseId}</div>
                    <div class="search-result-book">${result.bookName}</div>
                </div>
                <div class="search-result-content">${this.highlightSearchTerm(result.content, query)}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                this.navigateToVerse(result.bookId, result.chapterId, result.verseId);
            });
            
            resultsList.appendChild(resultItem);
        });
    }

    highlightSearchTerm(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>');
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.hideAllContent();
        document.getElementById('welcomeMessage').classList.remove('hidden');
    }

    updateStats() {
        const totalBooks = this.books.length;
        const totalChapters = this.books.reduce((sum, book) => sum + book.chapters, 0);
        
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('totalChapters').textContent = totalChapters;
    }

    hideAllContent() {
        document.getElementById('welcomeMessage').classList.add('hidden');
        document.getElementById('bookInfo').classList.add('hidden');
        document.getElementById('chapterContent').classList.add('hidden');
        document.getElementById('searchResults').classList.add('hidden');
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        // 간단한 에러 표시 (실제로는 더 정교한 에러 처리 UI를 구현할 수 있습니다)
        alert(message);
    }

    // 설정 로드
    async loadSettings() {
        try {
            const response = await fetch('/api/bible/settings');
            const data = await response.json();
            
            if (data.success) {
                this.settings = data.data;
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('설정을 로드하는 중 오류:', error);
        }
    }

    // 설정 UI 업데이트
    updateSettingsUI() {
        const baptismTypeSelect = document.getElementById('baptismType');
        if (baptismTypeSelect) {
            baptismTypeSelect.value = this.settings.baptismType;
        }
    }

    // 설정 모달 열기
    openSettings() {
        this.updateSettingsUI();
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    // 설정 모달 닫기
    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    // 설정 저장
    async saveSettings() {
        try {
            const baptismType = document.getElementById('baptismType').value;
            
            const response = await fetch('/api/bible/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ baptismType })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.settings = data.data;
                this.closeSettings();
                
                // 현재 표시된 내용 새로고침
                if (this.currentBook && this.currentChapter) {
                    await this.selectChapter(this.currentChapter);
                } else if (this.currentBook) {
                    await this.showBookInfo();
                }
                
                // 성공 메시지 표시
                this.showSuccessMessage('설정이 저장되었습니다.');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('설정을 저장하는 중 오류:', error);
            this.showError('설정을 저장하는 중 오류가 발생했습니다.');
        }
    }

    // 성공 메시지 표시
    showSuccessMessage(message) {
        // 간단한 성공 메시지 (실제로는 더 정교한 UI를 구현할 수 있습니다)
        alert(message);
    }

    // 오늘의 추천 성경말씀 로드
    async loadDailyVerse() {
        try {
            const response = await fetch('/api/bible/daily-verse');
            const data = await response.json();
            
            if (data.success) {
                this.displayDailyVerse(data.data);
            }
        } catch (error) {
            console.error('오늘의 추천 성경말씀을 로드하는 중 오류:', error);
        }
    }

    // 오늘의 추천 성경말씀 표시
    displayDailyVerse(verse) {
        const referenceElement = document.getElementById('dailyVerseReference');
        const contentElement = document.getElementById('dailyVerseContent');
        
        if (referenceElement && contentElement) {
            referenceElement.textContent = `${verse.bookName} ${verse.chapterId}:${verse.verseId}`;
            contentElement.textContent = verse.content;
        }
    }

    // 오늘의 말씀 전체 읽기
    async readDailyVerse() {
        try {
            const response = await fetch('/api/bible/daily-verse');
            const data = await response.json();
            
            if (data.success) {
                const verse = data.data;
                // bookName을 찾아서 설정
                const book = this.books.find(b => b.id === verse.bookId);
                if (book) {
                    this.currentBook = { id: verse.bookId, name: book.name };
                    await this.navigateToVerse(verse.bookId, verse.chapterId, verse.verseId);
                }
            }
        } catch (error) {
            console.error('오늘의 말씀을 읽는 중 오류:', error);
        }
    }

    // 성경 장절 검색 결과 표시 (검색 결과가 장절인 경우)
    showReferenceSearchResult(result) {
        // UI 상태 업데이트
        this.hideAllContent();
        document.getElementById('searchResults').classList.remove('hidden');

        // 검색 결과 렌더링
        const resultsList = document.getElementById('searchResultsList');
        resultsList.innerHTML = '';

        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item reference-result';
        resultItem.innerHTML = `
            <div class="search-result-header">
                <div class="search-result-reference">${result.bookName} ${result.chapterId}:${result.verseId}</div>
                <div class="search-result-type">장절 검색 결과</div>
            </div>
            <div class="search-result-content">${result.content}</div>
        `;
        
        resultItem.addEventListener('click', () => {
            this.navigateToVerse(result.bookId, result.chapterId, result.verseId);
        });
        
        resultsList.appendChild(resultItem);
    }

    // 특정 절로 이동하고 하이라이트
    async navigateToVerse(bookId, chapterId, verseId) {
        try {
            // 책 선택
            this.currentBook = { id: bookId };
            await this.selectChapter(chapterId);
            
            // 잠시 대기 후 해당 절로 스크롤하고 하이라이트
            setTimeout(() => {
                this.scrollToVerse(verseId);
                this.highlightVerse(verseId);
            }, 500);
        } catch (error) {
            console.error('절로 이동하는 중 오류:', error);
        }
    }

    // 특정 절로 스크롤
    scrollToVerse(verseId) {
        const verseElement = document.querySelector(`[data-verse-id="${verseId}"]`);
        if (verseElement) {
            verseElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    // 특정 절 하이라이트
    highlightVerse(verseId) {
        // 기존 하이라이트 제거
        const existingHighlights = document.querySelectorAll('.verse-highlight');
        existingHighlights.forEach(el => {
            el.classList.remove('verse-highlight');
        });

        // 새로운 하이라이트 추가
        const verseElement = document.querySelector(`[data-verse-id="${verseId}"]`);
        if (verseElement) {
            verseElement.classList.add('verse-highlight');
            
            // 하이라이트는 유지 (제거하지 않음)
        }
    }

    // 홈으로 이동
    goHome() {
        // 현재 상태 초기화
        this.currentBook = null;
        this.currentChapter = null;
        
        // 검색 결과 초기화
        document.getElementById('searchInput').value = '';
        
        // 모든 하이라이트 제거
        const existingHighlights = document.querySelectorAll('.verse-highlight');
        existingHighlights.forEach(el => {
            el.classList.remove('verse-highlight');
        });
        
        // 활성 상태 제거
        document.querySelectorAll('.book-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 홈 화면 표시
        this.hideAllContent();
        document.getElementById('welcomeMessage').classList.remove('hidden');
        
        // 오늘의 추천 성경말씀 다시 로드
        this.loadDailyVerse();
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new BibleViewer();
}); 