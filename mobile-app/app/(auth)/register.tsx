import { Redirect } from 'expo-router';

/** Signup is handled via the Login Form tab — keep this route for deep links. */
export default function RegisterRedirect() {
  return <Redirect href="/(auth)/login" />;
}
