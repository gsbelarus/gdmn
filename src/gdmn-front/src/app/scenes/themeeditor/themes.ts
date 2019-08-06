import { IPartialTheme } from 'office-ui-fabric-react';

interface INamedTheme {
  name: string;
  isInverted: boolean;
  theme: IPartialTheme;
};

export const themes: INamedTheme[] = [
  {
    name: 'Blue',
    isInverted: false,
    theme: {
      palette: {
        themePrimary: '#0078d4',
        themeLighterAlt: '#f3f9fd',
        themeLighter: '#d0e7f8',
        themeLight: '#a9d3f2',
        themeTertiary: '#5ca9e5',
        themeSecondary: '#1a86d9',
        themeDarkAlt: '#006cbe',
        themeDark: '#005ba1',
        themeDarker: '#004377',
        neutralLighterAlt: '#f8f8f8',
        neutralLighter: '#f4f4f4',
        neutralLight: '#eaeaea',
        neutralQuaternaryAlt: '#dadada',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c8c8',
        neutralTertiary: '#bab8b7',
        neutralSecondary: '#a3a2a0',
        neutralPrimaryAlt: '#8d8b8a',
        neutralPrimary: '#323130',
        neutralDark: '#605e5d',
        black: '#494847',
        white: '#ffffff',
      }
    }
  },
  {
    name: 'DarkViolet',
    isInverted: true,
    theme: {
      palette: {
        themePrimary: '#e6b0f5',
        themeLighterAlt: '#e9b9f6',
        themeLighter: '#ecc1f7',
        themeLight: '#eecaf8',
        themeTertiary: '#f1d2f9',
        themeSecondary: '#f4dbfb',
        themeDarkAlt: '#f6e4fc',
        themeDark: '#f9ecfd',
        themeDarker: '#fcf5fe',
        neutralLighterAlt: '#680ca9',
        neutralLighter: '#6c13ac',
        neutralLight: '#751fb2',
        neutralQuaternaryAlt: '#7a26b5',
        neutralQuaternary: '#7e2cb8',
        neutralTertiaryAlt: '#9149c4',
        neutralTertiary: '#fcdeca',
        neutralSecondary: '#fde3d3',
        neutralPrimaryAlt: '#fde8db',
        neutralPrimary: '#fbcdb1',
        neutralDark: '#fef3ed',
        black: '#fef9f5',
        white: '#6205a5',
      }
    }
  },
  {
    name: 'DarkGreen',
    isInverted: true,
    theme: {
      palette: {
        themePrimary: '#d1f58c',
        themeLighterAlt: '#080a06',
        themeLighter: '#212716',
        themeLight: '#3f4a2a',
        themeTertiary: '#7d9354',
        themeSecondary: '#b8d87c',
        themeDarkAlt: '#d5f698',
        themeDark: '#dcf7a7',
        themeDarker: '#e5f9be',
        neutralLighterAlt: '#05410a',
        neutralLighter: '#08490d',
        neutralLight: '#0e5514',
        neutralQuaternaryAlt: '#135d19',
        neutralQuaternary: '#18631e',
        neutralTertiaryAlt: '#2e7e35',
        neutralTertiary: '#fafcca',
        neutralSecondary: '#fbfdd3',
        neutralPrimaryAlt: '#fcfddb',
        neutralPrimary: '#f8fbb1',
        neutralDark: '#fdfeed',
        black: '#fefef5',
        white: '#023906',
      }
    }
  },
  {
    name: 'Red',
    isInverted: true,
    theme: {
      palette: {
          themePrimary: '#f4c971',
          themeLighterAlt: '#0a0805',
          themeLighter: '#272012',
          themeLight: '#493c22',
          themeTertiary: '#927944',
          themeSecondary: '#d7b163',
          themeDarkAlt: '#f5cf7e',
          themeDark: '#f7d692',
          themeDarker: '#f9e1ae',
          neutralLighterAlt: '#ae0202',
          neutralLighter: '#ab0202',
          neutralLight: '#a40202',
          neutralQuaternaryAlt: '#990202',
          neutralQuaternary: '#920202',
          neutralTertiaryAlt: '#8c0202',
          neutralTertiary: '#fdf0e2',
          neutralSecondary: '#fdf2e7',
          neutralPrimaryAlt: '#fef5ec',
          neutralPrimary: '#fce8d4',
          neutralDark: '#fefaf5',
          black: '#fffcfa',
          white: '#b20202',
        }
    }
  }
];

