import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Ship } from "lucide-react"

export default function NaviosLoading() {
  return <PageLoadingSkeleton title="Navios" Icon={Ship} />
}
