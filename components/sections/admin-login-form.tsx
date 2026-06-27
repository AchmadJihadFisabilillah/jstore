"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
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

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError("");
    const result = await signIn("credentials", { ...values, redirect: false });
    
    if (result?.error) {
      return setError("Email atau password salah.");
    }
    
    // Retrieve the session on the client to check user role
    const session = await getSession();
    
    if (session?.user?.role !== "ADMIN") {
      // Not allowed! Sign them out immediately
      await signOut({ redirect: false });
      return setError("Akses ditolak. Anda bukan administrator.");
    }
    
    // Successful admin login, redirect to dashboard
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email Administrasi</label>
        <Input placeholder="admin@jstore.id" {...form.register("email")} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password Keamanan</label>
        <Input placeholder="••••••••" type="password" {...form.register("password")} />
      </div>
      {error ? <p className="text-sm text-red-500 font-medium">{error}</p> : null}
      <Button className="w-full mt-2" isLoading={form.formState.isSubmitting}>
        Masuk Dashboard
      </Button>
    </form>
  );
}
