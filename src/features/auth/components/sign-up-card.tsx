import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";
import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

type Props = {
  setState: (state: SignInFlow) => void;
};

export default function SignUpCard({ setState }: Props) {
  const { refresh } = useRouter();

  const { signIn } = useAuthActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleProvider = (value: "github" | "google") => {
    setPending(true);
    signIn(value).finally(() => {
      setPending(false);
    });
  };

  const onPasswordSignUp = (e: React.FocusEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    signIn("password", { name, email, password, flow: "signUp" })
      .catch(() => {
        setError("Something went wrong");
      })
      .then(() => {
        refresh();
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <Card className="size-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onPasswordSignUp} className="space-y-2.5">
          <Input
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full Name"
          />
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="Password"
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
            placeholder="Confirm password"
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            type="button"
            disabled={pending}
            onClick={() => handleProvider("google")}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute left-2.5 top-3" />
            Continue with Google
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => handleProvider("github")}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute left-2.5 top-3" />
            Continue with GitHub
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have a account?
          <span
            onClick={() => setState("signIn")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
