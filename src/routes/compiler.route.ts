// src/routes/compiler.route.ts
import express from 'express';
import { compileCode } from '../controllers/compiler.controller';

const router = express.Router();
// Route để biên dịch mã
router.post('/compile', (req, res) => {
  compileCode(req, res).catch(err => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
});

export default router;
