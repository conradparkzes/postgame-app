import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@/src/constants/colors';

type Variant = 'primary' | 'secondary' | 'text';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', loading = false, style, disabled, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles[`${variant}Pressed`],
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.textInverse : Colors.accent} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // primary — Portland Orange fill
  primary: {
    backgroundColor: Colors.accent,
  },
  primaryPressed: {
    backgroundColor: Colors.accentDim,
  },
  primaryLabel: {
    color: Colors.textInverse,
  },

  // secondary — outlined
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryPressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  secondaryLabel: {
    color: Colors.textPrimary,
  },

  // text — no background or border
  text: {
    backgroundColor: 'transparent',
    height: 40,
  },
  textPressed: {
    opacity: 0.6,
  },
  textLabel: {
    color: Colors.accent,
  },

  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
