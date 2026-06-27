import { hashSync } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const authService = {
  async register(input: z.infer<typeof registerSchema>) {
    const parsed = registerSchema.parse(input);
    const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (exists) {
      throw new Error("Email sudah terdaftar.");
    }
    return prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        password: hashSync(parsed.password, 10),
      },
    });
  },
};
