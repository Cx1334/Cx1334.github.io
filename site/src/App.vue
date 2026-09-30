<script setup>
import { computed } from 'vue';
import profileData from '../content/profile.json';
import projectsData from '../content/projects.json';
import ProjectCard from './components/ProjectCard.vue';
import NotesSection from './components/NotesSection.vue';
import SnippetsSection from './components/SnippetsSection.vue';
import ToolsSection from './components/ToolsSection.vue';

const profile = profileData;
const projects = projectsData.projects;

const visibleContact = computed(() =>
  (profile.contact ?? []).filter((item) => item.value && item.value.trim() !== ''),
);

const featuredProjects = computed(() => {
  const featuredIds = profile.featured ?? [];
  return projects.filter((project) => featuredIds.includes(project.id));
});
</script>

<template>
  <div class="site">
    <header class="hero">
      <div class="hero-inner">
        <p class="eyebrow">{{ profile.eyebrow }}</p>
        <h1>{{ profile.name }}</h1>
        <p class="headline">{{ profile.headline }}</p>
        <p class="intro">{{ profile.intro }}</p>
        <div class="facts">
          <span v-for="fact in profile.facts" :key="fact">{{ fact }}</span>
        </div>
        <div class="hero-actions">
          <a class="cta" href="#projects">查看项目作品</a>
          <a v-if="visibleContact.length" class="cta ghost" href="#contact">联系我</a>
          <a class="cta ghost" href="/app/">我的工作台</a>
        </div>
      </div>
    </header>

    <main>
      <section v-if="featuredProjects.length" class="section">
        <div class="container">
          <h2 class="section-title">代表作品</h2>
          <p class="section-sub">最有代表性的产品与项目</p>
          <div class="projects">
            <ProjectCard v-for="project in featuredProjects" :key="project.id" :project="project" />
          </div>
        </div>
      </section>

      <section id="projects" class="section section-alt">
        <div class="container">
          <h2 class="section-title">产品与项目</h2>
          <p class="section-sub">每个产品是什么 · 我的角色 · 技术栈 · 亮点</p>
          <div class="projects">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section-title">技能栈</h2>
          <div class="skills">
            <div v-for="group in profile.skills" :key="group.title" class="skill-group">
              <h3>{{ group.title }}</h3>
              <div class="chips">
                <span v-for="item in group.items" :key="item" class="chip">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SnippetsSection />

      <NotesSection />

      <section v-if="profile.resources?.length" class="section section-alt">
        <div class="container">
          <h2 class="section-title">嵌入式资源导航</h2>
          <p class="section-sub">平时用得顺手的芯片资料、内核源码与选型工具</p>
          <div class="resources">
            <a
              v-for="resource in profile.resources"
              :key="resource.url"
              class="resource-item"
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="resource-cat">{{ resource.category }}</span>
              <h3>{{ resource.title }}</h3>
              <p>{{ resource.description }}</p>
            </a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section-title">实用工具</h2>
          <p class="section-sub">嵌入式开发常用计算与转换，随时可用</p>
          <ToolsSection />
        </div>
      </section>

      <section class="section section-alt">
        <div class="container">
          <h2 class="section-title">学习与成长</h2>
          <ul class="learning">
            <li v-for="item in profile.learning" :key="item.title">
              <strong>{{ item.title }}</strong>
              <span>{{ item.body }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section v-if="visibleContact.length" id="contact" class="section">
        <div class="container">
          <h2 class="section-title">联系我</h2>
          <p class="section-sub">欢迎技术交流与合作机会</p>
          <div class="contact">
            <a
              v-for="item in visibleContact"
              :key="item.label"
              class="contact-item"
              :href="item.href || `mailto:${item.value}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="contact-label muted">{{ item.label }}</span>
              <span class="contact-value">{{ item.value }}</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p v-if="profile.quotes?.length" class="footer-quote">
          「{{ profile.quotes[0].content }}」 —— {{ profile.quotes[0].author }}
        </p>
        <p>© 2026 {{ profile.name }} · 嵌入式工程师</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(560px 320px at 85% -10%, rgba(143, 199, 184, 0.22), transparent 60%),
    linear-gradient(158deg, #0d1117 0%, #131b20 55%, #16282a 120%);
  color: #f2f0ea;
  padding: 84px 0 68px;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1.4px);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.9) 30%, transparent 90%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 20px;
}

.eyebrow {
  margin: 0 0 12px;
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  color: #8fc7b8;
}

h1 {
  margin: 0 0 12px;
  font-size: 46px;
  letter-spacing: 0.02em;
}

.headline {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 650;
  color: #e8e4d8;
}

.intro {
  margin: 0;
  max-width: 560px;
  font-size: 16px;
  line-height: 1.9;
  color: #d7d3c8;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.facts span {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #cfe3dc;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.cta {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 12px;
  background: #8fc7b8;
  color: #0d1117;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.cta:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.cta.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #e8e4d8;
}

.section {
  padding: 64px 0;
}

.section-alt {
  background: #f1efe9;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.section-title {
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.01em;
}

.section-sub {
  margin: 6px 0 24px;
  font-size: 13.5px;
  color: var(--ink-2);
}

.skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
}

.resources {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--ink);
  transition: border-color 0.15s ease, transform 0.12s ease;
}

.resource-item:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.resource-cat {
  align-self: flex-start;
  font-size: 11px;
  padding: 1px 9px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 650;
}

.resource-item h3 {
  margin: 2px 0 0;
  font-size: 15px;
}

.resource-item p {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.7;
}

.skill-group {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}

.skill-group h3 {
  margin: 0 0 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--ink-2);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.learning {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 15px;
}

.learning li {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}

.learning strong {
  flex-shrink: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--accent);
  font-family: var(--mono);
}

.contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--ink);
  transition: border-color 0.15s ease, transform 0.12s ease;
}

.contact-item:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.contact-label {
  font-size: 12px;
}

.contact-value {
  font-size: 15px;
  font-weight: 600;
}

.footer {
  border-top: 1px solid var(--border);
  padding: 28px 0 40px;
  font-size: 13px;
  background: var(--paper);
}

.footer p {
  margin: 0;
}

.footer-quote {
  margin-bottom: 8px;
  font-size: 12.5px;
  color: var(--ink-2);
}

.muted {
  color: var(--ink-2);
}
</style>
