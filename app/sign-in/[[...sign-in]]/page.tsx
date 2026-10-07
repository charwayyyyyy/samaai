import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      description="Bring your team into one focused workspace for shaping systems from first idea to final technical specification."
      eyebrow="Welcome back"
      title="Continue designing with your team."
    >
      <SignIn />
    </AuthShell>
  );
}
