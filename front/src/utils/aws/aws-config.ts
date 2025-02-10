import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: String(import.meta.env.VITE_AWS_USER_POOL_ID),
      userPoolClientId: String(import.meta.env.VITE_AWS_CLIENT_ID),
      loginWith: {
        oauth: {
          domain: String(import.meta.env.VITE_AWS_COGNITO_DOMAIN),
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [String(import.meta.env.VITE_AWS_REDIRECT_SIGNIN)],
          redirectSignOut: [String(import.meta.env.VITE_AWS_REDIRECT_SIGNOUT)],
          responseType: "code",
          providers: ["Google", { custom: "Line" }],
        },
      },
    },
  },
});
