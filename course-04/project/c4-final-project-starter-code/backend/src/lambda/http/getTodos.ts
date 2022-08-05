import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser } from '../../helpers/todos'
import { getUserId, parseLimitParameter, parseNextKeyParameter } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const nextKey = parseNextKeyParameter(event)
    const limit = parseLimitParameter(event) || 20
    const result = await getTodosForUser(userId, nextKey, limit)

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
