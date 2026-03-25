import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./todo-item";
import { useReorderTodos } from "@/hooks/use-reorder-todos";
import type { Todo, Tag } from "@/types";

interface DraggableTodoListProps {
  todos: Todo[];
  listId: string;
  todoTags: Record<string, Tag[]>;
  subtaskCounts: Record<string, { done: number; total: number }>;
  onEditTodo: (todo: Todo) => void;
  canEdit?: boolean;
}

function SortableTodoItem({
  todo,
  tags,
  subtaskCount,
  onEdit,
  canEdit = true,
}: {
  todo: Todo;
  tags?: Tag[];
  subtaskCount?: { done: number; total: number };
  onEdit: (todo: Todo) => void;
  canEdit?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        tags={tags}
        subtaskCount={subtaskCount}
        onEdit={onEdit}
        dragListeners={canEdit ? listeners : undefined}
        dragAttributes={canEdit ? attributes : undefined}
        canEdit={canEdit}
      />
    </div>
  );
}

export function DraggableTodoList({
  todos,
  listId,
  todoTags,
  subtaskCounts,
  onEditTodo,
  canEdit = true,
}: DraggableTodoListProps) {
  const reorder = useReorderTodos();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No todos yet. Add one above!
      </p>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...todos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorder.mutate({ listId, reordered });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              tags={todoTags[todo.id]}
              subtaskCount={subtaskCounts[todo.id]}
              onEdit={onEditTodo}
              canEdit={canEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
