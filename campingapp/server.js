const express = require('express');
const multer = require('multer')
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const uploadFolder = 'uploads'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'camping_db'
});

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// 서버 실행
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

app.post('/login', (req, res) => {
    const {id, pw} = req.body;
    const query = `select user_id
                   from users
                   where name = ?
                     and password = ?`;
    db.query(query, [id, pw], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length === 0) {
            return res.status(401).send('invalid account')
        }
        return res.status(200).send(result[0])
    })
})

app.post('/filter', (req, res) => {
    const {name, checkIn, checkOut, address, type} = req.body;
    let query = `
        SELECT campgrounds.*, 
               GROUP_CONCAT(distinct campgroundtype.type SEPARATOR ', ') as types,
               GROUP_CONCAT(distinct amenities.type separator ', ') as amenities
        FROM campgrounds
                 LEFT OUTER JOIN campgroundtype ON campgrounds.campground_id = campgroundtype.campground_id
                 LEFT OUTER JOIN amenities ON campgrounds.campground_id = amenities.campground_id
        WHERE 1 = 1
    `;
    let queryParams = []

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
            WHERE (reservations.checkIn <= ? AND reservations.checkOut >= ?)
               OR (reservations.checkIn <= ? AND reservations.checkOut >= ?)
               OR (reservations.checkIn >= ? AND reservations.checkOut <= ?)
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

app.get(`${uploadFolder}/:filename`, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, uploadFolder, filename)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('image not found')
        }
    })
})