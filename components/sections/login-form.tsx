"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError("");
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) return setError("Email atau password salah.");
    
    const session = await getSession();
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Password" type="password" {...form.register("password")} />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button className="w-full" isLoading={form.formState.isSubmitting}>
        Login
      </Button>
    </form>
  );
}
