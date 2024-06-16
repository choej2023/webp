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
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
    } else if (results.length === 0 || !results[0].main_photo) {
      // 이미지가 없는 경우 기본 응답을 반환
      res.json(null); // 또는 원하는 기본 이미지 URL을 반환할 수 있습니다.
    } else {
      const mainPhotoPath = results[0].main_photo;
      res.json(`http://localhost:8080/${uploadFolder}/${path.basename(mainPhotoPath)}`);
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
  const sql = 'SELECT c.campsite_id, c.campground_id, c.name, c.rate, c.capacity, c.photo, r.status FROM campsites c LEFT JOIN reservations r ON c.campsite_id = r.campsite_id AND CURDATE() BETWEEN r.check_in_date AND r.check_out_date WHERE c.campground_id = ?';
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
app.post('/main/campingDetail/:campgroundId/reserve/:user_id', (req, res) => {
  const { campsite_id, checkInDate, checkOutDate, adults, children, status } = req.body;
  const {campgroundId, user_id} = req.params;



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
      const sqlQuery = 'INSERT INTO reservations (campsite_id, user_id, check_in_date, check_out_date, adults, children, status, campground_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(sqlQuery, [campsite_id,user_id, checkInDate, checkOutDate, adults, children, status, campgroundId], (err, result) => {
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
  const { text, user_id } = req.body;
  const photo = req.file ? `${req.file.filename}` : null; // 수정된 이미지 파일 이름 사용
  console.log(req.body)

  const query = 'INSERT INTO reviews (campground_id, user_id, text, photo) VALUES (?, ?, ?, ?)';
  const values = [campgroundId, user_id, text, photo];

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
           GROUP_CONCAT(distinct campgroundtype.type SEPARATOR ', ') as types
    FROM campgrounds
           LEFT OUTER JOIN campgroundtype ON campgrounds.campground_id = campgroundtype.campground_id
    WHERE 1 = 1
  `;
  let queryParams = [];

  if (name) {
    query += ` AND campgrounds.name LIKE ? `;
    queryParams.push(`%${name}%`);
  }
  if (address) {
    query += ` AND campgrounds.address LIKE ? `;
    queryParams.push(`%${address}%`);
  }
  if (type) {
    query += ` AND campgroundtype.type = ? `;
    queryParams.push(type);
  }
  if (checkIn !== '' && checkOut !== '') {
    query += ` AND campgrounds.campground_id NOT IN (
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

// 캠핑장 등록 API
app.post('/enroll', upload.single('main_photo'), (req, res) => {
  const { userId, name, description, address, contact, check_in_time, check_out_time, manner_start_time, manner_end_time, amenities } = req.body;
  const main_photo = req.file ? `${req.file.filename}` : null; // 수정된 이미지 파일 이름 사용

  const query = 'INSERT INTO campgrounds (user_id, name, address, contact, description, check_in_time, check_out_time, manner_start_time, manner_end_time, main_photo, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [userId, name, address, contact, description, check_in_time, check_out_time, manner_start_time, manner_end_time, main_photo, amenities], (error, results) => {
    if (error) {
      return res.status(500).json({ error: '캠핑장정보 등록 실패' });
    }
    const insertId = results.insertId;
    res.json({ success: true, id: insertId });
  });
});

// 캠핑장 업데이트
app.put('/updateCampground/:campgroundId/update', upload.single('main_photo'), (req, res) => {
  const campgroundId = req.params.campgroundId;
  const { user_id, name, description, address, contact, check_in_time, check_out_time, manner_start_time, manner_end_time, amenities } = req.body;
  const main_photo = req.file ? `${req.file.filename}` : null;
  console.log(req.body, main_photo);

  const updateQuery = `
    UPDATE campgrounds
    SET
      user_id = ?,
      name = ?,
      address = ?,
      contact = ?,
      description = ?,
      check_in_time = ?,
      check_out_time = ?,
      manner_start_time = ?,
      manner_end_time = ?,
      main_photo = ?,
      amenities = ?
    WHERE campground_id = ?
  `;

  db.query(
      updateQuery,
      [user_id, name, address, contact, description, check_in_time, check_out_time, manner_start_time, manner_end_time, main_photo, amenities, campgroundId],
      (error, results) => {
        if (error) {
          console.error('Error updating campground:', error);
          return res.status(500).json({ error: '캠핑장 정보 업데이트 실패' });
        }
        console.log(`Campground with ID ${campgroundId} updated successfully.`);
        res.json(results);
      }
  );
});

// 캠핑장타입 등록 API
app.post('/enrollType', (req, res) => {
  const { campgroundType, id } = req.body;

  console.log('Received data:', req.body); // req.body 출력

  const query = 'INSERT INTO campgroundtype (campground_id, type) VALUES (?, ?)';

  db.query(query, [id, campgroundType], (error, results) => {
    if (error) {
      console.error('캠핑장타입 등록 실패:', error);
      return res.status(500).json({ error: '캠핑장타입 등록 실패' });
    }
    res.json({ success: true});
  });
});

// 캠핑장 타입 수정 API
app.put('/editType', (req, res) => {
  const { campgroundType, id } = req.body;

  console.log('Received data:', req.body); // req.body 출력

  const query = 'UPDATE campgroundtype SET type = ? WHERE campground_id = ?';

  db.query(query, [campgroundType, id], (error, results) => {
    if (error) {
      console.error('캠핑장타입 수정 실패:', error);
      return res.status(500).json({ error: '캠핑장타입 수정 실패' });
    }
    res.json({ success: true });
  });
});



// 사이트 등록 API
app.post('/site', upload.single('photo'), (req, res) => {
  const { campId, name, rate, capacity } = req.body;
  const photo = req.file ? req.file.filename : null;

  const query = 'INSERT INTO campsites (campground_id, name, rate, capacity, photo) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [campId, name, rate, capacity, photo], (error, results) => {
    if (error) {
      console.error('사이트 등록 실패:', error);
      return res.status(500).json({ error: '사이트 등록 실패' });
    }
    res.json({ success: true });
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


// 리뷰 데이터 조회
app.get('/MyPage/reviews', (req, res) => {

  const query = 'SELECT text, photo FROM reviews';
  db.query(query, (error, result) => {

    if (error) {
      console.error('리뷰 데이터 조회 실패', error);
      res.status(500).send('서버 오류: 리뷰 데이터 조회 실패');
    } else {
      const response = result.map(review => ({
        ...review,
        photo: review.photo ? `http://localhost:8080/${uploadFolder}/${path.basename(review.photo)}` : null
      }));
      res.status(200).json(response);
    }
  });
});

// 예약정보 데이터 조회
app.get('/MyPage/reservations/:user_id', (req, res) => {
  const {user_id} = req.params
  const query = 'SELECT *  FROM reservations WHERE user_id = ?';
  db.query(query, [user_id], (error, result) => {

    if (error) {
      console.error('리뷰 데이터 조회 실패', error);
      res.status(500).send('서버 오류: 리뷰 데이터 조회 실패');
    } else {
      res.status(200).json(result)
    }
  });
});



// 고객의 예약 현황 조회
app.get('/MyPage/reservation', (req, res) => {
  const userId = req.query.user_id;
  const sql = `
    SELECT r.reservation_id, c.name AS campground_name, cs.name AS campsite_name, r.check_in_date, r.check_out_date, r.status
    FROM reservations r
    JOIN campsites cs ON r.campsite_id = cs.campsite_id
    JOIN campgrounds c ON r.campground_id = c.campground_id
    WHERE r.user_id = ?;
  `;
  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('예약 현황 조회 실패:', error);
      res.status(500).send('예약 현황 조회 실패');
      return;
    }
    res.json(results);
  });
});

app.get('/reservCamp', (req, res) => {
  const { user_id } = req.query; // GET 요청에서 req.query 사용

  const sql = `SELECT r.user_id, u.name AS user_name, cg.campground_id, cg.name AS campground_name, cs.campsite_id, cs.name AS campsite_name, r.reservation_id, r.check_in_date, r.check_out_date, r.status, r.adults, r.children FROM users u JOIN campgrounds cg ON u.user_id = cg.user_id JOIN campsites cs ON cg.campground_id = cs.campground_id JOIN reservations r ON cs.campsite_id = r.campsite_id WHERE u.user_id = ?`;

  db.query(sql, [user_id], (error, result) => {
    if (error) {
      console.error('내 캠핑장의 예약 현황 조회 실패:', error);
      res.status(500).send('내 캠핑장 예약 현황 조회 실패');
      return;
    }
    res.json(result);
  });
});

app.post('/acceptReserv', (req, res) => {
  const { reservation_id, campsite_id } = req.body;

  const query = `
    UPDATE reservations
    SET status = 'Confirmed'
    WHERE reservation_id = ? AND campsite_id = ?;
  `;

  db.query(query, [reservation_id, campsite_id], (err, result) => {
    if (err) {
      console.error('Error updating reservation status:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send('Reservation not found');
      return;
    }

    res.status(200).send('Reservation confirmed successfully');
  });
});



// 고객의 리뷰 조회
app.get('/api/reviews', (req, res) => {
  const userId = req.query.user_id;
  const sql = 'SELECT review_id, text, photo FROM reviews WHERE user_id = ?';
  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('리뷰 조회 실패:', error);
      res.status(500).send('리뷰 조회 실패');
      return;
    }
    const response = results.map(review => ({
      ...review,
      photo: review.photo ? `http://localhost:8080/${uploadFolder}/${path.basename(review.photo)}` : null
    }));
    res.status(200).send(response);
  });
});


// 캠핑장 예약 취소 API
app.delete('/main/MyPage/cancel/:campsite_id/:reservation_id', (req, res) => {
  const { campsite_id, reservation_id } = req.params;
  const sql = 'DELETE FROM reservations WHERE campsite_id = ? AND reservation_id = ?';
  db.query(sql, [campsite_id, reservation_id], (error, result) => {
    if (error) {
      console.error('예약 취소 실패:', error);
      res.status(500).send('서버 오류: 예약 취소 실패');
      return;
    }
    res.json({ success: true, message: '예약이 성공적으로 취소되었습니다.' });
  });
});



// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
