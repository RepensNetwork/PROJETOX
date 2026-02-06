import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Wallet } from "lucide-react"

export default function FinanceiroLoading() {
  return <PageLoadingSkeleton title="Financeiro" Icon={Wallet} />
}
