// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'qkp7nr6101'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-hbua3ix0.us.auth0.com', // Auth0 domain
  clientId: 'u0VBwRoWJ2b8dBMoZ1m7ye52r7Bj7W1N', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
