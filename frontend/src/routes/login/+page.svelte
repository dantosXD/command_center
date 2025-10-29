<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let isSignUp = false;
  let errorMessage = '';
  let loading = false;

  // Redirect if already authenticated
  onMount(() => {
    const unsubscribe = authStore.subscribe(($auth) => {
      if ($auth.user && !$auth.loading) {
        goto('/hub');
      }
    });

    return unsubscribe;
  });

  async function handleSubmit() {
    errorMessage = '';
    loading = true;

    try {
      if (isSignUp) {
        await authStore.signUp(email, password);
        // After signup, redirect to hub (or show email verification message)
        goto('/hub');
      } else {
        await authStore.signIn(email, password);
        // After login, redirect to hub
        goto('/hub');
      }
    } catch (err: any) {
      errorMessage = err.message || 'Authentication failed';
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    errorMessage = '';
  }
</script>

<svelte:head>
  <title>{isSignUp ? 'Sign Up' : 'Sign In'} - Command Center</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Command Center
      </h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300">
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {isSignUp
          ? 'Get started with your unified productivity hub'
          : 'Sign in to access your hub'}
      </p>
    </div>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleSubmit} class="mt-8 space-y-6">
      <div class="rounded-md shadow-sm space-y-4">
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            disabled={loading}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete={isSignUp ? 'new-password' : 'current-password'}
            required
            bind:value={password}
            disabled={loading}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>
      </div>

      <!-- Error Message -->
      {#if errorMessage}
        <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-300">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if loading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {isSignUp ? 'Creating account...' : 'Signing in...'}
          {:else}
            {isSignUp ? 'Create account' : 'Sign in'}
          {/if}
        </button>
      </div>

      <!-- Toggle Sign Up / Sign In -->
      <div class="text-center">
        <button
          type="button"
          on:click={toggleMode}
          disabled={loading}
          class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>

    <!-- Footer -->
    <div class="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
      <p>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  </div>
</div>

<style>
  /* Add any additional styles here if needed */
</style>
