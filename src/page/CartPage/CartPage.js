import React from "react";
import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CartProductCard from "./component/CartProductCard";
import OrderReceipt from "../PaymentPage/component/OrderReceipt";
import "./style/cart.style.css";
import { getCartList } from "../../features/cart/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart.cartList);
  const cartList = cartData.items || []; // items 배열을 참조
  // const { totalPrice } = useSelector((state) => state.cart.totalPrice);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    //카트리스트 불러오기
    dispatch(getCartList()).then(() => {
      setLoading(false); // 데이터 로딩이 끝나면 로딩 상태 해제
    });
  }, [dispatch]);

  useEffect(() => {
    console.log("rrr3 ", cartList); // cartList 업데이트 확인용 로그
  }, [cartList]);

  return (
    <Container>
      <Row>
        <Col xs={12} md={7}>
          {loading ? (
          <div className="text-align-center empty-bag">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
          ) :
            cartList.length > 0 ? (
              cartList.map((item) => (
                <CartProductCard item={item} key={item._id} />
              ))
            ) : (
              <div className="text-align-center empty-bag">
                <h2>카트가 비어있습니다.</h2>
                <div>상품을 담아주세요!</div>
              </div>
          )}
        </Col>
        <Col xs={12} md={5}>
          <OrderReceipt />
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
