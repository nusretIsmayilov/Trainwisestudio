import { MentalHealthActivity } from "@/mockdata/viewprograms/mockmentalhealthprograms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface ActivityDetailsProps {
  activity: MentalHealthActivity;
  onActivityToggle: (activityId: string, isCompleted: boolean) => void;
}

export default function ActivityDetails({ activity, onActivityToggle }: ActivityDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{activity.name}</CardTitle>
          <Badge variant={activity.isCompleted ? "default" : "secondary"}>
            {activity.isCompleted ? "Completed" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{activity.durationMinutes} minutes</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Type:</span>
          <Badge variant="outline">{activity.type}</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Best time:</span>
          <span className="text-sm">{activity.timeOfDay}</span>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => onActivityToggle(activity.id, !activity.isCompleted)}
            variant={activity.isCompleted ? "outline" : "default"}
            className="w-full"
          >
            {activity.isCompleted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Incomplete
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
