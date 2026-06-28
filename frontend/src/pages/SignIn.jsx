
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function SignIn() {  console.loog("Rendering SignIn page");  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
      <h2>Signn In</h2>
      <GoogleSignInButton />
    </div>
  );
}
