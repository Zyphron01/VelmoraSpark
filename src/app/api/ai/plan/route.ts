import { NextRequest, NextResponse } from 'next/server';
import { generatePlanSuggestions, PlanRequestSchema } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, language, preset } = parsed.data;
    const suggestions = await generatePlanSuggestions(prompt, language, preset);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
