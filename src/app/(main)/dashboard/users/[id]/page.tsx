/* eslint-disable complexity */
/* eslint-disable max-lines */
"use client";

import * as React from "react";

import { useParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, Edit, Eye, EyeOff, MapPin, Plus, Trash2, Upload, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActiveDietaryNeeds } from "@/hooks/use-dietary-needs";
import { useCreateRsvp, useDeleteRsvp, useRsvpsByUser, useUpdateRsvp } from "@/hooks/use-rsvps";
import {
  useRemoveUserSavedVenue,
  useResetUserPassword,
  useUpdateUser,
  useUser,
  useUserSavedVenues,
} from "@/hooks/use-users";
import { uploadFile } from "@/lib/upload-utils";
import { Rsvp, RsvpCreateInput, RsvpUpdateInput } from "@/types/rsvp";

import {
  AdminResetPasswordFormValues,
  adminResetPasswordSchema,
  AdminUpdateUserFormValues,
  adminUpdateUserSchema,
} from "../_components/schema";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/users")} className="cursor-pointer">
          <ArrowLeft className="mr-2 size-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/users")} className="cursor-pointer">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">
            Member since {format(new Date(user.createdAt), "MMMM dd, yyyy")}
          </p>
        </div>
        <Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Reset Password</TabsTrigger>
          <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
          <TabsTrigger value="venues">Saved Venues</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab user={user} />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <ResetPasswordTab userId={userId} />
        </TabsContent>

        <TabsContent value="rsvps" className="mt-6">
          <RsvpsTab userId={userId} />
        </TabsContent>

        <TabsContent value="venues" className="mt-6">
          <SavedVenuesTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Profile Tab Component
// ============================================
interface ProfileTabProps {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    address?: string | null;
    avatar?: string | null;
    role: string;
    isActive: boolean;
    isEmailVerified?: boolean;
    lastLogin?: string | null;
  };
}

