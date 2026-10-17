import { describe, expect, it } from "vitest";
// The existing portfolio uses browser-safe JavaScript data modules.
// @ts-expect-error The static portfolio does not provide TypeScript declarations.
import { CERTIFICATES } from "../../public/portfolio/assets/js/cert-data.js";

describe("Personal certificate metadata", () => {
  it("contains only the 11 supplied certificate images", () => {
    expect(CERTIFICATES).toHaveLength(11);
    expect(CERTIFICATES.map((cert: { image: string }) => cert.image.split("/").at(-1)).sort()).toEqual([
      "ai.jpg", "android.jpg", "certificate-1.png", "certificate-2.png", "certificate-3.png",
      "certificate-4.png", "certificate-5.png", "certificate-6.png", "certificate-7.png",
      "data-analysis.jpg", "programming.jpg",
    ]);
  });

  it("does not invent verification URLs, dates, or skills", () => {
    for (const cert of CERTIFICATES) {
      expect(cert).not.toHaveProperty("credentialUrl");
      expect(cert).not.toHaveProperty("date");
      expect(cert.skills).toEqual([]);
    }
  });
});