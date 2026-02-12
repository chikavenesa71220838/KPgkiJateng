/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Background } from '@react-navigation/elements';
import { Platform } from 'react-native';

const palette = {
  warnaUtama: '#207163ff',
  warnaMuda: '#a3d8d1ff',
  warnaTambahan: '#ffd000ff',
  warnaError: '#d9534f',
  warnaAccordion: '#f8f8f8',
  warnaInput: '#E9F5F4',
  warnaBackground: '#ffffff',
  secondaryText: '#666666',
  white: '#ffffffff',
  black: '#000000',
  border: '#ddd',
  placeholder: '#ccc',
  divider: '#eee',
};

// const tintColorLight = palette.warnaUtama;
// const tintColorDark = '#fff';

export const Colors = {

  primary: palette.warnaUtama,
  muda: palette.warnaMuda,
  accent: palette.warnaTambahan,
  danger: palette.warnaError,
  primaryDark: palette.warnaUtama,
  primaryLight: palette.warnaUtama,
  black: palette.black,
  white: palette.white,

  background: palette.warnaBackground,
  cardBackground: palette.warnaAccordion,
  inputBackground: palette.warnaInput,
  border : palette.border,
  text : palette.black,
  textMuted : palette.secondaryText,
  placeholder : palette.placeholder,
  divider : palette.divider,

  light: {
    text: palette.black,
    background: palette.white,
    tint: palette.warnaUtama,
    icon: palette.secondaryText,
    tabIconDefault: palette.secondaryText,
    tabIconSelected: palette.warnaUtama,
  },
  dark: {
    text: palette.black,
    background: palette.white,
    tint: palette.warnaUtama,
    icon: palette.secondaryText,
    tabIconDefault: palette.secondaryText,
    tabIconSelected: palette.warnaUtama,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const FontSize = {
  h1: 24, 
  h2: 20,
  h3: 18,
  body: 14,
  small: 12,
  caption: 10,
  custom: {
    titleCard: 13,
    dateCard: 11,
  }
};

export const Layout = {
  padding: 16,
  paddingSmall: 10,
  radius: 8,
  radiusLarge: 12,
  radiusXLarge: 16,
  gap: 10,
};