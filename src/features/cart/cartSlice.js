import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, size }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/cart",{productId:id,size,qty:1});
      if(response.status !== 200) throw new Error(response.error);
      dispatch(showToastMessage({
        message:"카트에 아이템이 추가됐습니다.", 
        status:"success",
      }));
      return response.data.cartItemQty;
    } catch (error) {
      dispatch(showToastMessage({
        message:error.error, 
        status:"error",
      }));
      return rejectWithValue(error.error);
    }
  }
);

//카트리스트 가져오기
export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      if(response.status !== 200) throw new Error(response.error);
      return response.data.data;
    } catch (error) {
      rejectWithValue(error.error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/cart/${id}`);
      if(response.status !== 200) throw new Error(response.error);
      dispatch({
        payload: response.data.cartItemQty,
      });
      dispatch(showToastMessage({
        message:"아이템이 삭제되었습니다.", 
        status:"success",
      }));

    } catch (error) {
      dispatch(showToastMessage({
        message:error.error, 
        status:"error",
      }));
      rejectWithValue(error.error);
    }
  }
);

//상품 수량 수정
export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue }) => {
    try {
      console.log("id",id);
      console.log("qty",value);
      const response = await api.put(`/cart/${id}`, { qty: value });
      if(response.status !== 200) throw new Error(response.error);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

//카트 수량 가져오기
export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart/qty"); // 장바구니 수량을 가져오는 API 호출
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch cart qty");
      }

      // 가져온 수량을 반환
      return response.data.cartItemQty;
    } catch (error) {
      return rejectWithValue(error.message); // 오류 처리
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder.addCase(addToCart.pending,(state,action)=>{
      state.loading=true;
    })
    .addCase(addToCart.fulfilled,(state,action)=>{
      state.loading=false;
      state.error="";
      state.cartItemCount = action.payload;
      
    })
    .addCase(addToCart.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(getCartList.pending,(state,action)=>{
      state.loading=true;
    })
    .addCase(getCartList.fulfilled,(state,action)=>{
      console.log("cartList ",action.payload);
      state.loading=false;
      state.error="";
      state.cartList = action.payload;
      state.cartItemCount = action.payload.length;
      state.totalPrice = action.payload.reduce((total,item)=> (total+Number(item.productId.price)*Number(item.qty)),0) //리듀서에 저장하는 이유? 다양한 곳에서 쓰이기 때문. cart, order 등
      console.log("totalPrice ",state.totalPrice)
    })
    .addCase(getCartList.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(deleteCartItem.pending,(state,action)=>{
      state.loading=true;
    })
    .addCase(deleteCartItem.fulfilled,(state,action)=>{
      state.loading=false;
      state.error="";
      state.cartItemCount = action.payload;
    })
    .addCase(deleteCartItem.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(getCartQty.fulfilled,(state,action)=>{
      state.loading=false;
      state.error="";
      state.cartItemCount = action.payload;
    })
    .addCase(getCartQty.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(updateQty.pending,(state,action)=>{
      state.loading=true;
    })
    .addCase(updateQty.fulfilled,(state,action)=>{
      state.loading=false;
      state.error="";
      state.cartList = action.payload;
      state.totalPrice = action.payload.reduce((total,item)=> (total+Number(item.productId.price)*Number(item.qty)),0) 
    })
    .addCase(updateQty.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
