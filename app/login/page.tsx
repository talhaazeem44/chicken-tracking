import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Poultry Chicken
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to your dashboard
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
