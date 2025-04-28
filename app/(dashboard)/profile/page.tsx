"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function Profile() {
	const supabase = createClientComponentClient();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [resetLoading, setResetLoading] = useState(false); // For password reset
	const [userEmail, setUserEmail] = useState<string | null>(null); // Store user's email
	const [initialValues, setInitialValues] = useState<z.infer<
		typeof profileSchema
	> | null>(null);

	// Use profileSchema for validation
	const form = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			username: "",
			club_supported: "",
			nationality: "",
		},
	});

	const { watch } = form;

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				setUserEmail(user.email ?? null);

				const { data: playerData } = await supabase
					.from("players")
					.select("*")
					.eq("auth_id", user.id)
					.single();

				if (playerData) {
					const initialData = {
						username: playerData.username,
						club_supported: playerData.club_supported,
						nationality: playerData.nationality,
					};
					form.reset(initialData);
					setInitialValues(initialData);
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [supabase, form]);

	const onSubmit = async (values: z.infer<typeof profileSchema>) => {
		setSaving(true);
		try {
			// Check if the username is already taken
			const usernameExists = await supabase
				.from("players")
				.select("id")
				.eq("username", values.username)
				.single();

			if (usernameExists.data) {
				form.setError("username", {
					type: "manual",
					message: "This username is already taken",
				});
				setSaving(false);
				return;
			}

			// Update profile details
			const { error: profileError } = await supabase
				.from("players")
				.update({
					username: values.username,
					club_supported: values.club_supported,
					nationality: values.nationality,
				})
				.eq("auth_id", (await supabase.auth.getUser()).data.user?.id);

			if (profileError) throw profileError;

			toast({
				title: "Success",
				description: "Profile updated successfully",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message || "Failed to update profile",
			});
		} finally {
			setSaving(false);
		}
	};

	// Handle password reset
	const handlePasswordReset = async () => {
		setResetLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				toast({
					variant: "destructive",
					title: "Error",
					description: "No email associated with this account.",
				});
				return;
			}

			const { error: resetError } = await supabase.auth.resetPasswordForEmail(
				user.email,
				{
					redirectTo: `${window.location.origin}/reset-password`,
				}
			);

			if (resetError) throw resetError;

			toast({
				title: "Success",
				description: "Password reset link sent to your email.",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message || "Failed to send password reset link.",
			});
		} finally {
			setResetLoading(false);
		}
	};

	// Watch the current form values
	const currentValues = watch();

	// Check if the form values have changed
	const isFormChanged =
		initialValues &&
		JSON.stringify(initialValues) !== JSON.stringify(currentValues);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				Loading profile...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Profile</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Your Information</CardTitle>
					<CardDescription>
						Update your profile details and preferences
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Email (Disabled) */}
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input value={userEmail || ""} disabled />
								</FormControl>
								<FormMessage />
							</FormItem>

							{/* Username */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Supported Club */}
							<FormField
								control={form.control}
								name="club_supported"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Supported Club</FormLabel>
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
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Nationality */}
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

							{/* Submit Button */}
							<Button type="submit" disabled={saving || !isFormChanged}>
								<Save className="mr-2 h-4 w-4" />
								{saving ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Password Reset Section */}
			<Card>
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>
						Send a password reset link to your email.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="w-full"
						onClick={handlePasswordReset}
						disabled={resetLoading}
					>
						{resetLoading ? "Sending..." : "Send Reset Link"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
