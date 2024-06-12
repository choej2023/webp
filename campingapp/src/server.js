const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const multer = require('multer')
const bodyParser = require('body-parser')
const app = express();
const port = 3001;
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors());


// 미들웨어 설정
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // 요청 메서드와 URL을 출력합니다.
  next(); // 다음 미들웨어로 전달합니다.
});

  // MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'camping',
  password: '1234',
  database: 'camping_db'
});

db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 실패: ', err);
    return;
  }
  console.log('데이터베이스 연결 성공');
});

// uploads 폴더가 없으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 임의의 숫자와 하이픈을 제거하고, 이미지 파일 이름만 저장
    const filename = file.originalname.split('\\').pop();
    cb(null,filename);
    
  },
});

const upload = multer({ storage: storage });



// campground_id에 따라 데이터를 가져와서 화면에 출력하는 라우트
app.get('/campingDetail/:campgroundId', (req, res) => {
  const campgroundId = req.params.campgroundId;
  console.log('Received request for campground ID:', campgroundId)
  // 데이터베이스에서 해당하는 campground_id의 데이터를 가져오는 쿼리 실행
  const sql = 'SELECT * FROM campgrounds WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, results) => {
    if (error) {
      console.error('Error fetching campground data:', error);
      res.status(500).send('Error fetching campground data'+error.message);
      return;
    }
    
    // 결과를 화면에 출력
    res.json(results[0]);
    
  });
});

//메인 사진 조회
app.get('/campingDetail/:campgroundId/main_photo', (req, res) => {
  const { campgroundId } = req.params;
  const sql = 'SELECT main_photo FROM campgrounds WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, results) => {
    if (error) {
      console.error("이미지 조회 실패", error);
      res.status(500).send("서버 오류: 이미지 조회 실패");
    } else {
      res.json(results[0]); // main_photo가 한 개만 있을 것으로 가정
    }
  });
});

//시설정보 조회
app.get('/campingDetail/:campgroundId/amenities', (req,res)=>{
  const {campgroundId} = req.params;
  const sql = 'SELECT * FROM amenities WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error,result)=>{
    if(error){
      res.status(500).send("서버 오류: 시설정보 조회 실패");
    }else{
      res.json(result);
    }
  })
})

// 리뷰 데이터 조회
app.get('/campingDetail/:campgroundId/reviews',(req,res)=>{
  const query = 'SELECT campground_id, text, photo FROM reviews';
  db.query(query,(error, result)=>{
    if(error){
      console.error('리뷰 데이터 조회 실패', error);
      res.status(500).send('서버 오류: 리뷰 데이터 조회 실패');
    }else{
      res.json(result)
    }
  })
})

// 캠프 사이트 조회
app.get('/campingDetail/:campgroundId/campsite',(req,res)=>{
  const campgroundId = req.params.campgroundId;
  
  const sql = 'SELECT * FROM campsites WHERE campground_id = ?';
  db.query(sql,[campgroundId],(error,result)=>{
    if(error){
      console.error('캠프 사이트 조회 실패', error);
      res.status(500).send('서버 오류: 캠프 사이트 조회 실패');
    }else{
      res.json(result);
    }
  })
})
// 캠핑장 예약정보 조회
app.get('/campingDetail/:campgroundId/reserve',(req,res)=>{
  const campgroundId = req.params.campgroundId;
  const sql = 'SELECT * FROM reservations WHERE campground_id = ?';
  db.query(sql, [campgroundId],(error,result)=>{
    if(error){
      console.error("예약 정보 조회 실패", error);
      res.status(500).send("서버 오류: 예약 정보 조회 실패");
    }else{
      res.json(result);
    }
  })
})


// 캠핑장 예약 정보를 저장하는 API
app.post('/reserve', (req, res) => {
  const { campsite_id, checkInDate, checkOutDate, adults, children, status, campgroundId } = req.body;

  // 날짜 겹침 확인 쿼리
  const overlapQuery = `
    SELECT * FROM reservations
    WHERE campground_id = ? AND campsite_id = ?
    AND ((check_in_date <= ? AND check_out_date >= ?)
    OR (check_in_date <= ? AND check_out_date >= ?)
    OR (check_in_date >= ? AND check_out_date <= ?))
  `;

  db.query(overlapQuery, [campgroundId, campsite_id, checkOutDate, checkInDate, checkInDate, checkOutDate, checkInDate, checkOutDate], (error, result)=>{
    if(error){
      console.error("예약 날짜 확인 실패", error);
      res.status(500).send("서버 오류: 예약 날짜 확인 실패");
    }else if(result.length > 0){
      res.status(400).json({message: "해당 날짜는 이미 예약되었습니다. "});
    }else{
      const sqlQuery = 'INSERT INTO reservations (campsite_id, check_in_date, check_out_date, adults, children, status, campground_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(sqlQuery, [campsite_id, checkInDate, checkOutDate, adults, children, status, campgroundId], (err, result) => {
        if (err) {
          res.status(500).send(err);
          console.error('Database query error:', err);
          return;
        }
        
        res.json({ success: true});
      });


    }
  })
  
  
  
});

// 캠핑장 리뷰 정보를 저장하는 API
app.post('/campingDetail/:campgroundId/reviews', upload.single('photo'), (req, res) => {
  const { campgroundId } = req.params;
  const { text } = req.body;
  const photo = req.file ? `${req.file.filename}` : null; //수정된 이미지 파일 이름 사용
  
  const query = 'INSERT INTO reviews (campground_id, text, photo) VALUES (?, ?, ?)';
  const values = [campgroundId, text, photo];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('리뷰 등록 실패:', error);
      return res.status(500).json({ error: '리뷰 등록 실패' });
    }
    res.status(201).json({ id: results.insertId, campgroundId, text, photo });
  });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
  
});
