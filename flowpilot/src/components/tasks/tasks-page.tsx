"use client";

import { useState, useCallback } from "react";
import { Plus, MoreHorizontal, Calendar, Flag, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate, getInitials } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS: { key: TaskStatus; color: string }[] = [
  { key: "todo", color: "border-t-slate-400" },
  { key: "in_progress", color: "border-t-blue-500" },
  { key: "review", color: "border-t-amber-500" },
  { key: "done", color: "border-t-emerald-500" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "text-slate-500",
  medium: "text-amber-500",
  high: "text-orange-500",
  urgent: "text-rose-600",
};

const MOCK_TASKS: Task[] = [
  { id: "1", organization_id: "o", title: "API-Dokumentation aktualisieren", description: "Alle Endpoints dokumentieren", status: "todo", priority: "medium", assignee_id: null, due_date: "2026-03-28", position: 0, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "2", organization_id: "o", title: "Dashboard-Performance optimieren", description: null, status: "in_progress", priority: "high", assignee_id: "u1", due_date: "2026-03-25", position: 0, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "3", organization_id: "o", title: "Neue Landing Page", description: "Design und Entwicklung", status: "in_progress", priority: "urgent", assignee_id: "u2", due_date: "2026-03-22", position: 1, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "4", organization_id: "o", title: "Security-Audit Q1", description: null, status: "review", priority: "high", assignee_id: "u1", due_date: "2026-03-20", position: 0, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "5", organization_id: "o", title: "Onboarding-Flow testen", description: "Nutzertest mit 5 Personen", status: "done", priority: "medium", assignee_id: "u3", due_date: "2026-03-15", position: 0, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "6", organization_id: "o", title: "E-Mail-Templates erstellen", description: null, status: "todo", priority: "low", assignee_id: null, due_date: "2026-04-10", position: 1, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "7", organization_id: "o", title: "Datenbank-Migration", description: null, status: "done", priority: "urgent", assignee_id: "u2", due_date: "2026-03-10", position: 1, created_by: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  tasks: Task[];
}

export function TasksPage({ tasks: serverTasks }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const [addOpen, setAddOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(serverTasks.length > 0 ? serverTasks : MOCK_TASKS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "todo", priority: "medium" },
  });

  const onSubmit = async (data: FormValues) => {
    const newTask: Task = {
      id: String(Date.now()),
      organization_id: "o",
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      assignee_id: null,
      due_date: data.due_date ?? null,
      position: tasks.filter((t) => t.status === data.status).length,
      created_by: "u1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    toast.success(t("toasts.taskAdded"));
    reset();
    setAddOpen(false);
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Check if dragging over a column
    const overColumn = COLUMNS.find((c) => c.key === overId);
    if (overColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overColumn.key } : t
        )
      );
      return;
    }

    // Dragging over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        )
      );
    }
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    setTasks((prev) => {
      const activeIdx = prev.findIndex((t) => t.id === activeId);
      const overIdx = prev.findIndex((t) => t.id === overId);

      if (activeIdx === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(activeIdx, 1);

      if (overIdx !== -1) {
        updated.splice(overIdx, 0, moved);
      } else {
        updated.push(moved);
      }

      return updated;
    });
  }, []);

  const statusVal = watch("status");
  const priorityVal = watch("priority");

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("tasks.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("tasks.subtitle")}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {t("tasks.addTask")}
        </Button>
      </div>

      {/* Kanban Board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[400px]">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <KanbanColumn
                key={col.key}
                column={col}
                tasks={colTasks}
                locale={locale}
                t={t}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} locale={locale} t={t} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add task dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tasks.addTask")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>{t("tasks.form.title")}</Label>
              <Input placeholder={t("tasks.form.titlePlaceholder")} error={!!errors.title} {...register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("tasks.form.description")}</Label>
              <Textarea rows={2} placeholder={t("tasks.form.descriptionPlaceholder")} {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("tasks.form.status")}</Label>
                <Select value={statusVal} onValueChange={(v) => setValue("status", v as TaskStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((c) => <SelectItem key={c.key} value={c.key}>{t(`tasks.columns.${c.key}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("tasks.form.priority")}</Label>
                <Select value={priorityVal} onValueChange={(v) => setValue("priority", v as TaskPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>{t(`tasks.priority.${p}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("tasks.form.dueDate")}</Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" loading={isSubmitting}>{t("tasks.addTask")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  locale,
  t,
}: {
  column: { key: TaskStatus; color: string };
  tasks: Task[];
  locale: string;
  t: (key: string) => string;
}) {
  const { setNodeRef } = useSortable({
    id: column.key,
    data: { type: "column" },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t(`tasks.columns.${column.key}`)}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`min-h-[300px] rounded-2xl border-t-2 bg-muted/20 p-2 space-y-2 transition-colors ${column.color}`}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} locale={locale} t={t} />
          ))}

          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border border-dashed rounded-xl">
              {t("tasks.noTasks")}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task, locale, t }: { task: Task; locale: string; t: (key: string) => string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} locale={locale} t={t} dragListeners={listeners} />
    </div>
  );
}

function TaskCard({
  task,
  locale,
  t,
  isDragging,
  dragListeners,
}: {
  task: Task;
  locale: string;
  t: (key: string) => string;
  isDragging?: boolean;
  dragListeners?: Record<string, unknown>;
}) {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <Card className={`shadow-none hover:shadow-sm transition-shadow ${isDragging ? "shadow-lg" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <button
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
              {...dragListeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm font-medium leading-tight flex-1">{task.title}</p>
          </div>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 ml-5">{task.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className={`flex items-center gap-1 text-xs font-medium ${priorityColor}`}>
            <Flag className="h-3 w-3" />
            {t(`tasks.priority.${task.priority}`)}
          </span>

          <div className="flex items-center gap-2">
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-rose-600" : "text-muted-foreground"}`}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date, locale)}
              </span>
            )}
            {task.assignee_id && (
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px]">U</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
