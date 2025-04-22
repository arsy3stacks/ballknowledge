import { MarketingNavbar } from "./_components/marketing-navbar";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<MarketingNavbar />
			{children}
		</div>
	);
}
