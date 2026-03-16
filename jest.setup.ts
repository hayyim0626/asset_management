import "@testing-library/jest-dom";
import { server } from "@/shared/test/msw/server";

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://127.0.0.1:54321";
process.env.SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";
process.env.SUPABASE_SECRET_KEY ||= "test-secret-key";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.NEXT_PUBLIC_APP_URL ||= "http://127.0.0.1:3000";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
