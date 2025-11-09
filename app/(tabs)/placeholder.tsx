import { Redirect } from 'expo-router';

export default function PlaceholderScreen() {
  // This screen is hidden from the tab bar but needed for routing
  return <Redirect href="/(tabs)/" />;
}