function ProfileTab({ user }: ProfileTabProps) {
  const updateUserMutation = useUpdateUser();
  const [isUploading, setIsUploading] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user.avatar ?? null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<AdminUpdateUserFormValues>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      name: user.name ?? "",
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
      isActive: user.isActive ?? true,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: user.name ?? "",
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
      isActive: user.isActive ?? true,
    });
    setAvatarPreview(user.avatar ?? null);
  }, [user, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file, "users/avatars");
      form.setValue("avatar", url);
      setAvatarPreview(url);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatar", "");
    setAvatarPreview(null);
  };

  const onSubmit = (data: AdminUpdateUserFormValues) => {
    updateUserMutation.mutate({ id: user.id, data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update the user&apos;s profile details. Email cannot be changed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-3">
              <Label>Avatar</Label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="User avatar" className="size-24 rounded-full border-2 object-cover" />
                  ) : (
                    <div className="bg-muted flex size-24 items-center justify-center rounded-full border-2">
                      <User className="text-muted-foreground size-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="cursor-pointer"
                    >
                      <Upload className="mr-2 size-4" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>
            </div>

            {/* Read-only email */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Email (Read-only)</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>

            {/* Editable fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-muted-foreground text-xs">User can access the platform when active</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} placeholder="Enter address" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional info */}
            <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Last Login</Label>
                <p className="text-sm font-medium">
                  {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy h:mm a") : "Never"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Email Verified</Label>
                <div>
                  <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                    {user.isEmailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateUserMutation.isPending || isUploading} className="cursor-pointer">
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================
// Reset Password Tab Component
// ============================================
interface ResetPasswordTabProps {
  userId: string;
}

function ResetPasswordTab({ userId }: ResetPasswordTabProps) {
  const resetPasswordMutation = useResetUserPassword();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<AdminResetPasswordFormValues>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: AdminResetPasswordFormValues) => {
    resetPasswordMutation.mutate(
      { id: userId, password: data.password },
      {
        onSuccess: () => {
          form.reset();
          setShowPassword(false);
          setShowConfirmPassword(false);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Set a new password for this user. They will need to use this password to log in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full cursor-pointer px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="text-muted-foreground size-4" />
                        ) : (
                          <Eye className="text-muted-foreground size-4" />
                        )}
                      </Button>
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
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full cursor-pointer px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="text-muted-foreground size-4" />
                        ) : (
                          <Eye className="text-muted-foreground size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={resetPasswordMutation.isPending} className="cursor-pointer">
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================
// RSVPs Tab Component
// ============================================
interface RsvpsTabProps {
  userId: string;
}

function RsvpsTab({ userId }: RsvpsTabProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingRsvp, setEditingRsvp] = React.useState<Rsvp | null>(null);
  const [deletingRsvp, setDeletingRsvp] = React.useState<Rsvp | null>(null);

  const { data: rsvps, isLoading } = useRsvpsByUser(userId);
  const createRsvpMutation = useCreateRsvp();
  const updateRsvpMutation = useUpdateRsvp();
  const deleteRsvpMutation = useDeleteRsvp();

  const handleCreateRsvp = (data: Omit<RsvpCreateInput, "userId">) => {
    createRsvpMutation.mutate(
      { ...data, userId },
      {
        onSuccess: () => {
          setIsAddOpen(false);
        },
      },
    );
  };

  const handleUpdateRsvp = (id: string, data: RsvpUpdateInput) => {
    updateRsvpMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditingRsvp(null);
        },
      },
    );
  };

  const handleDeleteRsvp = () => {
    if (!deletingRsvp) return;
    deleteRsvpMutation.mutate(deletingRsvp.id, {
      onSuccess: () => {
        setDeletingRsvp(null);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User RSVPs</CardTitle>
          <CardDescription>View and manage RSVPs created by this user.</CardDescription>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer">
          <Plus className="mr-2 size-4" />
          Add RSVP
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">Loading RSVPs...</div>
        ) : rsvps && rsvps.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {rsvps.map((rsvp) => (
              <div key={rsvp.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {rsvp.firstName} {rsvp.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm">{rsvp.email}</p>
                    {rsvp.hostEventRequest && (
                      <p className="text-muted-foreground text-xs">
                        Event: {rsvp.hostEventRequest.eventName ?? "Unnamed"}{" "}
                        {rsvp.hostEventRequest.date &&
                          `(${(() => {
                            try {
                              return format(new Date(rsvp.hostEventRequest.date), "MMM d, yyyy");
                            } catch {
                              return rsvp.hostEventRequest?.date;
                            }
                          })()})`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditingRsvp(rsvp)}>
                      <Edit className="mr-1 size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive cursor-pointer"
                      onClick={() => setDeletingRsvp(rsvp)}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                {(rsvp.dietaryNeeds.length > 0 || rsvp.customDietaryNeed) && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {rsvp.dietaryNeeds.map((need) => (
                      <Badge key={need.id} variant="secondary" className="text-xs">
                        {need.name}
                      </Badge>
                    ))}
                    {rsvp.customDietaryNeed && (
                      <Badge variant="outline" className="text-xs">
                        {rsvp.customDietaryNeed}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            This user has no RSVPs yet.
          </div>
        )}

        {/* Add RSVP Dialog */}
        <AddRsvpDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onCreate={handleCreateRsvp}
          isCreating={createRsvpMutation.isPending}
        />

        {/* Edit RSVP Dialog */}
        <EditRsvpDialog
          open={!!editingRsvp}
          onOpenChange={(open) => !open && setEditingRsvp(null)}
          rsvp={editingRsvp}
          onUpdate={handleUpdateRsvp}
          isUpdating={updateRsvpMutation.isPending}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingRsvp} onOpenChange={(open) => !open && setDeletingRsvp(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete RSVP</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this RSVP for {deletingRsvp?.firstName} {deletingRsvp?.lastName}? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRsvp}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                disabled={deleteRsvpMutation.isPending}
              >
                {deleteRsvpMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// ============================================
// Add RSVP Dialog Component
// ============================================
interface AddRsvpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: Omit<RsvpCreateInput, "userId">) => void;
  isCreating: boolean;
}

function AddRsvpDialog({ open, onOpenChange, onCreate, isCreating }: AddRsvpDialogProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [selectedDietaryNeeds, setSelectedDietaryNeeds] = React.useState<string[]>([]);
  const [customDietaryNeed, setCustomDietaryNeed] = React.useState("");

  const { data: dietaryNeedsData } = useActiveDietaryNeeds();
  const dietaryNeeds = dietaryNeedsData ?? [];

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setSelectedDietaryNeeds([]);
      setCustomDietaryNeed("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      firstName,
      lastName,
      email,
      dietaryNeeds: selectedDietaryNeeds.length > 0 ? selectedDietaryNeeds : undefined,
      customDietaryNeed: customDietaryNeed || undefined,
    });
  };

  const toggleDietaryNeed = (id: string) => {
    setSelectedDietaryNeeds((prev) => (prev.includes(id) ? prev.filter((dnId) => dnId !== id) : [...prev, id]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add RSVP</DialogTitle>
          <DialogDescription>Create a new RSVP for this user.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-firstName">First Name</Label>
              <Input
                id="add-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-lastName">Last Name</Label>
              <Input
                id="add-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Dietary Needs</Label>
            <div className="grid grid-cols-2 gap-2">
              {dietaryNeeds.map((need) => (
                <div key={need.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`add-dn-${need.id}`}
                    checked={selectedDietaryNeeds.includes(need.id)}
                    onCheckedChange={() => toggleDietaryNeed(need.id)}
                    className="cursor-pointer"
                  />
                  <label htmlFor={`add-dn-${need.id}`} className="cursor-pointer text-sm">
                    {need.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-customDietaryNeed">Custom Dietary Need</Label>
            <Textarea
              id="add-customDietaryNeed"
              value={customDietaryNeed}
              onChange={(e) => setCustomDietaryNeed(e.target.value)}
              placeholder="Enter any other dietary requirements..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="cursor-pointer">
              {isCreating ? "Creating..." : "Create RSVP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit RSVP Dialog Component
// ============================================
interface EditRsvpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rsvp: Rsvp | null;
  onUpdate: (id: string, data: RsvpUpdateInput) => void;
  isUpdating: boolean;
}

function EditRsvpDialog({ open, onOpenChange, rsvp, onUpdate, isUpdating }: EditRsvpDialogProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [selectedDietaryNeeds, setSelectedDietaryNeeds] = React.useState<string[]>([]);
  const [customDietaryNeed, setCustomDietaryNeed] = React.useState("");

  const { data: dietaryNeedsData } = useActiveDietaryNeeds();
  const dietaryNeeds = dietaryNeedsData ?? [];

  React.useEffect(() => {
    if (rsvp) {
      setFirstName(rsvp.firstName);
      setLastName(rsvp.lastName);
      setEmail(rsvp.email);
      setSelectedDietaryNeeds(rsvp.dietaryNeeds.map((dn) => dn.id));
      setCustomDietaryNeed(rsvp.customDietaryNeed ?? "");
    }
  }, [rsvp]);

  if (!rsvp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(rsvp.id, {
      firstName,
      lastName,
      email,
      dietaryNeeds: selectedDietaryNeeds,
      customDietaryNeed: customDietaryNeed || undefined,
    });
  };

  const toggleDietaryNeed = (id: string) => {
    setSelectedDietaryNeeds((prev) => (prev.includes(id) ? prev.filter((dnId) => dnId !== id) : [...prev, id]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit RSVP</DialogTitle>
          <DialogDescription>Update the RSVP details for this guest.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input id="edit-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input id="edit-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Dietary Needs</Label>
            <div className="grid grid-cols-2 gap-2">
              {dietaryNeeds.map((need) => (
                <div key={need.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-dn-${need.id}`}
                    checked={selectedDietaryNeeds.includes(need.id)}
                    onCheckedChange={() => toggleDietaryNeed(need.id)}
                    className="cursor-pointer"
                  />
                  <label htmlFor={`edit-dn-${need.id}`} className="cursor-pointer text-sm">
                    {need.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customDietaryNeed">Custom Dietary Need</Label>
            <Textarea
              id="edit-customDietaryNeed"
              value={customDietaryNeed}
              onChange={(e) => setCustomDietaryNeed(e.target.value)}
              placeholder="Enter any other dietary requirements..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="cursor-pointer">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Saved Venues Tab Component
// ============================================
interface SavedVenuesTabProps {
  userId: string;
}

function SavedVenuesTab({ userId }: SavedVenuesTabProps) {
  const [deletingVenueId, setDeletingVenueId] = React.useState<string | null>(null);

  const { data: venues, isLoading } = useUserSavedVenues(userId);
  const removeVenueMutation = useRemoveUserSavedVenue();

  const handleRemoveVenue = () => {
    if (!deletingVenueId) return;
    removeVenueMutation.mutate(
      { userId, venueId: deletingVenueId },
      {
        onSuccess: () => {
          setDeletingVenueId(null);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Venues</CardTitle>
        <CardDescription>Venues this user has added to their favorites.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">Loading saved venues...</div>
        ) : venues && venues.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <div key={venue.id} className="flex flex-col rounded-lg border">
                {venue.thumbnail ? (
                  <img src={venue.thumbnail} alt={venue.name} className="h-32 w-full rounded-t-lg object-cover" />
                ) : (
                  <div className="bg-muted flex h-32 items-center justify-center rounded-t-lg">
                    <MapPin className="text-muted-foreground size-8" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  <h5 className="font-medium">{venue.name}</h5>
                  <p className="text-muted-foreground text-sm">{venue.address}</p>
                  {(venue.city ?? venue.route) && (
                    <p className="text-muted-foreground text-xs">
                      {[venue.route, venue.city].filter(Boolean).join(", ")}
                    </p>
                  )}

                  <div className="mt-2 flex gap-1">
                    {venue.isSponsored && (
                      <Badge variant="default" className="text-xs">
                        Sponsored
                      </Badge>
                    )}
                    {venue.isTrending && (
                      <Badge variant="secondary" className="text-xs">
                        Trending
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex gap-2 pt-4">
                    {venue.venueLink && (
                      <Button variant="outline" size="sm" className="flex-1 cursor-pointer" asChild>
                        <a href={venue.venueLink} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-1 size-4" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive flex-1 cursor-pointer"
                      onClick={() => setDeletingVenueId(venue.id)}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            This user has not saved any venues yet.
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingVenueId} onOpenChange={(open) => !open && setDeletingVenueId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Saved Venue</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this venue from the user&apos;s favorites? The user can save it again
                later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveVenue}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                disabled={removeVenueMutation.isPending}
              >
                {removeVenueMutation.isPending ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
