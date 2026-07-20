import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
            🐔
          </span>
          <h1 className="text-xl font-semibold text-zinc-900">
            Poultry Chicken
          </h1>
          <p className="text-sm text-zinc-500">Sign in to your dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
