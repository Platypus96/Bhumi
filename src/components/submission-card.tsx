
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Submission } from '@/lib/types';
import { Hourglass } from 'lucide-react';
import { format } from 'date-fns';

interface SubmissionCardProps {
  submission: Submission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  return (
    <Card className="h-full flex flex-col bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={submission.imageUrl}
            alt={submission.title}
            fill
            className="object-cover"
          />
           <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-100 text-amber-800 border-amber-200">
            Pending Approval
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-semibold mb-1">{submission.title}</CardTitle>
         <CardDescription className="text-sm text-muted-foreground mb-2">{submission.area}</CardDescription>
        <div className="text-sm text-muted-foreground space-y-2">
           <div className="flex items-center">
                <Hourglass className="h-4 w-4 mr-2 flex-shrink-0 text-amber-600" />
                <span className="truncate">Submitted on {format(submission.createdAt.toDate(), "PPP")}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Badge variant="outline" className="border-amber-300 text-amber-700">
          Under Verification
        </Badge>
      </CardFooter>
    </Card>
  );
}
