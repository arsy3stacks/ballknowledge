import { MarketingHeader } from "./_components/marketing-header";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<MarketingHeader />
			{children}
		</div>
	);
}
