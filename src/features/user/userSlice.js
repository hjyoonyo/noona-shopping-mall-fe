import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

//로그인
export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/login",{email,password});
      //로그인 성공
      //로그인 페이지에서 처리

      //토큰 저장.
      // 1.local storage 브라우저에 저장. 창이 닫히고 다시 열어도 유지 
      // 2. session storage 현재 창이 존재하는 순간에만 유지
      sessionStorage.setItem("token",response.data.token);
      
      return response.data; //or response.date.user
    }catch(error){
      //로그인 실패
      //실패시 생긴 에러값을 reducer에 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

//로그아웃
export const logout = () => (dispatch) => {
  // 1. 토큰 삭제
  sessionStorage.removeItem("token");
  //2. 유저 정보 삭제. Redux 상태 초기화?
  dispatch(userSlice.actions.clearUserData());
  //3. 쇼핑백 정보 삭제
  dispatch(initialCart());
};

//회원가입
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user",{email,name,password});
      //성공
      //1. 성공 토스트 메세지 보여주기
      dispatch(showToastMessage({message:"회원가입을 성공했습니다.",status:"success"}));
      //2. 로그인 페이지 리다이렉트
      navigate("/login");

      return response.data.data;
    } catch (error) {
      //실패
      //1. 실패 토스트 메세지 보여주기
      dispatch(showToastMessage({message:"회원가입에 실패했습니다.",status:"error"}));
      //2. 에러 값을 저장한다
      return rejectWithValue(error.error);
    }

  }
);

//토큰으로 로그인.
export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
    clearUserData: (state) => {
      // 로그아웃 시 사용자 상태 초기화
      state.user = null;
      state.loginError = null;
      state.registrationError = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending,(state)=>{ //회원가입
      state.loading=true;
    })
    .addCase(registerUser.fulfilled,(state)=>{
      state.loading=false;
      state.registrationError=null;
    })
    .addCase(registerUser.rejected,(state,action)=>{
      state.registrationError = action.payload;
    })
    .addCase(loginWithEmail.pending,(state)=>{ //로그인
      state.loading=true;
    })
    .addCase(loginWithEmail.fulfilled,(state,action)=>{
      state.loading=false;
      state.user = action.payload.user;
      state.loginError = null;
    })
    .addCase(loginWithEmail.rejected,(state,action)=>{
      state.loading=false;
      state.loginError = action.payload;
    })
    .addCase(loginWithToken.fulfilled,(state,action)=>{
      state.user = action.payload.user;
    });
  }
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
