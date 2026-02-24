"use client";

import * as React from "react";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveDietaryNeeds } from "@/hooks/use-dietary-needs";
import { Rsvp, RsvpUpdateInput } from "@/types/rsvp";

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rsvp: Rsvp | null;
  onUpdate: (id: string, data: RsvpUpdateInput) => void;
  isUpdating: boolean;
}

export function ViewDialog({ open, onOpenChange, rsvp, onUpdate, isUpdating }: ViewDialogProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [selectedDietaryNeeds, setSelectedDietaryNeeds] = React.useState<string[]>([]);
  const [customDietaryNeed, setCustomDietaryNeed] = React.useState("");

  const { data: dietaryNeedsData } = useActiveDietaryNeeds();
  const dietaryNeeds = dietaryNeedsData ?? [];

  // Reset form when RSVP changes
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
          <DialogTitle>RSVP Details</DialogTitle>
          <DialogDescription>
            Created on {format(new Date(rsvp.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Info (Read-only) */}
          {rsvp.user && (
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase">Owner</h4>
              <div className="bg-muted rounded-md p-3">
                <p className="font-medium">{rsvp.user.name}</p>
                <p className="text-muted-foreground text-sm">{rsvp.user.email}</p>
              </div>
            </div>
          )}

          {/* Event Info (Read-only) */}
          {rsvp.hostEventRequest && (
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase">Event</h4>
              <div className="bg-muted rounded-md p-3">
                <p className="font-medium">{rsvp.hostEventRequest.eventName ?? "Unnamed Event"}</p>
                {rsvp.hostEventRequest.date && (
                  <p className="text-muted-foreground text-sm">
                    {(() => {
                      try {
                        return format(new Date(rsvp.hostEventRequest.date), "MMMM dd, yyyy");
                      } catch {
                        return rsvp.hostEventRequest.date;
                      }
                    })()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Guest Details (Editable) */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Guest Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          {/* Dietary Needs */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-semibold uppercase">Dietary Needs</h4>

            <div className="space-y-2">
              <Label>Select Dietary Needs</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryNeeds.map((need) => (
                  <div key={need.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dn-${need.id}`}
                      checked={selectedDietaryNeeds.includes(need.id)}
                      onCheckedChange={() => toggleDietaryNeed(need.id)}
                      className="cursor-pointer"
                    />
                    <label htmlFor={`dn-${need.id}`} className="cursor-pointer text-sm">
                      {need.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedDietaryNeeds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedDietaryNeeds.map((id) => {
                    const need = dietaryNeeds.find((dn) => dn.id === id);
                    return need ? (
                      <Badge key={id} variant="secondary">
                        {need.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDietaryNeed">Custom Dietary Need</Label>
              <Textarea
                id="customDietaryNeed"
                value={customDietaryNeed}
                onChange={(e) => setCustomDietaryNeed(e.target.value)}
                placeholder="Enter any other dietary requirements..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="cursor-pointer">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
