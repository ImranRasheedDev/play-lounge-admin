"use client";

import * as React from "react";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { z } from "zod";
import "react-phone-number-input/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// eslint-disable-next-line complexity -- Complex form with multiple UI states
export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
    },
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
      });
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    }
  }, [profile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate({
      name: data.name,
      phoneNumber: data.phoneNumber ?? "",
      address: data.address ?? "",
      avatar: avatarFile ?? profile?.avatar,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Watch the name field to get current form value
  const currentName = form.watch("name");

  // Split name into first and last for display
  const nameParts = (currentName || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and avatar</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-full">
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <UserAvatar name={profile?.name ?? "User"} size="xl" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium">{profile?.name}</p>
                <p className="text-muted-foreground text-sm">{profile?.email}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {profile?.role === "SUPER_ADMIN" ? "Super Admin" : "User"}
                </p>
              </div>
            </div>

            {/* Name Fields (displayed as first name / last name but stored as single name) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FormLabel>First Name</FormLabel>
                <Input
                  value={firstName}
                  onChange={(e) => {
                    const newFirstName = e.target.value;
                    form.setValue("name", `${newFirstName} ${lastName}`.trim());
                  }}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={lastName}
                  onChange={(e) => {
                    const newLastName = e.target.value;
                    form.setValue("name", `${firstName} ${newLastName}`.trim());
                  }}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Hidden name field for form validation */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (read-only) */}
            <div className="space-y-2">
              <FormLabel>Email</FormLabel>
              <Input value={profile?.email ?? ""} disabled className="bg-muted" />
              <p className="text-muted-foreground text-xs">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="[&_.PhoneInputInput]:border-input [&_.PhoneInputInput]:placeholder:text-muted-foreground [&_.PhoneInputInput]:focus-visible:ring-ring [&_.PhoneInputInput]:flex [&_.PhoneInputInput]:h-9 [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:rounded-md [&_.PhoneInputInput]:border [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-1 [&_.PhoneInputInput]:text-base [&_.PhoneInputInput]:shadow-sm [&_.PhoneInputInput]:transition-colors [&_.PhoneInputInput]:focus-visible:ring-1 [&_.PhoneInputInput]:focus-visible:outline-none [&_.PhoneInputInput]:disabled:cursor-not-allowed [&_.PhoneInputInput]:disabled:opacity-50 [&_.PhoneInputInput]:md:text-sm">
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateMutation.isPending} className="cursor-pointer">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
