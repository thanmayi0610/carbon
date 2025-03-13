import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

type Reminder = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
};

const reminders: Reminder[] = []; 

// post
app.post("/reminders", async (context) => {
  try {
    const body: Reminder = await context.req.json();

    
    if (
      !body.id ||
      !body.title ||
      !body.description ||
      !body.dueDate ||
      typeof body.isCompleted !== "boolean"
    ) {
      return context.json({ error: "Missing or invalid fields" }, 400);
    }

    reminders.push(body);
    console.log("Reminder added:", body); // Debugging log
    return context.json({ message: "Reminder created successfully", reminder: body }, 201);
  } catch (error) {
    return context.json({ error: "Invalid JSON format" }, 400);
  }
});

app.get("/reminders/completed", (context) => {
  console.log("Reminders:", reminders);
  const completedReminders = reminders.filter((r) => r.isCompleted === true);
  console.log("Completed Reminders before filtering:", reminders.filter((r) => r.isCompleted));
  console.log("Completed Reminders:", completedReminders);
  if (completedReminders.length === 0) {
    return context.json({ error: "No completed reminders found" }, 404);
  }
  return context.json(completedReminders, 200);
});
app.get('/reminders/not-completed', (context) => {
  const incompletedReminders = reminders.filter((r) => r.isCompleted === false);
  
  if (incompletedReminders.length === 0) {
    return context.json({ error: 'No incompleted reminders found' }, 404);
  }
  
  return context.json(incompletedReminders);
}
);
// Get reminders due today
app.get("/reminders/due-today", (c) => {
  const todayDateString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dueTodayReminders = reminders.filter(
    (reminder) => reminder.dueDate >= todayDateString && reminder.isCompleted === false
  );
  if (dueTodayReminders.length === 0) {
    return c.json({ message: "No reminders due today" });
    }
  return c.json(dueTodayReminders,200);
});
//by id
app.get("/reminders/:id", (context) => {
  const id = context.req.param("id");
  console.log("Searching for ID:", id); // Debugging log

  const reminder = reminders.find((r) => r.id === id);
  if (!reminder) {
    console.log("Reminder not found for ID:", id); // Log if not found
    return context.json({ error: "Reminder not found" }, 404);
  }

  console.log("Reminder found:", reminder); // Log found reminder
  return context.json(reminder, 200);
});

app.get("/reminders", (context) => {
  if (reminders.length === 0) {
    return context.json({ error: "No reminders found" }, 404);
  }
  return context.json(reminders, 200);
});
app.patch("/reminders/:id", async (context) => {
  const id = context.req.param("id");
  const body = await context.req.json();

  const reminder = reminders.find((r) => r.id === id);
  if (!reminder) {
    return context.json({ error: "Reminder not found" }, 404);
  }

  if (
    (body.title && typeof body.title !== "string") ||
    (body.description && typeof body.description !== "string") ||
    (body.dueDate && typeof body.dueDate !== "string") ||
    (body.isCompleted !== undefined && typeof body.isCompleted !== "boolean")
  ) {
    return context.json({ error: "Invalid field types" }, 400);
  }

  // Update fields if provided
  if (body.title) reminder.title = body.title;
  if (body.description) reminder.description = body.description;
  if (body.dueDate) reminder.dueDate = body.dueDate;
  if (body.isCompleted !== undefined) reminder.isCompleted = body.isCompleted;

  return context.json({ message: "Reminder updated successfully", reminder }, 200);
});
app.delete("/reminders/:id", (context) => {
  const id = context.req.param("id");
  const index = reminders.findIndex((r) => r.id === id);

  if (index === -1) {
    return context.json({ error: "Reminder not found" }, 404);
  }

  reminders.splice(index, 1);
  return context.json({ message: "Reminder deleted successfully" }, 200);
});
app.post("/reminders/:id/mark-completed", (context) => {
  const id = context.req.param("id");
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return context.json({ error: "Reminder not found" }, 404);
  }

  reminder.isCompleted = true;
  return context.json({ message: "Reminder marked as completed", reminder }, 200);
});
app.post("/reminders/:id/unmark-completed", (context) => {
  const id = context.req.param("id");
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return context.json({ error: "Reminder not found" }, 404);
  }

  reminder.isCompleted = false;
  return context.json({ message: "Reminder unmarked as completed", reminder }, 200);
});



serve(app);
console.log("Server is running on http://localhost:3000");
