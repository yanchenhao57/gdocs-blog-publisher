import { loginAction } from "./action";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/", error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Access Required
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Enter your password to continue
        </p>
        <form action={loginAction}>
          <input type="hidden" name="from" value={from} />
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">Incorrect password, please try again</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
