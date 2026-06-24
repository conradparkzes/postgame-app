import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, onComplete, error }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function handleChange(text: string, index: number) {
    // Handle paste — if more than 1 char arrives, distribute across boxes
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').split('').slice(0, length);
      const next = [...values];
      digits.forEach((d, i) => {
        if (index + i < length) next[index + i] = d;
      });
      setValues(next);
      const lastFilled = Math.min(index + digits.length, length - 1);
      refs.current[lastFilled]?.focus();
      if (next.every((v) => v !== '')) onComplete(next.join(''));
      return;
    }

    const digit = text.replace(/\D/g, '');
    const next = [...values];
    next[index] = digit;
    setValues(next);

    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    if (next.every((v) => v !== '')) onComplete(next.join(''));
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <View>
      <View style={styles.row}>
        {values.map((val, i) => (
          <TextInput
            key={i}
            ref={(r) => { refs.current[i] = r; }}
            style={[
              styles.box,
              focusedIndex === i && styles.boxFocused,
              error && styles.boxError,
            ]}
            value={val}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={6} // allow paste into first box
            textContentType="oneTimeCode"
            caretHidden
            selectTextOnFocus
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  boxFocused: {
    borderColor: Colors.borderFocus,
  },
  boxError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 10,
  },
});
