"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EventQuery, EventQueryStatus } from "@/types/event-query";

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: EventQuery | null;
  onUpdateStatus: (id: string, status: EventQueryStatus, adminNotes: string) => void;
  isUpdating: boolean;
}

const formatStatus = (status: EventQueryStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

const getStatusBadgeVariant = (status: EventQueryStatus) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

export function ViewDialog({ open, onOpenChange, inquiry, onUpdateStatus, isUpdating }: ViewDialogProps) {
  if (!inquiry) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as EventQueryStatus;
    const adminNotes = formData.get("adminNotes") as string;
    onUpdateStatus(inquiry.id, status, adminNotes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Inquiry Details</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(inquiry.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="font-medium">
                  {inquiry.firstName} {inquiry.lastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{inquiry.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Phone</Label>
                <p className="font-medium">{inquiry.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Event Type</Label>
                <p className="font-medium">{inquiry.eventType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Area</Label>
                <p className="font-medium">{inquiry.area}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Number of Guests</Label>
                <p className="font-medium">{inquiry.numberOfPeople}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Estimated Spend</Label>
                <p className="font-medium">{inquiry.estimatedSpend}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Venue Layout</Label>
                <p className="font-medium">{inquiry.venueLayout}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Venue Style</Label>
                <p className="font-medium">{inquiry.venueStyle}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Event Date</Label>
                <p className="font-medium">
                  {(() => {
                    try {
                      return format(new Date(inquiry.eventDate), "MMMM dd, yyyy");
                    } catch {
                      return inquiry.eventDate;
                    }
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Time Range</Label>
                <p className="font-medium">{inquiry.timeRange}</p>
              </div>
            </div>
            {inquiry.message && (
              <div>
                <Label className="text-muted-foreground text-xs">Message</Label>
                <p className="font-medium whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            )}
          </div>

          {/* Status Management */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Manage Inquiry</h4>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs">Current Status:</Label>
              <Badge variant={getStatusBadgeVariant(inquiry.status)}>{formatStatus(inquiry.status)}</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select name="status" defaultValue={inquiry.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                name="adminNotes"
                defaultValue={inquiry.adminNotes}
                placeholder="Add internal notes about this inquiry..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="w-full">
              {isUpdating ? "Updating..." : "Update Inquiry"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
