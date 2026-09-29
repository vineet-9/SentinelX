import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-bold text-white">
          Page not found
        </h1>

        <p className="mt-4 text-zinc-400">
          The page you are looking for does not exist or may have
          been moved.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}