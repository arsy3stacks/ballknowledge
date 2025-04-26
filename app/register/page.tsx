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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, Eye, EyeOff, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
	const supabase = createClientComponentClient();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [username, setUsername] = useState("");
	const [clubSupported, setClubSupported] = useState("");
	const [nationality, setNationality] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [success, setSuccess] = useState(false); // New state to track success

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/login`, // Redirect to /login after email verification
				},
			});

			if (signUpError) throw signUpError;

			if (data?.user) {
				const { error: profileError } = await supabase.from("players").insert([
					{
						auth_id: data.user.id,
						username,
						club_supported: clubSupported,
						nationality,
					},
				]);

				if (profileError) {
					// Check if the error is related to the unique constraint on the username
					if (
						profileError.message.includes(
							'duplicate key value violates unique constraint "players_username_key"'
						)
					) {
						throw new Error(
							"This username is already taken. Please choose another one."
						);
					}

					// Check if the error is related to the foreign key constraint on auth_id
					if (
						profileError.message.includes(
							'violates foreign key constraint "players_auth_id_fkey"'
						)
					) {
						throw new Error(
							"An account with this email already exists. Please log in or use a different email."
						);
					}

					// Throw other errors as they are
					throw profileError;
				}

				// Show success message
				setSuccess(true);
			}
		} catch (err: any) {
			setError(err.message || "An error occurred during registration");
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
					<CardTitle className="text-2xl">Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account and start making
						predictions
					</CardDescription>
				</CardHeader>
				{success ? (
					// Success message after registration
					<CardContent className="space-y-4">
						<div className="text-center text-emerald-600 dark:text-emerald-400">
							<h2 className="text-lg font-bold">Registration Successful!</h2>
							<p>
								We’ve sent you a verification email. Please check your inbox and
								verify your email to complete the registration process.
							</p>
						</div>
						<CardFooter className="flex flex-col space-y-4">
							<Link href="/login">
								<Button className="w-full">Go to Login</Button>
							</Link>
						</CardFooter>
					</CardContent>
				) : (
					// Registration form
					<form onSubmit={handleSignUp}>
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

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="••••••••••••"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
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

							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									placeholder="Choose a unique username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="club">Club Supported</Label>
								<Select
									value={clubSupported}
									onValueChange={setClubSupported}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select your club" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Premier League</SelectLabel>
											<SelectItem value="Arsenal">Arsenal</SelectItem>
											<SelectItem value="Aston Villa">Aston Villa</SelectItem>
											<SelectItem value="Chelsea">Chelsea</SelectItem>
											<SelectItem value="Liverpool">Liverpool</SelectItem>
											<SelectItem value="Manchester City">
												Manchester City
											</SelectItem>
											<SelectItem value="Manchester United">
												Manchester United
											</SelectItem>
											<SelectItem value="Tottenham">Tottenham</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="nationality">Nationality</Label>
								<Select
									value={nationality}
									onValueChange={setNationality}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select your nationality" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="England">England</SelectItem>
										<SelectItem value="Scotland">Scotland</SelectItem>
										<SelectItem value="Wales">Wales</SelectItem>
										<SelectItem value="Ireland">Ireland</SelectItem>
										<SelectItem value="France">France</SelectItem>
										<SelectItem value="Germany">Germany</SelectItem>
										<SelectItem value="Spain">Spain</SelectItem>
										<SelectItem value="Portugal">Portugal</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{error && <div className="text-sm text-destructive">{error}</div>}
						</CardContent>

						<CardFooter className="flex flex-col space-y-4">
							<Button className="w-full" type="submit" disabled={loading}>
								{loading ? "Creating account..." : "Create account"}
							</Button>
							<div className="text-center text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link
									href="/login"
									className="text-primary underline-offset-4 hover:underline"
								>
									Sign in
								</Link>
							</div>
						</CardFooter>
					</form>
				)}
			</Card>
		</div>
	);
}
