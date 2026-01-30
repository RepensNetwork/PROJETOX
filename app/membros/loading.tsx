import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Users } from "lucide-react"

export default function MembrosLoading() {
  return <PageLoadingSkeleton title="Colaboradores" Icon={Users} />
}
