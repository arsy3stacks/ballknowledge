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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
	Ban,
	CheckCircle,
	Edit,
	Search,
	Shield,
	ShieldOff,
	UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AdminUsers() {
	const supabase = createClientComponentClient();
	const { toast } = useToast();

	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState<any | null>(null);
	const [editForm, setEditForm] = useState({
		username: "",
		club_supported: "",
		nationality: "",
		is_admin: false,
	});

	// Fetch users from the database
	const fetchUsers = async () => {
		try {
			const { data: usersData, error: usersError } = await supabase.from(
				"players"
			).select(`
              id,
              username,
              club_supported,
              nationality,
              joined_at,
              is_admin,
              is_suspended
          `);

			if (usersError) throw usersError;

			setUsers(usersData);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to fetch users: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	// Handle user suspension
	const handleToggleSuspension = async (user: any) => {
		try {
			const { error } = await supabase
				.from("players")
				.update({ is_suspended: !user.is_suspended })
				.eq("id", user.id);

			if (error) throw error;

			setUsers(
				users.map((u) =>
					u.id === user.id ? { ...u, is_suspended: !user.is_suspended } : u
				)
			);

			toast({
				title: "Success",
				description: `User ${
					user.is_suspended ? "unsuspended" : "suspended"
				} successfully`,
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to update user status: ${error.message}`,
			});
		}
	};

	// Handle admin role toggle
	const handleToggleAdmin = async (user: any) => {
		try {
			const { error } = await supabase
				.from("players")
				.update({ is_admin: !user.is_admin })
				.eq("id", user.id);

			if (error) throw error;

			setUsers(
				users.map((u) =>
					u.id === user.id ? { ...u, is_admin: !user.is_admin } : u
				)
			);

			toast({
				title: "Success",
				description: `Admin status ${
					user.is_admin ? "removed" : "granted"
				} successfully`,
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to update admin status: ${error.message}`,
			});
		}
	};

	// Handle user edit
	const handleEditUser = async () => {
		if (!editingUser) return;

		try {
			const { error } = await supabase
				.from("players")
				.update({
					username: editForm.username,
					club_supported: editForm.club_supported,
					nationality: editForm.nationality,
					is_admin: editForm.is_admin,
				})
				.eq("id", editingUser.id);

			if (error) throw error;

			setUsers(
				users.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u))
			);

			setEditingUser(null);
			toast({
				title: "Success",
				description: "User updated successfully",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to update user: ${error.message}`,
			});
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// Filter users based on search query
	const filteredUsers = users.filter((user) =>
		user.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Manage Users</CardTitle>
					<CardDescription>View and manage user accounts</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Username</TableHead>
									<TableHead>Club</TableHead>
									<TableHead>Nationality</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											{user.username}
										</TableCell>
										<TableCell>{user.club_supported}</TableCell>
										<TableCell>{user.nationality}</TableCell>
										<TableCell>
											{new Date(user.joined_at).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{user.is_suspended ? (
												<span className="flex items-center text-destructive">
													<Ban className="h-4 w-4 mr-1" />
													Suspended
												</span>
											) : (
												<span className="flex items-center text-emerald-600">
													<CheckCircle className="h-4 w-4 mr-1" />
													Active
												</span>
											)}
										</TableCell>
										<TableCell>
											{user.is_admin ? (
												<span className="flex items-center text-primary">
													<Shield className="h-4 w-4 mr-1" />
													Admin
												</span>
											) : (
												<span className="text-muted-foreground">User</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															size="icon"
															onClick={() => {
																setEditingUser(user);
																setEditForm({
																	username: user.username,
																	club_supported: user.club_supported,
																	nationality: user.nationality,
																	is_admin: user.is_admin,
																});
															}}
														>
															<Edit className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Edit User</DialogTitle>
															<DialogDescription>
																Update user profile information
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4 py-4">
															<div className="space-y-2">
																<Label>Username</Label>
																<Input
																	value={editForm.username}
																	onChange={(e) =>
																		setEditForm({
																			...editForm,
																			username: e.target.value,
																		})
																	}
																/>
															</div>
															<div className="space-y-2">
																<Label>Club Supported</Label>
																<Select
																	value={editForm.club_supported}
																	onValueChange={(value) =>
																		setEditForm({
																			...editForm,
																			club_supported: value,
																		})
																	}
																>
																	<SelectTrigger>
																		<SelectValue placeholder="Select club" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="Arsenal">
																			Arsenal
																		</SelectItem>
																		<SelectItem value="Chelsea">
																			Chelsea
																		</SelectItem>
																		<SelectItem value="Liverpool">
																			Liverpool
																		</SelectItem>
																		<SelectItem value="Manchester City">
																			Manchester City
																		</SelectItem>
																		<SelectItem value="Manchester United">
																			Manchester United
																		</SelectItem>
																		<SelectItem value="Tottenham">
																			Tottenham
																		</SelectItem>
																		<SelectItem value="Other">Other</SelectItem>
																	</SelectContent>
																</Select>
															</div>
															<div className="space-y-2">
																<Label>Nationality</Label>
																<Select
																	value={editForm.nationality}
																	onValueChange={(value) =>
																		setEditForm({
																			...editForm,
																			nationality: value,
																		})
																	}
																>
																	<SelectTrigger>
																		<SelectValue placeholder="Select nationality" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="England">
																			England
																		</SelectItem>
																		<SelectItem value="Scotland">
																			Scotland
																		</SelectItem>
																		<SelectItem value="Wales">Wales</SelectItem>
																		<SelectItem value="Ireland">
																			Ireland
																		</SelectItem>
																		<SelectItem value="France">
																			France
																		</SelectItem>
																		<SelectItem value="Germany">
																			Germany
																		</SelectItem>
																		<SelectItem value="Spain">Spain</SelectItem>
																		<SelectItem value="Portugal">
																			Portugal
																		</SelectItem>
																		<SelectItem value="Other">Other</SelectItem>
																	</SelectContent>
																</Select>
															</div>
														</div>
														<DialogFooter>
															<Button onClick={handleEditUser}>
																Save Changes
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												<Button
													variant="outline"
													size="icon"
													onClick={() => handleToggleAdmin(user)}
												>
													{user.is_admin ? (
														<ShieldOff className="h-4 w-4" />
													) : (
														<Shield className="h-4 w-4" />
													)}
												</Button>

												<Button
													variant={
														user.is_suspended ? "outline" : "destructive"
													}
													size="icon"
													onClick={() => handleToggleSuspension(user)}
												>
													<Ban className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
