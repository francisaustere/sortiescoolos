<template>
  <div class="App mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-6 sm:py-10">
    <header class="App__Header flex flex-col gap-1">
      <h1 class="text-3xl font-black tracking-tight">🌅 {{ t("app.title") }}</h1>
      <p v-if="data" class="text-sm text-[var(--muted)]">{{ t("app.subtitle", { date: formatStamp(data.generatedAt) }) }}</p>
    </header>

    <nav class="App__Tabs flex gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-sm">
      <button
        v-for="tab in TABS"
        :key="tab"
        type="button"
        class="flex-1 rounded-full px-3 py-1.5 transition-colors"
        :class="activeTab === tab ? 'bg-ink text-white dark:bg-sand dark:text-ink' : 'hover:bg-[var(--bg)]'"
        @click="activeTab = tab">
        {{ t(`tabs.${tab}`) }}<span v-if="tab === 'watch' && data?.watch.length"> ({{ data.watch.length }})</span>
      </button>
    </nav>

    <p v-if="isLoading" class="text-[var(--muted)]">{{ t("app.loading") }}</p>
    <p v-else-if="error" class="text-brick">{{ t("app.error", { message: error }) }}</p>
    <main v-else-if="data">
      <AgendaView v-if="activeTab === 'agenda'" :data="data" />
      <WatchView v-else-if="activeTab === 'watch'" :posts="data.watch" />
      <SourcesView v-else :sources="data.sources" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import AgendaView from "@/components/views/AgendaView.vue";
import SourcesView from "@/components/views/SourcesView.vue";
import WatchView from "@/components/views/WatchView.vue";
import { useEvents } from "@/composables/useEvents";
import { formatStamp } from "@/utils/date.utils";

type Tab = "agenda" | "watch" | "sources";

const TABS: Tab[] = ["agenda", "watch", "sources"];

const { t } = useI18n();
const { data, error, isLoading } = useEvents();

const activeTab = ref<Tab>("agenda");
</script>
