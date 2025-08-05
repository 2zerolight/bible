const fs = require('fs');
const path = require('path');

// 성경 책 정보
const bibleBooks = [
  { id: '창', name: '창세기', koreanName: '창세기', englishName: 'Genesis', testament: 'old', chapters: 50 },
  { id: '출', name: '출애굽기', koreanName: '출애굽기', englishName: 'Exodus', testament: 'old', chapters: 40 },
  { id: '레', name: '레위기', koreanName: '레위기', englishName: 'Leviticus', testament: 'old', chapters: 27 },
  { id: '민', name: '민수기', koreanName: '민수기', englishName: 'Numbers', testament: 'old', chapters: 36 },
  { id: '신', name: '신명기', koreanName: '신명기', englishName: 'Deuteronomy', testament: 'old', chapters: 34 },
  { id: '수', name: '여호수아', koreanName: '여호수아', englishName: 'Joshua', testament: 'old', chapters: 24 },
  { id: '삿', name: '사사기', koreanName: '사사기', englishName: 'Judges', testament: 'old', chapters: 21 },
  { id: '룻', name: '룻기', koreanName: '룻기', englishName: 'Ruth', testament: 'old', chapters: 4 },
  { id: '삼상', name: '사무엘상', koreanName: '사무엘상', englishName: '1 Samuel', testament: 'old', chapters: 31 },
  { id: '삼하', name: '사무엘하', koreanName: '사무엘하', englishName: '2 Samuel', testament: 'old', chapters: 24 },
  { id: '왕상', name: '열왕기상', koreanName: '열왕기상', englishName: '1 Kings', testament: 'old', chapters: 22 },
  { id: '왕하', name: '열왕기하', koreanName: '열왕기하', englishName: '2 Kings', testament: 'old', chapters: 25 },
  { id: '대상', name: '역대상', koreanName: '역대상', englishName: '1 Chronicles', testament: 'old', chapters: 29 },
  { id: '대하', name: '역대하', koreanName: '역대하', englishName: '2 Chronicles', testament: 'old', chapters: 36 },
  { id: '스', name: '에스라', koreanName: '에스라', englishName: 'Ezra', testament: 'old', chapters: 10 },
  { id: '느', name: '느헤미야', koreanName: '느헤미야', englishName: 'Nehemiah', testament: 'old', chapters: 13 },
  { id: '에', name: '에스더', koreanName: '에스더', englishName: 'Esther', testament: 'old', chapters: 10 },
  { id: '욥', name: '욥기', koreanName: '욥기', englishName: 'Job', testament: 'old', chapters: 42 },
  { id: '시', name: '시편', koreanName: '시편', englishName: 'Psalms', testament: 'old', chapters: 150 },
  { id: '잠', name: '잠언', koreanName: '잠언', englishName: 'Proverbs', testament: 'old', chapters: 31 },
  { id: '전', name: '전도서', koreanName: '전도서', englishName: 'Ecclesiastes', testament: 'old', chapters: 12 },
  { id: '아', name: '아가', koreanName: '아가', englishName: 'Song of Solomon', testament: 'old', chapters: 8 },
  { id: '사', name: '이사야', koreanName: '이사야', englishName: 'Isaiah', testament: 'old', chapters: 66 },
  { id: '렘', name: '예레미야', koreanName: '예레미야', englishName: 'Jeremiah', testament: 'old', chapters: 52 },
  { id: '애', name: '예레미야애가', koreanName: '예레미야애가', englishName: 'Lamentations', testament: 'old', chapters: 5 },
  { id: '겔', name: '에스겔', koreanName: '에스겔', englishName: 'Ezekiel', testament: 'old', chapters: 48 },
  { id: '단', name: '다니엘', koreanName: '다니엘', englishName: 'Daniel', testament: 'old', chapters: 12 },
  { id: '호', name: '호세아', koreanName: '호세아', englishName: 'Hosea', testament: 'old', chapters: 14 },
  { id: '욜', name: '요엘', koreanName: '요엘', englishName: 'Joel', testament: 'old', chapters: 3 },
  { id: '암', name: '아모스', koreanName: '아모스', englishName: 'Amos', testament: 'old', chapters: 9 },
  { id: '옵', name: '오바댜', koreanName: '오바댜', englishName: 'Obadiah', testament: 'old', chapters: 1 },
  { id: '욘', name: '요나', koreanName: '요나', englishName: 'Jonah', testament: 'old', chapters: 4 },
  { id: '미', name: '미가', koreanName: '미가', englishName: 'Micah', testament: 'old', chapters: 7 },
  { id: '나', name: '나훔', koreanName: '나훔', englishName: 'Nahum', testament: 'old', chapters: 3 },
  { id: '합', name: '하박국', koreanName: '하박국', englishName: 'Habakkuk', testament: 'old', chapters: 3 },
  { id: '습', name: '스바냐', koreanName: '스바냐', englishName: 'Zephaniah', testament: 'old', chapters: 3 },
  { id: '학', name: '학개', koreanName: '학개', englishName: 'Haggai', testament: 'old', chapters: 2 },
  { id: '슥', name: '스가랴', koreanName: '스가랴', englishName: 'Zechariah', testament: 'old', chapters: 14 },
  { id: '말', name: '말라기', koreanName: '말라기', englishName: 'Malachi', testament: 'old', chapters: 4 },
  { id: '마', name: '마태복음', koreanName: '마태복음', englishName: 'Matthew', testament: 'new', chapters: 28 },
  { id: '막', name: '마가복음', koreanName: '마가복음', englishName: 'Mark', testament: 'new', chapters: 16 },
  { id: '눅', name: '누가복음', koreanName: '누가복음', englishName: 'Luke', testament: 'new', chapters: 24 },
  { id: '요', name: '요한복음', koreanName: '요한복음', englishName: 'John', testament: 'new', chapters: 21 },
  { id: '행', name: '사도행전', koreanName: '사도행전', englishName: 'Acts', testament: 'new', chapters: 28 },
  { id: '롬', name: '로마서', koreanName: '로마서', englishName: 'Romans', testament: 'new', chapters: 16 },
  { id: '고전', name: '고린도전서', koreanName: '고린도전서', englishName: '1 Corinthians', testament: 'new', chapters: 16 },
  { id: '고후', name: '고린도후서', koreanName: '고린도후서', englishName: '2 Corinthians', testament: 'new', chapters: 13 },
  { id: '갈', name: '갈라디아서', koreanName: '갈라디아서', englishName: 'Galatians', testament: 'new', chapters: 6 },
  { id: '엡', name: '에베소서', koreanName: '에베소서', englishName: 'Ephesians', testament: 'new', chapters: 6 },
  { id: '빌', name: '빌립보서', koreanName: '빌립보서', englishName: 'Philippians', testament: 'new', chapters: 4 },
  { id: '골', name: '골로새서', koreanName: '골로새서', englishName: 'Colossians', testament: 'new', chapters: 4 },
  { id: '살전', name: '데살로니가전서', koreanName: '데살로니가전서', englishName: '1 Thessalonians', testament: 'new', chapters: 5 },
  { id: '살후', name: '데살로니가후서', koreanName: '데살로니가후서', englishName: '2 Thessalonians', testament: 'new', chapters: 3 },
  { id: '딤전', name: '디모데전서', koreanName: '디모데전서', englishName: '1 Timothy', testament: 'new', chapters: 6 },
  { id: '딤후', name: '디모데후서', koreanName: '디모데후서', englishName: '2 Timothy', testament: 'new', chapters: 4 },
  { id: '딛', name: '디도서', koreanName: '디도서', englishName: 'Titus', testament: 'new', chapters: 3 },
  { id: '몬', name: '빌레몬서', koreanName: '빌레몬서', englishName: 'Philemon', testament: 'new', chapters: 1 },
  { id: '히', name: '히브리서', koreanName: '히브리서', englishName: 'Hebrews', testament: 'new', chapters: 13 },
  { id: '약', name: '야고보서', koreanName: '야고보서', englishName: 'James', testament: 'new', chapters: 5 },
  { id: '벧전', name: '베드로전서', koreanName: '베드로전서', englishName: '1 Peter', testament: 'new', chapters: 5 },
  { id: '벧후', name: '베드로후서', koreanName: '베드로후서', englishName: '2 Peter', testament: 'new', chapters: 3 },
  { id: '요일', name: '요한일서', koreanName: '요한일서', englishName: '1 John', testament: 'new', chapters: 5 },
  { id: '요이', name: '요한이서', koreanName: '요한이서', englishName: '2 John', testament: 'new', chapters: 1 },
  { id: '요삼', name: '요한삼서', koreanName: '요한삼서', englishName: '3 John', testament: 'new', chapters: 1 },
  { id: '유', name: '유다서', koreanName: '유다서', englishName: 'Jude', testament: 'new', chapters: 1 },
  { id: '계', name: '요한계시록', koreanName: '요한계시록', englishName: 'Revelation', testament: 'new', chapters: 22 }
];

