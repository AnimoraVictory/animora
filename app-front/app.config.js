import 'dotenv/config';

export default {
  expo: {
    name: "app-front",
    slug: "app-front",
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
