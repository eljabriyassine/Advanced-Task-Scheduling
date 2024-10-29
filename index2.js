const { developers, tasks } = require("./data");

function assignTasksWithPriorityAndDependencies(developers = [], tasks) {
  try {
    // Validate input data
    if (!Array.isArray(developers) || !Array.isArray(tasks)) {
      throw new Error("Invalid input: developers and tasks must be arrays.");
    }
    if (developers.length === 0 || tasks.length === 0) {
      throw new Error("Invalid input: the length should be superior than 0");
    }

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

    const sortedTasks = tasks.sort((a, b) => {
      // Check if either task has dependencies
      const aHasDependencies = a.dependencies.length > 0;
      const bHasDependencies = b.dependencies.length > 0;

      // If task a has dependencies and task b does not, task b should come first
      if (aHasDependencies && !bHasDependencies) return 1;

      // If task b has dependencies and task a does not, task a should come first
      if (!aHasDependencies && bHasDependencies) return -1;

      if (b.priority === a.priority) {
        return a.difficulty - b.difficulty; // lower difficulty first
      }

      return b.priority - a.priority; // higher priority first
    });

    // Assign tasks to developers
    for (const task of sortedTasks) {
      if (!canAssignTask(task)) {
        // If dependencies are not met, add task to unassigned list
        unassignedTasks.push(task);
        continue;
      }

      // Find a suitable developer
      const suitableDeveloper = developerTasks.find(
        (dev) =>
          dev.maxHours - dev.totalHours >= task.hoursRequired &&
          dev.skillLevel >= task.difficulty &&
          dev.preferredTaskType === task.taskType
      );

      if (suitableDeveloper) {
        // Assign task to the developer
        suitableDeveloper.assignedTasks.push(task.taskName);
        suitableDeveloper.totalHours += task.hoursRequired;
        completedTasks.add(task.taskName);
      } else {
        // If no suitable developer found, add task to unassigned list
        unassignedTasks.push(task);
      }
    }

    return {
      developers: developerTasks,
      unassignedTasks: unassignedTasks,
    };
  } catch (error) {
    console.error("An error occurred during task assignment:", error.message);
    return {
      developers: [],
      unassignedTasks: [],
      error: error.message,
    };
  }
}

// Call the function and log the result
const result = assignTasksWithPriorityAndDependencies(developers, tasks);
console.log(JSON.stringify(result, null, 2));
