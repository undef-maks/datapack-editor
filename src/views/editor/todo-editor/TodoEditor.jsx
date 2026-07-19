import React, { useState } from "react";
import styles from "./TodoEditor.module.css";

export default function TodoEditor({ data, onChange }) {
  const tasks = data?.tasks || [];
  const meta = data?._meta || {};
  const [newTaskText, setNewTaskText] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [titleInput, setTitleInput] = useState(meta.title || "Список завдань датапаку");
  const [descInput, setDescInput] = useState(meta.description || "Контролюй розробку та фічі прямо в редакторі");

  const [draggedIndex, setDraggedIndex] = useState(null);

  // Зберігаємо ID таски, яку зараз редагуємо, та її тимчасовий текст
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTextInput, setTaskTextInput] = useState("");

  const updateMetaField = (field, value) => {
    onChange({
      ...data,
      _meta: {
        ...meta,
        [field]: value,
      },
    });
  };

  const updateTasks = (updatedTasks) => {
    onChange({
      ...data,
      tasks: updatedTasks,
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
    };

    updateTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    updateTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    updateTasks(updated);
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskTextInput(task.text);
  };

  const handleSaveTaskText = (id) => {
    if (!taskTextInput.trim()) {
      handleDeleteTask(id);
    } else {
      const updated = tasks.map((task) =>
        task.id === id ? { ...task, text: taskTextInput.trim() } : task
      );
      updateTasks(updated);
    }
    setEditingTaskId(null);
  };

  const handleDragStart = (index) => {
    // Не дозволяємо перетягувати, якщо в цей момент редагується текст таски
    if (editingTaskId !== null) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedTasks = [...tasks];
    const draggedItem = updatedTasks[draggedIndex];

    updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    updateTasks(updatedTasks);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={styles.todoEditorContainer}>
      <div className={styles.todoHeader}>
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              updateMetaField("title", titleInput);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditingTitle(false);
                updateMetaField("title", titleInput);
              }
            }}
            className={styles.todoHeaderInput}
            autoFocus
          />
        ) : (
          <h3 onClick={() => setIsEditingTitle(true)} className={styles.todoClickableTitle}>
            {titleInput}
          </h3>
        )}

        {isEditingDesc ? (
          <input
            type="text"
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            onBlur={() => {
              setIsEditingDesc(false);
              updateMetaField("description", descInput);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditingDesc(false);
                updateMetaField("description", descInput);
              }
            }}
            className={styles.todoDescInput}
            autoFocus
          />
        ) : (
          <p onClick={() => setIsEditingDesc(true)} className={styles.todoClickableDesc}>
            {descInput}
          </p>
        )}
      </div>

      <form onSubmit={handleAddTask} className={styles.todoInputForm}>
        <input
          type="text"
          placeholder="Що потрібно зробити?"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className={styles.todoInput}
        />
        <button type="submit" className={styles.todoAddBtn}>
          Додати
        </button>
      </form>

      <div className={styles.todoList}>
        {tasks.length === 0 ? (
          <div className={styles.todoEmpty}>
            <span className={styles.todoEmptyIcon}>🎉</span>
            <p>Усі завдання виконано або список порожній!</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`${styles.todoItem} ${task.done ? styles.done : ""} ${draggedIndex === index ? styles.dragging : ""}`}
              draggable={editingTaskId === null} // вимикаємо drag, якщо редагуємо текст
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.todoItemLeft}>
                <div className={styles.todoDragHandle} title="Перетягнути">⋮⋮</div>
                <label className={styles.todoCheckboxWrapper}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => handleToggleTask(task.id)}
                    className={styles.todoCheckbox}
                  />
                  <span className={styles.todoCustomCheck}></span>
                </label>

                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={taskTextInput}
                    onChange={(e) => setTaskTextInput(e.target.value)}
                    onBlur={() => handleSaveTaskText(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTaskText(task.id);
                    }}
                    className={styles.todoItemInput}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => handleStartEditTask(task)}
                    className={styles.todoText}
                    title="Клікніть для редагування"
                  >
                    {task.text}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className={styles.todoDeleteBtn}
                title="Видалити завдання"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className={styles.todoFooter}>
          {(() => {
            const completedCount = tasks.filter((t) => t.done).length;
            const percentage = Math.round((completedCount / tasks.length) * 100);
            return (
              <>
                <div className={styles.todoProgressText}>
                  <span>Прогрес розробки:</span>
                  <span>{completedCount} з {tasks.length} ({percentage}%)</span>
                </div>
                <div className={styles.todoProgressBar}>
                  <div className={styles.todoProgressFill} style={{ width: `${percentage}%` }}></div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
