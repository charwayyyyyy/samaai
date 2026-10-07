import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      description="Create a shared space where ideas become collaborative architecture and durable technical specs."
      eyebrow="Get started"
      title="Build your next system together."
    >
      <SignUp />
    </AuthShell>
  );
}