// 성경 데이터를 메모리에 로드
let bibleData = null;

function loadBibleData() {
  if (bibleData) return bibleData;
  
  try {
    const dataPath = path.join(__dirname, 'bible.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    bibleData = JSON.parse(rawData);
    return bibleData;
  } catch (error) {
    console.error('성경 데이터를 로드하는 중 오류:', error);
    return {};
  }
}

// 성경 구절 키를 파싱하는 함수
function parseVerseKey(key) {
  // "창1:1" 형식을 파싱
  const match = key.match(/^([가-힣]+)(\d+):(\d+)$/);
  if (!match) return null;
  
  return {
    bookId: match[1],
    chapterId: parseInt(match[2]),
    verseId: parseInt(match[3])
  };
}

class BibleData {
  constructor() {
    this.books = bibleBooks;
    this.data = loadBibleData();
    this.settings = {
      baptismType: '세례' // '세례' 또는 '침례'
    };
  }

  // 모든 책 목록 조회
  getBooks() {
    return this.books;
  }

  // 특정 책 정보 조회
  getBook(bookId) {
    return this.books.find(book => book.id === bookId);
  }

  // 책의 장 목록 조회
  getChapters(bookId) {
    const book = this.getBook(bookId);
    if (!book) return null;

    const chapters = [];
    for (let i = 1; i <= book.chapters; i++) {
      chapters.push({
        chapterId: i,
        bookId: bookId,
        bookName: book.name
      });
    }
    return chapters;
  }

  // 특정 장의 절 목록 조회
  getVerses(bookId, chapterId) {
    const book = this.getBook(bookId);
    if (!book) return null;

    const verses = [];
    const chapterKey = `${bookId}${chapterId}:`;
    
    // 해당 장의 모든 절을 찾기
    Object.keys(this.data).forEach(key => {
      if (key.startsWith(chapterKey)) {
        const parsed = parseVerseKey(key);
        if (parsed && parsed.bookId === bookId && parsed.chapterId === chapterId) {
          verses.push({
            verseId: parsed.verseId,
            chapterId: chapterId,
            bookId: bookId,
            content: this.transformContent(this.data[key].trim())
          });
        }
      }
    });

    return verses.sort((a, b) => a.verseId - b.verseId);
  }

  // 특정 절 조회
  getVerse(bookId, chapterId, verseId) {
    const key = `${bookId}${chapterId}:${verseId}`;
    const content = this.data[key];
    
    if (!content) return null;

    return {
      verseId: verseId,
      chapterId: chapterId,
      bookId: bookId,
      content: this.transformContent(content.trim())
    };
  }

  // 성경 내용 검색
  searchVerses(query, bookId = null, limit = 10) {
    const results = [];
    const searchQuery = query.toLowerCase();

    const booksToSearch = bookId ? [bookId] : this.books.map(book => book.id);

    for (const book of booksToSearch) {
      if (results.length >= limit) break;

      Object.keys(this.data).forEach(key => {
        if (results.length >= limit) return;

        const parsed = parseVerseKey(key);
        if (!parsed || parsed.bookId !== book) return;

        const content = this.data[key];
        const transformedContent = this.transformContent(content.trim());
        if (transformedContent.toLowerCase().includes(searchQuery)) {
          const bookInfo = this.getBook(book);
          results.push({
            bookId: book,
            chapterId: parsed.chapterId,
            verseId: parsed.verseId,
            content: transformedContent,
            bookName: bookInfo ? bookInfo.name : book
          });
        }
      });
    }

    return results.slice(0, limit);
  }

  // 책 ID로 책 정보 찾기 (한글 이름으로도 검색 가능)
  findBookByIdOrName(searchTerm) {
    return this.books.find(book => 
      book.id === searchTerm || 
      book.name === searchTerm || 
      book.koreanName === searchTerm ||
      book.englishName.toLowerCase() === searchTerm.toLowerCase()
    );
  }

  // 성경 장절 파싱 (다양한 형식 지원)
  parseBibleReference(reference) {
    // 다양한 형식 지원:
    // 창1:1, 창 1:1, 창세기 1:1, 창세기 1장1절, 창1장1절, 창 1장 1절 등
    
    const patterns = [
      // 창1:1, 창 1:1
      /^([가-힣]+)\s*(\d+):(\d+)$/,
      // 창세기 1:1, 창세기 1장1절
      /^([가-힣]+)\s*(\d+)(?:장)?\s*(\d+)(?:절)?$/,
      // 창1장1절, 창 1장 1절
      /^([가-힣]+)\s*(\d+)장\s*(\d+)절$/
    ];

    for (const pattern of patterns) {
      const match = reference.match(pattern);
      if (match) {
        const bookName = match[1];
        const chapter = parseInt(match[2]);
        const verse = parseInt(match[3]);
        
        // 책 이름으로 책 찾기
        const book = this.findBookByIdOrName(bookName);
        if (book) {
          return {
            bookId: book.id,
            bookName: book.name,
            chapterId: chapter,
            verseId: verse
          };
        }
      }
    }
    
    return null;
  }

  // 성경 장절 검색
  searchBibleReference(reference) {
    const parsed = this.parseBibleReference(reference);
    if (!parsed) return null;
    
    const verse = this.getVerse(parsed.bookId, parsed.chapterId, parsed.verseId);
    if (!verse) return null;
    
    // bookName 추가
    return {
      ...verse,
      bookName: parsed.bookName
    };
  }

  // 오늘의 추천 성경말씀 (날짜 기반)
  getDailyVerse() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // 365일을 기준으로 성경 구절을 순환 (실제로는 더 많은 구절이 있지만 예시용)
    const dailyVerses = [
      { bookId: '창', chapterId: 1, verseId: 1, description: '창조의 시작' },
      { bookId: '시', chapterId: 23, verseId: 1, description: '여호와는 나의 목자' },
      { bookId: '요', chapterId: 3, verseId: 16, description: '하나님이 세상을 사랑하사' },
      { bookId: '롬', chapterId: 8, verseId: 28, description: '모든 것이 합력하여 선을 이룬다' },
      { bookId: '빌', chapterId: 4, verseId: 13, description: '내게 능력 주시는 자 안에서' },
      { bookId: '마', chapterId: 28, verseId: 20, description: '내가 너희와 항상 함께 있으리라' },
      { bookId: '사', chapterId: 40, verseId: 31, description: '여호와를 앙망하는 자는 새 힘을 얻으리라' },
      { bookId: '렘', chapterId: 29, verseId: 11, description: '너희를 향한 나의 생각을 내가 안다' },
      { bookId: '고후', chapterId: 5, verseId: 17, description: '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물' },
      { bookId: '엡', chapterId: 2, verseId: 8, description: '너희가 그 은혜로 말미암아 믿음으로 구원을 받았으니' }
    ];
    
    const index = dayOfYear % dailyVerses.length;
    const dailyVerse = dailyVerses[index];
    
    const verse = this.getVerse(dailyVerse.bookId, dailyVerse.chapterId, dailyVerse.verseId);
    if (!verse) return null;
    
    const book = this.getBook(dailyVerse.bookId);
    
    return {
      ...verse,
      bookName: book.name,
      description: dailyVerse.description
    };
  }

  // 내용 변환 함수 (세례/침례 단어 변환)
  transformContent(content) {
    if (this.settings.baptismType === '침례') {
      return content.replace(/세례/g, '침례');
    }
    return content;
  }

  // 설정 업데이트
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // 현재 설정 조회
  getSettings() {
    return { ...this.settings };
  }
}

module.exports = new BibleData(); 