import { Copy } from "lucide-react"

import { Button } from "./button"

export function CopyButton() {
  return (
    <Button variant="outline" size="icon">
     <Copy className="h-4 w-4" />
    </Button>
  )
}