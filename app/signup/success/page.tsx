export default function SignUpSuccessPage() {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Almost There!</h1>
        <p className="mt-4">
          We’ve sent an email to confirm your account. Please check your inbox (and 
          spam folder) to verify your email before logging in.
        </p>
        <p className="mt-6">
          <a href="/login" className="text-blue-600 underline">
            Return to Login
          </a>
        </p>
      </div>
    );
  }
  