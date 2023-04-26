import { Router } from 'express';
import { getEvaluationsCollection } from '../db';
import {validateSearch} from '../middlewares/validations';

export const coursesRouter = Router();

coursesRouter.get('/search', validateSearch, async (req, res, next) => {
  try {
    const { phrase } = req.query;
    const result = await getEvaluationsCollection()
      .find({
        $or: [
          { description: { $regex: phrase, $options: 'i' } },
          { instructors: { $regex: phrase, $options: 'i' } },
        ],
      })
      .toArray();

    res.json(result);
  } catch (err) {
    console.log("Error while attempting search!");
    next(err);
  }
});

