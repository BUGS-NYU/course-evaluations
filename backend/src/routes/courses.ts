import { Router } from 'express';
import { getEvaluationsCollection } from '../db';

export const coursesRouter = Router();

coursesRouter.get('/search', async (req, res) => {
  const { phrase } = req.query;
  const result = await getEvaluationsCollection()
    .find({
      $or: [
        { description: { $regex: phrase, $options: 'i' } },
        { instructors: { $regex: phrase, $options: 'i' } },
      ],
    })
    .toArray();
  console.log(result);
  res.json(result);
});
