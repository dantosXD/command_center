<script lang="ts">
  import { onMount } from 'svelte';

  let currentTime = '';

  onMount(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      currentTime = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    };
    updateTime();
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <div class="max-w-5xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-900 mb-4">
        Command Center
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Your unified productivity hub for work and life
      </p>
      <div class="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-lg text-sm font-medium">
        ✨ MVP Phase 2 - Ready to Use
      </div>
    </div>

    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- Tasks Card -->
      <a href="/tasks" class="group">
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Tasks</h3>
          <p class="text-gray-600 text-sm">Create, manage, and track your work with tasks, checklists, and subtasks</p>
          <div class="mt-4 text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Get started →
          </div>
        </div>
      </a>

      <!-- Calendar Card -->
      <a href="/calendar" class="group">
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Calendar</h3>
          <p class="text-gray-600 text-sm">Schedule events, manage meetings, and sync across your devices</p>
          <div class="mt-4 text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Get started →
          </div>
        </div>
      </a>

      <!-- Hub Card -->
      <a href="/(app)/hub" class="group">
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Hub</h3>
          <p class="text-gray-600 text-sm">Unified dashboard view of all your tasks, events, and activity</p>
          <div class="mt-4 text-green-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            Get started →
          </div>
        </div>
      </a>
    </div>

    <!-- Quick Start -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Keyboard Shortcuts -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 9a2 2 0 11-4 0 2 2 0 014 0z" />
              <path fill-rule="evenodd" d="M7.465 3.066A16.001 16.001 0 0110 3c3.318 0 6.318.886 8.535 2.316.851.502 1.573 1.113 2.122 1.781A3.001 3.001 0 0022 9c0 1.657-.672 3.157-1.757 4.243A3 3 0 0018 15H4a3 3 0 00-3-3c0-.464.08-.912.236-1.343.582-1.798 1.56-3.413 2.878-4.707A10 10 0 017.465 3.066zM3.066 7.465A8 8 0 016 6a6 6 0 016 6H4a1 1 0 00-1 1v6a1 1 0 001 1h14a1 1 0 001-1v-6a1 1 0 00-1-1h-2.5a4 4 0 00-3.84-2.5H7a4 4 0 00-3.84 2.5H3a1 1 0 00-1 1v6a1 1 0 001 1h2z" clip-rule="evenodd" />
            </svg>
            Keyboard Shortcuts
          </h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between"><span class="font-mono">Cmd+N</span><span>Create new task</span></div>
            <div class="flex justify-between"><span class="font-mono">Cmd+E</span><span>Edit task</span></div>
            <div class="flex justify-between"><span class="font-mono">Cmd+D</span><span>Delete task</span></div>
            <div class="flex justify-between"><span class="font-mono">Cmd+/</span><span>Show all shortcuts</span></div>
            <div class="flex justify-between"><span class="font-mono">Escape</span><span>Close dialogs</span></div>
          </div>
        </div>

        <!-- Features -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Features
          </h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div>✓ Real-time collaboration with your team</div>
            <div>✓ Works on desktop, mobile, and tablet</div>
            <div>✓ Comments and mentions support</div>
            <div>✓ Keyboard shortcuts for power users</div>
            <div>✓ Auto-syncs across all devices</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center">
      <a href="/tasks" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
        Open Tasks
      </a>
      <p class="text-gray-600 text-sm mt-4">
        Press <span class="font-mono bg-gray-100 px-2 py-1 rounded">Cmd+N</span> to create your first task
      </p>
    </div>
  </div>
</div>
