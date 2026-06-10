type WorkspaceEmptyStateProps = {
  email: string;
};

export function WorkspaceEmptyState({ email }: WorkspaceEmptyStateProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-500">Signed in as</p>
        <h2 className="mt-1 text-xl font-semibold">{email}</h2>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        Auth is connected. Next up: create the first workspace record and list
        the workspaces you belong to.
      </p>
    </div>
  );
}
