import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Mic } from "lucide-react"

export default function IntakeLoading() {
  return <PageLoadingSkeleton title="Criar demanda" Icon={Mic} />
}
