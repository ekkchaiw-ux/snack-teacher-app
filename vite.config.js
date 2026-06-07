import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/snck-teacher-app/', // ⚠️ สำคัญมาก: ชื่อตรงนี้ต้องตรงกับชื่อ Repository ใน GitHub ของคุณเป๊ะๆ (สังเกตว่ามี / ปิดหัวท้าย)
})