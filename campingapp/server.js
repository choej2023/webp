const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const uploadFolder = 'uploads';
const port = 8080; // 포트를 8080으로 설정

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(cors());


// uploads 폴더가 없으면 생성
const uploadDir = path.join(__dirname, uploadFolder);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 미들웨어 설정
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // 요청 메서드와 URL을 출력합니다.
  next(); // 다음 미들웨어로 전달합니다.
});

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'camping_db'
});

db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 실패: ', err);
    return;
  }
  console.log('데이터베이스 연결 성공');
});



// campground_id에 따라 데이터를 가져와서 화면에 출력하는 라우트
app.get('/main/campingDetail/:campgroundId', (req, res) => {
  const campgroundId = req.params.campgroundId;
  console.log('Received request for campground ID:', campgroundId);
  // 데이터베이스에서 해당하는 campground_id의 데이터를 가져오는 쿼리 실행
  const sql = 'SELECT * FROM campgrounds WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, results) => {
    if (error) {
      console.error('Error fetching campground data:', error);
      res.status(500).send('Error fetching campground data' + error.message);
      return;
    }
    // 결과를 화면에 출력
    const response = results.map(campground => ({
      ...campground,
      main_photo: campground.main_photo ? `http://localhost:8080/${uploadFolder}/${path.basename(campground.main_photo)}` : null
    }));
    res.status(200).json(response[0])
  });
});

// 메인 사진 조회
app.get('/main/campingDetail/:campgroundId/main_photo', (req, res) => {
  const { campgroundId } = req.params;
  const sql = 'SELECT main_photo FROM campgrounds WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, results) => {
    if (error) {
      console.error("이미지 조회 실패", error);
      res.status(500).send("서버 오류: 이미지 조회 실패");
    } else {
      res.json(`http://localhost:8080/${uploadFolder}/${path.basename(results[0].main_photo)}`); // main_photo가 한 개만 있을 것으로 가정
    }
  });
});

// 시설정보 조회
app.get('/main/campingDetail/:campgroundId/amenities', (req, res) => {
  const { campgroundId } = req.params;
  const sql = 'SELECT * FROM amenities WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, result) => {
    if (error) {
      res.status(500).send("서버 오류: 시설정보 조회 실패");
    } else {
      res.json(result);
    }
  });
});

// 리뷰 데이터 조회
app.get('/main/campingDetail/:campgroundId/reviews', (req, res) => {
  const { campgroundId } = req.params;
  const query = 'SELECT campground_id, text, photo FROM reviews WHERE campground_id = ?';
  db.query(query, [campgroundId], (error, result) => {
    console.log(campgroundId)
    if (error) {
      console.error('리뷰 데이터 조회 실패', error);
      res.status(500).send('서버 오류: 리뷰 데이터 조회 실패');
    } else {
      const response = result.map(reviews => ({
        ...reviews,
        photo: reviews.photo ? `http://localhost:8080/${uploadFolder}/${path.basename(reviews.photo)}` : null
      }));
      res.json(response);
    }
  });
});

// 캠프 사이트 조회
app.get('/main/campingDetail/:campgroundId/campsite', (req, res) => {
  const { campgroundId } = req.params;
  console.log(campgroundId)
  const sql = 'SELECT * FROM campsites WHERE campground_id = ?';
  db.query(sql, [campgroundId], (error, result) => {
    if (error) {
      console.error('캠프 사이트 조회 실패', error);
      res.status(500).send('서버 오류: 캠프 사이트 조회 실패');
    } else {
      const response = result.map(sites => ({
        ...sites,
        photo: sites.photo ? `http://localhost:8080/${uploadFolder}/${path.basename(sites.photo)}` : null
      }));
      res.json(response);
    }
  });
});

// 캠핑장 예약정보 조회
app.get('/main/campingDetail/:campgroundId/reserve', (req, res) => {
  const { campgroundId } = req.params;
  const sql = `SELECT * FROM reservations WHERE campground_id = ?`;
  db.query(sql, [campgroundId], (error, result) => {
    if (error) {
      console.error("예약 정보 조회 실패", error);
      res.status(500).send("서버 오류: 예약 정보 조회 실패");
    } else {
      res.json(result);
      
    }
  });
});

