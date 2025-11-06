<script lang="ts">
	import { onMount } from 'svelte';
	import { Bell, Clock, CheckSquare, ChevronDown, ChevronUp, X, Settings } from 'lucide-svelte';

	interface Notification {
		id: string;
		title: string;
		content: string;
		timestamp: string;
		read: boolean;
		type: 'info' | 'warning' | 'error' | 'success';
		source?: string;
		actionUrl?: string;
		actionLabel?: string;
	}

	interface Reminder {
		id: string;
		title: string;
		dueDate: string;
		completed: boolean;
		priority: 'low' | 'medium' | 'high';
	}

	interface Task {
		id: string;
		title: string;
		status: 'open' | 'in-progress' | 'completed' | 'blocked';
		priority: 'low' | 'medium' | 'high';
	}

	let activeTab: 'notifications' | 'reminders' | 'tasks' = 'notifications';
	let minimized = false;
	let position = { x: 20, y: 20 };
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };
	let isPreferencesOpen = false;

	function toggleMinimize() {
		minimized = !minimized;
		// Save state to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('floatingPanelMinimized', JSON.stringify(minimized));
		}
	}

	let notifications: Notification[] = [
		{
			id: '1',
			title: 'Welcome to Command Center',
			content: 'Your floating panel is ready to use with the new Novu-inspired design',
			timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
			read: false,
			type: 'info',
			source: 'System'
		},
		{
			id: '2',
			title: 'New feature available',
			content: 'Check out the preferences modal to customize your notification settings',
			timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
			read: false,
			type: 'info',
			source: 'Product Team'
		}
	];

	let reminders: Reminder[] = [
		{
			id: '1',
			title: 'Team Meeting',
			dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
			completed: false,
			priority: 'high'
		}
	];

	let tasks: Task[] = [
		{
			id: '1',
			title: 'Review new notifications',
			status: 'open',
			priority: 'medium'
		}
	];

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		dragOffset.x = e.clientX - position.x;
		dragOffset.y = e.clientY - position.y;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;

		position.x = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 384));
		position.y = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 600));
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleTabClick(tab: 'notifications' | 'reminders' | 'tasks') {
		console.log('handleTabClick called with:', tab);
		activeTab = tab;
		console.log('activeTab set to:', activeTab);
		// Ensure focus is set for keyboard navigation (especially Firefox)
		setTimeout(() => {
			const activeTabElement = document.querySelector('[role="tab"][aria-selected="true"]');
			if (activeTabElement instanceof HTMLElement) {
				activeTabElement.focus();
			}
		}, 0);
	}

	function markNotificationAsRead(id: string) {
		notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
	}

	function toggleReminderComplete(id: string) {
		reminders = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
	}

	function updateTaskStatus(id: string, status: Task['status']) {
		tasks = tasks.map((t) => (t.id === id ? { ...t, status } : t));
	}

	// Format relative time like Novu
	function formatRelativeTime(timestamp: string): string {
		const now = new Date();
		const time = new Date(timestamp);
		const diffMs = now.getTime() - time.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		
		return time.toLocaleDateString();
	}

	// Get avatar initials like Novu
	function getAvatarInitials(title: string, source?: string): string {
		const text = source || title;
		const words = text.trim().split(/\s+/);
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return text.slice(0, 2).toUpperCase();
	}

	// Get notification counts for tabs
	$: unreadNotifications = notifications.filter(n => !n.read).length;
	$: activeReminders = reminders.filter(r => !r.completed).length;
	$: activeTasks = tasks.filter(t => t.status !== 'completed').length;

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		// Load state from localStorage
		const savedMinimized = localStorage.getItem('floatingPanelMinimized');
		if (savedMinimized !== null) {
			minimized = JSON.parse(savedMinimized);
		}

		// Expose handlers globally for testing purposes
		(window as any).__handleTabClick = handleTabClick;
		(window as any).__toggleMinimize = toggleMinimize;

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800';
			case 'low':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'open':
				return 'bg-gray-300';
			case 'in-progress':
				return 'bg-blue-500';
			case 'completed':
				return 'bg-green-500';
			case 'blocked':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
	class="fixed rounded-xl shadow-2xl border border-gray-100 bg-white bg-opacity-95 backdrop-blur-sm z-50 transition-all duration-300 ease-out"
	style="left: {position.x}px; top: {position.y}px; width: {minimized ? '320px' : '384px'}; height: {minimized ? '56px' : '600px'};"
	role="region"
	aria-label="Floating panel with notifications, reminders, and tasks"
