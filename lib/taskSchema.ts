import { z } from "zod"

export const TaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(1),
  context: z.string().nullable().default(null),
  requester: z.string().nullable().default(null),
  project: z.string().nullable().default(null),
  category: z.enum(["Operacao", "Financeiro", "Comercial", "TI", "Compras", "Outro"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        owner: z.string().nullable().default(null),
      })
    )
    .default([]),
  questions: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
})

export type TaskDTO = z.infer<typeof TaskSchema>
