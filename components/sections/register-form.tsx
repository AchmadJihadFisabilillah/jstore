"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const data = (await response.json()) as { message: string };
      return setError(data.message);
    }
    router.push("/login");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Nama lengkap" {...form.register("name")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Password" type="password" {...form.register("password")} />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button className="w-full" isLoading={form.formState.isSubmitting}>
        Daftar
      </Button>
    </form>
  );
}
