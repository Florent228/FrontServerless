<template>
  <div class="min-h-screen bg-gray-bg dark:bg-gray-900 animate-pulse">
    <!-- Header skeleton -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-24 flex items-center justify-between px-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div class="hidden md:flex space-x-6">
          <div v-for="i in 4" :key="i" class="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>

    <!-- Content skeleton -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Title skeleton -->
      <div class="mb-8">
        <div class="w-48 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div class="w-96 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      <!-- Cards skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div class="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div class="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <!-- Table header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="w-32 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>

        <!-- Table content -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="i in 5" :key="i" class="px-6 py-4">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div class="w-48 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composant skeleton pur sans logique
</script> 