"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LibraryItem } from "@/mockdata/library/mockLibrary";
import { Dumbbell, Utensils, Feather, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LibraryViewerProps {
  item: LibraryItem;
  onBack: () => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ item, onBack }) => {
  const getDetails = () => {
    let icon, primaryDetail, secondaryTag;

    switch (item.category) {
      case "exercise":
        icon = <Dumbbell className="h-6 w-6" />;
        primaryDetail = item.muscleGroup || "Full Body";
        secondaryTag = item.isCustom ? "Custom Workout" : "Standard Exercise";
        break;
      case "recipe":
        icon = <Utensils className="h-6 w-6" />;
        primaryDetail = item.allergies || "Allergy Free";
        secondaryTag = item.isCustom ? "Custom Recipe" : "Meal Plan";
        break;
      case "mental health":
        icon = <Feather className="h-6 w-6" />;
        primaryDetail =
          item.content?.[0]?.type === "soundfile"
            ? "Audio Session"
            : "Guided Text";
        secondaryTag = item.isCustom ? "My Activity" : "Meditation";
        break;
    }
    return { icon, primaryDetail, secondaryTag };
  };

  const { icon, primaryDetail, secondaryTag } = getDetails();

  const getFallbackImage = (category: string) => {
    switch (category) {
      case "exercise":
        return "https://images.unsplash.com/photo-1549476483-e8893d56a337?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      case "recipe":
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      case "mental health":
      default:
        return "https://images.unsplash.com/photo-1517436034114-1e2b6e159046?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    }
  };

  // Placeholder for image based on category
  const imageUrl =
    (item as any).hero_image_url ??
    (item.category === "exercise"
      ? "https://images.unsplash.com/photo-1549476483-e8893d56a337?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      : item.category === "recipe"
        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : "https://images.unsplash.com/photo-1517436034114-1e2b6e159046?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");

  const renderContent = () => {
    switch (item.category) {
      case "exercise":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Muscle Group</h3>
              <p className="text-muted-foreground">
                {item.muscleGroup || "Full Body"}
              </p>
            </div>
            {item.howTo && item.howTo.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">How to Perform</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {item.howTo.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step.value}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      case "recipe":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Allergies</h3>
              <p className="text-muted-foreground">
                {item.allergies || "Allergy Free"}
              </p>
            </div>
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {item.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-muted-foreground">
                      {ingredient.quantity} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.stepByStep && item.stepByStep.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {item.stepByStep.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      case "mental health":
        return (
          <div className="space-y-4">
            {item.content && item.content.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Content</h3>
                <div className="space-y-3">
                  {item.content.map((contentItem, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{contentItem.type}</p>
                      <p className="text-muted-foreground">
                        {contentItem.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              item.isCustom
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground",
            )}
          >
            {secondaryTag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {/* Image Section */}
        <Card className="overflow-hidden shadow-md">
          <div className="relative w-full bg-muted">
            {/* Aspect ratio 4:3 veya 16:9 – senin içeriğine göre seç */}
            <div className="relative pb-[56.25%] md:pb-[50%]">
              {" "}
              {/* 16:9 mobilde, biraz daha kare desktopta */}
              <img
                src={imageUrl}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage(item.category);
                  e.currentTarget.className =
                    "absolute inset-0 h-full w-full object-contain bg-muted";
                }}
              />
            </div>

            {/* Category badge – biraz daha şık konum */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1.5 shadow-sm">
              {icon} {item.category.replace("mental health", "Wellness")}
            </div>
          </div>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.introduction}</p>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default LibraryViewer;