>
	<!-- Header -->
	<div
		class="bg-white border-b border-gray-100 px-4 py-3 rounded-t-xl flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors"
		on:mousedown={handleMouseDown}
		role="banner"
		aria-label="Panel header - drag to move"
	>
		<!-- Bell Icon with Notification Count -->
		<div class="relative">
			<Bell class="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
			{#if unreadNotifications > 0}
				<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
					{unreadNotifications > 99 ? '99+' : unreadNotifications}
				</span>
			{/if}
		</div>

		<h2 class="text-sm font-semibold text-gray-900">Notifications</h2>
		
		<div class="flex gap-2">
			<button
				on:click={toggleMinimize}
				on:keydown={(e) => e.key === 'Enter' && toggleMinimize()}
				class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
				aria-label={minimized ? 'Expand panel' : 'Minimize panel'}
				title={minimized ? 'Expand' : 'Minimize'}
			>
				{#if minimized}
					<ChevronUp size={16} class="text-gray-500" />
				{:else}
					<ChevronDown size={16} class="text-gray-500" />
				{/if}
			</button>
			<button
				on:keydown={(e) => e.key === 'Enter' && (minimized = !minimized)}
				class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
				aria-label="Close panel"
				title="Close"
			>
				<X size={16} class="text-gray-500" />
			</button>
			<button
				on:click={() => isPreferencesOpen = true}
				class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
				aria-label="Notification preferences"
				title="Preferences"
			>
				<Settings size={16} class="text-gray-500" />
			</button>
		</div>
	</div>

	{#if !minimized}
		<!-- Tab Bar -->
		<div class="flex border-b border-gray-100 bg-white" role="tablist" aria-label="Panel tabs">
			<button
				on:mousedown={() => handleTabClick('notifications')}
				on:keydown={(e) => {
					if (e.key === 'Enter') handleTabClick('notifications');
					if (e.key === 'ArrowRight') handleTabClick('reminders');
					if (e.key === 'ArrowLeft') handleTabClick('tasks');
				}}
				class="flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all duration-200 {activeTab ===
				'notifications'
					? 'border-blue-600 text-blue-600 bg-blue-50'
					: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'}"
				role="tab"
				aria-selected={activeTab === 'notifications'}
				aria-label="Notifications tab"
			>
				<div class="flex items-center justify-center gap-2">
					<Bell size={16} />
					<span class="hidden sm:inline">Notifications</span>
					{#if unreadNotifications > 0}
						<span class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
							{unreadNotifications > 99 ? '99+' : unreadNotifications}
						</span>
					{/if}
				</div>
			</button>
			<button
				on:mousedown={() => handleTabClick('reminders')}
				on:click={() => handleTabClick('reminders')}
				on:keydown={(e) => {
					if (e.key === 'Enter') handleTabClick('reminders');
					if (e.key === 'ArrowRight') handleTabClick('tasks');
					if (e.key === 'ArrowLeft') handleTabClick('notifications');
				}}
				class="flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all duration-200 {activeTab ===
				'reminders'
					? 'border-blue-600 text-blue-600 bg-blue-50'
					: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'}"
				role="tab"
				aria-selected={activeTab === 'reminders'}
				aria-label="Reminders tab"
			>
				<div class="flex items-center justify-center gap-2">
					<Clock size={16} />
					<span class="hidden sm:inline">Reminders</span>
					{#if activeReminders > 0}
						<span class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
							{activeReminders > 99 ? '99+' : activeReminders}
						</span>
					{/if}
				</div>
			</button>
			<button
				on:mousedown={() => handleTabClick('tasks')}
				on:click={() => handleTabClick('tasks')}
				on:keydown={(e) => {
					if (e.key === 'Enter') handleTabClick('tasks');
					if (e.key === 'ArrowRight') handleTabClick('notifications');
					if (e.key === 'ArrowLeft') handleTabClick('reminders');
				}}
				class="flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all duration-200 {activeTab ===
				'tasks'
					? 'border-blue-600 text-blue-600 bg-blue-50'
					: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'}"
				role="tab"
				aria-selected={activeTab === 'tasks'}
				aria-label="Tasks tab"
			>
				<div class="flex items-center justify-center gap-2">
					<CheckSquare size={16} />
					<span class="hidden sm:inline">Tasks</span>
					{#if activeTasks > 0}
						<span class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
							{activeTasks > 99 ? '99+' : activeTasks}
						</span>
					{/if}
				</div>
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto">
			{#if activeTab === 'notifications'}
				<div role="region" aria-label="Notifications list">
					{#if notifications.length === 0}
						<div class="flex items-center justify-center h-full">
							<div class="text-center">
								<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
									</svg>
								</div>
								<p class="text-gray-500 text-sm font-medium">All caught up!</p>
								<p class="text-gray-400 text-xs mt-1">No new notifications</p>
							</div>
						</div>
					{:else}
						<ul class="divide-y divide-gray-100">
							{#each notifications as notification (notification.id)}
								<li
									class="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 {!notification.read ? 'bg-blue-50/30' : ''}"
									on:click={() => markNotificationAsRead(notification.id)}
									on:keydown={(e) => e.key === 'Enter' && markNotificationAsRead(notification.id)}
									role="button"
									tabindex="0"
									aria-label="Notification: {notification.title}"
								>
									<!-- Avatar -->
									<div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
										{getAvatarInitials(notification.title, notification.source)}
									</div>

									<!-- Content -->
									<div class="flex-1 min-w-0">
										<h3 class="font-medium text-gray-900 text-sm leading-tight">{notification.title}</h3>
										<p class="text-gray-600 text-sm mt-0.5 line-clamp-2 leading-relaxed">{notification.content}</p>
										<p class="text-gray-400 text-xs mt-2">{formatRelativeTime(notification.timestamp)}</p>
										
										{#if notification.actionUrl}
											<a
												href={notification.actionUrl}
												class="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block font-medium"
												on:click|stopPropagation
											>
												{notification.actionLabel || 'View'}
											</a>
										{/if}
									</div>

									<!-- Unread Indicator -->
									{#if !notification.read}
										<div class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" aria-label="Unread"></div>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{:else if activeTab === 'reminders'}
				<div role="region" aria-label="Reminders list">
					{#if reminders.length === 0}
						<div class="p-4 text-center text-gray-500">No reminders</div>
					{:else}
						<ul class="divide-y divide-gray-200">
							{#each reminders as reminder (reminder.id)}
								<li class="p-3 hover:bg-gray-50 transition-colors">
									<div class="flex gap-3">
										<input
											type="checkbox"
											checked={reminder.completed}
											on:change={() => toggleReminderComplete(reminder.id)}
											class="mt-1"
											aria-label="Mark {reminder.title} as complete"
										/>
										<div class="flex-1">
											<h3
												class="text-sm font-medium {reminder.completed
													? 'line-through text-gray-500'
													: 'text-gray-900'}"
											>
												{reminder.title}
											</h3>
											<div class="flex gap-2 mt-2">
												<span class="text-xs text-gray-500">
													📅 {new Date(reminder.dueDate).toLocaleDateString()}
												</span>
												<span class="text-xs px-2 py-1 rounded {getPriorityColor(reminder.priority)}">
													{reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
												</span>
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{:else if activeTab === 'tasks'}
				<div role="region" aria-label="Tasks list">
					{#if tasks.length === 0}
						<div class="p-4 text-center text-gray-500">No tasks</div>
					{:else}
						<ul class="divide-y divide-gray-200">
							{#each tasks as task (task.id)}
								<li class="p-3 hover:bg-gray-50 transition-colors">
									<div class="flex gap-3">
										<div
											class="flex-shrink-0 w-3 h-3 rounded-full mt-1 {getStatusColor(task.status)}"
											aria-label="Status: {task.status}"
										></div>
										<div class="flex-1">
											<h3 class="text-sm font-medium text-gray-900">{task.title}</h3>
											<div class="flex gap-2 mt-2">
												<select
													value={task.status}
													on:change={(e) =>
														updateTaskStatus(task.id, e.currentTarget.value as Task['status'])}
													class="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
													aria-label="Change status for {task.title}"
												>
													<option value="open">Open</option>
													<option value="in-progress">In Progress</option>
													<option value="completed">Completed</option>
													<option value="blocked">Blocked</option>
												</select>
												<span class="text-xs px-2 py-1 rounded {getPriorityColor(task.priority)}">
													{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
												</span>
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Preferences Modal -->
{#if isPreferencesOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
			on:click={() => isPreferencesOpen = false}
		></div>
		
		<!-- Modal -->
		<div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h2 class="text-lg font-semibold text-gray-900">Notification Preferences</h2>
				<button
					on:click={() => isPreferencesOpen = false}
					class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
					aria-label="Close preferences"
				>
					<X size={20} class="text-gray-500" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="px-6 py-4 overflow-y-auto max-h-[60vh]">
				<div class="space-y-6">
					<!-- Email Notifications -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<h3 class="font-medium text-gray-900">Email Notifications</h3>
								<p class="text-sm text-gray-500">Receive updates via email</p>
							</div>
						</div>
						<label class="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" class="sr-only peer" checked />
							<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>

					<!-- In-App Notifications -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</div>
							<div>
								<h3 class="font-medium text-gray-900">In-App Notifications</h3>
								<p class="text-sm text-gray-500">Show notifications in the app</p>
							</div>
						</div>
						<label class="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" class="sr-only peer" checked />
							<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
				</div>
			</div>
			
			<!-- Footer -->
			<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
				<button
					on:click={() => isPreferencesOpen = false}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
				<button
					on:click={() => isPreferencesOpen = false}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
				>
					Save Changes
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>
