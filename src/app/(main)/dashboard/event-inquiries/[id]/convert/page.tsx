/* eslint-disable max-lines -- Complex form page with multiple sections */
"use client";

import * as React from "react";

import { useParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConvertToEvent, useEventQuery } from "@/hooks/use-event-queries";
import { useVenues } from "@/hooks/use-venues";
import { cn } from "@/lib/utils";

const convertFormSchema = z.object({
  eventName: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1, "At least 1 guest required"),
  date: z.date({ required_error: "Event date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  eventType: z.string().optional(),
  eventStyle: z.string().optional(),
  maxBudget: z.string().optional(),
  message: z.string().optional(),
  venueId: z.string().min(1, "Venue selection is required"),
  flexibleDates: z.boolean().optional(),
});

type ConvertFormValues = z.infer<typeof convertFormSchema>;

export default function ConvertToEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventQueryId = params.id as string;

  const { data: eventQuery, isLoading: isLoadingQuery } = useEventQuery(eventQueryId);
  const { data: venues = [], isLoading: isLoadingVenues } = useVenues();
  const convertMutation = useConvertToEvent();

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      eventName: "",
      numberOfGuests: 1,
      startTime: "",
      endTime: "",
      eventType: "",
      eventStyle: "",
      maxBudget: "",
      message: "",
      venueId: "",
      flexibleDates: false,
    },
  });

  // Pre-populate form when event query loads
  // eslint-disable-next-line complexity -- useEffect with form pre-population has necessary complexity
  React.useEffect(() => {
    if (eventQuery) {
      const timeRange = eventQuery.timeRange ?? "";
      const [startTime, endTime] = timeRange.split(" - ").map((t) => t.trim());

      form.reset({
        eventName: "",
        numberOfGuests: parseInt(eventQuery.numberOfPeople) || 1,
        date: eventQuery.eventDate ? new Date(eventQuery.eventDate) : undefined,
        startTime: startTime ?? "",
        endTime: endTime ?? "",
        eventType: eventQuery.eventType ?? "",
        eventStyle: eventQuery.venueStyle ?? "",
        maxBudget: eventQuery.estimatedSpend ?? "",
        message: eventQuery.message ?? "",
        venueId: "",
        flexibleDates: false,
      });
    }
  }, [eventQuery, form]);

  const onSubmit = async (values: ConvertFormValues) => {
    convertMutation.mutate(
      {
        eventQueryId,
        eventName: values.eventName,
        numberOfGuests: values.numberOfGuests,
        date: format(values.date, "yyyy-MM-dd"),
        startTime: values.startTime,
        endTime: values.endTime,
        eventType: values.eventType,
        eventStyle: values.eventStyle,
        maxBudget: values.maxBudget,
        message: values.message,
        venueId: values.venueId,
        flexibleDates: values.flexibleDates,
      },
      {
        onSuccess: () => {
          router.push("/dashboard/event-inquiries");
        },
      },
    );
  };

  if (isLoadingQuery) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!eventQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Event inquiry not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Convert to Event</h1>
          <p className="text-muted-foreground text-sm">
            Convert event inquiry from {eventQuery.firstName} {eventQuery.lastName} to a host event request
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Selection</CardTitle>
              <CardDescription>Select a venue for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="venueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingVenues ? "Loading venues..." : "Select a venue"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Information about the event</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Birthday Party" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Event</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style of Event</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="cocktail">Cocktail</SelectItem>
                        <SelectItem value="seated">Seated Dinner</SelectItem>
                        <SelectItem value="buffet">Buffet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="£1000 - £2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
              <CardDescription>When is the event taking place</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Any other details about the event</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message to Venue</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special requirements or notes..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={convertMutation.isPending} className="flex-1">
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Event"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
