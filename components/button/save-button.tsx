import { Bookmark } from "lucide-react"

import { Button } from "./button"

export function SaveButton() {
  return (
    <Button variant="outline" size="icon">
     <Bookmark  className="h-4 w-4" />
    </Button>
  )
}
