import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Calendar } from "lucide-react"

export default function EscalasLoading() {
  return <PageLoadingSkeleton title="Escalas" Icon={Calendar} />
}
