import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 rounded bg-muted animate-pulse mb-2" />
              <div className="h-3 w-full max-w-[140px] rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded bg-muted animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
