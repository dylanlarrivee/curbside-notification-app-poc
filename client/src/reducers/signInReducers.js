import deepFreeze from 'deep-freeze'

const state = [];
const signInReducer = (state = [{loginStoreID:""},{loginUserName:""},{loginUserPassword:""}], action) => {
    switch(action.type) {
      case 'SET_STORE_ID':
        state = [];
        return [...state, action.data]
      case 'SET_USER_NAME':
        state = [];
        return [...state, action.data]
      case 'SET_USER_PASSWORD':
        state = [];
        return [...state, action.data]  
      default:
      return state
    }
  }

 export const storeIdAction = (loginStoreID) => {
    return {
      type: 'SET_STORE_ID',
      data: {
        loginStoreID
      }
    }
  }

  export const userNameAction = (loginUserName) => {
    return {
      type: 'SET_STORE_ID',
      data: {
        loginUserName
      }
    }
  }

  export const userPasswordAction = (loginUserPassword) => {
    return {
      type: 'SET_STORE_ID',
      data: {
        loginUserPassword
      }
    }
  }


  deepFreeze(state)
  export default signInReducer;
