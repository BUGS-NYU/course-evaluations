import { Router, Request, Response, NextFunction } from 'express';
import { getEvaluationsCollection } from '../db';
import { validateSearch } from '../middlewares/validations';

export const coursesRouter = Router();

coursesRouter.get('/test', async (req, res) => {
  const {p} = req.query;
  const phrase = String(p).replace(/\s+/g, "|");
  console.log(phrase);
  const cursor = await getEvaluationsCollection().find({ searchIndexes: { $elemMatch: { $regex: phrase, $options: 'i' } } }).toArray();
  res.send(cursor);
});

coursesRouter.get(
  '/search',
  validateSearch,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const phrase = String(req.query.phrase).replace(/\s+/g, ".*");
      console.log(phrase)
      const perPage = parseInt(req.query.perPage as string);
      const currPage = parseInt(req.query.currPage as string);
      const query = {
        $or: [
          { description: { $regex: phrase, $options: 'i' } },
          { instructors: { $elemMatch: { $regex: phrase, $options: 'i' } } },
        ],
      };
      const totalItems = await getEvaluationsCollection().countDocuments(query);
      const data = await getEvaluationsCollection()
        .find(query)
        .skip((currPage - 1) * perPage)
        .limit(perPage)
        .toArray();
      const totalPages = Math.ceil(totalItems / perPage);

      return res.json({
        data,
        pagination: {
          currPage,
          perPage,
          totalPages,
          totalItems,
        },
      });
    } catch (err) {
      console.log('Error while attempting search');
      return next(err);
    }
  },
);
