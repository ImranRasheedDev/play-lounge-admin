/* eslint-disable max-lines -- Full management page with many editable fields */
/* eslint-disable complexity -- Multi-field admin form has unavoidable branching */
"use client";

import * as React from "react";

import { useParams, useRouter } from "next/navigation";

import { format } from "date-fns";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useHostEventRequest, useUpdateHostEventRequest } from "@/hooks/use-host-event-requests";
import { useVenues } from "@/hooks/use-venues";
import { uploadFile } from "@/lib/upload-utils";
import { EventRequestDocument, HostEventRequestStatus } from "@/types/host-event-request";

const NO_VENUE_VALUE = "__none__";

const STATUS_OPTIONS: { label: string; value: HostEventRequestStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const defaultFormData = {
  eventName: "",
  numberOfGuests: 1,
  date: "",
  startTime: "",
  endTime: "",
  guestArrivalTime: "",
  eventType: "",
  eventStyle: "",
  maxBudget: "",
  eventDescription: "",
  eventInstructions: "",
  message: "",
  banner: "",
  foodMenuUrls: [] as string[],
  drinkMenuUrls: [] as string[],
  additionalDocumentUrls: [] as string[],
  venueId: "",
  status: "PENDING" as HostEventRequestStatus,
  adminNotes: "",
};

type VenueLike = { id?: string; _id?: string; name?: string };

const getVenueId = (venue: string | VenueLike | null | undefined): string => {
  if (!venue) return "";
  if (typeof venue === "string") return venue;
  return venue.id ?? venue._id ?? "";
};

const getVenueName = (venue: string | VenueLike | null | undefined): string => {
  if (!venue || typeof venue === "string") return "";
  return venue.name ?? "";
};

const getStatusBadgeVariant = (status: HostEventRequestStatus) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "APPROVED":
      return "outline";
    case "DECLINED":
      return "destructive";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

type UploadListType = "foodMenuUrls" | "drinkMenuUrls" | "additionalDocumentUrls";
type PendingUploads = Record<UploadListType, File[]>;

const EMPTY_PENDING_UPLOADS: PendingUploads = {
  foodMenuUrls: [],
  drinkMenuUrls: [],
  additionalDocumentUrls: [],
};

export default function HostEventRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const { data: request, isLoading } = useHostEventRequest(requestId);
  const { data: venuesData, isLoading: isLoadingVenues } = useVenues();
  const updateMutation = useUpdateHostEventRequest();

  const [documents, setDocuments] = React.useState<EventRequestDocument[]>([]);
  const [formData, setFormData] = React.useState(defaultFormData);
  const [pendingBannerFile, setPendingBannerFile] = React.useState<File | null>(null);
  const [pendingBannerPreviewUrl, setPendingBannerPreviewUrl] = React.useState("");
  const [pendingUploads, setPendingUploads] = React.useState<PendingUploads>(EMPTY_PENDING_UPLOADS);
  const [pendingEventDocumentFiles, setPendingEventDocumentFiles] = React.useState<File[]>([]);
  const [isUploadingPending, setIsUploadingPending] = React.useState(false);
  const venues = React.useMemo(() => venuesData?.data ?? [], [venuesData?.data]);

  const savedVenueId = getVenueId(request?.venueId);
  const savedVenueName = getVenueName(request?.venueId);
  const venueIds = React.useMemo(() => {
    return new Set(venues.map((venue) => getVenueId(venue as VenueLike)).filter((venueId) => Boolean(venueId)));
  }, [venues]);

  React.useEffect(() => {
    if (!request) return;

    const requestVenueId = getVenueId(request.venueId);

    setFormData({
      eventName: request.eventName ?? "",
      numberOfGuests: request.numberOfGuests,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      guestArrivalTime: request.guestArrivalTime ?? "",
      eventType: request.eventType ?? "",
      eventStyle: request.eventStyle ?? "",
      maxBudget: request.maxBudget ?? "",
      eventDescription: request.eventDescription ?? "",
      eventInstructions: request.eventInstructions ?? "",
      message: request.message ?? "",
      banner: request.banner ?? "",
      foodMenuUrls: request.foodMenuUrls ?? [],
      drinkMenuUrls: request.drinkMenuUrls ?? [],
      additionalDocumentUrls: request.additionalDocumentUrls ?? [],
      venueId: requestVenueId ?? "",
      status: request.status,
      adminNotes: request.adminNotes ?? "",
    });
    setDocuments(request.documents ?? []);
    setPendingBannerFile(null);
    setPendingBannerPreviewUrl("");
    setPendingUploads(EMPTY_PENDING_UPLOADS);
    setPendingEventDocumentFiles([]);
  }, [request]);

  React.useEffect(() => {
    return () => {
      if (pendingBannerPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pendingBannerPreviewUrl);
      }
    };
  }, [pendingBannerPreviewUrl]);

  const handleBannerUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const bannerFile = fileList[0];

    if (pendingBannerPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pendingBannerPreviewUrl);
    }
    setPendingBannerFile(bannerFile);
    setPendingBannerPreviewUrl(URL.createObjectURL(bannerFile));
    toast.info("Banner added to pending uploads. It will upload when you save.");
  };

  const handleUploadFiles = (type: UploadListType, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    setPendingUploads((prev) => {
      if (type === "foodMenuUrls") {
        return { ...prev, foodMenuUrls: [...prev.foodMenuUrls, ...files] };
      }
      if (type === "drinkMenuUrls") {
        return { ...prev, drinkMenuUrls: [...prev.drinkMenuUrls, ...files] };
      }
      return { ...prev, additionalDocumentUrls: [...prev.additionalDocumentUrls, ...files] };
    });
    toast.info(`${files.length} file(s) added to pending uploads.`);
  };

  const removePendingUpload = (type: UploadListType, fileName: string) => {
    setPendingUploads((prev) => {
      if (type === "foodMenuUrls") {
        return { ...prev, foodMenuUrls: prev.foodMenuUrls.filter((file) => file.name !== fileName) };
      }
      if (type === "drinkMenuUrls") {
        return { ...prev, drinkMenuUrls: prev.drinkMenuUrls.filter((file) => file.name !== fileName) };
      }
      return {
        ...prev,
        additionalDocumentUrls: prev.additionalDocumentUrls.filter((file) => file.name !== fileName),
      };
    });
  };

  const handlePendingEventDocuments = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setPendingEventDocumentFiles((prev) => [...prev, ...files]);
    toast.info(`${files.length} admin document(s) added to pending uploads.`);
  };

  const removePendingEventDocument = (fileName: string) => {
    setPendingEventDocumentFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const removeExistingEventDocument = (url: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.url !== url));
  };

  const openInputPicker = (event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
    if (typeof inputEl.showPicker === "function") {
      inputEl.showPicker();
    }
  };

  const removeUploadedUrl = (type: UploadListType, url: string) => {
    setFormData((prev) => {
      if (type === "foodMenuUrls") {
        return { ...prev, foodMenuUrls: prev.foodMenuUrls.filter((item) => item !== url) };
      }
      if (type === "drinkMenuUrls") {
        return { ...prev, drinkMenuUrls: prev.drinkMenuUrls.filter((item) => item !== url) };
      }
      return {
        ...prev,
        additionalDocumentUrls: prev.additionalDocumentUrls.filter((item) => item !== url),
      };
    });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!request) return;

    const venueIdForSave = formData.venueId === NO_VENUE_VALUE ? undefined : formData.venueId || undefined;

    const uploadPendingList = async (files: File[], folder: string) => {
      if (files.length === 0) return [] as string[];
      return Promise.all(files.map((file) => uploadFile(file, folder)));
    };

    setIsUploadingPending(true);

    try {
      let nextBannerUrl = formData.banner;
      if (pendingBannerFile) {
        toast.info("Uploading pending banner...");
        nextBannerUrl = await uploadFile(pendingBannerFile, "events/banners");
      }

      const [newFoodMenuUrls, newDrinkMenuUrls, newAdditionalDocumentUrls] = await Promise.all([
        uploadPendingList(pendingUploads.foodMenuUrls, "events/food-menus"),
        uploadPendingList(pendingUploads.drinkMenuUrls, "events/drink-menus"),
        uploadPendingList(pendingUploads.additionalDocumentUrls, "events/documents"),
      ]);

      const uploadedEventDocuments = await Promise.all(
        pendingEventDocumentFiles.map(async (file) => {
          const url = await uploadFile(file, "host-event-requests/documents");
          return {
            url,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          } satisfies EventRequestDocument;
        }),
      );

      const nextFoodMenuUrls = [...formData.foodMenuUrls, ...newFoodMenuUrls];
      const nextDrinkMenuUrls = [...formData.drinkMenuUrls, ...newDrinkMenuUrls];
      const nextAdditionalDocumentUrls = [...formData.additionalDocumentUrls, ...newAdditionalDocumentUrls];
      const nextEventDocuments = [...documents, ...uploadedEventDocuments];

      if (pendingBannerPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pendingBannerPreviewUrl);
      }
      setPendingBannerPreviewUrl("");
      setPendingBannerFile(null);
      setPendingUploads(EMPTY_PENDING_UPLOADS);
      setPendingEventDocumentFiles([]);
      setDocuments(nextEventDocuments);
      setFormData((prev) => ({
        ...prev,
        banner: nextBannerUrl,
        foodMenuUrls: nextFoodMenuUrls,
        drinkMenuUrls: nextDrinkMenuUrls,
        additionalDocumentUrls: nextAdditionalDocumentUrls,
      }));

      updateMutation.mutate(
        {
          id: request.id,
          data: {
            eventName: formData.eventName || undefined,
            numberOfGuests: formData.numberOfGuests,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            guestArrivalTime: formData.guestArrivalTime || undefined,
            eventType: formData.eventType || undefined,
            eventStyle: formData.eventStyle || undefined,
            maxBudget: formData.maxBudget || undefined,
            banner: nextBannerUrl || undefined,
            foodMenuUrls: nextFoodMenuUrls,
            drinkMenuUrls: nextDrinkMenuUrls,
            additionalDocumentUrls: nextAdditionalDocumentUrls,
            eventDescription: formData.eventDescription || undefined,
            eventInstructions: formData.eventInstructions || undefined,
            venueId: venueIdForSave,
            status: formData.status,
            adminNotes: formData.adminNotes || undefined,
            documents: formData.status === "APPROVED" ? nextEventDocuments : undefined,
          },
        },
        {
          onSuccess: () => {
            setIsUploadingPending(false);
          },
          onError: () => {
            setIsUploadingPending(false);
          },
        },
      );
    } catch (error) {
      setIsUploadingPending(false);
      toast.error(error instanceof Error ? error.message : "Failed to upload pending files");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <p className="text-muted-foreground">Host event request not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/host-event-requests")}>
          Back to requests
        </Button>
      </div>
    );
  }

  const submittedBy =
    request.userId && typeof request.userId === "object"
      ? `${request.userId.name} (${request.userId.email})`
      : `${request.name} (${request.email})`;

  const effectiveVenueId = formData.venueId || savedVenueId;
  const showSavedVenueFallback = Boolean(effectiveVenueId && !venueIds.has(effectiveVenueId));
  const savedVenueLabel = savedVenueName || (effectiveVenueId ? `Saved venue (${effectiveVenueId})` : "Saved venue");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/host-event-requests")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Host Event Request</h1>
          <p className="text-muted-foreground text-sm">Super admin can fully manage this request from tabs below.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            {request.eventName ?? "Unnamed Event"}
            <Badge variant={getStatusBadgeVariant(formData.status)}>{formData.status}</Badge>
          </CardTitle>
          <CardDescription>
            Submitted by {submittedBy} on {format(new Date(request.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Tabs defaultValue="event-details" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="event-details">Event Details</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="event-details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Update venue, schedule, guest count, and user-provided details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    value={formData.eventName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    value={formData.venueId || savedVenueId || NO_VENUE_VALUE}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        venueId: value === NO_VENUE_VALUE ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="venue">
                      <SelectValue placeholder={isLoadingVenues ? "Loading venues..." : "Select venue"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_VENUE_VALUE}>No venue selected</SelectItem>
                      {showSavedVenueFallback && effectiveVenueId && (
                        <SelectItem value={effectiveVenueId}>{savedVenueLabel} (current)</SelectItem>
                      )}
                      {venues.map((venue) => {
                        const venueOptionId = getVenueId(venue as VenueLike);
                        if (!venueOptionId) return null;

                        return (
                          <SelectItem key={venueOptionId} value={venueOptionId}>
                            {venue.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {showSavedVenueFallback && savedVenueName && (
                    <p className="text-muted-foreground text-xs">Saved venue from request: {savedVenueName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfGuests">Guests</Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min={1}
                    value={formData.numberOfGuests}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        numberOfGuests: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="cursor-pointer"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    onClick={openInputPicker}
                    onFocus={openInputPicker}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="cursor-pointer"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    onClick={openInputPicker}
                    onFocus={openInputPicker}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="cursor-pointer"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    onClick={openInputPicker}
                    onFocus={openInputPicker}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestArrivalTime">Guest Arrival</Label>
                  <Input
                    id="guestArrivalTime"
                    type="time"
                    className="cursor-pointer"
                    value={formData.guestArrivalTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, guestArrivalTime: e.target.value }))}
                    onClick={openInputPicker}
                    onFocus={openInputPicker}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Input
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventStyle">Event Style</Label>
                  <Input
                    id="eventStyle"
                    value={formData.eventStyle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventStyle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Max Budget</Label>
                  <Input
                    id="maxBudget"
                    value={formData.maxBudget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxBudget: e.target.value }))}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Event Banner</Label>
                  {pendingBannerPreviewUrl || formData.banner ? (
                    <div className="space-y-2">
                      <img
                        src={pendingBannerPreviewUrl || formData.banner}
                        alt="Event banner"
                        className="h-56 w-full rounded-md border object-cover"
                      />
                      {pendingBannerFile ? (
                        <p className="text-sm">
                          Pending banner: <span className="font-medium">{pendingBannerFile.name}</span>
                        </p>
                      ) : (
                        <a
                          href={formData.banner}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          Open banner file
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No banner uploaded.</p>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleBannerUpload(e.target.files)}
                      disabled={updateMutation.isPending || isUploadingPending}
                    />
                    <p className="text-muted-foreground mt-1 text-xs">
                      Banner stays pending and uploads to AWS only after you click Save Changes.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Message From User</Label>
                  <Textarea id="message" rows={3} value={formData.message} readOnly disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="eventDescription">Event Description</Label>
                  <RichTextEditor
                    value={formData.eventDescription}
                    onChange={(value) => setFormData((prev) => ({ ...prev, eventDescription: value }))}
                    placeholder="Write event description..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="eventInstructions">Event Instructions</Label>
                  <RichTextEditor
                    value={formData.eventInstructions}
                    onChange={(value) => setFormData((prev) => ({ ...prev, eventInstructions: value }))}
                    placeholder="Write event instructions..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Uploaded Files</CardTitle>
                <CardDescription>View, add, or remove menu/document files for this event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Food Menus</Label>
                  {formData.foodMenuUrls.length > 0 ? (
                    <div className="space-y-2">
                      {formData.foodMenuUrls.map((url) => (
                        <div key={`food-${url}`} className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-sm underline"
                          >
                            {url.split("/").pop() ?? "Food menu"}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUploadedUrl("foodMenuUrls", url)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No food menus uploaded.</p>
                  )}
                  <Input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    onChange={(e) => void handleUploadFiles("foodMenuUrls", e.target.files)}
                    disabled={updateMutation.isPending || isUploadingPending}
                  />
                  {pendingUploads.foodMenuUrls.length > 0 && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-sm font-medium">Pending upload</p>
                      {pendingUploads.foodMenuUrls.map((file) => (
                        <div key={`pending-food-${file.name}`} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePendingUpload("foodMenuUrls", file.name)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Drink Menus</Label>
                  {formData.drinkMenuUrls.length > 0 ? (
                    <div className="space-y-2">
                      {formData.drinkMenuUrls.map((url) => (
                        <div key={`drink-${url}`} className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-sm underline"
                          >
                            {url.split("/").pop() ?? "Drink menu"}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUploadedUrl("drinkMenuUrls", url)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No drink menus uploaded.</p>
                  )}
                  <Input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    onChange={(e) => void handleUploadFiles("drinkMenuUrls", e.target.files)}
                    disabled={updateMutation.isPending || isUploadingPending}
                  />
                  {pendingUploads.drinkMenuUrls.length > 0 && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-sm font-medium">Pending upload</p>
                      {pendingUploads.drinkMenuUrls.map((file) => (
                        <div key={`pending-drink-${file.name}`} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePendingUpload("drinkMenuUrls", file.name)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Additional Documents</Label>
                  {formData.additionalDocumentUrls.length > 0 ? (
                    <div className="space-y-2">
                      {formData.additionalDocumentUrls.map((url) => (
                        <div key={`additional-${url}`} className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-sm underline"
                          >
                            {url.split("/").pop() ?? "Document"}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUploadedUrl("additionalDocumentUrls", url)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No additional documents uploaded.</p>
                  )}
                  <Input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    onChange={(e) => void handleUploadFiles("additionalDocumentUrls", e.target.files)}
                    disabled={updateMutation.isPending || isUploadingPending}
                  />
                  {pendingUploads.additionalDocumentUrls.length > 0 && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-sm font-medium">Pending upload</p>
                      {pendingUploads.additionalDocumentUrls.map((file) => (
                        <div key={`pending-additional-${file.name}`} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePendingUpload("additionalDocumentUrls", file.name)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {formData.status === "APPROVED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Documents (Approved Events)</CardTitle>
                  <CardDescription>
                    Documents stay pending and upload to AWS only when you click Save Changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Uploaded Admin Documents</Label>
                    {documents.length > 0 ? (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={`admin-doc-${doc.url}`}
                            className="flex items-center gap-2 rounded-md border px-3 py-2"
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-w-0 flex-1 truncate text-sm underline"
                            >
                              {doc.filename}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExistingEventDocument(doc.url)}
                              disabled={updateMutation.isPending || isUploadingPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No admin documents uploaded.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Add Admin Documents</Label>
                    <Input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                      onChange={(e) => handlePendingEventDocuments(e.target.files)}
                      disabled={updateMutation.isPending || isUploadingPending}
                    />
                  </div>

                  {pendingEventDocumentFiles.length > 0 && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-sm font-medium">Pending upload</p>
                      {pendingEventDocumentFiles.map((file) => (
                        <div key={`pending-admin-doc-${file.name}`} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePendingEventDocument(file.name)}
                            disabled={updateMutation.isPending || isUploadingPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Set final status and add notes for the operations team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Event Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as HostEventRequestStatus }))
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((statusOption) => (
                        <SelectItem key={statusOption.value} value={statusOption.value}>
                          {statusOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    rows={6}
                    value={formData.adminNotes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Add internal notes..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending || isUploadingPending}>
            {updateMutation.isPending || isUploadingPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
