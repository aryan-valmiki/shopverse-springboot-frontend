import { createSlice } from "@reduxjs/toolkit";

const user = localStorage.getItem("user")

const initialState = user
    ?
    {
        user: JSON.parse(user),
        isLoggedIn: true
    }
    
    :
    {
        user: null,
        isLoggedIn: false
    }

const authSlice = createSlice(
    {
        name: "auth",
        initialState,
        reducers: {
            login: function (state, action) {
                state.user = action.payload.data;
                state.isLoggedIn = true;
                localStorage.setItem("user", JSON.stringify(action.payload.data))
            },
            logout: function (state) {
                state.user = null;
                state.isLoggedIn = false;
                localStorage.removeItem("user")
            }
        }
    }
)



export const { login, logout } = authSlice.actions;
export default authSlice.reducer