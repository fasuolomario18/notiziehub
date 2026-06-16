import { NextResponse } from "next/server";
import { vote, getResults } from "@/lib/polls";

export async function POST(req: Request) {
  let body: { slug?: string; optionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { slug, optionId } = body;
  if (!slug || !optionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const results = vote(slug, optionId);
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true, results: getResults(slug) });
}
