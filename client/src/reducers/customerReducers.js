import deepFreeze from 'deep-freeze'

const state = [];
const customerReducer = (state = [], action) => {
    switch(action.type) {
      case 'NOW_CUSTOMERS':
        state = [];
        return [...state, action.data]
        //return [...action.data]
      case 'TODAY_CUSTOMERS':
        state = [];
        return [...state, action.data]
      default:
      return state
    }
  }

 export const nowCustomerAction = (nowCustomerContent) => {
    return {
      type: 'NOW_CUSTOMERS',
      data: {
        nowCustomerContent
      }
    }
  }

  export const todayCustomerAction = (toodayCustomerContent) => {
    return {
      type: 'NOW_CUSTOMERS',
      data: {
        toodayCustomerContent
      }
    }
  }

  deepFreeze(state)
  export default customerReducer;
