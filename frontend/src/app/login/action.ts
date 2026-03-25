"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const from = (formData.get("from") as string) || "/";
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword || password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set("app_auth", correctPassword ?? "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: "/",
    });
    redirect(from);
  }

  redirect(`/login?from=${encodeURIComponent(from)}&error=1`);
}
