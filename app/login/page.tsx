"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, Eye, EyeOff, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const supabase = createClientComponentClient();

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (signInError) throw signInError;

			// Redirect to dashboard on successful login
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message || "Failed to sign in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center gap-2 mb-2">
						<Link href="/">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<div className="flex items-center gap-2">
							<Trophy className="h-5 w-5 text-chart-1" />
							<span className="font-bold">Ball Knowledge</span>
						</div>
					</div>
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>
						Sign in to your account to access your predictions and leaderboard
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSignIn}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="your.email@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute inset-y-0 right-2 flex items-center px-2 text-muted-foreground"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<div className="text-sm text-right">
							<Link
								href="/reset-password"
								className="text-primary hover:underline"
							>
								Forgot your password?
							</Link>
						</div>
						{error && <div className="text-sm text-destructive">{error}</div>}
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? "Signing in..." : "Sign in"}
						</Button>
						<div className="text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link
								href="/register"
								className="text-primary underline-offset-4 hover:underline"
							>
								Create account
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
