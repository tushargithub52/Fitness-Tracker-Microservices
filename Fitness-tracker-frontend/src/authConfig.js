export const authConfig = {
  clientId: 'oauth2-pkce-client',
  authorizationEndpoint: 'http://localhost:8181/realms/FitTrack-AI/protocol/openid-connect/auth',
  tokenEndpoint: 'http://localhost:8181/realms/FitTrack-AI/protocol/openid-connect/token',
  redirectUri: 'http://localhost:5173',
  scope: 'openid roles profile email offline_access',
  onRefreshTokenExpire: (event) => event.logIn(),
}