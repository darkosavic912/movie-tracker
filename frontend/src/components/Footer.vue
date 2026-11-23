<script setup lang="ts">
 const datum = new Date().getFullYear() 
</script>
<template>
<footer class="bg-body-tertiary text-center py-4 mt-4 mb-5">
    <p style="font-size: 20px;"> &copy; {{ datum }} Movie Tracker. All rights reserved.</p>
</footer>
</template>