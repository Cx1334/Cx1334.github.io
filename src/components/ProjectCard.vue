<script setup>
import { ref } from 'vue';

const props = defineProps({
  project: { type: Object, required: true },
});

const isExpanded = ref(false);

function toggle() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <article class="project card">
    <div class="head">
      <div>
        <h3>{{ props.project.name }}</h3>
        <p class="tagline">{{ props.project.tagline }}</p>
      </div>
      <div class="head-meta">
        <span v-if="props.project.status === 'placeholder'" class="sample-badge">示例</span>
        <span v-if="props.project.period" class="period">{{ props.project.period }}</span>
      </div>
    </div>

    <div class="chips">
      <span v-for="tech in props.project.techStack" :key="tech" class="chip">{{ tech }}</span>
    </div>

    <ul v-if="props.project.highlights?.length" class="highlights">
      <li v-for="item in props.project.highlights" :key="item">
        <span class="hl-mark">▸</span>
        <span>{{ item }}</span>
      </li>
    </ul>

    <template v-if="props.project.description || props.project.role">
      <button class="toggle" type="button" @click="toggle">
        {{ isExpanded ? '收起详情' : '查看详情' }}
      </button>

      <div v-if="isExpanded" class="detail">
        <p v-if="props.project.description" class="description">{{ props.project.description }}</p>
        <p v-if="props.project.role" class="role"><strong>我的角色：</strong>{{ props.project.role }}</p>
        <p v-if="props.project.problem" class="field-line">
          <strong>解决的问题：</strong>{{ props.project.problem }}
        </p>
        <p v-if="props.project.result" class="field-line">
          <strong>成果：</strong>{{ props.project.result }}
        </p>
        <p v-if="props.project.links?.length" class="field-line links">
          <template v-for="link in props.project.links" :key="link">
            <a :href="link" target="_blank" rel="noopener noreferrer">{{ link }}</a>
          </template>
        </p>
      </div>
    </template>
  </article>
</template>

<style scoped>
.project {
  padding: 20px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

h3 {
  margin: 0;
  font-size: 18px;
}

.tagline {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ink-2);
}

.head-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.period {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-2);
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.sample-badge {
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 650;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.highlights {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlights li {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 14px;
}

.hl-mark {
  flex-shrink: 0;
  color: var(--accent);
  font-size: 12px;
}

.toggle {
  margin-top: 14px;
  padding: 6px 14px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

.detail {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
  font-size: 14px;
}

.detail p {
  margin: 0 0 10px;
}

.detail p:last-child {
  margin-bottom: 0;
}

.field-line {
  margin: 0 0 10px;
}

.links a {
  margin-right: 12px;
  word-break: break-all;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
</style>
