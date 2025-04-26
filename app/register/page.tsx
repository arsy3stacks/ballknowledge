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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { registerSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, Eye, EyeOff, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type FormData = z.infer<typeof registerSchema>;

export default function Register() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [success, setSuccess] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			username: "",
			clubSupported: "",
			nationality: "",
		},
	});

	const onSubmit = async (values: FormData) => {
		setLoading(true);

		try {
			const { data, error: signUpError } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
				options: {
					emailRedirectTo: `${window.location.origin}/login`,
				},
			});

			if (signUpError) throw signUpError;

			if (data?.user) {
				const { error: profileError } = await supabase.from("players").insert([
					{
						auth_id: data.user.id,
						username: values.username,
						club_supported: values.clubSupported,
						nationality: values.nationality,
					},
				]);

				if (profileError) throw profileError;

				setSuccess(true);
			}
		} catch (error: any) {
			form.setError("root", {
				message: error.message || "An error occurred during registration",
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
					<CardTitle className="text-2xl">Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account and start making
						predictions
					</CardDescription>
				</CardHeader>
				{success ? (
					<CardContent className="space-y-4">
						<div className="text-center text-emerald-600 dark:text-emerald-400">
							<h2 className="text-lg font-bold">Registration Successful!</h2>
							<p>
								We've sent you a verification email. Please check your inbox and
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

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="••••••••••••"
														{...field}
													/>
													<button
														type="button"
														onClick={() =>
															setShowConfirmPassword((prev) => !prev)
														}
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
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Username</FormLabel>
											<FormControl>
												<Input
													placeholder="Choose a unique username"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="clubSupported"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Club Supported</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your club" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Premier League</SelectLabel>
														<SelectItem value="Arsenal">Arsenal</SelectItem>
														<SelectItem value="Aston Villa">
															Aston Villa
														</SelectItem>
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
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="nationality"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nationality</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your nationality" />
													</SelectTrigger>
												</FormControl>
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
											<FormMessage />
										</FormItem>
									)}
								/>

								{form.formState.errors.root && (
									<div className="text-sm text-destructive">
										{form.formState.errors.root.message}
									</div>
								)}
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
					</Form>
				)}
			</Card>
		</div>
	);
}
