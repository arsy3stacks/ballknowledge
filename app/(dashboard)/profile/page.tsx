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
	FormDescription,
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
import { Player } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	username: z.string().min(3).max(20),
	club_supported: z.string().min(1),
	nationality: z.string().min(1),
});

export default function Profile() {
	const supabase = createClientComponentClient();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [player, setPlayer] = useState<Player | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			club_supported: "",
			nationality: "",
		},
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				const { data: playerData } = await supabase
					.from("players")
					.select("*")
					.eq("auth_id", user.id)
					.single();

				if (playerData) {
					setPlayer(playerData);
					form.reset({
						username: playerData.username,
						club_supported: playerData.club_supported,
						nationality: playerData.nationality,
					});
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [supabase, form]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!player) return;

		setSaving(true);
		try {
			const { error } = await supabase
				.from("players")
				.update({
					username: values.username,
					club_supported: values.club_supported,
					nationality: values.nationality,
				})
				.eq("id", player.id);

			if (error) throw error;

			toast.success("Profile updated successfully");
		} catch (error: any) {
			toast.error("Failed to update profile: " + error.message);
		} finally {
			setSaving(false);
		}
	};

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
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>
											This is your public display name
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

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

							<Button type="submit" disabled={saving}>
								<Save className="mr-2 h-4 w-4" />
								{saving ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
