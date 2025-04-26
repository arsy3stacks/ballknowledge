import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as z from "zod";

// Helper function to check if email exists
async function emailExists(email: string) {
	const supabase = createClientComponentClient();
	const { data } = await supabase
		.from("players")
		.select("auth_id")
		.eq("email", email)
		.single();
	return !!data;
}

// Helper function to check if username exists
async function usernameExists(username: string) {
	const supabase = createClientComponentClient();
	const { data } = await supabase
		.from("players")
		.select("id")
		.eq("username", username)
		.single();
	return !!data;
}

export const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
	.object({
		email: z
			.string()
			.email("Please enter a valid email address")
			.refine(async (email) => !(await emailExists(email)), {
				message: "This email is already registered",
			}),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.refine(async (username) => !(await usernameExists(username)), {
				message: "This username is already taken",
			}),
		clubSupported: z.string().min(1, "Please select your supported club"),
		nationality: z.string().min(1, "Please select your nationality"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const resetPasswordSchema = z
	.object({
		email: z.string().email("Please enter a valid email address"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.optional(),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.password || data.confirmPassword) {
				return data.password === data.confirmPassword;
			}
			return true;
		},
		{
			message: "Passwords do not match",
			path: ["confirmPassword"],
		}
	);

export const profileSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.refine(
			async (username, ctx) => {
				// Skip validation if username hasn't changed
				if (ctx.path.length > 0 && username === ctx.path[0]) {
					return true;
				}
				return !(await usernameExists(username));
			},
			{
				message: "This username is already taken",
			}
		),
	club_supported: z.string().min(1, "Please select your supported club"),
	nationality: z.string().min(1, "Please select your nationality"),
});
