import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
 
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  reactYouMightNotNeedAnEffect.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error"
    }
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])
 
export default eslintConfig
