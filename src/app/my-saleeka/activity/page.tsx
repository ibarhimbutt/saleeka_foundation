import ActivityLog from '@/components/profile/ActivityLog';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold text-primary">Activity Log</h1>
        <p className="text-muted-foreground">View your recent account activity and actions.</p>
      </div>
      <ActivityLog />
    </div>
  );
}