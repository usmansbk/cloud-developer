import { APIGatewayProxyEvent } from 'aws-lambda'
import { Key } from 'aws-sdk/clients/dynamodb'
import { parseUserId } from '../auth/utils'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event: APIGatewayProxyEvent, name: string) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

export function parseNextKeyParameter(event: APIGatewayProxyEvent): Key | null {
  const nextKeyStr = getQueryParameter(event, 'nextKey')
  if (!nextKeyStr) {
    return null
  }

  const uriDecoded = decodeURIComponent(nextKeyStr)
  return JSON.parse(uriDecoded) as Key
}

export function parseLimitParameter(
  event: APIGatewayProxyEvent
): number | null {
  const limitStr = getQueryParameter(event, 'limit')
  if (!limitStr) {
    return null
  }

  const limit = parseInt(limitStr, 10)

  if (limit <= 0) {
    throw new Error('Limit should be positive')
  }

  return limit
}
