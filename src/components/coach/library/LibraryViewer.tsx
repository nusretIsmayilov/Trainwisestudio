"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LibraryItem } from "@/mockdata/library/mockLibrary";
import { Dumbbell, Utensils, Feather, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Opsiyonel: Tipi daha güvenli hale getirmek için (mockLibrary.ts'te tanımlı olmalı)
// Eğer tanımlı değilse, geçici olarak interface genişletiyoruz
interface ExtendedLibraryItem extends LibraryItem {
  hero_image_url?: string | null;
  howTo?: Array<{ id: string; type: "step" | "image"; value: string }>;
  content?: Array<{ type: string; value: string }>;
  // diğer olası field'lar...
}

interface LibraryViewerProps {
  item: ExtendedLibraryItem; // veya sadece LibraryItem, eğer tip güncellendiyse
  onBack: () => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ item, onBack }) => {
  const getDetails = () => {
    let icon: React.ReactNode;
    let primaryDetail: string;
    let secondaryTag: string;

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
          item.content?.[0]?.type === "soundfile" || item.content?.[0]?.type === "audio"
            ? "Audio Session"
            : "Guided Text";
        secondaryTag = item.isCustom ? "My Activity" : "Meditation";
        break;
      default:
        icon = null;
        primaryDetail = "";
        secondaryTag = "";
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

  // Hero image – tip güvenli erişim
  const imageUrl = item.hero_image_url ?? getFallbackImage(item.category);

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
                <ol className="list-decimal list-inside space-y-4">
                  {item.howTo.map((step, index) => (
                    <li key={step.id || index} className="text-muted-foreground">
                      {step.type === "step" ? (
                        <span>{step.value}</span>
                      ) : step.type === "image" ? (
                        <div className="mt-2">
                          <img
                            src={step.value}
                            alt={`Step ${index + 1} image`}
                            className="max-w-full h-auto rounded-lg shadow-md object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackImage(item.category);
                              console.log("Image load error in howTo:", step.id);
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-yellow-600">
                          Unsupported step type: {step.type}
                        </span>
                      )}
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
                <div className="space-y-4">
                  {item.content.map((contentItem, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg border border-border/30"
                    >
                      <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
                        {contentItem.type}
                      </div>

                      {contentItem.type === "text" ? (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {contentItem.value}
                        </p>
                      ) : contentItem.type === "image" ? (
                        <div className="mt-2">
                          <img
                            src={contentItem.value}
                            alt={`Content media ${index + 1}`}
                            className="max-w-full h-auto rounded-md shadow-sm object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackImage(item.category);
                            }}
                          />
                        </div>
                      ) : contentItem.type === "audio" || contentItem.type === "soundfile" ? (
                        <div className="mt-2">
                          <audio
                            controls
                            className="w-full"
                            src={contentItem.value}
                          >
                            Tarayıcınız ses oynatmayı desteklemiyor.
                          </audio>
                        </div>
                      ) : contentItem.type === "video" ? (
                        <div className="mt-2 aspect-video">
                          <video
                            controls
                            className="w-full h-full rounded-md"
                            src={contentItem.value}
                          >
                            Tarayıcınız video oynatmayı desteklemiyor.
                          </video>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          {contentItem.value}
                          <br />
                          <span className="text-xs text-destructive">
                            (Desteklenmeyen içerik tipi: {contentItem.type})
                          </span>
                        </p>
                      )}
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
                : "bg-muted text-muted-foreground"
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
            <div className="relative pb-[56.25%] md:pb-[50%]">
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