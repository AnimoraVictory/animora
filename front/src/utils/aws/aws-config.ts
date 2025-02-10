const awsConfig = {
    Auth: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_AWS_CLIENT_ID,
      mandatorySignIn: false,
      authenticationFlowType: "USER_SRP_AUTH",
      oauth: {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
        scope: ["openid", "email", "profile"],
        redirectSignIn: import.meta.env.VITE_AWS_REDIRECT_SIGNIN,
        redirectSignOut: import.meta.env.VITE_AWS_REDIRECT_SIGNOUT,
        responseType: "code",
      },
    },
  }
  
  export default awsConfig
  