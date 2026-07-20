import { getSalesTeam } from "@/lib/reports";
import { formatDateTime } from "@/lib/format";
import { CreateUserForm } from "./create-user-form";

export default async function AdminUsersPage() {
  const team = await getSalesTeam();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Sales Team
        </h1>
        <p className="text-sm text-zinc-500">
          Create login accounts for sales people and see who has access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            New Sales Account
          </h2>
          <CreateUserForm />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Existing Sales Accounts
            </h2>
          </div>
          {team.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">
              No sales accounts yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="p-3">{member.name}</td>
                    <td className="p-3 text-zinc-500">
                      {member.username}
                    </td>
                    <td className="p-3 text-zinc-500">
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
