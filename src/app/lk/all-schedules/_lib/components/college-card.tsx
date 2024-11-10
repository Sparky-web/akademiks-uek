import { Landmark } from "lucide-react";
import Card from "~/app/_lib/components/card";
import { H3, H4 } from "~/components/ui/typography";

export default function CollegeCard() {
    return (
        // <Card >
        <div className="grid gap-3">

            <div className="flex gap-2 content-center">
                <Landmark className="h-5 w-5" />
                <H3>Уральский радиотехнический колледж им. А.С. Попова</H3>
            </div>
            <div className="text-muted-foreground">
                Все расписания
            </div>
        </div>
        // </Card>
    )
}