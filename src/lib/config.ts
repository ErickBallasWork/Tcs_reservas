// Next.js only inlines NEXT_PUBLIC_* when accessed literally like this
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_URL. Define it in .env.local (see .env.example).",
  );
}

export const API_URL = rawApiUrl.replace(/\/+$/, "");