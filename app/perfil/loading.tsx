import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { User } from "lucide-react"

export default function PerfilLoading() {
  return <PageLoadingSkeleton title="Meu Perfil" Icon={User} rows={3} />
}
