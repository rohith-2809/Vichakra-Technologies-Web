const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth',   require('./auth'));
router.use('/admin',  require('./admin'));
router.use('/portal', require('./portal'));

module.exports = router;
