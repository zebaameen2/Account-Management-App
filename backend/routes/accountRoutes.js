import express from 'express';
import {
  getBalance,
  getStatement,
  transferMoney,
  getAllUsers
} from '../controllers/accountController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// All account routes are protected
router.use(authMiddleware);

router.get('/balance', getBalance);
router.get('/statement', getStatement);
router.post('/transfer', transferMoney);
router.get('/users', getAllUsers);

export default router;