// 캠핑장 예약 정보를 저장하는 API
app.post('/main/campingDetail/:campgroundId/reserve', (req, res) => {
  const { campsite_id, checkInDate, checkOutDate, adults, children, status, campgroundId } = req.body;


  // 날짜 겹침 확인 쿼리
  const overlapQuery = `
    SELECT * FROM reservations
    WHERE campground_id = ? AND campsite_id = ?
    AND ((check_in_date <= ? AND check_out_date >= ?)
    OR (check_in_date <= ? AND check_out_date >= ?)
    OR (check_in_date >= ? AND check_out_date <= ?))
  `;

  db.query(overlapQuery, [campgroundId, campsite_id, checkOutDate, checkInDate, checkInDate, checkOutDate, checkInDate, checkOutDate], (error, result) => {
    if (error) {
      console.error("예약 날짜 확인 실패", error);
      res.status(500).send("서버 오류: 예약 날짜 확인 실패");
    } else if (result.length > 0) {
      res.status(400).json({ message: "해당 날짜는 이미 예약되었습니다." });
    } else {
      const sqlQuery = 'INSERT INTO reservations (campsite_id, check_in_date, check_out_date, adults, children, status, campground_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(sqlQuery, [campsite_id, checkInDate, checkOutDate, adults, children, status, campgroundId], (err, result) => {
        if (err) {
          res.status(500).send(err);
          console.error('Database query error:', err);
          return;
        }
        res.json({ success: true });
      });
    }
  });
});

// 캠핑장 리뷰 정보를 저장하는 API
app.post('/main/campingDetail/:campgroundId/reviews', upload.single('photo'), (req, res) => {
  const { campgroundId } = req.params;
  const { text } = req.body;
  const photo = req.file ? `${req.file.filename}` : null; // 수정된 이미지 파일 이름 사용

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

// 로그인3 API
app.post('/login', (req, res) => {
  const { id, pw } = req.body;
  const query = `SELECT user_id FROM users WHERE name = ? AND password = ?`;
  db.query(query, [id, pw], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      return res.status(401).send('invalid account');
    }
    return res.status(200).send(result[0]);
  });
});

// 필터 API
app.post('/filter', (req, res) => {
  const { name, checkIn, checkOut, address, type } = req.body;
  let query = `
    SELECT campgrounds.*, 
           GROUP_CONCAT(distinct campgroundtype.type SEPARATOR ', ') as types,
           GROUP_CONCAT(distinct amenities.type separator ', ') as amenities
    FROM campgrounds
             LEFT OUTER JOIN campgroundtype ON campgrounds.campground_id = campgroundtype.campground_id
             LEFT OUTER JOIN amenities ON campgrounds.campground_id = amenities.campground_id
    WHERE 1 = 1
  `;
  let queryParams = [];

  if (name) {
    query += `AND campgrounds.name LIKE ? `;
    queryParams.push(`%${name}%`);
  }
  if (address) {
    query += `AND campgrounds.address LIKE ? `;
    queryParams.push(`%${address}%`);
  }
  if (type) {
    query += `AND campgroundtype.type = ? `;
    queryParams.push(type);
  }
  if (checkIn !== '' && checkOut !== '') {
    query += `AND campgrounds.campground_id NOT IN (
      SELECT campgrounds.campground_id
      FROM campgrounds
      JOIN campsites ON campgrounds.campground_id = campsites.campground_id
      JOIN reservations ON campsites.campsite_id = reservations.campsite_id
      WHERE (reservations.check_in_date <= ? AND reservations.check_out_date >= ?)
         OR (reservations.check_in_date <= ? AND reservations.check_out_date >= ?)
         OR (reservations.check_in_date >= ? AND reservations.check_out_date <= ?)
    ) `;
    queryParams.push(checkOut, checkIn, checkOut, checkIn, checkIn, checkOut);
  }

  query += `GROUP BY campgrounds.campground_id`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    // 이미지 URL을 포함한 응답 데이터 생성
    const response = results.map(campground => ({
      ...campground,
      main_photo: campground.main_photo ? `http://localhost:8080/${uploadFolder}/${path.basename(campground.main_photo)}` : null
    }));
    return res.status(200).send(response);
  });
});

// 이미지 파일 제공
app.get(`${uploadFolder}/:filename`, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, uploadFolder, filename);
  console.log("hello", filePath, filename)
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).send('image not found');
    }
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
