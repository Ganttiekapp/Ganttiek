# 🍌 Bananas Gantt Chart Library 🍌

The ultimate, full-featured Gantt chart library built from scratch with Svelte! This library provides everything you need to create professional, interactive Gantt charts with advanced features.

## ✨ Features

### 🚀 Core Features
- **Advanced Timeline Calculations** - Precise date handling with working days support
- **Critical Path Analysis** - Automatic identification of critical tasks
- **Dependency Management** - Support for all dependency types (FS, SS, FF, SF)
- **Resource Allocation** - Assign and manage resources across tasks
- **Interactive Drag & Drop** - Resize tasks, move them, create dependencies
- **Multiple Time Scales** - Hour, day, week, month, quarter, year views
- **Zoom & Pan** - Navigate large projects with ease

### 🎨 Visual Features
- **Multiple Themes** - Default, Dark, Colorful themes included
- **Progress Visualization** - Visual progress bars within tasks
- **Status Indicators** - Color-coded task status (todo, in-progress, completed, blocked)
- **Milestone Support** - Special diamond markers for milestones
- **Grid System** - Professional grid layout with customizable styling
- **Responsive Design** - Works on desktop, tablet, and mobile

### 🔧 Advanced Features
- **Undo/Redo System** - Full history tracking with keyboard shortcuts
- **Export Capabilities** - Export to SVG, PNG formats
- **Context Menus** - Right-click actions for quick task management
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Multi-Select** - Select and manage multiple tasks
- **Performance Optimization** - Handles large datasets efficiently
- **Event System** - Comprehensive event handling for custom integrations

## 📦 Installation

The library is already included in your project! Simply import the components:

```javascript
import { BananasGantt, GanttEngine, GanttRenderer, GanttInteractions } from '$lib/gantt/index.js';
```

## 🚀 Quick Start

### Basic Usage

```svelte
<script>
  import { BananasGantt } from '$lib/gantt/index.js';
  
  let tasks = [
    {
      id: 'task-1',
      name: 'Project Planning',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-15'),
      progress: 75,
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: 'task-2',
      name: 'Development',
      startDate: new Date('2024-01-16'),
      endDate: new Date('2024-02-15'),
      progress: 25,
      status: 'todo',
      priority: 'medium'
    }
  ];
</script>

<BananasGantt 
  {tasks}
  theme="default"
  width={1200}
  height={600}
  enableInteractions={true}
  showCriticalPath={true}
  showDependencies={true}
  showProgress={true}
  enableExport={true}
  enableUndoRedo={true}
/>
```

### Advanced Usage with Dependencies

```svelte
<script>
  import { BananasGantt, DependencyTypes } from '$lib/gantt/index.js';
  
  let tasks = [
    {
      id: 'task-1',
      name: 'Design Phase',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-15'),
      progress: 100,
      status: 'completed'
    },
    {
      id: 'task-2',
      name: 'Development Phase',
      startDate: new Date('2024-01-16'),
      endDate: new Date('2024-02-15'),
      progress: 50,
      status: 'in_progress'
    }
  ];
  
  let dependencies = [
    {
      from: 'task-1',
      to: 'task-2',
      type: DependencyTypes.FINISH_TO_START,
      lag: 0
    }
  ];
</script>

<BananasGantt 
  {tasks}
  {dependencies}
  theme="dark"
  showCriticalPath={true}
  showDependencies={true}
  on:taskClick={(event) => console.log('Task clicked:', event.detail)}
  on:dependencyCreated={(event) => console.log('Dependency created:', event.detail)}
/>
```

## 🎛️ Component Props

### BananasGantt Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | Array | `[]` | Array of task objects |
| `dependencies` | Array | `[]` | Array of dependency objects |
| `resources` | Array | `[]` | Array of resource objects |
| `theme` | String | `'default'` | Theme name ('default', 'dark', 'colorful') |
| `width` | Number | `1200` | Chart width in pixels |
| `height` | Number | `600` | Chart height in pixels |
| `enableInteractions` | Boolean | `true` | Enable drag/drop and interactions |
| `showCriticalPath` | Boolean | `true` | Show critical path highlighting |
| `showDependencies` | Boolean | `true` | Show dependency arrows |
| `showProgress` | Boolean | `true` | Show progress bars |
| `showResources` | Boolean | `true` | Show resource information |
| `enableExport` | Boolean | `true` | Enable export functionality |
| `enableUndoRedo` | Boolean | `true` | Enable undo/redo system |

## 📊 Task Object Structure

