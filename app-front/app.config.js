import 'dotenv/config';

export default {
  expo: {
    name: 'Animora',
    slug: 'Animora',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'animora',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'animora',
      infoPlist: {
        NSCameraUsageDescription:
          'ペットとの思い出を記録するためにカメラを使用します。',
        NSPhotoLibraryUsageDescription:
          '写真ライブラリ全体にアクセスし、投稿やプロフィール画像の選択などに使用します。',
        NSUserNotificationUsageDescription:
          'デイリータスクの更新情報や他の飼い主さんからの通知をお知らせするために使用します。',
        NSLocationWhenInUseUsageDescription:
          '近くの飼い主さんの投稿を表示するために現在地情報を使用します。',
        NSMicrophoneUsageDescription:
          'アプリ内で音声の録音や使用を行うためにマイクへのアクセスが必要です。',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.animora.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-secure-store',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '9620deb2-9d31-4c2b-ac91-d41231661941',
      },
      API_URL: process.env.API_URL,
    },
  },
};
