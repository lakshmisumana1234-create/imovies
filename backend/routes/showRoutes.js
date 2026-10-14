const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowsByTheater,
  getShowById,
  createShow,
} = require('../controllers/showController');

router.get('/', getShows);
router.get('/theaters', getShowsByTheater);
router.get('/:id', getShowById);
router.post('/list-your-show', createShow);

module.exports = router;