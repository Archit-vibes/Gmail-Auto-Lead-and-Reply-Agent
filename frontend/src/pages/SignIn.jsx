
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function SignIn() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
      <h2>Sign In</h2>
      <GoogleSignInButton />
    </div>
  );
}
