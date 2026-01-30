import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Car } from "lucide-react"

export default function MotoristaLoading() {
  return <PageLoadingSkeleton title="Transportes do dia" Icon={Car} />
}
