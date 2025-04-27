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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, Eye, EyeOff, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type FormData = z.infer<typeof loginSchema>;

export default function Login() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const supabase = createClientComponentClient();

	const form = useForm<FormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				// Redirect to /dashboard if the user is logged in
				router.push("/dashboard");
			}
		};

		checkSession();
	}, [supabase, router]);

	const onSubmit = async (values: FormData) => {
		setLoading(true);

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password,
			});

			if (signInError) throw signInError;

			router.push("/dashboard");
		} catch (error: any) {
			form.setError("root", {
				message: error.message || "Failed to sign in",
			});
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
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="your.email@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••••••"
													{...field}
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
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="text-sm text-right">
								<Link
									href="/reset-password"
									className="text-primary hover:underline"
								>
									Forgot your password?
								</Link>
							</div>

							{form.formState.errors.root && (
								<div className="text-sm text-destructive">
									{form.formState.errors.root.message}
								</div>
							)}
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
				</Form>
			</Card>
		</div>
	);
}
