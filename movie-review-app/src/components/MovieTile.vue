<script setup lang="ts">
import type { Movie } from '@/types/movie';

defineProps<{
    movie: Movie
}>();

</script>

<template>
    <div>
        <strong>{{ movie.Title }}</strong>
        <span v-if="movie.Year"> ({{ movie.Year }})</span>
        <p v-if="movie.Director">Director: {{ movie.Director }}</p>
        <p v-if="movie.Genre">Genre: {{ movie.Genre }}</p>
        <div class="flex aspect-w-2 aspect-h-3 w-full max-w-2xs bg-secondary items-center text-xs">
            <img src="@/assets/image.png" alt="Film Icon" class="w-full" />
        </div>
    </div>
</template>