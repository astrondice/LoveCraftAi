import { createClient } from "@supabase/supabase-js";

const url = "https://oucygqsltknoderruayc.supabase.co";
const key = "sb_publishable_p-koiNrSnQV6QsL3GLr-DA_ApR6VEI5";

const supabase = createClient(url, key);

async function testAuthAndInsert() {
  console.log("=== TESTING AUTHENTICATED INSERT ===");

  // 1. Get current session
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Current session user:", session?.user?.id ?? "none (unauthenticated)");

  if (session?.user) {
    const userId = session.user.id;
    const testId = "00000000-0000-0000-0000-000000000099";

    const websitePayload = {
      id: testId,
      user_id: userId,
      title: "Test Website",
      slug: "test-slug-12345",
      status: "active",
      website_type: "cosmic",
      blueprint_json: { test: true },
      preview_image: null,
      published_html: "https://oucygqsltknoderruayc.supabase.co/storage/v1/object/public/published-assets/test.html",
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("websites")
      .upsert(websitePayload, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("=== AUTHENTICATED INSERT ERROR ===");
      console.error(error);
    } else {
      console.log("=== AUTHENTICATED INSERT SUCCESS ===");
      console.log("Inserted row:", data);
      await supabase.from("websites").delete().eq("id", testId);
    }
  }
}

testAuthAndInsert();
