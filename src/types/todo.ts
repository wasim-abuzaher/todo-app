import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

export type TodoList = Tables["todo_lists"]["Row"];
export type TodoListInsert = Tables["todo_lists"]["Insert"];
export type TodoListUpdate = Tables["todo_lists"]["Update"];

export type Todo = Tables["todos"]["Row"];
export type TodoInsert = Tables["todos"]["Insert"];
export type TodoUpdate = Tables["todos"]["Update"];

export type Subtask = Tables["subtasks"]["Row"];
export type SubtaskInsert = Tables["subtasks"]["Insert"];
export type SubtaskUpdate = Tables["subtasks"]["Update"];

export type Tag = Tables["tags"]["Row"];
export type TagInsert = Tables["tags"]["Insert"];

export type TodoTag = Tables["todo_tags"]["Row"];

export type ListShare = Tables["list_shares"]["Row"];
export type ListShareInsert = Tables["list_shares"]["Insert"];

export type ShareInvite = Tables["share_invites"]["Row"];

export type TodoWithRelations = Todo & {
  subtasks: Subtask[];
  todo_tags: (TodoTag & { tags: Tag })[];
};
