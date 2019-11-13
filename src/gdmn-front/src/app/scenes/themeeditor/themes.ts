import { IPartialTheme } from 'office-ui-fabric-react';

interface INamedTheme {
  name: string;
  theme: IPartialTheme;
};

export const themes: INamedTheme[] = [
  {
    name: 'Blue',
    theme: {
      isInverted: false,
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
    name: 'Violet',
    theme: {
      isInverted: false,
      palette: {
        themePrimary: '#ab00d4',
        themeLighterAlt: '#fbf3fd',
        themeLighter: '#f0d0f8',
        themeLight: '#e4a9f2',
        themeTertiary: '#cb5ce5',
        themeSecondary: '#b41ad9',
        themeDarkAlt: '#9a00be',
        themeDark: '#8200a1',
        themeDarker: '#600077',
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
    name: 'Red',
    theme: {
      isInverted: false,
      palette: {
        themePrimary: '#ff0000',
        themeLighterAlt: '#fff5f5',
        themeLighter: '#ffd6d6',
        themeLight: '#ffb3b3',
        themeTertiary: '#ff6666',
        themeSecondary: '#ff1f1f',
        themeDarkAlt: '#e60000',
        themeDark: '#c20000',
        themeDarker: '#8f0000',
        neutralLighterAlt: '#f8f8f8',
        neutralLighter: '#f4f4f4',
        neutralLight: '#eaeaea',
        neutralQuaternaryAlt: '#dadada',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c8c8',
        neutralTertiary: '#595959',
        neutralSecondary: '#373737',
        neutralPrimaryAlt: '#2f2f2f',
        neutralPrimary: '#000000',
        neutralDark: '#151515',
        black: '#0b0b0b',
        white: '#ffffff',
      }
    }
  },
  {
    name: 'DarkViolet',
    theme: {
      isInverted: true,
      palette: {
        themePrimary: '#ff99ff',
        themeLighterAlt: '#0a060a',
        themeLighter: '#291829',
        themeLight: '#4d2e4d',
        themeTertiary: '#995c99',
        themeSecondary: '#e087e0',
        themeDarkAlt: '#ffa3ff',
        themeDark: '#ffb1ff',
        themeDarker: '#ffc6ff',
        neutralLighterAlt: '#480348',
        neutralLighter: '#4f074f',
        neutralLight: '#5b0d5b',
        neutralQuaternaryAlt: '#631263',
        neutralQuaternary: '#691769',
        neutralTertiaryAlt: '#822e82',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#400040',
      }
    }
  },
  {
    name: 'DarkGreen',
    theme: {
      isInverted: true,
      palette: {
        themePrimary: '#ffff22',
        themeLighterAlt: '#0a0a01',
        themeLighter: '#292905',
        themeLight: '#4d4d0a',
        themeTertiary: '#999914',
        themeSecondary: '#e0e01d',
        themeDarkAlt: '#ffff37',
        themeDark: '#ffff56',
        themeDarker: '#ffff83',
        neutralLighterAlt: '#034803',
        neutralLighter: '#074f07',
        neutralLight: '#0d5b0d',
        neutralQuaternaryAlt: '#126312',
        neutralQuaternary: '#176917',
        neutralTertiaryAlt: '#2e822e',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#004000',
      }
    }
  },
  {
    name: 'DarkRed',
    theme: {
      isInverted: true,
      palette: {
        themePrimary: '#bbbb22',
        themeLighterAlt: '#070701',
        themeLighter: '#1e1e05',
        themeLight: '#38380a',
        themeTertiary: '#707014',
        themeSecondary: '#a4a41d',
        themeDarkAlt: '#c1c133',
        themeDark: '#cbcb4c',
        themeDarker: '#d8d875',
        neutralLighterAlt: '#480303',
        neutralLighter: '#4f0707',
        neutralLight: '#5b0d0d',
        neutralQuaternaryAlt: '#631212',
        neutralQuaternary: '#691717',
        neutralTertiaryAlt: '#822e2e',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#400000',
      }
    }
  },
  {
    name: 'Graphite',
    theme: {
      isInverted: true,
      palette: {
        themePrimary: '#909090',
        themeLighterAlt: '#060606',
        themeLighter: '#171717',
        themeLight: '#2b2b2b',
        themeTertiary: '#565656',
        themeSecondary: '#7e7e7e',
        themeDarkAlt: '#9a9a9a',
        themeDark: '#aaaaaa',
        themeDarker: '#c0c0c0',
        neutralLighterAlt: '#2b2b2b',
        neutralLighter: '#333333',
        neutralLight: '#414141',
        neutralQuaternaryAlt: '#4a4a4a',
        neutralQuaternary: '#515151',
        neutralTertiaryAlt: '#6f6f6f',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#202020',
      }
    }
  }
];
