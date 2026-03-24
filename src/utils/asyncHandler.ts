import { Request, Response, NextFunction } from 'express'
import { ParsedQs } from 'qs'

type ParamsDict = Record<string, string>

export function asyncHandler<
  P extends ParamsDict = ParamsDict,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
) {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction,
  ) => {
    fn(req, res, next).catch(next)
  }
}
