import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        VitePWA({
            manifest: {
                icons: [{
                    src: "assets/plant1_1.png",
                    sizes: "64x64",
                    type: "image/png",
                    purpose: "any maskable"
                }]
            }
        })
    ],
    base: "https://jsanc189.github.io/121-Final-project/",
})