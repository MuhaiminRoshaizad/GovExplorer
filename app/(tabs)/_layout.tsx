import { Tabs } from 'expo-router';

import { TabBar } from '@/components/nav/TabBar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
