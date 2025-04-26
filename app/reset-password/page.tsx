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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
export default function ResetPassword() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const supabase = createClientComponentClient();

	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			if (code && password !== confirmPassword) {
				throw new Error("Passwords do not match. Please try again.");
			}
			if (code) {
				// Update the user's password
				const { error: updateError } = await supabase.auth.updateUser({
					password: password,
				});

				if (updateError) throw updateError;

				// Show success message and stop redirecting
				setSuccess(true);
				setMessage("Password updated successfully. You can now log in.");
			} else {
				// Send password reset email
				const { error: resetError } = await supabase.auth.resetPasswordForEmail(
					email,
					{
						redirectTo: `${window.location.origin}/reset-password`,
					}
				);

				if (resetError) throw resetError;

				setMessage(
					"If an account exists with this email, you will receive a password reset link."
				);
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center gap-2 mb-2">
						<Link href="/login">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<div className="flex items-center gap-2">
							<Trophy className="h-5 w-5 text-chart-1" />
							<span className="font-bold">Ball Knowledge</span>
						</div>
					</div>
					<CardTitle className="text-2xl">
						{code ? "Reset Your Password" : "Forgot Password"}
					</CardTitle>
					<CardDescription>
						{code
							? "Enter your new password below"
							: "Enter your email to receive a password reset link"}
					</CardDescription>
				</CardHeader>
				{success ? (
					<CardContent className="space-y-4">
						<div className="text-center text-emerald-600 dark:text-emerald-400">
							<h2 className="text-lg font-bold">Password Reset Successful!</h2>
							<p>You can now log in with your new password.</p>
						</div>
						<CardFooter className="flex flex-col space-y-4">
							<Link href="/login">
								<Button className="w-full">Go to Login</Button>
							</Link>
						</CardFooter>
					</CardContent>
				) : (
					<form onSubmit={handlePasswordReset}>
						<CardContent className="space-y-4">
							{code ? (
								<>
									<div className="space-y-2">
										<Label htmlFor="password">New Password</Label>
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
									<div className="space-y-2">
										<Label htmlFor="confirm-password">Confirm Password</Label>
										<div className="relative">
											<Input
												id="confirm-password"
												type={showConfirmPassword ? "text" : "password"}
												placeholder="••••••••••••"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												required
												minLength={6}
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword((prev) => !prev)}
												className="absolute inset-y-0 right-2 flex items-center px-2 text-muted-foreground"
												tabIndex={-1}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</div>
								</>
							) : (
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
							)}
							{error && <div className="text-sm text-destructive">{error}</div>}
							{message && (
								<div className="text-sm text-emerald-600 dark:text-emerald-400">
									{message}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex flex-col space-y-4">
							<Button className="w-full" type="submit" disabled={loading}>
								{loading
									? "Processing..."
									: code
									? "Update Password"
									: "Send Reset Link"}
							</Button>
						</CardFooter>
					</form>
				)}
			</Card>
		</div>
	);
}
