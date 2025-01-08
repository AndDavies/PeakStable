export default function SignUpSuccessPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Success!</h1>
      <p className="mt-4">
        Your account has been successfully created. You can now log in and start using our services.
      </p>
      <p className="mt-6">
        <a href="/login" className="text-blue-600 underline">
          Go to Login
        </a>
      </p>
    </div>
  );
}