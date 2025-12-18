"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HostEventRequest, HostEventRequestStatus } from "@/types/host-event-request";

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HostEventRequest | null;
  onUpdateStatus: (id: string, status: HostEventRequestStatus, adminNotes: string) => void;
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

// eslint-disable-next-line complexity -- UI component with necessary conditional rendering
export function ViewDialog({ open, onOpenChange, request, onUpdateStatus, isUpdating }: ViewDialogProps) {
  if (!request) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as HostEventRequestStatus;
    const adminNotes = formData.get("adminNotes") as string;
    onUpdateStatus(request.id, status, adminNotes);
  };

  const getVenueName = () => {
    if (typeof request.venueId === "object" && request.venueId !== null) {
      return request.venueId.name;
    }
    return "—";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Host Event Request Details</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(request.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="font-medium">{request.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{request.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Phone</Label>
                <p className="font-medium">{request.phone ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Event Name</Label>
                <p className="font-medium">{request.eventName ?? "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Venue</Label>
                <p className="font-medium">{getVenueName()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Event Type</Label>
                <p className="font-medium">{request.eventType ?? "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Event Style</Label>
                <p className="font-medium">{request.eventStyle ?? "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Number of Guests</Label>
                <p className="font-medium">{request.numberOfGuests}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Max Budget</Label>
                <p className="font-medium">{request.maxBudget ?? "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Event Date</Label>
                <p className="font-medium">
                  {(() => {
                    try {
                      return format(new Date(request.date), "MMMM dd, yyyy");
                    } catch {
                      return request.date;
                    }
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Time</Label>
                <p className="font-medium">
                  {request.startTime} - {request.endTime}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Flexible Dates</Label>
                <p className="font-medium">{request.flexibleDates ? "Yes" : "No"}</p>
              </div>
              {request.guestArrivalTime && (
                <div>
                  <Label className="text-muted-foreground text-xs">Guest Arrival Time</Label>
                  <p className="font-medium">{request.guestArrivalTime}</p>
                </div>
              )}
            </div>
            {request.message && (
              <div>
                <Label className="text-muted-foreground text-xs">Message</Label>
                <p className="font-medium whitespace-pre-wrap">{request.message}</p>
              </div>
            )}
            {request.eventDescription && (
              <div>
                <Label className="text-muted-foreground text-xs">Event Description</Label>
                <p className="font-medium whitespace-pre-wrap">{request.eventDescription}</p>
              </div>
            )}
          </div>

          {/* Status Management */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Manage Request</h4>

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

            <Button type="submit" disabled={isUpdating} className="w-full">
              {isUpdating ? "Updating..." : "Update Request"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
