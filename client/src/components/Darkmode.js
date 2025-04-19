import React from 'react'
import "../styles/Darkmode.css";

const Darkmode = () => {
    const setDarkMode = () => {
        sessionStorage.setItem("selectedTheme", "dark")
        document.querySelector("body").setAttribute('data-theme', 'dark')
    }
     const setLightMode = () => {
        document.querySelector("body").setAttribute('data-theme', 'light')
      sessionStorage.setItem("selectedTheme", "light")
     }
    
    const selectedTheme = localStorage.getItem("selectedTheme")
    if (selectedTheme ==="dark") {
        setDarkMode();
    }
    const toggleTheme = e =>{
        if (e.target.checked) setDarkMode();
        else setLightMode();
    }
  return (
      <div className='dark_mode'>
          <input 
              className='dark_mode_input'
              type='checkbox'
              id='darkmode_toggle'
              oncChange={toggleTheme}
              defaultChecked={selectedTheme === "dark"} />
      
    </div>
  )
}

export default Darkmode

