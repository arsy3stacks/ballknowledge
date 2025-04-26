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
import { resetPasswordSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, Eye, EyeOff, Trophy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");

	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [success, setSuccess] = useState(false);
	const supabase = createClientComponentClient();

	const form = useForm<FormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			email: "",
			password: code ? "" : undefined,
			confirmPassword: code ? "" : undefined,
		},
	});

	const onSubmit = async (values: FormData) => {
		setLoading(true);

		try {
			if (code) {
				const { error: updateError } = await supabase.auth.updateUser({
					password: values.password,
				});

				if (updateError) throw updateError;

				setSuccess(true);
			} else {
				const { error: resetError } = await supabase.auth.resetPasswordForEmail(
					values.email,
					{
						redirectTo: `${window.location.origin}/reset-password`,
					}
				);

				if (resetError) throw resetError;

				form.reset();
				form.setError("root", {
					type: "success",
					message:
						"If an account exists with this email, you will receive a password reset link.",
				});
			}
		} catch (error: any) {
			form.setError("root", {
				message: error.message || "Something went wrong",
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
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<CardContent className="space-y-4">
								{code ? (
									<>
										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>New Password</FormLabel>
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
									</>
								) : (
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														placeholder="your.email@example.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{form.formState.errors.root && (
									<div
										className={`text-sm ${
											form.formState.errors.root.type === "success"
												? "text-emerald-600 dark:text-emerald-400"
												: "text-destructive"
										}`}
									>
										{form.formState.errors.root.message}
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
					</Form>
				)}
			</Card>
		</div>
	);
}