```javascript
{
  id: 'unique-task-id',           // Required: Unique identifier
  name: 'Task Name',              // Required: Display name
  description: 'Task description', // Optional: Detailed description
  startDate: new Date(),          // Required: Start date
  endDate: new Date(),            // Required: End date
  progress: 50,                   // Optional: Progress percentage (0-100)
  status: 'in_progress',          // Optional: 'todo', 'in_progress', 'completed', 'blocked'
  priority: 'high',               // Optional: 'low', 'medium', 'high', 'critical'
  resourceId: 'resource-1',       // Optional: Assigned resource ID
  parentId: 'parent-task-id',     // Optional: Parent task for subtasks
  dependencies: ['dep-task-id'],  // Optional: Array of dependency IDs
  customFields: {}                // Optional: Custom data
}
```

## 🔗 Dependency Object Structure

```javascript
{
  id: 'unique-dep-id',            // Auto-generated: Unique identifier
  from: 'source-task-id',         // Required: Source task ID
  to: 'target-task-id',           // Required: Target task ID
  type: 'finish-to-start',        // Required: Dependency type
  lag: 0                          // Optional: Lag time in days
}
```

### Dependency Types

- `finish-to-start` (FS) - Task B starts when Task A finishes
- `start-to-start` (SS) - Task B starts when Task A starts
- `finish-to-finish` (FF) - Task B finishes when Task A finishes
- `start-to-finish` (SF) - Task B finishes when Task A starts

## 🎨 Themes

### Default Theme
Clean, professional look with blue accents and subtle shadows.

### Dark Theme
Dark mode with high contrast for low-light environments.

### Colorful Theme
Vibrant colors with sky blue accents for a more playful appearance.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all tasks |
| `Ctrl/Cmd + Z` | Undo last action |
| `Ctrl/Cmd + Y` | Redo last action |
| `Ctrl/Cmd + C` | Copy selected tasks |
| `Ctrl/Cmd + V` | Paste tasks |
| `Delete/Backspace` | Delete selected tasks |
| `Escape` | Clear selection |

## 🖱️ Mouse Interactions

### Task Bar Interactions
- **Click** - Select task
- **Double-click** - Edit task
- **Drag** - Move task to new dates
- **Resize** - Change task duration
- **Right-click** - Open context menu

### Timeline Interactions
- **Mouse wheel** - Zoom in/out
- **Middle mouse drag** - Pan timeline
- **Ctrl/Cmd + Click** - Multi-select tasks

## 📤 Export Features

### SVG Export
```javascript
const ganttComponent = document.querySelector('bananas-gantt');
const svgData = ganttComponent.exportSVG();
```

### PNG Export
```javascript
const ganttComponent = document.querySelector('bananas-gantt');
const pngData = await ganttComponent.exportPNG();
```

## 🎯 Events

The component emits various events for custom handling:

```svelte
<BananasGantt 
  {tasks}
  on:taskClick={(event) => handleTaskClick(event.detail)}
  on:taskUpdated={(event) => handleTaskUpdate(event.detail)}
  on:dependencyCreated={(event) => handleDependencyCreated(event.detail)}
  on:criticalPathCalculated={(event) => handleCriticalPath(event.detail)}
/>
```

### Available Events

- `taskClick` - Task clicked
- `taskHover` - Task hovered
- `taskAdded` - New task added
- `taskUpdated` - Task modified
- `taskDeleted` - Task removed
- `dependencyAdded` - Dependency created
- `dependencyRemoved` - Dependency deleted
- `criticalPathCalculated` - Critical path updated
- `dragStart` - Drag operation started
- `dragEnd` - Drag operation completed
- `resizeStart` - Resize operation started
- `resizeEnd` - Resize operation completed

## 🔧 Advanced Configuration

### Custom Options

```javascript
const options = {
  timeScale: 'day',                    // Time scale unit
  workingDays: [1, 2, 3, 4, 5],       // Working days (1=Monday)
  workingHours: { start: 9, end: 17 }, // Working hours
  holidays: ['2024-12-25'],            // Holiday dates
  rowHeight: 40,                       // Task row height
  headerHeight: 60,                    // Header height
  sidebarWidth: 250                    // Sidebar width
};
```

### Performance Optimization

For large datasets (1000+ tasks), consider:

```javascript
const options = {
  enableVirtualization: true,          // Enable virtual scrolling
  renderBatchSize: 50,                 // Tasks per render batch
  debounceRender: 16                   // Render debounce time (ms)
};
```

## 🧪 Testing

The library includes comprehensive tests:

```bash
npm run test:silent
```

## 🤝 Contributing

This is a custom-built library designed specifically for your project. To extend functionality:

1. **Add new features** to the appropriate class (`GanttEngine`, `GanttRenderer`, `GanttInteractions`)
2. **Create new themes** by adding them to `GanttThemes` in `index.js`
3. **Add new event types** by extending the event system
4. **Optimize performance** by improving the rendering pipeline

## 📝 License

This library is part of your project and follows the same license terms.

## 🎉 Conclusion

The Bananas Gantt Chart Library provides everything you need to create professional, interactive Gantt charts. With its comprehensive feature set, beautiful themes, and powerful interactions, it's the perfect solution for project management applications.

**Happy charting! 🍌📊**
