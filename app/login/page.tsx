import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel (Dark Branding) */}
      <div className="flex-1 bg-black text-white p-8 flex flex-col justify-center">
        <div className="max-w-sm mx-auto">
          <h1 className="text-3xl font-bold mb-4">PeakMetrix</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            “Elevate your performance with data-driven training and mindful
            practices. Log in or create an account to get started on your
            holistic fitness journey.”
          </p>
        </div>
      </div>

      {/* Right Panel (Light Form) */}
      <div className="w-full max-w-md bg-white text-gray-800 flex flex-col justify-center p-8">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Enter your email and password to continue. If you don't have an account,
            sign up in seconds.
          </p>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full p-2 border border-gray-300 rounded 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full p-2 border border-gray-300 rounded 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <button
                formAction={login}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded
                           hover:bg-blue-700 focus:outline-none focus:ring-2
                           focus:ring-blue-500 transition-colors"
              >
                Log In
              </button>


            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
