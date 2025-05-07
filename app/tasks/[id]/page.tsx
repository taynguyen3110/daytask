import { MainLayout } from "@/components/layouts/main-layout"
import { TaskDetail } from "@/components/tasks/task-detail"

export default function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <MainLayout>
      <TaskDetail id={params.id} />
    </MainLayout>
  )
}
