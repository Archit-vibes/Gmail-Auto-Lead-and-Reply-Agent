
import React from "react";

const GoogleSignInButton = () => {
  const handleGoogleSignIn = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/google';
    console.log("Redirecting to Google Sign-In...");
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      style={{
        padding: '12px 24px',
        fontSize: 18,
        backgroundColor: '#4285F4',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}
    >
      <span style={{ fontWeight: 600 }}>Sign in with Google</span>
    </button>
  );
};

export default GoogleSignInButton;