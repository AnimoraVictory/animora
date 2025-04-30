import { Stack } from 'expo-router';

export default function SettingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 全ページでデフォルト非表示
      }}
    />
  );
}
