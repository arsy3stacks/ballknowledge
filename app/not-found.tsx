import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-[80vh] px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="flex justify-center">
					<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
						<FileQuestion className="h-10 w-10 text-muted-foreground" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-4xl font-bold">Page not found</h1>
					<p className="text-muted-foreground">
						We couldn&apos;t find the page you were looking for. It might have
						been moved or deleted.
					</p>
				</div>

				<div className="flex justify-center gap-4">
					<Button asChild>
						<Link href="/">Go Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
