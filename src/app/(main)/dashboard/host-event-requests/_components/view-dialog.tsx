/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import * as React from "react";

import { format } from "date-fns";
import { ExternalLink, FileText, Image, File } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRsvpsByEvent } from "@/hooks/use-rsvps";
import { HostEventRequestUpdateInput } from "@/services/host-event-request.service";
import { EventRequestDocument, HostEventRequest, HostEventRequestStatus } from "@/types/host-event-request";

import { DocumentUpload } from "./document-upload";

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HostEventRequest | null;
  onUpdateStatus: (
    id: string,
    status: HostEventRequestStatus,
    adminNotes: string,
    documents?: EventRequestDocument[],
  ) => void;
  onUpdateRequest?: (id: string, data: HostEventRequestUpdateInput) => void;
  isUpdating: boolean;
}

const formatStatus = (status: HostEventRequestStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "DECLINED":
      return "Declined";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
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

const getFileIcon = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? "")) {
    return <Image className="size-4 text-green-500" />;
  }
  if (ext === "pdf") {
    return <FileText className="size-4 text-red-500" />;
  }
  return <File className="size-4 text-blue-500" />;
};

export function ViewDialog({
  open,
  onOpenChange,
  request,
  onUpdateStatus,
  onUpdateRequest,
  isUpdating,
}: ViewDialogProps) {
  const [documents, setDocuments] = React.useState<EventRequestDocument[]>([]);
  const [activeTab, setActiveTab] = React.useState("details");

  // Form state for editable fields
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    eventName: "",
    numberOfGuests: 0,
    date: "",
    startTime: "",
    endTime: "",
    guestArrivalTime: "",
    eventDescription: "",
    eventType: "",
    eventStyle: "",
    maxBudget: "",
    message: "",
    flexibleDates: false,
  });

  // Fetch RSVPs for this event
  const { data: rsvps, isLoading: rsvpsLoading } = useRsvpsByEvent(request?.id);

  // Reset form when request changes
  React.useEffect(() => {
    if (request) {
      setDocuments(request.documents ?? []);
      setFormData({
        name: request.name ?? "",
        email: request.email ?? "",
        phone: request.phone ?? "",
        eventName: request.eventName ?? "",
        numberOfGuests: request.numberOfGuests ?? 0,
        date: request.date ?? "",
        startTime: request.startTime ?? "",
        endTime: request.endTime ?? "",
        guestArrivalTime: request.guestArrivalTime ?? "",
        eventDescription: request.eventDescription ?? "",
        eventType: request.eventType ?? "",
        eventStyle: request.eventStyle ?? "",
        maxBudget: request.maxBudget ?? "",
        message: request.message ?? "",
        flexibleDates: request.flexibleDates ?? false,
      });
      setActiveTab("details");
    }
  }, [request]);

  if (!request) return null;

  const handleAdminSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const status = fd.get("status") as HostEventRequestStatus;
    const adminNotes = fd.get("adminNotes") as string;
    onUpdateStatus(request.id, status, adminNotes, documents);
  };

  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onUpdateRequest) {
      onUpdateRequest(request.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        eventName: formData.eventName || undefined,
        numberOfGuests: formData.numberOfGuests,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        guestArrivalTime: formData.guestArrivalTime || undefined,
        eventDescription: formData.eventDescription || undefined,
        eventType: formData.eventType || undefined,
        eventStyle: formData.eventStyle || undefined,
        maxBudget: formData.maxBudget || undefined,
        message: formData.message || undefined,
        flexibleDates: formData.flexibleDates,
      });
    }
  };

  const getVenueName = () => {
    if (typeof request.venueId === "object" && request.venueId !== null) {
      return request.venueId.name;
    }
    return "—";
  };

  const getUserInfo = () => {
    if (typeof request.userId === "object" && request.userId !== null) {
      return request.userId;
    }
    return null;
  };

  const userInfo = getUserInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Host Event Request Details</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Submitted on {format(new Date(request.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
            <Badge variant={getStatusBadgeVariant(request.status)}>{formatStatus(request.status)}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="files">Uploaded Files</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs ({rsvps?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Event Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {userInfo && (
              <div className="bg-muted rounded-md p-3">
                <Label className="text-muted-foreground text-xs">Submitted by</Label>
                <p className="font-medium">{userInfo.name}</p>
                <p className="text-muted-foreground text-sm">{userInfo.email}</p>
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-sm font-semibold uppercase">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      value={formData.eventName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, eventName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input value={getVenueName()} disabled className="bg-muted" />
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
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      value={formData.numberOfGuests}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 0 }))
                      }
                      required
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
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestArrivalTime">Guest Arrival Time</Label>
                    <Input
                      id="guestArrivalTime"
                      type="time"
                      value={formData.guestArrivalTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, guestArrivalTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Event Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={formData.eventDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventDescription: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {onUpdateRequest && (
                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? "Saving..." : "Save Event Details"}
                </Button>
              )}
            </form>
          </TabsContent>

          {/* Uploaded Files Tab */}
          <TabsContent value="files" className="space-y-6">
            {/* Banner */}
            {request.banner && (
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event Banner</h4>
                <a href={request.banner} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={request.banner} alt="Event banner" className="max-h-48 rounded-md border object-cover" />
                </a>
              </div>
            )}

            {/* Food Menus */}
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase">Food Menus</h4>
              {request.foodMenuUrls && request.foodMenuUrls.length > 0 ? (
                <div className="grid gap-2">
                  {request.foodMenuUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted flex items-center gap-2 rounded-md border p-2"
                    >
                      {getFileIcon(url)}
                      <span className="flex-1 truncate text-sm">Food Menu {index + 1}</span>
                      <ExternalLink className="text-muted-foreground size-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No food menus uploaded</p>
              )}
            </div>

            {/* Drink Menus */}
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase">Drink Menus</h4>
              {request.drinkMenuUrls && request.drinkMenuUrls.length > 0 ? (
                <div className="grid gap-2">
                  {request.drinkMenuUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted flex items-center gap-2 rounded-md border p-2"
                    >
                      {getFileIcon(url)}
                      <span className="flex-1 truncate text-sm">Drink Menu {index + 1}</span>
                      <ExternalLink className="text-muted-foreground size-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No drink menus uploaded</p>
              )}
            </div>

            {/* Additional Documents */}
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase">Additional Documents</h4>
              {request.additionalDocumentUrls && request.additionalDocumentUrls.length > 0 ? (
                <div className="grid gap-2">
                  {request.additionalDocumentUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted flex items-center gap-2 rounded-md border p-2"
                    >
                      {getFileIcon(url)}
                      <span className="flex-1 truncate text-sm">Document {index + 1}</span>
                      <ExternalLink className="text-muted-foreground size-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No additional documents uploaded</p>
              )}
            </div>
          </TabsContent>

          {/* RSVPs Tab */}
          <TabsContent value="rsvps" className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">
              Guest RSVPs ({rsvps?.length ?? 0})
            </h4>
            {rsvpsLoading ? (
              <p className="text-muted-foreground text-sm">Loading RSVPs...</p>
            ) : rsvps && rsvps.length > 0 ? (
              <div className="divide-y rounded-md border">
                {rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">
                        {rsvp.firstName} {rsvp.lastName}
                      </p>
                      <p className="text-muted-foreground text-sm">{rsvp.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No RSVPs for this event yet.</p>
            )}
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground text-xs">Current Status:</Label>
                <Badge variant={getStatusBadgeVariant(request.status)}>{formatStatus(request.status)}</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select name="status" defaultValue={request.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="DECLINED">Declined</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  name="adminNotes"
                  defaultValue={request.adminNotes}
                  placeholder="Add internal notes about this request..."
                  rows={3}
                />
              </div>

              {/* Document Upload Section - Only visible for APPROVED status */}
              {request.status === "APPROVED" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event Documents</h4>
                  <p className="text-muted-foreground text-xs">
                    Upload contracts, agreements, or other relevant documents for this approved event.
                  </p>
                  <DocumentUpload documents={documents} onDocumentsChange={setDocuments} disabled={isUpdating} />
                </div>
              )}

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Updating..." : "Update Request"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
