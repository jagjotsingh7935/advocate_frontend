import { createContext, useState, useContext } from 'react';

// Create context
export const MyContext = createContext();

// Provider component (only export this as a component)
const MyContextProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [authme,setauthme]=useState(null)
  
  const [theme,settheme]=useState(localStorage.getItem('theme'))

  const updateState = (newState) => {
    setState(newState);
    console.log('State updated:', newState); // Log the new state directly
  };

  const updatetheme=(newtheme)=>{
    settheme(newtheme)
    localStorage.setItem('theme',newtheme)
  }
  const updateAuthMe = (newAuthMe) => {
    setauthme(newAuthMe);
    console.log('AuthMe updated:', newAuthMe); // Log the new authme directly
  };
console.log('Initial state:', state); // Log initial state
  console.log('Initial authme:', authme); // Log initial authme
  return (
    <MyContext.Provider value={{ state, updateState,authme,updateAuthMe,theme,updatetheme }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContextProvider; // Default export for component