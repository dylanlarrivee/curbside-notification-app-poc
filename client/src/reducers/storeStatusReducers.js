import deepFreeze from 'deep-freeze'

const state = [];
const initialState = [{"status":false}]
const storeStatusReducer = (state = [], action) => {
    switch(action.type) {
      case 'STORE_STATUS_UPDATE':
        return [action.data]
      default:
      return state
    }
  }

 export const updateStoreStatusAction = (status) => {
    return {
      type: 'STORE_STATUS_UPDATE',
      data: {
        status
      }
    }
  }

  deepFreeze(state)
  export default storeStatusReducer;
