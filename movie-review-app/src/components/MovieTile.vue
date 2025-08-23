<script setup lang="ts">
import type { Movie } from '@/types/movie';

defineProps<{
    movie: Movie
    averageRating?: string
}>();

</script>

<template>
    <div>
        <div class="flex justify-center items-center space-x-1 overflow-hidden">
            <strong class="truncate max-w-70 text-center">
                {{ movie.Title }}
            </strong>
            <span v-if="movie.Year" class="shrink-0">
                ({{ movie.Year }})
            </span>
        </div>
        <p v-if="movie.Director">Director: {{ movie.Director }}</p>
        <p v-if="movie.Genre">Genre: {{ movie.Genre }}</p>
        <p v-if="movie.averageRating" class="text-highlight">★ {{ movie.averageRating == 0 ? 'No Rating' :
            movie.averageRating }}</p>
        <div class="flex aspect-w-2 aspect-h-3 w-full max-w-2xs bg-secondary items-center text-xs">
            <img src="@/assets/image.png" alt="Film Icon" class="w-full" />
        </div>
    </div>
</template>