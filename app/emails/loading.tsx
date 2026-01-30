import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { Mail } from "lucide-react"

export default function EmailsLoading() {
  return <PageLoadingSkeleton title="Inbox" Icon={Mail} />
}
