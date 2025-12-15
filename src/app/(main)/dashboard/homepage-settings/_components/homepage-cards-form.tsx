/* eslint-disable max-lines */
"use client";

import * as React from "react";

import Image from "next/image";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { homepageCardsSchema, type HomepageCardsFormValues } from "./schema";

// Small Image Upload Box Component for Icons (80x80)
interface IconUploadBoxProps {
  accept?: string;
  onChange: (file: File | null) => void;
}

function IconUploadBox({ accept = "image/*", onChange }: IconUploadBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      onChange(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={handleClick}
        className="hover:border-primary focus-visible:ring-ring group flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center gap-1 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-[10px] font-medium">Upload</span>
        </div>
      </button>
    </>
  );
}

// Sortable Card Item Component
interface SortableCardItemProps {
  id: string;
  cardIndex: number;
  onRemove: (index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Form type from react-hook-form
  form: any;
  onIconChange: (index: number, file: File | null) => void;
  onRemoveIcon: (index: number) => void;
}

function SortableCardItem({ id, cardIndex, onRemove, form, onIconChange, onRemoveIcon }: SortableCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [iconPreview, setIconPreview] = React.useState<string>("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const iconValue = form.watch(`cards.${cardIndex}.icon`);

  // Handle icon preview from form state (for existing icons from backend)
  React.useEffect(() => {
    if (iconValue instanceof File) {
      const objectUrl = URL.createObjectURL(iconValue);
      setIconPreview(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (typeof iconValue === "string" && iconValue) {
      setIconPreview(iconValue);
    } else if (!iconValue) {
      setIconPreview("");
    }
  }, [iconValue]);

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border p-4">
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5" />
              </button>
              <CardTitle className="text-lg">Card {cardIndex + 1}</CardTitle>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemove(cardIndex)}
              className="cursor-pointer"
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name={`cards.${cardIndex}.icon`}
            render={() => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {iconPreview ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-md border-2">
                        <Image
                          src={iconPreview}
                          alt={`Card ${cardIndex + 1} icon`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Cleanup object URL if it's a blob URL
                            if (iconPreview && iconPreview.startsWith("blob:")) {
                              URL.revokeObjectURL(iconPreview);
                            }
                            onRemoveIcon(cardIndex);
                            setIconPreview("");
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute top-1 right-1 z-10 cursor-pointer rounded-full p-1 shadow-md"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <IconUploadBox
                        accept="image/*"
                        onChange={(file) => {
                          if (file) {
                            onIconChange(cardIndex, file);
                            // Immediately create preview
                            const objectUrl = URL.createObjectURL(file);
                            setIconPreview(objectUrl);
                          }
                        }}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`cards.${cardIndex}.heading`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heading</FormLabel>
                <FormControl>
                  <Input placeholder="Enter card heading" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`cards.${cardIndex}.para`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter card description" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function HomepageCardsForm() {
  const form = useForm<HomepageCardsFormValues>({
    resolver: zodResolver(homepageCardsSchema),
    defaultValues: {
      cards: [
        {
          icon: undefined,
          heading: "",
          para: "",
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleIconChange = (index: number, file: File | null) => {
    if (file) {
      // Validate image file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      form.setValue(`cards.${index}.icon`, file);
    }
  };

  const handleRemoveIcon = (index: number) => {
    form.setValue(`cards.${index}.icon`, undefined);
  };

  const addCard = () => {
    append({
      icon: undefined,
      heading: "",
      para: "",
    });
  };

  const removeCard = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one card is required");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  const onSubmit = async (data: HomepageCardsFormValues) => {
    try {
      // TODO: Implement API call to save homepage cards
      console.log("Homepage Cards data:", data);
      toast.success("Homepage cards saved successfully");
    } catch (error) {
      toast.error("Failed to save homepage cards");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Cards</CardTitle>
        <CardDescription>Add and manage homepage cards with icons, headings, and descriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <SortableCardItem
                      key={field.id}
                      id={field.id}
                      cardIndex={index}
                      onRemove={removeCard}
                      form={form}
                      onIconChange={handleIconChange}
                      onRemoveIcon={handleRemoveIcon}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button type="button" variant="outline" onClick={addCard} className="w-full cursor-pointer">
              <Plus className="mr-2 size-4" />
              Add Card
            </Button>

            <Button type="submit" className="cursor-pointer">
              Save Homepage Cards
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
