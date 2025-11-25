import { Bookmark, Category, Note, Quote } from './types';

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
  {
    id: '4',
    title: 'FreeRTOS',
    url: 'https://www.freertos.org',
    description: '市场领先的微控制器实时操作系统 (RTOS) 开源内核。',
    category: Category.EMBEDDED,
    tags: ['RTOS', 'Scheduler', 'Middleware'],
    createdAt: Date.now() - 300000,
  },
  {
    id: '5',
    title: 'Altium Designer',
    url: 'https://www.altium.com',
    description: '专业的 PCB 设计软件资源和文档。',
    category: Category.TOOLS,
    tags: ['PCB', 'EDA', 'Design'],
    createdAt: Date.now() - 400000,
  }
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
  {
    id: 'n2',
    title: 'Linux 设备树 (Device Tree) 备忘',
    content: '设备树是描述硬件的数据结构。\n\n常用命令：\n- 编译：dtc -I dts -O dtb -o my.dtb my.dts\n- 反编译：dtc -I dtb -O dts -o dump.dts my.dtb\n\n注意：compatible 属性必须与驱动中的 .of_match_table 匹配。',
    tags: ['Linux', 'DeviceTree', 'Driver'],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 100000
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