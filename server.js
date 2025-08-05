const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bibleRoutes = require('./routes/bible');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static('public'));

// 라우트 설정
app.use('/api/bible', bibleRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '성경 조회 API에 오신 것을 환영합니다!',
    version: '1.0.0',
    endpoints: {
      'GET /api/bible/books': '성경 책 목록 조회',
      'GET /api/bible/books/:bookId': '특정 책 정보 조회',
      'GET /api/bible/books/:bookId/chapters': '책의 장 목록 조회',
      'GET /api/bible/books/:bookId/chapters/:chapterId': '특정 장의 절 목록 조회',
      'GET /api/bible/search': '성경 내용 검색 (query 파라미터 필요)',
      'GET /api/bible/verse/:bookId/:chapterId/:verseId': '특정 절 조회'
    }
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`성경 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
}); 