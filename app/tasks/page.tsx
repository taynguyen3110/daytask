import { MainLayout } from "@/components/layouts/main-layout"
import { TaskList } from "@/components/tasks/task-list"

export default function TasksPage() {
  return (
    <MainLayout>
      <TaskList />
    </MainLayout>
  )
}
