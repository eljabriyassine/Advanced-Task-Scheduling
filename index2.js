// Import the tasks and developers from the data module
const { tasks, developers } = require("./data");

function assignTasksWithPriorityAndDependencies(developers, tasks) {
  // Initialize the result array and a map to track assigned hours per developer
  const developerTasks = developers.map((dev) => ({
    ...dev,
    assignedTasks: [],
    totalHours: 0,
  }));
  const unassignedTasks = [];
  const completedTasks = new Set();

  // Helper function to check if all dependencies are met
  function canAssignTask(task) {
    return task.dependencies.every((dep) => completedTasks.has(dep));
  }

  // Step 2: Sort tasks by priority (high to low) and then by difficulty (low to high)
  const sortedTasks = tasks.sort((a, b) => {
    if (b.priority === a.priority) {
      return a.difficulty - b.difficulty; // lower difficulty first
    }
    return b.priority - a.priority; // higher priority first
  });

  // Assign tasks to developers
  assignTasksToDevelopers(
    sortedTasks,
    developerTasks,
    unassignedTasks,
    completedTasks,
    canAssignTask
  );

  return {
    developers: developerTasks,
    unassignedTasks: unassignedTasks,
  };
}

function assignTasksToDevelopers(
  sortedTasks,
  developerTasks,
  unassignedTasks,
  completedTasks,
  canAssignTask
) {
  for (const task of sortedTasks) {
    if (!canAssignTask(task)) {
      // If dependencies are not met, add task to unassigned list
      unassignedTasks.push(task);
      continue;
    }

    // Find a suitable developer
    const suitableDeveloper = developerTasks.find(
      (dev) =>
        dev.maxHours >= task.hoursRequired &&
        dev.skillLevel >= task.difficulty &&
        dev.preferredTaskType === task.taskType
    );

    if (suitableDeveloper) {
      // Assign task to the developer
      suitableDeveloper.assignedTasks.push(task.taskName);
      suitableDeveloper.totalHours += task.hoursRequired;
      suitableDeveloper.maxHours -= task.hoursRequired;
      completedTasks.add(task.taskName); // Mark task as completed
    } else {
      // If no suitable developer found, add task to unassigned list
      unassignedTasks.push(task);
    }
  }
}

// Call the function and log the result
const result = assignTasksWithPriorityAndDependencies(developers, tasks);
console.log(JSON.stringify(result, null, 2));
