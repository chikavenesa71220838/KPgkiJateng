import { Redirect } from 'expo-router';

export default function Index() {
  // Mengarahkan langsung ke halaman jadwal ibadah yang ada di dalam grup (tabs)
  return <Redirect href="/home" />;
}