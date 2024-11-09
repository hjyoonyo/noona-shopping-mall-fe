import React, { useEffect, useState }  from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetail } from "../../features/order/orderSlice";
import { ColorRing } from "react-loader-spinner";
import { Table, Badge } from "react-bootstrap";
import { badgeBg } from "../../constants/order.constants";
import { currencyFormat } from "../../utils/number";

import "./style/OrderDetail.style.css";



const OrderDetail = () => {
    const dispatch = useDispatch();
    const { selectedOrder, loading } = useSelector((state) => state.order);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
      dispatch(getOrderDetail(id));
    }, [id, dispatch]);
      
    if (loading || !selectedOrder)
    return (
        <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
    );
    
    return (
        <Container className="order-detail-container">
            <Row>
                <Col>
                    <div>예약번호: {selectedOrder.orderNum}</div>
                    <div>주문날짜: {selectedOrder.createdAt.slice(0,10)}</div>
                    <div>배송지: {selectedOrder.shipTo.address + " " + selectedOrder.shipTo.city}</div>
                    <div>결제금액: {currencyFormat(selectedOrder.totalPrice)}</div>
                    <div>진행상황: <Badge bg={badgeBg[selectedOrder.status]}>{selectedOrder.status}</Badge></div>
                    {selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item,index)=>(
                            <Row className="product-detail">
                                <Col md={2} xs={12}>
                                    <img src={item.productId.image} width={80} alt="product" />
                                </Col>
                                <Col md={10} xs={12}>
                                    <div>
                                        <h5>{item.productId.name}</h5>
                                    </div>
                                    <div>사이즈: {item.size}</div>
                                    <div>가격: ₩ {currencyFormat(item.productId.price)}</div>
                                    <div>수량: {item.qty}</div>
                                    </Col>
                            </Row>
                        ))
                    ) : (
                        <div></div>
                    )}
                </Col>
            </Row>
        </Container>
    );




};

export default OrderDetail;