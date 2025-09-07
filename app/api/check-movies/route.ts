import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
	try {
		const client = supabaseAdmin ?? supabase;
		const { data, error, status, count } = await client
			.from("movies")
			.select("*", { count: "exact" })
			.limit(1);

		if (error) {
			const anyErr = error as {
				code?: string;
				message?: string;
				details?: string;
				hint?: string;
				status?: number;
			} | null;

			return NextResponse.json(
				{
					ok: false,
					status: status ?? anyErr?.status ?? null,
					code: anyErr?.code ?? null,
					message: anyErr?.message ?? null,
					details: anyErr?.details ?? null,
					hint: anyErr?.hint ?? null,
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ ok: true, rows: count ?? data?.length ?? 0 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, message: (e as Error).message },
			{ status: 500 }
		);
	}
}
