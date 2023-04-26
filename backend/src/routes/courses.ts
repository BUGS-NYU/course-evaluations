import { Router, Request, Response, NextFunction } from 'express';
import { getEvaluationsCollection } from '../db';
import { validateSearch } from '../middlewares/validations';

export const coursesRouter = Router();

coursesRouter.get(
  '/search',
  validateSearch,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phrase } = req.query;
      const perPage = parseInt(req.query.perPage as string);
      const currPage = parseInt(req.query.currPage as string);
      const query = {
        $or: [
          { description: { $regex: phrase, $options: 'i' } },
          { instructors: { $regex: phrase, $options: 'i' } },
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
