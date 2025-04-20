import 'dotenv/config';

export default {
  expo: {
    name: 'app-front',
    slug: 'app-front',
    scheme: 'animalia',
    newArchEnabled: true,
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
