import { useAuth } from '../auth/AuthContext'

/**
 * Login — OAuth sign-in screen. AdScale authenticates by connecting the user's
 * ad platform account (Google / Meta), so there is no password field by design.
 */
function Login() {
  const { signInWithGoogle, signInWithMeta } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">AdScale AI</h1>
          <p className="mt-1 text-slate-500">Autonomous Ad Manager</p>
        </header>

        <h2 className="mb-2 text-center text-xl font-semibold text-slate-800">
          Sign in to your account
        </h2>
        <p className="mb-8 text-center text-sm text-slate-500">
          AdScale connects directly to your ad platform — no separate password to manage.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <GoogleIcon />
            Continue with Google Ads
          </button>

          <button
            type="button"
            onClick={signInWithMeta}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe0]"
          >
            <MetaIcon />
            Continue with Meta
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          By continuing you authorize AdScale to manage campaigns on your connected ad
          account. We never store your password.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function MetaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.2 4C3.6 4 2 6.5 2 10c0 4.2 2 6 3.9 6 1.6 0 2.8-1.1 4.1-3.4.5-.9.9-1.7 1.2-2.4.3.7.7 1.5 1.2 2.4C13.7 14.9 14.9 16 16.5 16 18.4 16 22 14.2 22 10c0-3.5-1.6-6-4.2-6-1.9 0-3.3 1.4-4.6 3.6-.4.6-.7 1.3-1.1 2-.4-.7-.8-1.4-1.2-2C9.6 5.4 8.2 4 6.2 4Zm0 2c1 0 2 .9 3 2.6.3.4.5.9.8 1.4-.3.5-.6 1-.8 1.5C8.2 13.2 7.2 14 6.2 14 5 14 4 12.5 4 10s1-4 2.2-4Zm11.6 0C19 6 20 7.5 20 10s-1 4-2.2 4c-1 0-2-.8-3-2.5-.3-.5-.5-1-.8-1.5.3-.5.5-1 .8-1.4 1-1.7 2-2.6 3-2.6Z" />
    </svg>
  )
}

export default Login
