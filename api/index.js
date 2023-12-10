export const config = {
	runtime: "edge",
};

export default async function handler(request) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	const resp = await fetch(
		`https://g-calendar.koan.osaka-u.ac.jp/calendar/${id}`,
	);
	if (resp.status === 404) {
		return new Response(null, { status: 404 });
	}
	if (!resp.ok || resp.headers.get("Content-Type") !== "text/calendar") {
		return new Response(null, { status: 500 });
	}

	const ical = await resp.text();

	const rewrittenIcal = ical.replaceAll(
		/^(DT(?:START|END);TZID=Asia\/Tokyo:\d{8}T)(\d{4})00$/gmu,
		(match, p1, p2) => {
			const replacement = timeReplacement[p2];
			if (replacement === undefined) {
				return match;
			}
			return `${p1}${replacement}00`;
		},
	);

	return new Response(rewrittenIcal, {
		headers: { "Content-Type": "text/calendar" },
	});
}

const timeReplacement = {
	1300: "1330",
	1430: "1500",
	1440: "1510",
	1610: "1640",
	1620: "1650",
	1750: "1820",
	1800: "1830",
	1930: "2000",
};
