import { Request, Response, NextFunction } from 'express';
import { z, AnyZodObject } from 'zod';

const validate =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };

const searchSchema = z
  .object({
    query: z.object({
      perPage: z.coerce
        .number({ required_error: 'Must set per page parameter' })
        .int()
        .min(1)
        .max(200),
      phrase: z.string({ required_error: 'Must add search phrase parameter' }).min(1),
      currPage: z.coerce
        .number({ required_error: 'Must have current page parameter' })
        .min(1)
        .int()
        .finite(),
    }),
  })
  .required();

const getCourseByIdSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: 'Must provide courseId' }),
  }),
});

export const validateSearch = validate(searchSchema);
export const validateGetCourseById = validate(getCourseByIdSchema);
