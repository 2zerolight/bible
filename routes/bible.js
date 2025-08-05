const express = require('express');
const router = express.Router();
const bibleData = require('../data/bibleData');

// 모든 성경 책 목록 조회
router.get('/books', (req, res) => {
  try {
    const books = bibleData.getBooks();
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '책 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 특정 책 정보 조회
router.get('/books/:bookId', (req, res) => {
  try {
    const { bookId } = req.params;
    const book = bibleData.getBook(bookId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: '요청한 책을 찾을 수 없습니다.',
        bookId
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '책 정보를 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 책의 장 목록 조회
router.get('/books/:bookId/chapters', (req, res) => {
  try {
    const { bookId } = req.params;
    const chapters = bibleData.getChapters(bookId);
    
    if (!chapters) {
      return res.status(404).json({
        success: false,
        error: '요청한 책을 찾을 수 없습니다.',
        bookId
      });
    }
    
    res.json({
      success: true,
      data: chapters,
      count: chapters.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '장 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 특정 장의 절 목록 조회
router.get('/books/:bookId/chapters/:chapterId', (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const verses = bibleData.getVerses(bookId, parseInt(chapterId));
    
    if (!verses) {
      return res.status(404).json({
        success: false,
        error: '요청한 장을 찾을 수 없습니다.',
        bookId,
        chapterId
      });
    }
    
    res.json({
      success: true,
      data: verses,
      count: verses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '절 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 특정 절 조회
router.get('/verse/:bookId/:chapterId/:verseId', (req, res) => {
  try {
    const { bookId, chapterId, verseId } = req.params;
    const verse = bibleData.getVerse(bookId, parseInt(chapterId), parseInt(verseId));
    
    if (!verse) {
      return res.status(404).json({
        success: false,
        error: '요청한 절을 찾을 수 없습니다.',
        bookId,
        chapterId,
        verseId
      });
    }
    
    res.json({
      success: true,
      data: verse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '절을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 성경 내용 검색
router.get('/search', (req, res) => {
  try {
    const { query, bookId, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색어(query)가 필요합니다.'
      });
    }
    
    // 먼저 성경 장절 검색 시도
    const referenceResult = bibleData.searchBibleReference(query);
    if (referenceResult) {
      return res.json({
        success: true,
        data: [referenceResult],
        count: 1,
        query,
        type: 'reference',
        bookId: referenceResult.bookId
      });
    }
    
    // 일반 텍스트 검색
    const results = bibleData.searchVerses(query, bookId, parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query,
      type: 'text',
      bookId: bookId || '전체'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '검색 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 오늘의 추천 성경말씀
router.get('/daily-verse', (req, res) => {
  try {
    const dailyVerse = bibleData.getDailyVerse();
    
    if (!dailyVerse) {
      return res.status(404).json({
        success: false,
        error: '오늘의 추천 성경말씀을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: dailyVerse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '오늘의 추천 성경말씀을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 설정 조회
router.get('/settings', (req, res) => {
  try {
    const settings = bibleData.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '설정을 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 설정 업데이트
router.put('/settings', (req, res) => {
  try {
    const { baptismType } = req.body;
    
    if (baptismType && !['세례', '침례'].includes(baptismType)) {
      return res.status(400).json({
        success: false,
        error: 'baptismType은 "세례" 또는 "침례"여야 합니다.'
      });
    }
    
    bibleData.updateSettings({ baptismType });
    
    res.json({
      success: true,
      data: bibleData.getSettings(),
      message: '설정이 업데이트되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '설정을 업데이트하는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

module.exports = router; 