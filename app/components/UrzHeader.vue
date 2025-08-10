<template>
  <header>
    <div>
      <!-- 로고/홈 -->
      <NuxtLink :to="nav.siteLink">{{ nav.siteName }}</NuxtLink>

      <!-- 메뉴 -->
      <nav>
        <ul>
          <li v-for="item in nav.menus" :key="item.label">
            <!-- 단일 링크 -->
            <template v-if="item.href">
              <!-- 외부 링크(블로그 등) -->
              <a v-if="item.href.startsWith('http')" :href="item.href" target="_blank" rel="noopener">
                {{ item.label }}
              </a>
              <!-- 내부 링크 -->
              <NuxtLink v-else :to="item.href">{{ item.label }}</NuxtLink>
            </template>

            <!-- 하위 메뉴 -->
            <template v-else>
              <span>{{ item.label }}</span>
              <ul>
                <li v-for="c in item.children" :key="c.label">
                  <template v-if="c.href">
                    <a v-if="c.href.startsWith('http')" :href="c.href" target="_blank" rel="noopener">
                      {{ c.label }}
                    </a>
                    <NuxtLink v-else :to="c.href">{{ c.label }}</NuxtLink>
                  </template>
                </li>
              </ul>
            </template>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import nav from '~/data/nav.json'
</script>
