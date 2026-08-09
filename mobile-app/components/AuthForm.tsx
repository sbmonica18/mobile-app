import { ReactNode } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, ...props }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-fog">{label}</Text>
      <TextInput
        placeholderTextColor="#6B8490"
        className="rounded-xl border border-fog/30 bg-ink/50 px-4 py-3.5 text-base text-mist"
        {...props}
      />
      {error ? <Text className="mt-1.5 text-sm text-sand">{error}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading,
  variant = 'primary',
  disabled,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`items-center rounded-xl border border-fog/40 px-5 py-4 ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
      >
        <Text className="text-base font-medium text-mist">{loading ? 'Please wait…' : label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-xl bg-teal px-5 py-4 ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      <Text className="text-base font-semibold text-mist">{loading ? 'Please wait…' : label}</Text>
    </Pressable>
  );
}

export function AuthScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-xs font-semibold uppercase tracking-[4px] text-sand">UrbanLens</Text>
      <Text className="mt-3 text-3xl font-bold text-mist">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-fog">{subtitle}</Text>
      <View className="mt-8">{children}</View>
    </View>
  );
}
