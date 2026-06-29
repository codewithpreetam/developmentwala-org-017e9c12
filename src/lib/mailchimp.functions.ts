import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; firstName?: string; lastName?: string; source?: string }) => {
    if (!data || typeof data.email !== "string") throw new Error("Invalid input");
    return {
      email: data.email.slice(0, 254),
      firstName: data.firstName?.slice(0, 80),
      lastName: data.lastName?.slice(0, 80),
      source: data.source?.slice(0, 80) || "DevelopmentWala.org",
    };
  })
  .handler(async ({ data }) => {
    const { subscribeEmail } = await import("./mailchimp.server");
    return subscribeEmail(data);
  });

export const fetchNewsletterStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { getNewsletterStats } = await import("./mailchimp.server");
    return getNewsletterStats();
  });
