"use client";
import React, { useState } from "react";
import { SignInFlow } from "../types";
import SingInCard from "./sing-in-card";
import SignUpCard from "./sign-up-card";

export default function AuthScreen() {
  const [state, setState] = useState<SignInFlow>("signIn");
  return (
    <div className="h-full flex items-center justify-center bg-[#5C3B58]">
      <div className="md:h-auto md:w-[420px]">
        {state == "signIn" ? (
          <SingInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
}
