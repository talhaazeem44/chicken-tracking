import { getSalesTeam } from "@/lib/reports";
import { formatDateTime } from "@/lib/format";
import { CreateUserForm } from "./create-user-form";

export default async function AdminUsersPage() {
  const team = await getSalesTeam();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sales Team
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create login accounts for sales people and see who has access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            New Sales Account
          </h2>
          <CreateUserForm />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Existing Sales Accounts
            </h2>
          </div>
          {team.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
              No sales accounts yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="p-3">{member.name}</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">
                      {member.username}
                    </td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(member.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
