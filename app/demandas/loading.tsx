import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { ClipboardList } from "lucide-react"

export default function DemandasLoading() {
  return <PageLoadingSkeleton title="Demandas" Icon={ClipboardList} />
}
