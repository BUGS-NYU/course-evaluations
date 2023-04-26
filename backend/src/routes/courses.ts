import { Router, Request, Response, NextFunction } from 'express';
import { getEvaluationsCollection } from '../db';
import { validateSearch } from '../middlewares/validations';
import { escapeRegex } from '../utils';

export const coursesRouter = Router();

coursesRouter.get(
  '/search',
  validateSearch,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchQueries = String(req.query.phrase)
        .split(' ')
        .map((word) => new RegExp(`^${escapeRegex(word)}$`, 'i'));
      const perPage = parseInt(req.query.perPage as string);
      const currPage = parseInt(req.query.currPage as string);
      const query = { searchIndexes: { $all: searchQueries } };
      const totalItems = await getEvaluationsCollection().countDocuments(query);
      const data = await getEvaluationsCollection()
        .find(query)
        .project({ searchIndexes: 0, questionSections: 0, metadata: 0 })
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
