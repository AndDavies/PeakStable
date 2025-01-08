import { signup } from "./actions";

export default function SignUpPage() {
  console.log("[SignUpPage] RRRRRRRRRendering signup form...");

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="flex-1 bg-black text-white p-8 flex flex-col justify-center">
        <div className="max-w-sm mx-auto">
          <h1 className="text-3xl font-bold mb-4">PeakMetrix</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            “Join us and start elevating your performance...”
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full max-w-md bg-white text-gray-800 flex flex-col justify-center p-8">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your details. We'll ask you to confirm via email.
          </p>

          <form
            className="space-y-4"
            
          >
            {/* FIRST NAME */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <button
              formAction={signup}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
