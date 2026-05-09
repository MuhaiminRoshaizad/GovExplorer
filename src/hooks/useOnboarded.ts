import { useSetting } from './useSetting';

export function useOnboarded() {
  const [completed, setCompleted, loaded] = useSetting<boolean>('onboarding.completed', false);
  return { completed, setCompleted, loaded };
}
