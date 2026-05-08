import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FuelPriceScreen } from './src/screens/FuelPriceScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <FuelPriceScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
