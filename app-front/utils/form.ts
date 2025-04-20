type OnChangeFunction<F, T extends keyof F> = (
  args: { key: T; value: F[T] } | { updates: Partial<F> }
) => void;

export function onChangeFunction<F, T extends keyof F>(
  setFunction: React.Dispatch<React.SetStateAction<F>>
): OnChangeFunction<F, T> {
  return (args: { key: T; value: F[T] } | { updates: Partial<F> }) => {
    if ('key' in args) {
      const { key, value } = args;
      setFunction((prev) => ({ ...prev, [key]: value }));
    } else {
      const { updates } = args;
      setFunction((prev) => ({ ...prev, ...updates }));
    }
  };
}
