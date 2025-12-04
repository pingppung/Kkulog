import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-pink-100 text-2xl font-bold">
      Tailwind 작동 확인 🎨
      </div>
    </>
  )
}

export default App
