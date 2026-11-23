<script setup lang="ts">
interface BreadcrumbItem {
    label: string
    path?: string  // if there are no path -> current page
}

const props = defineProps<{
    items: BreadcrumbItem[]
}>()
</script>
<template>
<nav aria-label="breadcrumb">
    <ol class="breadcrumb ps-3 pt-2 fw-bold">
        <li v-for="(item, index) in items" :key="index" :class="index === items.length - 1 ? 'breadcrumb-item active' : 'breadcrumb-item'">
            <RouterLink v-if="item.path" :to="item.path">{{ item.label }}</RouterLink>
            <span v-else>{{ item.label }}</span>
        </li>
    </ol>
</nav>
</template>
<style scoped>
.breadcrumb {
    color: #198754;
    margin-top: 4px;
    margin-left: 40px;
}

.breadcrumb-item a {
    color: #198754;
    text-decoration: none;
}

.breadcrumb-item a:hover {
    color: #146c43;
}

.breadcrumb-item.active {
    color: #198754;
}
</style>