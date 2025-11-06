/**
 * Floating Panel Styles
 * Tailwind CSS class definitions for the floating panel components
 */

/**
 * Main panel container styles
 */
export const panelContainerStyles = {
  base: 'fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm bg-opacity-95 transition-all duration-300 ease-out',
  minimized: 'w-80 h-14',
  expanded: 'w-96 h-[600px]',
};

/**
 * Panel header (draggable) styles
 */
export const panelHeaderStyles = {
  base: 'bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors',
  title: 'font-semibold text-gray-900 text-sm',
  controls: 'flex gap-2',
  bellContainer: 'relative',
  bellIcon: 'w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors',
  notificationCount: 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium',
};

/**
 * Button styles
 */
export const buttonStyles = {
  base: 'p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
  icon: 'w-4 h-4 text-gray-500',
};

/**
 * Tab bar styles
 */
export const tabBarStyles = {
  base: 'flex border-b border-gray-100 bg-white',
  tab: 'flex-1 px-3 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-200 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
  tabActive: 'border-blue-600 text-blue-600 bg-blue-50',
};

/**
 * Tab content styles
 */
export const tabContentStyles = {
  base: 'flex-1 overflow-y-auto',
  empty: 'flex items-center justify-center h-full text-gray-500 text-sm',
};

/**
 * Item list styles
 */
export const itemListStyles = {
  base: 'divide-y divide-gray-200',
  item: 'p-3 hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
  itemHover: 'hover:bg-blue-50',
};

/**
 * Notification item styles
 */
export const notificationItemStyles = {
  container: 'flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
  avatar: 'flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm',
  content: 'flex-1 min-w-0',
  title: 'font-medium text-gray-900 text-sm leading-tight',
  message: 'text-gray-600 text-sm mt-0.5 line-clamp-2 leading-relaxed',
  timestamp: 'text-gray-400 text-xs mt-2',
  badge: 'inline-block px-2 py-1 rounded-full text-xs font-medium',
  badgeInfo: 'bg-blue-100 text-blue-800',
  badgeWarning: 'bg-yellow-100 text-yellow-800',
  badgeError: 'bg-red-100 text-red-800',
  badgeSuccess: 'bg-green-100 text-green-800',
  unreadIndicator: 'flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2',
};

/**
 * Reminder item styles
 */
export const reminderItemStyles = {
  container: 'flex gap-3 items-start',
  checkbox: 'flex-shrink-0 w-5 h-5 mt-0.5 cursor-pointer',
  content: 'flex-1 min-w-0',
  title: 'font-medium text-gray-900 text-sm',
  description: 'text-gray-600 text-sm mt-1',
  meta: 'flex gap-2 mt-2 text-xs text-gray-500',
  dueDate: 'flex items-center gap-1',
  priority: 'inline-block px-2 py-0.5 rounded text-xs font-medium',
  priorityLow: 'bg-gray-100 text-gray-800',
  priorityMedium: 'bg-yellow-100 text-yellow-800',
  priorityHigh: 'bg-red-100 text-red-800',
};

/**
 * Task item styles
 */
export const taskItemStyles = {
  container: 'flex gap-3 items-start',
  statusIndicator: 'flex-shrink-0 w-4 h-4 mt-1 rounded-full',
  statusOpen: 'bg-gray-300',
  statusInProgress: 'bg-blue-500',
  statusCompleted: 'bg-green-500',
  statusBlocked: 'bg-red-500',
  content: 'flex-1 min-w-0',
  title: 'font-medium text-gray-900 text-sm',
  description: 'text-gray-600 text-sm mt-1 line-clamp-2',
  meta: 'flex gap-2 mt-2 text-xs text-gray-500',
  priority: 'inline-block px-2 py-0.5 rounded text-xs font-medium',
  priorityLow: 'bg-gray-100 text-gray-800',
  priorityMedium: 'bg-yellow-100 text-yellow-800',
  priorityHigh: 'bg-red-100 text-red-800',
};

/**
 * Accessibility styles
 */
export const a11yStyles = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500',
  srOnly: 'sr-only',
};

/**
 * Animation styles
 */
export const animationStyles = {
  slideIn: 'animate-in slide-in-from-bottom duration-200',
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
};

/**
 * Responsive styles
 */
export const responsiveStyles = {
  panelMobile: 'w-80 h-96',
  panelTablet: 'w-96 h-96',
  panelDesktop: 'w-96 h-96',
};

/**
 * Utility function to combine styles
 */
export function combineStyles(...styles: (string | undefined)[]): string {
  return styles.filter(Boolean).join(' ');
}

/**
 * Get notification badge color based on type
 */
export function getNotificationBadgeClass(type: string): string {
  switch (type) {
    case 'warning':
      return notificationItemStyles.badgeWarning;
    case 'error':
      return notificationItemStyles.badgeError;
    case 'success':
      return notificationItemStyles.badgeSuccess;
    case 'info':
    default:
      return notificationItemStyles.badgeInfo;
  }
}

/**
 * Get priority badge color based on priority level
 */
export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status indicator color based on task status
 */
export function getStatusIndicatorClass(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'blocked':
      return 'bg-red-500';
    case 'open':
    default:
      return 'bg-gray-300';
  }
}
