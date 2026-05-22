import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography } from '../../constants/theme';
import { useTheme } from '../../hooks';

interface TextProps extends RNTextProps {
  variant?: 'extraLarge' | 'large' | 'mediumLarge' | 'medium' | 'regular' | 'small' | 'extraSmall';
  weight?: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'regular',
  weight = 'regular',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  const fontFamily = Typography.fontFamily[weight];
  const fontSize = Typography.fontSize[variant];

  return (
    <RNText
      style={[
        styles.text,
        {
          fontFamily,
          fontSize,
          color: color || colors.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});
