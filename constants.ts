import { Bookmark, Category, Note, Quote, Project, CodeSnippet, Material, DailyPlan } from './types';

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    title: 'STMicroelectronics',
    url: 'https://www.st.com',
    description: '意法半导体官方网站，STM32 芯片资料、参考手册和 HAL 库下载。',
    category: Category.EMBEDDED,
    tags: ['STM32', 'HAL', 'Datasheet'],
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Linux Kernel Archives',
    url: 'https://www.kernel.org',
    description: 'Linux 内核源代码主要分发站点。嵌入式 Linux 开发必备。',
    category: Category.LINUX,
    tags: ['Kernel', 'Source', 'OS'],
    createdAt: Date.now() - 100000,
  },
  {
    id: '3',
    title: 'DigiKey',
    url: 'https://www.digikey.com',
    description: '全球最大的电子元件分销商之一，选型和查找数据手册的利器。',
    category: Category.HARDWARE,
    tags: ['Component', 'Distributor', 'Datasheet'],
    createdAt: Date.now() - 200000,
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'I2C 通信调试笔记',
    content: '今天在调试 STM32 的 I2C 接口时遇到了死锁问题。\n\n现象：SCL 一直被拉低。\n原因：从设备在发送数据时被复位，导致状态机卡在发送低电平状态。\n\n解决方法：\n1. 初始化时手动翻转 GPIO 产生 9 个时钟脉冲进行解锁。\n2. 检查上拉电阻是否虚焊。',
    tags: ['I2C', 'STM32', 'Debug'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '智能温湿度监控系统',
    description: '基于 STM32F103 和 ESP8266 的物联网环境监控设备，通过 MQTT 上传数据。',
    githubUrl: 'https://github.com/example/smart-temp-monitor',
    status: 'development',
    priority: 'high',
    progress: 45,
    startDate: Date.now() - 10000000,
    tags: ['STM32', 'IoT', 'MQTT'],
    tasks: [
      { id: 't1', content: '完成 PCB 原理图设计', isCompleted: true },
      { id: 't2', content: 'ESP8266 AT 指令驱动编写', isCompleted: true },
      { id: 't3', content: 'DHT11 传感器数据读取', isCompleted: false },
      { id: 't4', content: '搭建 MQTT 服务器', isCompleted: false }
    ]
  },
];

export const INITIAL_SNIPPETS: CodeSnippet[] = [
  {
    id: 's1',
    title: 'STM32 HAL UART 重定向 printf',
    language: 'c',
    description: '在 Keil/IAR 中使用 printf 输出到串口',
    tags: ['STM32', 'UART', 'Debug'],
    platform: 'STM32',
    code: `#include "stdio.h"

// 重定向 fputc 函数
int fputc(int ch, FILE *f) {
    HAL_UART_Transmit(&huart1, (uint8_t *)&ch, 1, 0xFFFF);
    return ch;
}`,
    createdAt: Date.now()
  },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'm1',
    name: 'STM32F103x8_Datasheet.pdf',
    type: 'pdf',
    size: '2.4 MB',
    description: 'STM32F103x8 官方数据手册，包含电气特性和引脚定义。',
    tags: ['Datasheet', 'STM32', 'Ref'],
    createdAt: Date.now() - 2000000,
    link: 'https://www.st.com/resource/en/datasheet/stm32f103c8.pdf'
  },
  {
    id: 'm2',
    name: 'Motor_Control_Source',
    type: 'git',
    size: '-',
    description: '电机控制算法源码 Git 仓库。',
    tags: ['Motor', 'Git', 'Source'],
    createdAt: Date.now() - 8000000,
    link: 'https://github.com/vedderb/bldc'
  }
];

// NEW: Updated Daily Plans Structure
export const INITIAL_PLANS: DailyPlan[] = [
  {
    date: new Date().toISOString().split('T')[0],
    schedule: [
      { id: 's1', title: '晨会 & 邮件处理', startTime: '09:00', endTime: '09:30', type: 'meeting', completed: true },
      { id: 's2', title: 'FreeRTOS 内核阅读', startTime: '09:30', endTime: '11:30', type: 'deep_work', completed: true },
      { id: 's3', title: '午休', startTime: '12:00', endTime: '13:30', type: 'break', completed: true },
      { id: 's4', title: 'SPI 驱动调试', startTime: '14:00', endTime: '16:00', type: 'task', completed: false }
    ],
    todos: [
      { id: 't1', text: '整理项目文件结构', completed: false },
      { id: 't2', text: '回复客户关于 I2C 的问题', completed: false }
    ],
    summary: '上午效率很高，深入理解了任务调度机制。下午调试 SPI 遇到时序问题，怀疑是分频系数不对，明天继续排查。',
    mood: 'neutral'
  }
];

export const QUOTES: Quote[] = [
  { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { content: "硬件是躯体，软件是灵魂。", author: "Embedded Philosophy" },
  { content: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { content: "不要去修没坏的东西 (If it ain't broke, don't fix it).", author: "Engineering Proverb" },
  { content: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { content: "调试代码比写代码难两倍。因此，如果你写出了最聪明的代码，你就没有足够的能力去调试它。", author: "Brian Kernighan" },
  { content: "Real programmers don't comment their code. If it was hard to write, it should be hard to understand.", author: "Unknown (Joke)" },
  { content: "过早的优化是万恶之源。", author: "Donald Knuth" },
  { content: "The only way to go fast, is to go well.", author: "Robert C. Martin" },
  { content: "Stay hungry, stay foolish.", author: "Steve Jobs" }
];