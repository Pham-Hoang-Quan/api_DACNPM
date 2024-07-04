const express = require('express');
const router = express.Router();

// API để sinh viên đăng ký tham gia chiến dịch
router.post('/join', (req, res) => {
    const { campaignId, userId, info, status } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!campaignId || !userId || !status) {
        return res.status(400).json({ error: 'CampaignId, UserId và Status là bắt buộc' });
    }

    // Câu lệnh SQL để thêm bản ghi vào bảng Joined
    const query = `
        INSERT INTO joined (campaignId, userId, info, joinedAt, status)
        VALUES (?, ?, ?, NOW(), ?)
    `;

    req.connection.query(query, [campaignId, userId, info, status], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Trả về bản ghi mới được thêm
        const fetchQuery = `
            SELECT id, campaignId, userId, info, joinedAt, status
            FROM Joined
            WHERE id = ?
        `;

        req.connection.query(fetchQuery, [results.insertId], (err, joinResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json(joinResults[0]);
        });
    });
});

// api duyệt sinh viên tham gia chiến dịch (cập nhật lại status trong joined ='1') truyền vào userId và campaignId
// API duyệt sinh viên tham gia chiến dịch
router.put('/approve', (req, res) => {
    const { userId, campaignId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !campaignId) {
        return res.status(400).json({ error: 'UserId và CampaignId là bắt buộc' });
    }

    // Câu lệnh SQL để cập nhật status trong bảng Joined
    const query = `
        UPDATE joined
        SET status = '1'
        WHERE userId = ? AND campaignId = ?
    `;

    req.connection.query(query, [userId, campaignId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bản ghi phù hợp' });
        }

        // Trả về thông tin đã được cập nhật
        const fetchQuery = `
            SELECT id, campaignId, userId, info, joinedAt, status
            FROM joined
            WHERE userId = ? AND campaignId = ?
        `;

        req.connection.query(fetchQuery, [userId, campaignId], (err, joinResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(200).json(joinResults[0]);
        });
    });
});

router.get('/approved-users/:campaignId', (req, res) => {
    const { campaignId } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!campaignId) {
        return res.status(400).json({ error: 'CampaignId là bắt buộc' });
    }

    // Câu lệnh SQL để lấy danh sách các user đã được duyệt trong chiến dịch
    const query = `
        SELECT 
            u.id, u.name, u.studentId, u.email, u.role, u.universityId, u.createdAt,
            j.id AS joinedId, j.info, j.joinedAt, j.status
        FROM 
            joined j
        INNER JOIN 
            users u ON j.userId = u.id
        WHERE 
            j.campaignId = ? AND j.status = '1' AND u.role = 'student'
    `;

    req.connection.query(query, [campaignId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(results);
    });
});

router.get('/unapprove-users/:campaignId', (req, res) => {
    const { campaignId } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!campaignId) {
        return res.status(400).json({ error: 'CampaignId là bắt buộc' });
    }

    // Câu lệnh SQL để lấy danh sách các user đã được duyệt trong chiến dịch
    const query = `
        SELECT 
            u.id, u.name, u.studentId, u.email, u.role, u.universityId, u.createdAt,
            j.id AS joinedId, j.info, j.joinedAt, j.status
        FROM 
            joined j
        INNER JOIN 
            users u ON j.userId = u.id
        WHERE 
            j.campaignId = ? AND j.status = '0' AND u.role = 'student'
    `;

    req.connection.query(query, [campaignId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(results);
    });
});

module.exports = router;
