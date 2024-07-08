const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticate');
// Secret key for JWT
const JWT_SECRET = 'dacnpm';

// Create a new user
// Create a new user and generate JWT token
router.post('/campaign', async (req, res) => {
	const campaign = req.body;

	const query = `
    INSERT INTO campaigns(image, title, description, startAt, endAt, status, universityId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

	req.connection.query(query, [campaign.image, campaign.title, campaign.description, campaign.startAt, campaign.endAt, campaign.status, campaign.universityId ], (err, results) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		const insertedId = results.insertId;

		// Fetch the newly created user
		const fetchQuery = 'SELECT * FROM campaigns WHERE id = ?';
		req.connection.query(fetchQuery, [insertedId], (err, campaignResults) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			if (campaignResults.length > 0) {
				const campaignInfo = campaignResults[0]; 
				return res.status(200).json(campaignInfo); 
			} else {
				return res.status(404).json({ error: 'Campaign not found.' });
			}
			
		});
	});
});

// Lấy tất cả danh sách các chiến dịch
router.get('/getAll', (req, res) => {
	const query = 'SELECT * FROM campaigns';
	req.connection.query(query, (err, results) => {
	  if (err) {
		return res.status(500).json({ error: err.message });
	  }
  
	  if (results.length > 0) {
		return res.status(200).json(results);
	  } else {
		return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào.' });
	  }
	});
  });

// Lấy danh sách các chiến dịch dựa trên trường
router.get('/campaign/byuserId/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT *
FROM 
    campaigns c
JOIN 
    universities u ON c.universityId = u.id
WHERE 
    u.userId = ?;`;
    req.connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào với trạng thái này.' });
        }
    });
});

//Lấy danh sách các chiến dịch dựa theo trường đã duyệt (cho sv) (status = 0: chưa duyệt, status = 1: đã duyệt)
router.get('/campaign/accepted/:universityId', (req, res) => {
	const universityId = req.params.universityId;

	const query = 'SELECT * FROM campaigns WHERE universityId = ? AND status = 1';
	req.connection.query(query, [universityId] ,(err, results) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		if (results.length > 0) {
			return res.status(200).json(results);
		} else {
			return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào với trạng thái này.' });
		}
	});
});
//Lấy thông tin một chiến dịch
// router.get('/campaign/info/:id', (req, res) => {
// 	const id = req.params.id;

// 	const query = 'SELECT * FROM campaigns WHERE id = ?';
// 	req.connection.query(query, [id], (err, results) => {
// 		if (err) {
// 			return res.status(500).json({ error: err.message });
// 		}

// 		if (results.length > 0) {
// 			return res.status(200).json(results[0]);
// 		} else {
// 			return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào.' });
// 		}
// 	});
// });

router.get('/campaign/info/:id', (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT 
			joined.*,
            campaigns.*
        FROM joined 
        LEFT JOIN campaigns ON joined.campaignId = campaigns.id 
        WHERE campaigns.id = ?
    `;
    
    req.connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('SQL Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log('SQL Results:', results);  // Debugging: Log SQL results

        if (results.length > 0) {
            const campaign = results[0];
            return res.status(200).json(campaign);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào với trạng thái này.' });
        }
    });
});


//Xác nhận chiến dịch (trường) 
router.put('/campaign/update-status/:id', (req, res) => {
	const id = req.params.id;

	const query = 'UPDATE campaigns SET status = 1 WHERE id = ?';
	req.connection.query(query, [id], (err, results) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		if (results.affectedRows > 0) {
			return res.status(200).json({ message: 'Cập nhật trạng thái thành công.' });
		} else {
			return res.status(404).json({ error: 'Không tìm thấy chiến dịch nào với id này.' });
		}
	});
});




module.exports = router;
// Create a new campaign

