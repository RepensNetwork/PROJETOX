import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { LayoutDashboard } from "lucide-react"

export default function DashboardLoading() {
  return <PageLoadingSkeleton title="Dashboard" Icon={LayoutDashboard} />
}
