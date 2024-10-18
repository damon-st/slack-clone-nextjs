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
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  setState: (state: SignInFlow) => void;
};

export default function SingInCard({ setState }: Props) {
  const { refresh } = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onPasswordSingIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    signIn("password", { email, password, flow: "signIn" })
      .catch(() => {
        setError("Invalid email or password");
      })
      .then(() => {
        refresh();
      })
      .finally(() => {
        setPending(false);
      });
  };

  const handleProvider = (value: "github" | "google") => {
    setPending(true);
    signIn(value).finally(() => {
      setPending(false);
    });
  };
  return (
    <Card className="size-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
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
        <form onSubmit={onPasswordSingIn} className="space-y-2.5">
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
          Don&apos;t have a account?
          <span
            onClick={() => setState("signUp")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
